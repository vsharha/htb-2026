// Scores the target customer against the tract columns with a decision model,
// then combines the real tract numbers in code. The model sees the brief and
// the column descriptions, never a tract: one request asks one score question
// per column. A self-hosted System One endpoint, when configured, takes the
// call; Jev through AI Gateway does it otherwise.
//
// Columns are asked in batches so the map can be scored and shown after each
// one. A CPU-served model takes tens of seconds per batch, and a map that fills
// in beats one blank screen.

import { experimental_decide as decide } from "ai";

import type { AudienceFit, Brief, ColumnWeight } from "@/lib/contract";
import { getAudienceModel, getAudienceModelOrder, getSystemOneConfig, hasAudienceCredentials } from "@/lib/server/ai";
import { keywordWeights } from "@/lib/stand-in/keyword-weights";
import { readAnalysisCsv, readAnalysisJson } from "@/lib/stand-in/data-files";
import type { TractColumn } from "@/lib/tract-columns";

const SYSTEMONE_TIMEOUT_MS = 300_000;
const JEV_TIMEOUT_MS = 20_000;
const BATCH_SIZE = 7;

/** One audience fit, plus how many traits it covers. */
export type AudienceBatch = AudienceFit & { answered: number; total: number };

/**
 * The answer levels for every column, from against to for. A column can count
 * against a customer as well as for one: high incomes suit an affluent
 * audience and not a low-income one, and median age points opposite ways for
 * young and older audiences. So the level keeps its direction, and the weight
 * runs from -1 to 1.
 */
const JEV_LEVELS = [
  "Strongly against: the target customers are much less likely to have this trait.",
  "Against: the target customers are somewhat less likely to have this trait.",
  "Not relevant: the description says nothing either way about this trait.",
  "For: the target customers are somewhat more likely to have this trait.",
  "Strongly for: the target customers are much more likely to have this trait.",
];

/**
 * The same levels in shorter wording for the self-hosted model, because every
 * question repeats them and CPU inference time scales with prompt length. The
 * scale and its meaning are identical.
 */
const SYSTEMONE_LEVELS = [
  "Much less likely to have this trait.",
  "Somewhat less likely to have this trait.",
  "No relation to this trait.",
  "Somewhat more likely to have this trait.",
  "Much more likely to have this trait.",
];

/**
 * The answer as a weight from -1 to 1. With per-level probabilities this is
 * the expected level, so a split between "for" and "strongly for" lands
 * between them; otherwise it is the single level the model chose.
 */
function toWeight(answer: unknown, top: number): number {
  if (!answer || typeof answer !== "object") throw new Error("decision model returned no answer");
  const a = answer as { score?: unknown; probabilities?: unknown };
  let level = typeof a.score === "number" && Number.isFinite(a.score) ? a.score : null;
  if (a.probabilities && typeof a.probabilities === "object") {
    const entries = Object.entries(a.probabilities as Record<string, unknown>)
      .map(([key, p]) => [Number(key), typeof p === "number" ? p : Number.NaN] as const)
      .filter(([i, p]) => Number.isInteger(i) && i >= 0 && i <= top && Number.isFinite(p));
    const total = entries.reduce((sum, [, p]) => sum + p, 0);
    if (total > 0) level = entries.reduce((sum, [i, p]) => sum + i * p, 0) / total;
  }
  if (level === null) throw new Error("decision model returned no score or probabilities");
  level = Math.max(0, Math.min(top, level));
  return Number(Math.max(-1, Math.min(1, (level / top) * 2 - 1)).toFixed(2));
}

/** The questions and state a decision model receives, with its own level wording. */
function request(columns: TractColumn[], brief: Brief, levels: string[], compact: boolean) {
  return {
    state: {
      "target customer": brief.targetCustomer,
      startup: brief.description,
      industry: brief.industry,
    },
    questions: Object.fromEntries(
      columns.map((c) => {
        const area = c.measures === "lives" ? "residents" : c.measures === "works" ? "workers" : "passers-by";
        return [
          c.name,
          {
            type: "score" as const,
            instructions: compact
              ? `Trait of the area's ${area}: ${c.description}.`
              : `How does this trait of an area's ${area} relate to the startup's target customers? Trait: ${c.description}.`,
            criteria: levels,
          },
        ];
      }),
    ),
  };
}

function answersToWeights(columns: TractColumn[], answers: Record<string, unknown>, levels: string[]): ColumnWeight[] {
  const top = levels.length - 1;
  return columns.map((c) => ({
    column: c.name,
    description: c.description,
    measures: c.measures,
    weight: toWeight(answers[c.name], top),
  }));
}

async function systemOneWeights(
  columns: TractColumn[],
  brief: Brief,
  config: NonNullable<ReturnType<typeof getSystemOneConfig>>,
): Promise<{ weights: ColumnWeight[]; inputTokens?: number }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;

  const response = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: config.model, ...request(columns, brief, SYSTEMONE_LEVELS, true) }),
    signal: AbortSignal.timeout(SYSTEMONE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`decision model ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }

  const body = (await response.json()) as {
    answers?: unknown;
    result?: { answers?: unknown };
    usage?: { input_tokens?: unknown };
  };
  const answers = body.answers ?? body.result?.answers;
  if (!answers || typeof answers !== "object") throw new Error("decision model returned no answers");
  return {
    weights: answersToWeights(columns, answers as Record<string, unknown>, SYSTEMONE_LEVELS),
    inputTokens: typeof body.usage?.input_tokens === "number" ? body.usage.input_tokens : undefined,
  };
}

async function jevWeights(columns: TractColumn[], brief: Brief): Promise<ColumnWeight[]> {
  const result = await decide({
    model: getAudienceModel(),
    ...request(columns, brief, JEV_LEVELS, false),
    abortSignal: AbortSignal.timeout(JEV_TIMEOUT_MS),
  });

  const answers: Record<string, unknown> = {};
  for (const c of columns) {
    const answer = result.answers[c.name];
    if (answer?.type !== "score") throw new Error(`Jev returned no score for "${c.name}".`);
    answers[c.name] = answer;
  }
  return answersToWeights(columns, answers, JEV_LEVELS);
}

/**
 * Asks the model one batch of columns. The self-hosted endpoint is tried
 * first, then Jev, then keyword weights, so a batch always returns something.
 */
async function ask(columns: TractColumn[], brief: Brief): Promise<Omit<AudienceFit, "scores">> {
  const systemOne = getSystemOneConfig();
  const order = getAudienceModelOrder();

  for (const model of order) {
    if (model === "jev") {
      if (!hasAudienceCredentials()) continue;
      const started = Date.now();
      try {
        return { weights: await jevWeights(columns, brief), source: "jev", stats: { model: "Jev", durationMs: Date.now() - started } };
      } catch (error) {
        console.error("Jev failed; trying the next decision model.", error);
      }
      continue;
    }

    if (!systemOne) continue;
    const started = Date.now();
    try {
      const { weights, inputTokens } = await systemOneWeights(columns, brief, systemOne);
      return { weights, source: "systemone", stats: { model: systemOne.model, durationMs: Date.now() - started, inputTokens } };
    } catch (error) {
      console.error("The self-hosted decision model failed; trying the next decision model.", error);
    }
  }

  if (!systemOne && !hasAudienceCredentials()) {
    console.warn("No decision model endpoint or gateway credentials; weighting the audience by keywords instead.");
  }
  return { weights: keywordWeights(columns, brief.targetCustomer), source: "keywords" };
}

/** Ranks the tracts by the weighted traits, from 0 to 1, strongest last. */
function rankTracts(tracts: Record<string, string>[], columns: TractColumn[], weights: ColumnWeight[], markets: Set<string>) {
  const raw: [string, number][] = [];
  for (const tract of tracts) {
    if (!markets.has(tract.borough)) continue;
    let sum = 0;
    let magnitude = 0;
    for (const [i, w] of weights.entries()) {
      if (w.weight === 0) continue;
      sum += w.weight * Number(tract[columns[i].scaled]);
      magnitude += Math.abs(w.weight);
    }
    raw.push([tract.geoid, magnitude ? sum / magnitude : 0]);
  }

  // Rescale by rank so the strongest tracts reach 1 whatever the weights.
  raw.sort((a, b) => a[1] - b[1]);
  const scores: Record<string, number> = {};
  raw.forEach(([geoid], i) => {
    scores[geoid] = Number((i / Math.max(raw.length - 1, 1)).toFixed(4));
  });
  return scores;
}

/**
 * Yields a fit after each batch, so a caller can show a map that fills in.
 * The last yield is the complete fit.
 */
export async function* scoreBatches(brief: Brief, signal?: AbortSignal): AsyncGenerator<AudienceBatch> {
  const [columns, tracts] = await Promise.all([
    readAnalysisJson<TractColumn[]>("columns.json"),
    readAnalysisCsv("nyc_tracts.csv"),
  ]);

  const markets = new Set<string>(brief.markets);
  // Only the self-hosted CPU model is slow enough to need batching; Jev
  // answers all the columns in one fast request, as main does.
  const batchSize = getAudienceModelOrder()[0] === "systemone" && getSystemOneConfig() ? BATCH_SIZE : columns.length;
  const batches: TractColumn[][] = [];
  for (let i = 0; i < columns.length; i += batchSize) batches.push(columns.slice(i, i + batchSize));

  const weights: ColumnWeight[] = [];
  let source: AudienceFit["source"] = "keywords";
  let model = "";
  let durationMs = 0;
  let inputTokens: number | undefined;

  for (const [batchIndex, batch] of batches.entries()) {
    if (signal?.aborted) return;
    const answer = await ask(batch, brief);
    weights.push(...answer.weights);
    // A keyword batch anywhere makes the whole fit the fallback's quality.
    if (batchIndex === 0) source = answer.source;
    else if (answer.source === "keywords") source = "keywords";
    model = answer.stats?.model ?? model;
    durationMs += answer.stats?.durationMs ?? 0;
    inputTokens = inputTokens === undefined ? answer.stats?.inputTokens : inputTokens + (answer.stats?.inputTokens ?? 0);

    yield {
      weights: [...weights],
      scores: rankTracts(tracts, columns, weights, markets),
      source,
      stats: model ? { model, durationMs, inputTokens } : undefined,
      answered: weights.length,
      total: columns.length,
    };
  }
}

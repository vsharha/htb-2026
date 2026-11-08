"use server";

// Scores the target customer against the tract columns with a decision model,
// then combines the real tract numbers in code. The model sees the brief and
// the 21 column descriptions, never a tract: one request asks one score
// question per column. A self-hosted System One endpoint, when configured,
// takes the call; Jev through AI Gateway does it otherwise.

import { experimental_decide as decide } from "ai";

import type { AudienceFit, Brief, ColumnWeight } from "@/lib/contract";
import { getAudienceModel, getSystemOneConfig, hasAudienceCredentials } from "@/lib/server/ai";
import { keywordWeights } from "@/lib/stand-in/keyword-weights";
import { readAnalysisCsv, readAnalysisJson } from "@/lib/stand-in/data-files";
import type { TractColumn } from "@/lib/tract-columns";

const TIMEOUT_MS = 300_000;

/**
 * The answer levels for every column, from against to for. A column can count
 * against a customer as well as for one: high incomes suit an affluent
 * audience and not a low-income one, and median age points opposite ways for
 * young and older audiences. So the level keeps its direction, and the weight
 * runs from -1 to 1. The wording is short because every question repeats it,
 * and CPU inference time scales with prompt length.
 */
const LEVELS = [
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

/** The questions and state both decision-model paths send. */
function request(columns: TractColumn[], brief: Brief) {
  return {
    state: {
      "target customer": brief.targetCustomer,
      startup: brief.description,
      industry: brief.industry,
    },
    questions: Object.fromEntries(
      columns.map((c) => [
        c.name,
        {
          type: "score" as const,
          instructions: `Trait of the area's ${c.measures === "lives" ? "residents" : c.measures === "works" ? "workers" : "passers-by"}: ${c.description}.`,
          criteria: LEVELS,
        },
      ]),
    ),
  };
}

function answersToWeights(columns: TractColumn[], answers: Record<string, unknown>): ColumnWeight[] {
  const top = LEVELS.length - 1;
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
    body: JSON.stringify({ model: config.model, ...request(columns, brief) }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
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
    weights: answersToWeights(columns, answers as Record<string, unknown>),
    inputTokens: typeof body.usage?.input_tokens === "number" ? body.usage.input_tokens : undefined,
  };
}

async function jevWeights(columns: TractColumn[], brief: Brief): Promise<ColumnWeight[]> {
  const result = await decide({
    model: getAudienceModel(),
    ...request(columns, brief),
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const answers: Record<string, unknown> = {};
  for (const c of columns) {
    const answer = result.answers[c.name];
    if (answer?.type !== "score") throw new Error(`Jev returned no score for "${c.name}".`);
    answers[c.name] = answer;
  }
  return answersToWeights(columns, answers);
}

async function weightsFor(columns: TractColumn[], brief: Brief): Promise<Pick<AudienceFit, "weights" | "source" | "stats">> {
  const systemOne = getSystemOneConfig();
  if (systemOne) {
    const started = Date.now();
    try {
      const { weights, inputTokens } = await systemOneWeights(columns, brief, systemOne);
      return { weights, source: "systemone", stats: { model: systemOne.model, durationMs: Date.now() - started, inputTokens } };
    } catch (error) {
      console.error("The self-hosted decision model failed; trying Jev instead.", error);
    }
  }

  if (hasAudienceCredentials()) {
    const started = Date.now();
    try {
      return { weights: await jevWeights(columns, brief), source: "jev", stats: { model: "Jev", durationMs: Date.now() - started } };
    } catch (error) {
      console.error("Jev failed; weighting the audience by keywords instead.", error);
    }
  } else if (!systemOne) {
    console.warn("No decision model endpoint or gateway credentials; weighting the audience by keywords instead.");
  }

  return { weights: keywordWeights(columns, brief.targetCustomer), source: "keywords" };
}

export async function scoreAudience(brief: Brief): Promise<AudienceFit> {
  const [columns, tracts] = await Promise.all([
    readAnalysisJson<TractColumn[]>("columns.json"),
    readAnalysisCsv("nyc_tracts.csv"),
  ]);

  const { weights, source, stats } = await weightsFor(columns, brief);

  const markets = new Set<string>(brief.markets);
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

  return { weights, scores, source, stats };
}

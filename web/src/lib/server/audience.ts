"use server";

// Scores the target customer against the tract columns with a local Clef
// decision model (Cloudflare, Jev/SystemOne-compatible) over its
// /v1/systemone endpoint, then combines the real tract numbers in code. Clef
// sees the brief and the 21 column descriptions, never a tract: one request
// asks one score question per column.

import type { AudienceFit, Brief, ColumnWeight } from "@/lib/contract";
import { getClefConfig } from "@/lib/server/ai";
import { keywordWeights } from "@/lib/stand-in/keyword-weights";
import { readAnalysisCsv, readAnalysisJson } from "@/lib/stand-in/data-files";
import type { TractColumn } from "@/lib/tract-columns";

const TIMEOUT_MS = 20_000;

/**
 * The answer levels for every column, from against to for. A column can count
 * against a customer as well as for one: high incomes suit an affluent
 * audience and not a low-income one, and median age points opposite ways for
 * young and older audiences. So the level keeps its direction, and the weight
 * runs from -1 to 1.
 */
const LEVELS = [
  "Strongly against: the target customers are much less likely to have this trait.",
  "Against: the target customers are somewhat less likely to have this trait.",
  "Not relevant: the description says nothing either way about this trait.",
  "For: the target customers are somewhat more likely to have this trait.",
  "Strongly for: the target customers are much more likely to have this trait.",
];

function probabilityWeight(probabilities: unknown, top: number): number | null {
  if (!probabilities || typeof probabilities !== "object") return null;
  const entries = Object.entries(probabilities as Record<string, unknown>)
    .map(([key, p]) => [Number(key), typeof p === "number" ? p : Number.NaN] as const)
    .filter(([i, p]) => Number.isInteger(i) && i >= 0 && i <= top && Number.isFinite(p));
  const total = entries.reduce((sum, [, p]) => sum + p, 0);
  if (total <= 0) return null;
  const level = entries.reduce((sum, [i, p]) => sum + i * p, 0) / total;
  return Number(Math.max(-1, Math.min(1, (level / top) * 2 - 1)).toFixed(2));
}

/** Maps a Clef score answer to a weight from -1 to 1. */
function toWeight(answer: unknown, top: number): number {
  if (!answer || typeof answer !== "object") throw new Error("missing answer");
  const a = answer as { score?: unknown; probabilities?: unknown };
  const fromProbabilities = probabilityWeight(a.probabilities, top);
  if (fromProbabilities !== null) return fromProbabilities;
  if (typeof a.score === "number" && Number.isFinite(a.score)) {
    const level = Math.max(0, Math.min(top, a.score));
    return Number((((level / top) * 2 - 1)).toFixed(2));
  }
  throw new Error("score answer has no score or probabilities");
}

function unwrap(body: unknown): { answers: Record<string, unknown> } {
  if (!body || typeof body !== "object") throw new Error("Clef returned no body");
  const b = body as { answers?: unknown; result?: { answers?: unknown } };
  const answers = b.answers ?? b.result?.answers;
  if (!answers || typeof answers !== "object") throw new Error("Clef returned no answers");
  return { answers: answers as Record<string, unknown> };
}

async function clefWeights(columns: TractColumn[], brief: Brief): Promise<ColumnWeight[]> {
  const { url, model, token } = getClefConfig();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      state: {
        "target customer": brief.targetCustomer,
        startup: brief.description,
        industry: brief.industry,
      },
      questions: Object.fromEntries(
        columns.map((c) => [
          c.name,
          {
            type: "score",
            instructions: `How does this trait of an area's ${c.measures === "lives" ? "residents" : c.measures === "works" ? "workers" : "passers-by"} relate to the startup's target customers? Trait: ${c.description}.`,
            criteria: LEVELS,
          },
        ]),
      ),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Clef ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }

  const { answers } = unwrap(await response.json());
  const top = LEVELS.length - 1;
  return columns.map((c) => ({
    column: c.name,
    description: c.description,
    measures: c.measures,
    weight: toWeight(answers[c.name], top),
  }));
}

export async function scoreAudience(brief: Brief): Promise<AudienceFit> {
  const [columns, tracts] = await Promise.all([
    readAnalysisJson<TractColumn[]>("columns.json"),
    readAnalysisCsv("nyc_tracts.csv"),
  ]);

  // The local Clef model weights the columns; if it can't be reached, the
  // keyword stand-in keeps the page working and `source` tells the page which
  // one it got.
  let weights: ColumnWeight[];
  let source: AudienceFit["source"] = "clef";
  try {
    weights = await clefWeights(columns, brief);
  } catch (error) {
    console.error("Clef failed; weighting the audience by keywords instead.", error);
    weights = keywordWeights(columns, brief.targetCustomer);
    source = "keywords";
  }

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

  return { weights, scores, source };
}

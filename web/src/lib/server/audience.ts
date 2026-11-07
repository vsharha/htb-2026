"use server";

// Scores the target customer against the tract columns with Jev, TypeSafe
// AI's decision model, through Vercel AI Gateway, then combines the real tract
// numbers in code. Jev sees the brief and the 21 column descriptions, never a
// tract: one request asks one score question per column.

import { experimental_decide as decide } from "ai";

import type { AudienceFit, Brief, ColumnWeight } from "@/lib/contract";
import { getAudienceModel, hasAudienceCredentials } from "@/lib/server/ai";
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

/**
 * The answer as a weight from -1 to 1. With per-level probabilities this is
 * the expected level, so a split between "for" and "strongly for" lands
 * between them; otherwise it is the single level Jev chose.
 */
function toWeight(answer: { score: number; probabilities?: Record<string, number> }) {
  const top = LEVELS.length - 1;
  let level = answer.score;
  const entries = Object.entries(answer.probabilities ?? {})
    .map(([key, p]) => [Number(key), p] as const)
    .filter(([i, p]) => Number.isInteger(i) && i >= 0 && i <= top && Number.isFinite(p));
  const total = entries.reduce((sum, [, p]) => sum + p, 0);
  if (total > 0) level = entries.reduce((sum, [i, p]) => sum + i * p, 0) / total;
  return Number(Math.max(-1, Math.min(1, (level / top) * 2 - 1)).toFixed(2));
}

async function jevWeights(columns: TractColumn[], brief: Brief): Promise<ColumnWeight[]> {
  const result = await decide({
    model: getAudienceModel(),
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
          instructions: `How does this trait of an area's ${c.measures === "lives" ? "residents" : c.measures === "works" ? "workers" : "passers-by"} relate to the startup's target customers? Trait: ${c.description}.`,
          criteria: LEVELS,
        },
      ]),
    ),
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
  });

  return columns.map((c) => {
    const answer = result.answers[c.name];
    if (answer?.type !== "score") throw new Error(`Jev returned no score for "${c.name}".`);
    return { column: c.name, description: c.description, measures: c.measures, weight: toWeight(answer) };
  });
}

export async function scoreAudience(brief: Brief): Promise<AudienceFit> {
  const [columns, tracts] = await Promise.all([
    readAnalysisJson<TractColumn[]>("columns.json"),
    readAnalysisCsv("nyc_tracts.csv"),
  ]);

  // Without gateway credentials, or if Jev fails, the keyword stand-in keeps
  // the page working, and `source` tells the page which one it got. Locally the
  // credential is AI_GATEWAY_API_KEY; on a Vercel deployment the AI SDK uses
  // the project's OIDC token when no key is set.
  let weights: ColumnWeight[];
  let source: AudienceFit["source"] = "jev";
  if (!hasAudienceCredentials()) {
    console.warn("No AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN; weighting the audience by keywords instead of Jev.");
    weights = keywordWeights(columns, brief.targetCustomer);
    source = "keywords";
  } else {
    try {
      weights = await jevWeights(columns, brief);
    } catch (error) {
      console.error("Jev failed; weighting the audience by keywords instead.", error);
      weights = keywordWeights(columns, brief.targetCustomer);
      source = "keywords";
    }
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

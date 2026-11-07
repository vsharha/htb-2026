"use server";

// Scores the target-customer sentence against the tract columns with OpenAI's
// Decisions API, then combines the real tract numbers in code. The model never
// sees a tract.

import { openai } from "@ai-sdk/openai";
import { experimental_decide as decide } from "ai";

import type { AudienceFit, Brief, ColumnWeight, Measure } from "@/lib/contract";
import { readAnalysisCsv, readAnalysisJson } from "@/lib/data";

type Column = {
  name: string;
  scaled: string;
  description: string;
  measures: Measure;
};

/**
 * How a column can push an area up or down for one target customer. The
 * direction belongs to the customer, not the column: a high income is good for
 * an affluent audience and bad for a low-income one, and `median_age` points
 * the opposite way for young and older audiences. Flattening these to positive
 * weights would make the product unable to describe either end of those
 * ranges, so the score question asks for direction and the weight keeps its
 * sign.
 */
const LEVELS = [
  "Strongly against: the target customers are much less likely to have this trait.",
  "Against: the target customers are somewhat less likely to have this trait.",
  "Not relevant: the sentence says nothing either way about this trait.",
  "For: the target customers are somewhat more likely to have this trait.",
  "Strongly for: the target customers are much more likely to have this trait.",
];

const MODEL = openai.decisionModel("gpt-6-luna");

export async function scoreAudience(brief: Brief): Promise<AudienceFit> {
  try {
    return await score(brief);
  } catch (error) {
    console.error("Audience scoring failed", error);
    throw new Error(
      `Audience scoring failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function score(brief: Brief): Promise<AudienceFit> {
  const [columns, tracts] = await Promise.all([
    readAnalysisJson<Column[]>("columns.json"),
    readAnalysisCsv("nyc_tracts.csv"),
  ]);

  const result = await decide({
    model: MODEL,
    state: brief.targetCustomer,
    questions: Object.fromEntries(
      columns.map((column) => [
        column.name,
        {
          type: "score" as const,
          instructions: `How does this trait relate to the target customers? Trait: ${column.description}.`,
          criteria: LEVELS,
        },
      ]),
    ),
  });

  const weights: ColumnWeight[] = columns.map((column) => {
    const answer = result.answers[column.name];
    if (answer?.type !== "score") {
      throw new Error(`The model returned no score for "${column.name}".`);
    }
    const signed = (answer.score / (LEVELS.length - 1)) * 2 - 1;
    return {
      column: column.name,
      description: column.description,
      measures: column.measures,
      weight: Number(Math.min(1, Math.max(-1, signed)).toFixed(2)),
    };
  });

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

  return { weights, scores };
}

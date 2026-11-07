"use server";

// Stand-ins for the audience fit and placement Server Functions. They read
// the real tract and placement data, but replace Jev with keyword matching
// and invent placement costs.

import type {
  AudienceFit,
  Borough,
  Brief,
  ColumnWeight,
  Measure,
  Placement,
  PlacementQuery,
} from "@/lib/contract";

import { delay, hashUnit, readAnalysisCsv, readAnalysisJson } from "./data-files";

type Column = {
  name: string;
  scaled: string;
  description: string;
  measures: Measure;
};

const KEYWORDS: [RegExp, string[]][] = [
  [/young|gen ?z|20s|twent|millennial/i, ["share_age_20_34", "share_jobs_age_29_under"]],
  [/student|college|universit|grad/i, ["share_college_students", "share_age_20_34"]],
  [/afflu|wealth|rich|high.income|premium|luxury/i, ["share_income_150k", "per_capita_income", "share_jobs_high_earnings"]],
  [/professional|office|white.collar|consult|lawyer/i, ["share_jobs_professional", "share_jobs_degree", "share_degree"]],
  [/financ|bank|trader|invest|fintech/i, ["share_jobs_finance", "share_jobs_high_earnings"]],
  [/develop|engineer|software|tech|startup|designer|media/i, ["share_jobs_information", "share_jobs_professional"]],
  [/nurse|doctor|health|clinic|hospital/i, ["share_jobs_health"]],
  [/teacher|educat|school/i, ["share_jobs_education"]],
  [/retail|shop|store/i, ["share_jobs_retail"]],
  [/artist|creative|music|museum|theat/i, ["share_jobs_arts"]],
  [/restaurant|chef|bar|hospitality|food/i, ["share_jobs_food"]],
  [/commut|subway|transit|on the go|busy/i, ["weekly_riders_nearby"]],
  [/older|retire|senior|parent|famil/i, ["median_age"]],
];

const BASELINE: Record<string, number> = {
  population: 0.15,
  jobs: 0.15,
  weekly_riders_nearby: 0.2,
};

function weightColumns(columns: Column[], targetCustomer: string): ColumnWeight[] {
  const weights = new Map(Object.entries(BASELINE));
  for (const [pattern, names] of KEYWORDS) {
    if (!pattern.test(targetCustomer)) continue;
    for (const name of names) weights.set(name, 0.6 + 0.4 * hashUnit(targetCustomer + name));
  }
  return columns.map((c) => ({
    column: c.name,
    description: c.description,
    measures: c.measures,
    weight: Number((weights.get(c.name) ?? 0).toFixed(2)),
  }));
}

export async function scoreAudience(brief: Brief): Promise<AudienceFit> {
  const [columns, tracts] = await Promise.all([
    readAnalysisJson<Column[]>("columns.json"),
    readAnalysisCsv("nyc_tracts.csv"),
  ]);
  const weights = weightColumns(columns, brief.targetCustomer);
  const markets = new Set<string>(brief.markets);

  const raw: [string, number][] = [];
  for (const tract of tracts) {
    if (!markets.has(tract.borough)) continue;
    let sum = 0;
    let total = 0;
    for (const [i, w] of weights.entries()) {
      if (w.weight === 0) continue;
      sum += w.weight * Number(tract[columns[i].scaled]);
      total += w.weight;
    }
    raw.push([tract.geoid, total ? sum / total : 0]);
  }

  // Rescale by rank so the strongest tracts reach 1 whatever the weights.
  raw.sort((a, b) => a[1] - b[1]);
  const scores: Record<string, number> = {};
  raw.forEach(([geoid], i) => {
    scores[geoid] = Number((i / Math.max(raw.length - 1, 1)).toFixed(4));
  });

  await delay(700);
  return { weights, scores };
}

const MEASUREMENTS: Placement["measurement"][] = ["QR code", "promo code", "landing page"];

export async function findPlacements(query: PlacementQuery): Promise<Placement[]> {
  const rows = await readAnalysisCsv("nyc_placements.csv");
  const rank = new Map(query.geoids.map((g, i) => [g, i]));

  const placements: Placement[] = rows
    .filter((r) => rank.has(r.geoid) && r.carries_ads !== "no")
    .map((r) => {
      const base = r.kind === "linknyc" ? 0.02 : 0.035;
      return {
        id: r.placement_id,
        kind: r.kind as Placement["kind"],
        address: r.address,
        borough: r.borough as Borough,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        geoid: r.geoid,
        carriesAds: r.carries_ads as Placement["carriesAds"],
        costPerAudienceMember: Number((base * (0.6 + hashUnit(r.placement_id))).toFixed(3)),
        measurement: MEASUREMENTS[Math.floor(hashUnit(r.placement_id + "m") * 3)],
      };
    });

  // Stand-in minimum spends: a budget under $2,000 a month rules out bus shelters.
  const affordable = placements.filter(
    (p) => query.monthlyBudget >= 2000 || p.kind === "linknyc",
  );
  affordable.sort(
    (a, b) =>
      rank.get(a.geoid)! - rank.get(b.geoid)! ||
      a.costPerAudienceMember - b.costPerAudienceMember,
  );

  await delay(400);
  return affordable.slice(0, 12);
}

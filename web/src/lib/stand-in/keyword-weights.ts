// Weights the tract columns by matching keywords in the target customer
// sentence. Audience scoring falls back to this when Clef can't be reached.

import type { ColumnWeight } from "@/lib/contract";
import type { TractColumn } from "@/lib/tract-columns";

import { hashUnit } from "./data-files";

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

export function keywordWeights(columns: TractColumn[], targetCustomer: string): ColumnWeight[] {
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

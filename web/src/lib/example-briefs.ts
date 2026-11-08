import { CITIES, type Brief } from "@/lib/contract";

/**
 * Briefs run through the live competitor agent on 8 November 2026, best first.
 * The note is what a run of a longer wording of the brief returned, so a
 * rehearsal knows what to expect.
 *
 * The text must fit the form's one-line blanks. The first brief's description
 * and target customer must match data/competitors/sample-run.json exactly, or
 * its recorded run stops replaying.
 */
export const EXAMPLE_BRIEFS: { name: string; note: string; brief: Brief }[] = [
  {
    name: "Dating app",
    note: "Four competitors, twelve ads, five on the map, one recent enough for the Gap tab. Also what the empty form submits.",
    brief: {
      industry: "Consumer app",
      description: "a dating app for serious relationships",
      targetCustomer: "single professionals in their 20s and 30s",
      customerPays: { amount: 30, per: "month" },
      monthlyBudget: 8000,
      city: CITIES[0].id,
      markets: [...CITIES[0].areas],
    },
  },
  {
    name: "Budget gym",
    note: "Five competitors, eight ads, four on the map. Some findings drift off-category.",
    brief: {
      industry: "Health and wellness",
      description: "a budget gym chain near offices",
      targetCustomer: "young professionals on a budget",
      customerPays: { amount: 25, per: "month" },
      monthlyBudget: 5000,
      city: CITIES[0].id,
      markets: [...CITIES[0].areas],
    },
  },
  {
    name: "Dinner delivery",
    note: "Four competitors, ten ads, three on the map. The most variable of the three.",
    brief: {
      industry: "Consumer app",
      description: "a dinner delivery app for office workers",
      targetCustomer: "busy office workers in Manhattan",
      customerPays: { amount: 25, per: "purchase" },
      monthlyBudget: 10000,
      city: CITIES[0].id,
      markets: [...CITIES[0].areas],
    },
  },
];

/** What submitting the completely empty form runs. */
export const SAMPLE_BRIEF = EXAMPLE_BRIEFS[0].brief;

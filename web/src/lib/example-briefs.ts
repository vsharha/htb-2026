import { CITIES, type Brief } from "@/lib/contract";

/**
 * Briefs run through the live competitor agent on 8 November 2026, best first.
 * The note is what that run returned, so a rehearsal knows what to expect.
 */
export const EXAMPLE_BRIEFS: { name: string; note: string; brief: Brief }[] = [
  {
    name: "Dating app",
    note: "Four competitors, twelve ads, five on the map, one recent enough for the Gap tab. Also what the empty form submits.",
    brief: {
      industry: "Consumer app",
      description: "a dating app for people looking for a serious relationship",
      targetCustomer: "single professionals in their late twenties and thirties living in Manhattan and Brooklyn",
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
      description: "a budget gym chain with locations near offices",
      targetCustomer: "young professionals who want an affordable gym near their office",
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
      targetCustomer: "busy office workers in Manhattan who order dinner on weeknights",
      customerPays: { amount: 25, per: "purchase" },
      monthlyBudget: 10000,
      city: CITIES[0].id,
      markets: [...CITIES[0].areas],
    },
  },
];

/** What submitting the completely empty form runs. */
export const SAMPLE_BRIEF = EXAMPLE_BRIEFS[0].brief;

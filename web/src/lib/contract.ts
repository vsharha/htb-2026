// Shapes passed between the browser and the server. The stand-ins in
// `stand-in/` and the real backend both produce exactly these, so the UI
// does not change when one replaces the other.

export const BOROUGHS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
] as const;
export type Borough = (typeof BOROUGHS)[number];

/** Cities with a prepared dataset, and the areas each one maps. */
export const CITIES = [
  { id: "new-york", name: "New York", areas: BOROUGHS },
] as const;
export type CityId = (typeof CITIES)[number]["id"];

export const INDUSTRIES = [
  "Fintech",
  "Consumer app",
  "Developer tools",
  "Health and wellness",
  "Food and drink",
  "Education",
  "Retail and e-commerce",
  "Other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

/** The onboarding form. */
export type Brief = {
  industry: Industry;
  description: string;
  targetCustomer: string;
  customerPays: { amount: number; per: "month" | "purchase" };
  monthlyBudget: number;
  city: CityId;
  /** Every area of the chosen city; the form does not let the startup narrow them. */
  markets: Borough[];
};

/** Whether a tract column describes where people live, work or pass through. */
export type Measure = "lives" | "works" | "passes";

/** One column of the tract dataset, weighted by how strongly the target customer sentence implies it. */
export type ColumnWeight = {
  column: string;
  description: string;
  measures: Measure;
  /** -1 to 1: positive when the target customers are more likely to have the trait, negative when less. */
  weight: number;
};

/** Returned by the audience fit Server Function. */
export type AudienceFit = {
  weights: ColumnWeight[];
  /** Census tract GEOID to a score from 0 to 1. Tracts outside the brief's markets are absent. */
  scores: Record<string, number>;
  /** Whether Jev weighted the columns, or the keyword fallback did because Jev couldn't be reached. */
  source: "jev" | "keywords";
};

export type Station = {
  id: string;
  name: string;
  borough: Borough;
  latitude: number;
  longitude: number;
  weeklyRiders: number;
};

export type Competitor = { name: string; reason: string };

export type Campaign = {
  competitor: string;
  title: string;
  kind: "subway" | "billboard" | "bus shelter" | "linknyc" | "other";
  sourceUrl: string;
  /** The subway station the server matched the campaign to, or null when it could not place it. */
  station: Station | null;
};

/** One message streamed by the competitor-campaign agent's Route Handler. */
export type AgentEvent =
  | { type: "step"; message: string }
  | { type: "competitor"; competitor: Competitor }
  | { type: "campaign"; campaign: Campaign }
  | { type: "done" }
  | { type: "error"; message: string };

export type Placement = {
  id: string;
  kind: "linknyc" | "bus_shelter";
  address: string;
  borough: Borough;
  latitude: number;
  longitude: number;
  geoid: string;
  carriesAds: "yes" | "no" | "unknown";
  /** Estimated US dollars per target customer reached. */
  costPerAudienceMember: number;
  measurement: "QR code" | "promo code" | "landing page";
};

export type PlacementQuery = {
  /** The tracts to search, strongest first. */
  geoids: string[];
  monthlyBudget: number;
};

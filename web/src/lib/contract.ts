// Shapes passed between the browser and the server. The stand-ins in
// `stand-in/` and the real backend both produce exactly these, so the UI
// does not change when one replaces the other.

import type { UIMessage } from "ai";

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
  /** Whether the decision model weighted the columns, and how long it took. */
  stats?: { model: string; durationMs: number; inputTokens?: number };
  /** Which decision model weighted the columns, or the keyword fallback because neither could be reached. */
  source: "systemone" | "jev" | "keywords";
};

export type Station = {
  id: string;
  name: string;
  borough: Borough;
  latitude: number;
  longitude: number;
  weeklyRiders: number;
};

export type Competitor = {
  name: string;
  reason: string;
  sourceUrl: string;
  /** The competitor's own site, which a logo is loaded from. Null when research couldn't establish it. */
  website: string | null;
};

export type CampaignLocation = {
  latitude: number;
  longitude: number;
  label: string;
  precision: "station" | "address" | "area";
  source: "station" | "geoapify" | "street-centerline";
  attribution: string;
};

export type Campaign = {
  competitor: string;
  title: string;
  kind: "subway" | "billboard" | "bus shelter" | "linknyc" | "other";
  sourceUrl: string;
  evidence: string;
  location: string | null;
  startsOn: string | null;
  endsOn: string | null;
  /** "recent" means the source shows the campaign running within the past 12 months; the ad may no longer be up. */
  coverage: "current" | "recent" | "historical" | "unknown";
  /** The latest date the source shows the campaign running. Older recordings do not have it. */
  latestEvidenceOn?: string | null;
  /** The subway station the server matched the campaign to, or null when it could not place it. */
  station: Station | null;
  /** Older recordings may contain only a station match. */
  mapLocation?: CampaignLocation | null;
  locationNote?: string;
  /** Set when the source describes a campaign spread across the city or a borough, which no single map point can represent. */
  reach?: "citywide" | "borough";
};

export type ResearchSummary = {
  status: "complete" | "partial" | "failed" | "timed-out";
  searches: number;
  sources: number;
  rejectedSources: number;
  competitorsSearched: string[];
  competitorsCompleted: string[];
};

/**
 * One entry in the agent's trace: what the model said it was thinking, or a
 * tool it called. `stage` names the phase or the competitor being researched.
 */
export type TraceEntry =
  | { kind: "thought"; stage: string; text: string }
  | { kind: "tool"; stage: string; tool: string; detail: string };

/** One message streamed by the competitor-campaign agent's Route Handler. */
export type AgentEvent =
  | { type: "step"; message: string }
  | { type: "trace"; entry: TraceEntry }
  | { type: "competitor"; competitor: Competitor }
  | { type: "campaign"; campaign: Campaign }
  | { type: "recording"; recordedAt: string }
  | { type: "research"; summary: ResearchSummary }
  | { type: "done" }
  | { type: "error"; message: string };

export type AgentMessage = UIMessage<never, { agent: AgentEvent }>;

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
};

export type PlacementQuery = {
  /** The tracts to search, strongest first. */
  geoids: string[];
  monthlyBudget: number;
};

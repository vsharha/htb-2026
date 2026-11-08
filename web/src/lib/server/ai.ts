import "server-only";

import { openai } from "@ai-sdk/openai";
import { APICallError, createProviderRegistry, gateway } from "ai";

const providers = createProviderRegistry({ openai, gateway });
type ModelId = `openai:${string}` | `gateway:${string}`;

export const AI_MODELS = {
  competitor: "openai:gpt-5.6-luna",
  audience: "gateway:typesafe-ai/jev",
  systemOne: "clef-flash",
} as const satisfies { competitor: ModelId; audience: `gateway:${string}`; systemOne: string };

type ResearchEvent = {
  type: string;
  sourceType?: string;
  url?: string;
  toolName?: string;
  output?: unknown;
};

type ResearchObservation = { urls: string[]; message?: string; searched?: boolean; tool?: "web_search" | "open_page" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOpenAIResearchEvent(event: ResearchEvent): ResearchObservation {
  if (event.type === "source" && event.sourceType === "url" && event.url) return { urls: [event.url] };
  if (event.type !== "tool-result" || event.toolName !== "web_search" || !isRecord(event.output)) return { urls: [] };
  const output = event.output;
  const urls = Array.isArray(output.sources)
    ? output.sources.flatMap((source) => isRecord(source) && source.type === "url" && typeof source.url === "string" ? [source.url] : [])
    : [];
  const action = output.action;
  if (!isRecord(action)) return { urls };
  if (action.type === "search") {
    const queries = Array.isArray(action.queries) ? action.queries.filter((query): query is string => typeof query === "string") : [];
    const query = queries.join("; ") || (typeof action.query === "string" ? action.query : "New York outdoor campaigns");
    return { urls, message: `Searching: ${query}`, searched: true, tool: "web_search" };
  }
  if (action.type === "openPage" && typeof action.url === "string") {
    try {
      const url = new URL(action.url);
      if (url.protocol === "https:" || url.protocol === "http:") return { urls: [...urls, action.url], message: `Reading ${url.hostname}`, tool: "open_page" };
    } catch {
      return { urls };
    }
  }
  return { urls };
}

function openAIResearchFailure(error: unknown) {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401 || error.statusCode === 403) return "OpenAI rejected the key or model access. Check OPENAI_API_KEY and the API account's model access. Competition coverage is unknown.";
    if (error.statusCode === 429) return "OpenAI quota or rate limit reached. Check the API account's credits and limits. Competition coverage is incomplete.";
  }
  return "Competitor research could not finish. Findings already shown are kept; all other coverage is unknown.";
}

export function getCompetitorAI(modelId: ModelId = AI_MODELS.competitor) {
  if (!modelId.startsWith("openai:")) {
    throw new Error(`Competitor research has no search adapter for ${modelId}. Add compatible search tools, options and source handling before selecting this provider.`);
  }
  return {
    model: providers.languageModel(modelId),
    tools: { web_search: openai.tools.webSearch({ searchContextSize: "high" }) },
    providerOptions: { openai: { reasoningEffort: "low", reasoningSummary: "auto", store: false, parallelToolCalls: true, maxToolCalls: 8 } },
    configured: Boolean(process.env.OPENAI_API_KEY),
    missingCredentialsMessage: "Competitor search needs OPENAI_API_KEY in web/.env.local. Competition coverage is unknown.",
    readEvent: readOpenAIResearchEvent,
    failureMessage: openAIResearchFailure,
  };
}

export function getAudienceModel() {
  return providers.decisionModel(AI_MODELS.audience);
}

/**
 * Which decision model is tried first. Jev is the default, so a checkout with
 * both keys set still uses Jev; only an explicit AUDIENCE_MODEL=systemone,
 * which the Vultr deployment sets, prefers the self-hosted model.
 */
export function getAudiencePreference(): "jev" | "systemone" {
  return process.env.AUDIENCE_MODEL === "systemone" ? "systemone" : "jev";
}

/**
 * The self-hosted System One endpoint, when SYSTEMONE_BASE_URL names one.
 * It speaks the same /v1/systemone protocol as Jev, so it is called over
 * fetch rather than through the AI SDK. Null means use Jev instead.
 */
export function getSystemOneConfig() {
  const base = process.env.SYSTEMONE_BASE_URL?.replace(/\/+$/, "");
  if (!base) return null;
  return {
    url: base.endsWith("/v1/systemone") ? base : `${base}/v1/systemone`,
    model: process.env.SYSTEMONE_MODEL ?? AI_MODELS.systemOne,
    token: process.env.SYSTEMONE_API_TOKEN,
  };
}

export function hasAudienceCredentials() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

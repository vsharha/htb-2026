import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

import { BOROUGHS, INDUSTRIES, type AgentEvent, type AgentMessage, type Brief } from "@/lib/contract";
import { agentFailure, replayCompetitorResearch, runCompetitorResearch } from "@/lib/server/competitor-agent";

export const runtime = "nodejs";
export const maxDuration = 180;

function isBrief(value: unknown): value is Brief {
  if (!value || typeof value !== "object") return false;
  const brief = value as Partial<Brief>;
  const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= 2000;
  return INDUSTRIES.some((i) => i === brief.industry) && text(brief.description) && text(brief.targetCustomer)
    && brief.city === "new-york" && Array.isArray(brief.markets) && brief.markets.length > 0
    && brief.markets.length <= BOROUGHS.length && brief.markets.every((m) => BOROUGHS.includes(m))
    && typeof brief.monthlyBudget === "number" && Number.isFinite(brief.monthlyBudget) && brief.monthlyBudget > 0
    && !!brief.customerPays && typeof brief.customerPays.amount === "number"
    && Number.isFinite(brief.customerPays.amount) && brief.customerPays.amount >= 0
    && (brief.customerPays.per === "month" || brief.customerPays.per === "purchase");
}

export async function POST(request: Request) {
  let brief: unknown;
  try {
    const body = await request.text();
    if (body.length > 12_000) return Response.json({ error: "Brief is too large." }, { status: 413 });
    brief = JSON.parse(body);
  } catch {
    return Response.json({ error: "Expected a JSON startup brief." }, { status: 400 });
  }
  if (!isBrief(brief)) return Response.json({ error: "Invalid startup brief." }, { status: 400 });
  const input = brief;
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(170_000)]);
  const stream = createUIMessageStream<AgentMessage>({
    async execute({ writer }) {
      writer.write({ type: "start" });
      const emit = (event: AgentEvent) => {
        if (!request.signal.aborted) writer.write({ type: "data-agent", data: event });
      };
      let complete = false;
      let hasFindings = false;
      const report = (event: AgentEvent) => {
        if (event.type === "competitor" || event.type === "campaign") hasFindings = true;
        emit(event);
      };
      try {
        complete = await runCompetitorResearch(input, signal, report);
      } catch (error) {
        emit({ type: "error", message: signal.aborted ? "Competitor search reached its time limit. Findings are partial; remaining coverage is unknown." : agentFailure(error) });
      } finally {
        if (!complete && !hasFindings && !request.signal.aborted) {
          try {
            await replayCompetitorResearch(input, emit);
          } catch {
            emit({ type: "error", message: "The recorded research could not be loaded. Competition coverage remains unknown." });
          }
        }
        emit({ type: "done" });
        writer.write({ type: "finish" });
      }
    },
    onError: agentFailure,
  });
  return createUIMessageStreamResponse({ stream, headers: {
    "Cache-Control": "no-cache, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Accel-Buffering": "no",
  } });
}

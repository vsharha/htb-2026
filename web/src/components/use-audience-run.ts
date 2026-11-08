"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { findPlacements, runCompetitorAgent } from "@/lib/api";
import type { AgentEvent, AudienceFit, Brief, Campaign, Competitor, Placement } from "@/lib/contract";
import { useSettings } from "@/lib/settings";
import { registerNeighborhoods } from "@/lib/tracts";
import { computeLayers, recommendationLayer, strongest, type TractShapes } from "@/lib/gap";

export type RunState = {
  shapes: TractShapes | null;
  fit: AudienceFit | null;
  /** How much of the audience scoring has arrived, so the page can show progress. */
  scoring: { answered: number; total: number } | null;
  events: AgentEvent[];
  agentDone: boolean;
  placements: Placement[] | null;
  error: string | null;
};

const EMPTY: RunState = {
  shapes: null,
  fit: null,
  scoring: null,
  events: [],
  agentDone: false,
  placements: null,
  error: null,
};

let shapesRequest: Promise<TractShapes> | null = null;

/**
 * Scores the brief through the streaming Route Handler, calling `onFit` after
 * each batch so the map can fill in, and resolves with the complete fit.
 */
async function streamAudience(
  brief: Brief,
  signal: AbortSignal,
  onFit: (fit: AudienceFit & { answered: number; total: number }) => void,
) {
  const response = await fetch("/api/audience", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brief),
    signal,
  });
  if (!response.ok || !response.body) throw new Error(`Scoring failed (HTTP ${response.status})`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let complete: AudienceFit | null = null;

  const read = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as {
      type: string;
      fit?: AudienceFit & { answered: number; total: number };
      message?: string;
    };
    if (event.type === "error") throw new Error(event.message ?? "Scoring failed");
    if (event.type === "fit" && event.fit) {
      complete = event.fit;
      onFit(event.fit);
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) read(line);
  }
  if (buffer) read(buffer);
  if (!complete) throw new Error("Scoring returned no result");
  return complete;
}

/** The tract shapes, fetched once per page load. */
function loadShapes() {
  shapesRequest ??= fetch("/api/tracts").then(async (r) => {
    if (!r.ok) throw new Error(`Could not load the tract shapes (HTTP ${r.status})`);
    const shapes: TractShapes = await r.json();
    registerNeighborhoods(shapes);
    return shapes;
  });
  return shapesRequest;
}

/** Identifies a campaign within one run; campaigns are only ever appended, so the index is stable. */
export function campaignId(campaign: Campaign, index: number) {
  return `${index}|${campaign.sourceUrl}|${campaign.title}`;
}

export function campaignsOf(events: AgentEvent[]): Campaign[] {
  return events.flatMap((e) => (e.type === "campaign" ? [e.campaign] : []));
}

export function competitorsOf(events: AgentEvent[]): Competitor[] {
  return events.flatMap((e) => (e.type === "competitor" ? [e.competitor] : []));
}

export function useAudienceRun() {
  const [run, setRun] = useState<RunState | null>(null);
  const controller = useRef<AbortController | null>(null);

  const start = useCallback(async (brief: Brief) => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setRun(EMPTY);
    const update = (patch: (r: RunState) => Partial<RunState>) => {
      if (!ctrl.signal.aborted) setRun((r) => (r ? { ...r, ...patch(r) } : r));
    };

    try {
      const events: AgentEvent[] = [];
      const agent = (async () => {
        for await (const event of runCompetitorAgent(brief, ctrl.signal)) {
          events.push(event);
          update((r) => ({ events: [...r.events, event] }));
        }
        update(() => ({ agentDone: true }));
      })();
      const [shapes, fit] = await Promise.all([
        loadShapes().then((shapes) => {
          update(() => ({ shapes }));
          return shapes;
        }),
        streamAudience(brief, ctrl.signal, (batch) => {
          update(() => ({ fit: batch, scoring: { answered: batch.answered, total: batch.total } }));
        }).then((fit) => {
          update(() => ({ fit, scoring: null }));
          return fit;
        }),
      ]);

      const rankPlacements = async () => {
        if (ctrl.signal.aborted) return;
        const campaigns = campaignsOf(events);
        const layers = computeLayers(shapes, fit, campaigns);
        const found = await findPlacements({
          geoids: strongest(layers, recommendationLayer(campaigns), Object.keys(layers).length),
          monthlyBudget: brief.monthlyBudget,
        });
        update(() => ({ placements: found }));
      };
      await rankPlacements();
      await agent;
      await rankPlacements();
    } catch (e) {
      if (!ctrl.signal.aborted) {
        update(() => ({ error: e instanceof Error ? e.message : String(e) }));
      }
    }
  }, []);

  // The experimental cost estimate orders the list cheapest first, so the list,
  // the map numbers and the "lowest cost" tag agree; without it the order stays
  // by area.
  const { cost } = useSettings();
  const ordered = useMemo(
    () =>
      run?.placements && cost
        ? { ...run, placements: [...run.placements].sort((a, b) => a.costPerAudienceMember - b.costPerAudienceMember) }
        : run,
    [run, cost],
  );

  return { run: ordered, start };
}

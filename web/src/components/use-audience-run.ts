"use client";

import { useCallback, useRef, useState } from "react";

import { findPlacements, runCompetitorAgent, scoreAudience } from "@/lib/api";
import type { AgentEvent, AudienceFit, Brief, Campaign, Placement } from "@/lib/contract";
import { computeLayers, strongest, type TractShapes } from "@/lib/gap";

export type RunState = {
  shapes: TractShapes | null;
  fit: AudienceFit | null;
  events: AgentEvent[];
  agentDone: boolean;
  placements: Placement[] | null;
  error: string | null;
};

const EMPTY: RunState = {
  shapes: null,
  fit: null,
  events: [],
  agentDone: false,
  placements: null,
  error: null,
};

let shapesRequest: Promise<TractShapes> | null = null;

/** The tract shapes, fetched once per page load. */
function loadShapes() {
  shapesRequest ??= fetch("/api/tracts").then((r) => {
    if (!r.ok) throw new Error(`Could not load the tract shapes (HTTP ${r.status})`);
    return r.json();
  });
  return shapesRequest;
}

export function campaignsOf(events: AgentEvent[]): Campaign[] {
  return events.flatMap((e) => (e.type === "campaign" ? [e.campaign] : []));
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
        scoreAudience(brief).then((fit) => {
          update(() => ({ fit }));
          return fit;
        }),
      ]);

      const rankPlacements = async () => {
        if (ctrl.signal.aborted) return;
        const layers = computeLayers(shapes, fit, campaignsOf(events));
        const placements = await findPlacements({
          geoids: strongest(layers, "gap", Object.keys(layers).length),
          monthlyBudget: brief.monthlyBudget,
        });
        update(() => ({ placements }));
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

  const busy = run !== null && !run.error && (run.placements === null || !run.agentDone);
  return { run, start, busy };
}

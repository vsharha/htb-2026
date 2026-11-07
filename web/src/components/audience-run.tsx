"use client";

import { useRef, useState } from "react";

import { BriefForm } from "@/components/brief-form";
import { RunResults, type RunState } from "@/components/run-results";
import { findPlacements, runCompetitorAgent, scoreAudience } from "@/lib/api";
import type { Brief } from "@/lib/contract";
import { topTracts } from "@/lib/tracts";

const EMPTY: RunState = { fit: null, events: [], agentDone: false, placements: null, error: null };

export function AudienceRun() {
  const [run, setRun] = useState<RunState | null>(null);
  const controller = useRef<AbortController | null>(null);

  async function start(brief: Brief) {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setRun(EMPTY);
    const update = (patch: (r: RunState) => Partial<RunState>) => {
      if (!ctrl.signal.aborted) setRun((r) => (r ? { ...r, ...patch(r) } : r));
    };

    const agent = (async () => {
      for await (const event of runCompetitorAgent(brief, ctrl.signal)) {
        update((r) => ({ events: [...r.events, event] }));
      }
      update(() => ({ agentDone: true }));
    })();

    const audience = (async () => {
      const fit = await scoreAudience(brief);
      update(() => ({ fit }));
      const geoids = topTracts(fit.scores, 15).map(([g]) => g);
      const placements = await findPlacements({ geoids, monthlyBudget: brief.monthlyBudget });
      update(() => ({ placements }));
    })();

    try {
      await Promise.all([agent, audience]);
    } catch (e) {
      if (!ctrl.signal.aborted) {
        update(() => ({ error: e instanceof Error ? e.message : String(e) }));
      }
    }
  }

  const busy = run !== null && !run.error && (!run.agentDone || run.placements === null);

  return (
    <div className="flex flex-col gap-20">
      <BriefForm onSubmit={start} busy={busy} />
      {run && <RunResults run={run} />}
    </div>
  );
}

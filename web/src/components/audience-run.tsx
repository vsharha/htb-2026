"use client";

import { BriefForm } from "@/components/brief-form";
import { RunResults } from "@/components/run-results";
import { useAudienceRun } from "@/components/use-audience-run";

export function AudienceRun() {
  const { run, start, busy } = useAudienceRun();

  return (
    <div className="flex flex-col gap-20">
      <BriefForm onSubmit={start} busy={busy} />
      {run && <RunResults run={run} />}
    </div>
  );
}

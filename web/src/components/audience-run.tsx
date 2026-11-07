"use client";

import type { ReactNode } from "react";

import { BriefForm } from "@/components/brief-form";
import { RunResults } from "@/components/run-results";
import { useAudienceRun } from "@/components/use-audience-run";

const sheet = "bg-card text-card-foreground shadow-[0_24px_60px_-20px_rgb(21_23_28/0.35)]";

export function AudienceRun({ header }: { header: ReactNode }) {
  const { run, start, busy } = useAudienceRun();

  return (
    <>
      <section className={`${sheet} flex flex-col gap-12 rounded-b-[2.5rem] px-6 pt-8 pb-12 sm:px-14 sm:pt-12 sm:pb-16`}>
        {header}
        <BriefForm onSubmit={start} busy={busy} />
      </section>
      {run && (
        <section className={`${sheet} rounded-[2.5rem] px-6 py-10 sm:px-14 sm:py-14`}>
          <RunResults run={run} />
        </section>
      )}
    </>
  );
}

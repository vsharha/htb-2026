"use client";

import { useState } from "react";

import { BriefForm } from "@/components/brief-form";
import { HeatGlow } from "@/components/heat-glow";
import { ResultsSplit } from "@/components/results-split";
import { SiteHeader } from "@/components/site-header";
import { useAudienceRun } from "@/components/use-audience-run";
import type { Brief } from "@/lib/contract";

const sheet = "bg-card text-card-foreground shadow-[0_24px_60px_-20px_rgb(21_23_28/0.35)]";

/**
 * The form on the heat glow until it is submitted, then the results expand
 * over it from the bottom. The form stays mounted while hidden, so editing
 * the brief brings it back with the answers still in it.
 */
export function AudienceRun() {
  const { run, start, busy } = useAudienceRun();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [editing, setEditing] = useState(true);
  const [revealing, setRevealing] = useState(false);

  function submit(next: Brief) {
    setBrief(next);
    setEditing(false);
    setRevealing(true);
    window.scrollTo({ top: 0, behavior: "instant" });
    start(next);
  }

  const showResults = !editing && run && brief;

  return (
    <div className={`relative isolate flex-1${revealing ? " overflow-clip" : ""}`}>
      <div
        hidden={!!showResults && !revealing}
        inert={!!showResults}
        className={showResults ? "absolute inset-0" : "relative"}
      >
        <HeatGlow />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 sm:px-8">
          <section className={`${sheet} flex flex-col gap-12 rounded-b-[2.5rem] px-6 pt-8 pb-12 sm:px-14 sm:pt-12 sm:pb-16`}>
            <SiteHeader />
            <BriefForm onSubmit={submit} busy={busy} />
          </section>
        </main>
      </div>
      {showResults && (
        <main
          aria-label="Audience results"
          tabIndex={-1}
          className={`relative z-10 min-h-dvh bg-card outline-none${revealing ? " results-reveal" : ""}`}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            setRevealing(false);
            if (!event.currentTarget.contains(document.activeElement)) {
              event.currentTarget.focus({ preventScroll: true });
            }
          }}
        >
          <ResultsSplit
            run={run}
            brief={brief}
            onEditBrief={() => {
              setRevealing(false);
              setEditing(true);
            }}
          />
        </main>
      )}
    </div>
  );
}

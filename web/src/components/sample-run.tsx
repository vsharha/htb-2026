"use client";

import { useEffect } from "react";

import { LayerTabs } from "@/components/layer-tabs";
import { MapPanel } from "@/components/map-panel";
import { ResultsList, useRunView } from "@/components/run-results";
import { SiteHeader } from "@/components/site-header";
import { useAudienceRun, type RunState } from "@/components/use-audience-run";
import { BOROUGHS, type Brief } from "@/lib/contract";

const SAMPLE_BRIEF: Brief = {
  industry: "Fintech",
  description: "a budgeting app for shared flats",
  targetCustomer: "young professionals in tech who rent with roommates",
  customerPays: { amount: 12, per: "month" },
  monthlyBudget: 3000,
  city: "new-york",
  markets: [...BOROUGHS],
};

/**
 * The map fills the left two thirds and stays in view while the results
 * scroll in the right third. On narrow screens the map sits on top and the
 * page scrolls as a whole.
 */
function SplitResults({ run }: { run: RunState }) {
  const { layer, setLayer, campaigns, layers, focus } = useRunView(run);
  return (
    <div className="flex flex-col bg-card text-card-foreground lg:grid lg:h-dvh lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:overflow-hidden">
      <div className="flex flex-col gap-5 px-5 py-4 sm:px-8 lg:col-start-2 lg:pt-8 lg:pb-2">
        <SiteHeader />
        <LayerTabs layer={layer} onChange={setLayer} />
      </div>
      <MapPanel
        shapes={run.shapes}
        layers={layers}
        campaigns={campaigns}
        placements={run.placements}
        layer={layer}
        focus={focus}
        className="h-[55dvh] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-full"
      />
      <aside className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:col-start-2 lg:min-h-0 lg:overflow-y-auto lg:pt-6">
        <p className="text-sm text-muted-foreground">
          A {SAMPLE_BRIEF.industry.toLowerCase()} startup building {SAMPLE_BRIEF.description}, for{" "}
          {SAMPLE_BRIEF.targetCustomer}. ${SAMPLE_BRIEF.monthlyBudget.toLocaleString("en-US")} a month in New York.
        </p>
        <ResultsList run={run} layers={layers} campaigns={campaigns} layer={layer} focus={focus} />
      </aside>
    </div>
  );
}

/** Runs a fixed brief on load, so the results can be designed without filling in the form. */
export function SampleRun() {
  const { run, start } = useAudienceRun();

  useEffect(() => {
    start(SAMPLE_BRIEF);
  }, [start]);

  return run && <SplitResults run={run} />;
}

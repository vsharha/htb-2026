"use client";

import { PencilLine } from "lucide-react";

import { LayerTabs } from "@/components/layer-tabs";
import { MapPanel } from "@/components/map-panel";
import { ResultsList, useRunView } from "@/components/run-results";
import { SiteHeader } from "@/components/site-header";
import type { RunState } from "@/components/use-audience-run";
import { CITIES, type Brief } from "@/lib/contract";
import { recommendationLayer } from "@/lib/gap";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function BriefSummary({ brief }: { brief: Brief }) {
  const city = CITIES.find((c) => c.id === brief.city)?.name ?? brief.city;
  return (
    <>
      A {brief.industry.toLowerCase()} startup building {brief.description}, for {brief.targetCustomer}.{" "}
      {usd(brief.monthlyBudget)} a month on ads in {city}.
    </>
  );
}

/**
 * The map fills the left two thirds and stays in view while the results
 * scroll in the right third. On narrow screens the map sits on top and the
 * page scrolls as a whole.
 */
export function ResultsSplit({
  run,
  brief,
  onEditBrief,
}: {
  run: RunState;
  brief: Brief;
  /** Shows an edit button beside the brief summary. */
  onEditBrief?: () => void;
}) {
  const { layer, setLayer, campaigns, layers, focus, campaignFocus } = useRunView(run);
  return (
    <div className="flex flex-col bg-card text-card-foreground lg:grid lg:h-dvh lg:grid-cols-[2fr_1fr] lg:grid-rows-[auto_1fr] lg:overflow-hidden">
      <div className="flex flex-col gap-5 px-5 py-4 sm:px-8 lg:col-start-2 lg:pt-8 lg:pb-2">
        <SiteHeader />
        <LayerTabs layer={layer} onChange={setLayer} audienceOnly={recommendationLayer(campaigns) === "fit"} />
      </div>
      <MapPanel
        shapes={run.shapes}
        layers={layers}
        campaigns={campaigns}
        placements={run.placements}
        layer={layer}
        focus={focus}
        campaignFocus={campaignFocus}
        className="h-[55dvh] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-full"
      />
      <aside className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:col-start-2 lg:min-h-0 lg:overflow-y-auto lg:pt-6">
        <div className="flex items-start gap-3">
          <p className="flex-1 text-sm text-muted-foreground">
            <BriefSummary brief={brief} />
          </p>
          {onEditBrief && (
            <button
              type="button"
              onClick={onEditBrief}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-medium transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <PencilLine className="size-3.5" aria-hidden />
              Edit
            </button>
          )}
        </div>
        <ResultsList run={run} layers={layers} campaigns={campaigns} layer={layer} focus={focus} campaignFocus={campaignFocus} />
      </aside>
    </div>
  );
}

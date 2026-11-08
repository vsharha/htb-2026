"use client";

import dynamic from "next/dynamic";

import { LAYERS } from "@/components/layer-tabs";
import type { MapFocus } from "@/components/use-map-focus";
import type { Campaign, Competitor, Placement } from "@/lib/contract";
import { recommendationLayer, type LayerId, type TractLayers, type TractShapes } from "@/lib/gap";
import { cn } from "@/lib/utils";

// MapLibre needs the browser's WebGL, so the map is never rendered on the server.
const TractMap = dynamic(() => import("@/components/tract-map").then((m) => m.TractMap), {
  ssr: false,
  loading: () => <MapPlaceholder>Loading the map…</MapPlaceholder>,
});

function MapPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center bg-foreground/5 text-sm text-muted-foreground">
      <span className="animate-pulse">{children}</span>
    </div>
  );
}

export function MapPanel({
  shapes,
  layers,
  campaigns,
  competitors,
  placements,
  layer,
  focus,
  campaignFocus,
  className,
}: {
  shapes: TractShapes | null;
  layers: TractLayers | null;
  campaigns: Campaign[];
  competitors: Competitor[];
  placements: Placement[] | null;
  layer: LayerId;
  focus: MapFocus;
  campaignFocus: MapFocus;
  /** Sizes the map; the panel fills whatever box this gives it. */
  className?: string;
}) {
  const audienceOnly = recommendationLayer(campaigns) === "fit";
  const current = LAYERS.find((l) => l.id === layer)!;
  const showCampaigns = layer !== "fit";
  // Placements show on every layer that lists them; Customers lists them only without a Gap tab.
  const showPlacements = showCampaigns || audienceOnly;

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {shapes ? (
        <TractMap shapes={shapes} layers={layers} layer={layer} campaigns={campaigns} competitors={competitors} placements={placements} focus={focus} campaignFocus={campaignFocus} />
      ) : (
        <MapPlaceholder>Loading New York&rsquo;s census tracts…</MapPlaceholder>
      )}

      <div className="pointer-events-none absolute bottom-9 left-3 w-52 rounded-lg bg-background/95 p-3 shadow-sm sm:bottom-4 sm:left-4 sm:w-56">
        {layer === "competition" && audienceOnly ? (
          <p className="text-xs text-muted-foreground">Current competition coverage unknown</p>
        ) : (
          <>
            <div
              className="h-2 rounded-full"
              style={{ background: "linear-gradient(to right, transparent 0%, color-mix(in oklch, var(--heat-mid) 3%, transparent) 40%, color-mix(in oklch, var(--heat-mid) 50%, transparent) 65%, color-mix(in oklch, var(--heat-hot) 85%, transparent))" }}
            />
            <div className="mt-1.5 flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{current.low}</span>
              <span className="text-right">{current.high}</span>
            </div>
          </>
        )}
        {showPlacements && (
          <ul className="mt-3 flex flex-col gap-1.5 text-xs">
            {showCampaigns && (
              <>
                <li className="flex items-center gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-foreground"><span className="size-2 rounded-[2px] bg-foreground/25" /></span>
                  Current ad, at a matched location
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-4 shrink-0 rounded-full border-2 border-dashed border-foreground" />
                  Approximate, historical or undated ad
                </li>
              </>
            )}
            <li className="flex items-center gap-2">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background font-mono text-[9px] font-semibold">
                1
              </span>
              Placement to buy
            </li>
          </ul>
        )}
      </div>
    </section>
  );
}

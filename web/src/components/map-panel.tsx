"use client";

import dynamic from "next/dynamic";

import { LAYERS } from "@/components/layer-tabs";
import type { MapFocus } from "@/components/use-map-focus";
import { getCampaignLocation } from "@/lib/campaign-location";
import type { Campaign, Competitor, Placement } from "@/lib/contract";
import { recommendationLayer, type LayerId, type TractLayers, type TractShapes } from "@/lib/gap";
import { paletteTheme, useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** What the colour measures on each layer. */
const LEGEND_TITLE: Record<LayerId, string> = {
  fit: "Est. target customers per tract",
  competition: "Competitor ad coverage per tract",
  gap: "Uncovered target customers per tract",
};

// With the classic ramp the legend bar is a gradient like the map.
const CLASSIC_LEGEND =
  "linear-gradient(to right, color-mix(in oklch, var(--heat-mid) 10%, transparent), color-mix(in oklch, var(--heat-mid) 45%, transparent), color-mix(in oklch, var(--heat-hot) 75%, transparent))";

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
  const { heat: heatStyle, palette, dark } = useSettings();
  const ramp = paletteTheme(palette, dark).ramp;
  const showCampaigns = layer !== "fit";
  // Placements show on every layer that lists them; Customers lists them only without a Gap tab.
  const showPlacements = showCampaigns || audienceOnly;
  const citywide = campaigns.filter((campaign) => campaign.reach === "citywide" && !getCampaignLocation(campaign)).length;

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {shapes ? (
        <TractMap shapes={shapes} layers={layers} layer={layer} campaigns={campaigns} competitors={competitors} placements={placements} focus={focus} campaignFocus={campaignFocus} />
      ) : (
        <MapPlaceholder>Loading New York&rsquo;s census tracts…</MapPlaceholder>
      )}

      <div className="pointer-events-none absolute bottom-9 left-3 w-52 rounded-lg bg-background/95 p-3 shadow-sm sm:bottom-4 sm:left-4 sm:w-56">
        {layer === "competition" && audienceOnly ? (
          <p className="text-xs text-muted-foreground">Recent competition coverage unknown</p>
        ) : (
          <>
            <p className="mb-1.5 text-xs text-muted-foreground">{LEGEND_TITLE[layer]}</p>
            {heatStyle === "classic" ? (
              <div className="h-2 rounded-full" style={{ background: CLASSIC_LEGEND }} />
            ) : (
              // The first segment is the half of tracts that are not painted.
              <div className="flex h-2 gap-px overflow-hidden rounded-full">
                <span className="flex-[2] border border-border bg-background" />
                {ramp.map((color) => (
                  <span key={color} className="flex-1" style={{ background: color, opacity: 0.85 }} />
                ))}
              </div>
            )}
            <div className="mt-1.5 flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{current.low}</span>
              <span className="text-right">{current.high}</span>
            </div>
          </>
        )}
        {layer === "competition" && citywide > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {citywide === 1 ? "1 citywide campaign" : `${citywide} citywide campaigns`}, not pinned
          </p>
        )}
        {showPlacements && (
          <ul className="mt-3 flex flex-col gap-1.5 text-xs">
            {showCampaigns && (
              <>
                <li className="flex items-center gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-foreground"><span className="size-2 rounded-[2px] bg-foreground/25" /></span>
                  Recent ad, at a matched location
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-4 shrink-0 rounded-full border-2 border-dashed border-foreground" />
                  Approximate, historical or undated ad
                </li>
              </>
            )}
            <li className="flex items-center gap-2">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-white bg-accent font-mono text-[9px] font-bold text-accent-foreground shadow-sm">
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

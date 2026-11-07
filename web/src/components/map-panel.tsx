"use client";

import dynamic from "next/dynamic";

import { LAYERS } from "@/components/layer-tabs";
import type { PlacementFocus } from "@/components/use-placement-focus";
import type { Campaign, Placement } from "@/lib/contract";
import type { LayerId, TractLayers, TractShapes } from "@/lib/gap";
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
  placements,
  layer,
  focus,
  className,
}: {
  shapes: TractShapes | null;
  layers: TractLayers | null;
  campaigns: Campaign[];
  placements: Placement[] | null;
  layer: LayerId;
  focus: PlacementFocus;
  /** Sizes the map; the panel fills whatever box this gives it. */
  className?: string;
}) {
  const current = LAYERS.find((l) => l.id === layer)!;

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {shapes ? (
        <TractMap shapes={shapes} layers={layers} layer={layer} campaigns={campaigns} placements={placements} focus={focus} />
      ) : (
        <MapPlaceholder>Loading New York&rsquo;s census tracts…</MapPlaceholder>
      )}

      <div className="pointer-events-none absolute bottom-9 left-3 w-52 rounded-xl bg-background/95 p-3 shadow-sm sm:bottom-4 sm:left-4 sm:w-56">
        <div
          className="h-2 rounded-full"
          style={{ background: "linear-gradient(to right, var(--heat-cool), var(--heat-mid), var(--heat-hot))" }}
        />
        <div className="mt-1.5 flex justify-between gap-3 text-xs text-muted-foreground">
          <span>{current.low}</span>
          <span className="text-right">{current.high}</span>
        </div>
        {layer !== "fit" && (
          <ul className="mt-3 flex flex-col gap-1.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="size-4 shrink-0 rounded-full border-2 border-foreground" />
              Station with a competitor&rsquo;s ad
            </li>
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

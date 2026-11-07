"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Campaign, Placement } from "@/lib/contract";
import type { LayerId, TractLayers, TractShapes } from "@/lib/gap";
import { cn } from "@/lib/utils";

// MapLibre needs the browser's WebGL, so the map is never rendered on the server.
const TractMap = dynamic(() => import("@/components/tract-map").then((m) => m.TractMap), {
  ssr: false,
  loading: () => <MapPlaceholder>Loading the map…</MapPlaceholder>,
});

const LAYERS: { id: LayerId; label: string; low: string; high: string }[] = [
  { id: "gap", label: "Gap", low: "Covered or few customers", high: "Many customers, no competitors" },
  { id: "fit", label: "Your customers", low: "Few", high: "Many" },
  { id: "competition", label: "Competitors' ads", low: "None nearby", high: "Heavy" },
];

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
  className,
}: {
  shapes: TractShapes | null;
  layers: TractLayers | null;
  campaigns: Campaign[];
  placements: Placement[] | null;
  /** Sizes the map; the panel fills whatever box this gives it. */
  className?: string;
}) {
  const [layer, setLayer] = useState<LayerId>("gap");
  const current = LAYERS.find((l) => l.id === layer)!;

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {shapes ? (
        <TractMap shapes={shapes} layers={layers} layer={layer} campaigns={campaigns} placements={placements} />
      ) : (
        <MapPlaceholder>Loading New York&rsquo;s census tracts…</MapPlaceholder>
      )}

      <div className="pointer-events-none absolute inset-x-3 top-3 flex sm:inset-x-4 sm:top-4">
        <ToggleGroup
          aria-label="Map layer"
          value={[layer]}
          onValueChange={(v) => {
            const next = LAYERS.find((l) => l.id === v[0]);
            if (next) setLayer(next.id);
          }}
          spacing={0}
          className="pointer-events-auto rounded-full bg-background p-1 shadow-sm"
        >
          {LAYERS.map((l) => (
            <ToggleGroupItem
              key={l.id}
              value={l.id}
              className="h-8 rounded-full! px-3 text-sm data-pressed:bg-foreground data-pressed:text-background sm:px-4"
            >
              {l.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="pointer-events-none absolute bottom-9 left-3 w-52 rounded-xl bg-background/95 p-3 shadow-sm sm:bottom-4 sm:left-4 sm:w-56">
        <div
          className="h-2 rounded-full"
          style={{ background: "linear-gradient(to right, var(--heat-cool), var(--heat-mid), var(--heat-hot))" }}
        />
        <div className="mt-1.5 flex justify-between gap-3 text-xs text-muted-foreground">
          <span>{current.low}</span>
          <span className="text-right">{current.high}</span>
        </div>
        <ul className="mt-3 flex flex-col gap-1 text-xs">
          {layer !== "fit" && (
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-full border-2 border-foreground" /> Station with a competitor&rsquo;s ad
            </li>
          )}
          <li className="flex items-center gap-2">
            <span className="size-2.5 rounded-full border border-background bg-foreground ring-1 ring-foreground/20" /> Placement to buy
          </li>
        </ul>
      </div>
    </section>
  );
}

"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { LayerId } from "@/lib/gap";

export const LAYERS: { id: LayerId; label: string; low: string; high: string }[] = [
  { id: "gap", label: "Gap", low: "Covered or few customers", high: "Many customers, no competitors" },
  { id: "fit", label: "Customers", low: "Few", high: "Many" },
  { id: "competition", label: "Competitors", low: "None nearby", high: "Heavy" },
];

/** Picks the layer the map shows and the results column explains. */
export function LayerTabs({ layer, onChange }: { layer: LayerId; onChange: (layer: LayerId) => void }) {
  return (
    <ToggleGroup
      aria-label="Map layer"
      value={[layer]}
      onValueChange={(v) => {
        const next = LAYERS.find((l) => l.id === v[0]);
        if (next) onChange(next.id);
      }}
      spacing={0}
      className="w-full rounded-full bg-foreground/5 p-1"
    >
      {LAYERS.map((l) => (
        <ToggleGroupItem
          key={l.id}
          value={l.id}
          className="h-8 flex-1 rounded-full! px-2 text-sm data-pressed:bg-foreground data-pressed:text-background hover:data-pressed:bg-foreground hover:data-pressed:text-background"
        >
          {l.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

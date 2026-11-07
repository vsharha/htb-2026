"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { LayerId } from "@/lib/gap";

/** In reading order: who the customers are, where competitors reach, and what that leaves. */
export const LAYERS: { id: LayerId; label: string; low: string; high: string }[] = [
  { id: "fit", label: "Customers", low: "Few", high: "Many" },
  { id: "competition", label: "Competitors", low: "None nearby", high: "Heavy" },
  { id: "gap", label: "Gap", low: "Covered or few customers", high: "Many customers, no competitors" },
];

/** Picks the layer the map shows and the results column explains. */
export function LayerTabs({ layer, onChange }: { layer: LayerId; onChange: (layer: LayerId) => void }) {
  const items = useRef(new Map<LayerId, HTMLElement>());
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // The pill is one element that moves under the pressed tab, so the change
  // slides instead of jumping. It is measured again when the tabs resize.
  useLayoutEffect(() => {
    const el = items.current.get(layer);
    if (!el) return;
    const measure = () => setPill({ left: el.offsetLeft, width: el.offsetWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [layer]);

  return (
    <ToggleGroup
      aria-label="Map layer"
      value={[layer]}
      onValueChange={(v) => {
        const next = LAYERS.find((l) => l.id === v[0]);
        if (next) onChange(next.id);
      }}
      spacing={0}
      className="relative w-full rounded-full bg-foreground/5 p-1"
    >
      {pill && (
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-full bg-foreground transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {LAYERS.map((l) => (
        <ToggleGroupItem
          key={l.id}
          value={l.id}
          ref={(el: HTMLButtonElement | null) => {
            if (el) items.current.set(l.id, el);
            else items.current.delete(l.id);
          }}
          className="relative h-8 flex-1 rounded-full! px-2 text-sm transition-colors duration-300 data-pressed:bg-transparent data-pressed:text-background data-pressed:hover:bg-transparent data-pressed:hover:text-background"
        >
          {l.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

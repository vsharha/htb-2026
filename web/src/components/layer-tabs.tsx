"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { LayerId } from "@/lib/gap";

/** In reading order: who the customers are, where competitors reach, and what that leaves. */
export const LAYERS: { id: LayerId; label: string; low: string; high: string }[] = [
  { id: "fit", label: "Customers", low: "Few", high: "Many" },
  { id: "competition", label: "Competitors", low: "No confirmed ads nearby", high: "Confirmed recent ads" },
  { id: "gap", label: "Gap", low: "Covered or few customers", high: "High fit, no confirmed ads" },
];

/** Picks the layer the map shows and the results column explains. */
export function LayerTabs({ layer, onChange, showGap }: { layer: LayerId; onChange: (layer: LayerId) => void; showGap: boolean }) {
  const tabs = showGap ? LAYERS : LAYERS.filter((l) => l.id !== "gap");
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
        const next = tabs.find((l) => l.id === v[0]);
        if (next) onChange(next.id);
      }}
      spacing={0}
      className="relative w-full rounded-full bg-foreground/5 p-1"
    >
      {pill && (
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-full bg-tab transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {tabs.map((l) => (
        <ToggleGroupItem
          key={l.id}
          value={l.id}
          ref={(el: HTMLButtonElement | null) => {
            if (el) items.current.set(l.id, el);
            else items.current.delete(l.id);
          }}
          // The sliding pill is the only background; a tab painting its own
          // (the toggle's hover and pressed greys) would flash over the pill.
          className="relative h-8 flex-1 rounded-full! bg-transparent px-2 text-sm text-foreground/60 transition-[color] duration-300 hover:bg-transparent hover:text-foreground aria-pressed:bg-transparent aria-pressed:text-background aria-pressed:hover:text-background motion-reduce:transition-none"
        >
          {l.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

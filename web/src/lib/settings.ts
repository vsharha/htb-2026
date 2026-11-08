"use client";

import { useSyncExternalStore } from "react";

// Experimental interface settings, kept in localStorage and applied to the
// document root so every page picks them up. Each setting is a plain value in
// one small store, read with useSettings().

export type Corners = "rounded" | "sharp";
export type PaletteId = "default" | "blue" | "purple" | "teal" | "navy";
/** "fade" keeps the weakest 65% of tracts nearly clear; "classic" is the earlier ramp that tints every tract by its score. */
export type HeatStyle = "fade" | "classic";
export type Settings = { corners: Corners; palette: PaletteId; heat: HeatStyle; cost: boolean };

const DEFAULTS: Settings = { corners: "rounded", palette: "default", heat: "fade", cost: true };
const STORAGE_KEY = "placewise-settings";

/** The heatmap's colours, which the map needs as plain values rather than CSS variables. */
export type Heat = { mid: string; hot: string };

export type Palette = { label: string; note?: string; swatches: string[]; heat: Heat; vars: Record<string, string> };

export const PALETTES: Record<PaletteId, Palette> = {
  default: {
    label: "Default",
    swatches: ["#eceff3", "#c9cfd8", "#2b59c3", "#f2b134", "#e0334f"],
    heat: { mid: "#f2b134", hot: "#e0334f" },
    vars: {},
  },
  blue: {
    label: "Blue, lime",
    // #EEF2F8 #BCCBE3 #7895C4 #33589B #14264D, accent #C6F432
    swatches: ["#EEF2F8", "#BCCBE3", "#7895C4", "#33589B", "#14264D", "#C6F432"],
    heat: { mid: "#7895C4", hot: "#33589B" },
    vars: {
      "--background": "#EEF2F8",
      "--foreground": "#14264D",
      "--card": "#FFFFFF",
      "--card-foreground": "#14264D",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#14264D",
      "--primary": "#14264D",
      "--primary-foreground": "#EEF2F8",
      "--secondary": "#BCCBE3",
      "--secondary-foreground": "#14264D",
      "--muted": "color-mix(in oklab, #BCCBE3 35%, #EEF2F8)",
      "--muted-foreground": "#33589B",
      "--accent": "#C6F432",
      "--accent-foreground": "#14264D",
      "--border": "#BCCBE3",
      "--input": "#BCCBE3",
      "--ring": "#33589B",
      "--heat-cool": "#14264D",
      "--heat-mid": "#7895C4",
      "--heat-hot": "#33589B",
    },
  },
  purple: {
    label: "Purple, amber",
    // #F2F0FB #CFC8F0 #9D8FDD #6650C2 #33228A, accent #F2A516
    swatches: ["#F2F0FB", "#CFC8F0", "#9D8FDD", "#6650C2", "#33228A", "#F2A516"],
    heat: { mid: "#9D8FDD", hot: "#6650C2" },
    vars: {
      "--background": "#F2F0FB",
      "--foreground": "#33228A",
      "--card": "#FFFFFF",
      "--card-foreground": "#33228A",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#33228A",
      "--primary": "#33228A",
      "--primary-foreground": "#F2F0FB",
      "--secondary": "#CFC8F0",
      "--secondary-foreground": "#33228A",
      "--muted": "color-mix(in oklab, #CFC8F0 35%, #F2F0FB)",
      "--muted-foreground": "#6650C2",
      "--accent": "#F2A516",
      "--accent-foreground": "#33228A",
      "--border": "#CFC8F0",
      "--input": "#CFC8F0",
      "--ring": "#6650C2",
      "--heat-cool": "#33228A",
      "--heat-mid": "#9D8FDD",
      "--heat-hot": "#6650C2",
    },
  },
  teal: {
    label: "Teal, coral",
    // #EEF6F5 #BFE0DC #7FC2BA #2F8F86 #0B5450, accent #F2603D
    swatches: ["#EEF6F5", "#BFE0DC", "#7FC2BA", "#2F8F86", "#0B5450", "#F2603D"],
    heat: { mid: "#7FC2BA", hot: "#2F8F86" },
    vars: {
      "--background": "#EEF6F5",
      "--foreground": "#0B5450",
      "--card": "#FFFFFF",
      "--card-foreground": "#0B5450",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#0B5450",
      "--primary": "#0B5450",
      "--primary-foreground": "#EEF6F5",
      "--secondary": "#BFE0DC",
      "--secondary-foreground": "#0B5450",
      "--muted": "color-mix(in oklab, #BFE0DC 35%, #EEF6F5)",
      "--muted-foreground": "#2F8F86",
      "--accent": "#F2603D",
      "--accent-foreground": "#FFFFFF",
      "--border": "#BFE0DC",
      "--input": "#BFE0DC",
      "--ring": "#2F8F86",
      "--heat-cool": "#0B5450",
      "--heat-mid": "#7FC2BA",
      "--heat-hot": "#2F8F86",
    },
  },
  // The heat colours darken from light to dark rather than changing hue alone,
  // so a reader who cannot tell the hues apart still ranks the tracts. That is
  // what the four themes above lack: their lightness peaks at heat-mid, which
  // leaves heat-cool and heat-hot equally bright.
  navy: {
    label: "Navy, amber",
    note: "Colour-blind friendly",
    // #F7FBFF #C7E9B4 #41B6C4 #1D91C0 #08306B, accent #FEB24C
    swatches: ["#F7FBFF", "#C7E9B4", "#41B6C4", "#1D91C0", "#08306B", "#FEB24C"],
    heat: { mid: "#41B6C4", hot: "#08306B" },
    vars: {
      "--background": "#F7FBFF",
      "--foreground": "#08306B",
      "--card": "#FFFFFF",
      "--card-foreground": "#08306B",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#08306B",
      "--primary": "#08306B",
      "--primary-foreground": "#F7FBFF",
      "--secondary": "#DEEBF7",
      "--secondary-foreground": "#08306B",
      "--muted": "color-mix(in oklab, #DEEBF7 35%, #F7FBFF)",
      "--muted-foreground": "#2C6EA8",
      "--accent": "#FEB24C",
      "--accent-foreground": "#08306B",
      "--border": "#C6DBEF",
      "--input": "#C6DBEF",
      "--ring": "#1D91C0",
      "--heat-cool": "#C7E9B4",
      "--heat-mid": "#41B6C4",
      "--heat-hot": "#08306B",
    },
  },
};

let current: Settings = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function apply(settings: Settings) {
  const root = document.documentElement;
  root.dataset.corners = settings.corners;
  for (const { vars } of Object.values(PALETTES)) {
    for (const name of Object.keys(vars)) root.style.removeProperty(name);
  }
  for (const [name, value] of Object.entries(PALETTES[settings.palette].vars)) root.style.setProperty(name, value);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    current = {
      corners: saved.corners === "sharp" ? "sharp" : "rounded",
      palette: saved.palette in PALETTES ? saved.palette : "default",
      heat: saved.heat === "classic" ? "classic" : "fade",
      cost: saved.cost !== false,
    };
  } catch {
    current = DEFAULTS;
  }
  apply(current);
}

export function updateSettings(patch: Partial<Settings>) {
  load();
  current = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  apply(current);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => current, () => DEFAULTS);
}

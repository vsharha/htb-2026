"use client";

import { useSyncExternalStore } from "react";

// Experimental interface settings, kept in localStorage and applied to the
// document root so every page picks them up. Each setting is a plain value in
// one small store, read with useSettings().

export type Corners = "rounded" | "sharp";
export type PaletteId = "classic" | "teal" | "blue" | "purple" | "navy";
/** "fade" paints five percentile classes with the bottom half clear; "classic" is the earlier ramp that tints every tract by its score. */
export type HeatStyle = "fade" | "classic";
export type Settings = { corners: Corners; palette: PaletteId; heat: HeatStyle; cost: boolean };

const DEFAULTS: Settings = { corners: "rounded", palette: "classic", heat: "fade", cost: true };
// Bumped when the default palette changed, so saved choices do not hide it.
const STORAGE_KEY = "placewise-settings-3";

/** The heatmap's colours, which the map needs as plain values rather than CSS variables. */
export type Heat = { mid: string; hot: string };

export type Palette = {
  label: string;
  note?: string;
  swatches: string[];
  heat: Heat;
  /** The four filled map classes, from the 50th to 75th percentile up to the top 3%. */
  ramp: [string, string, string, string];
  /** Placement markers, and the darker colour of the selected one. */
  accent: string;
  accentDark: string;
  /** The faintest text, for small codes. */
  ink3: string;
  /** The active layer tab. */
  tab: string;
  vars: Record<string, string>;
};

export const PALETTES: Record<PaletteId, Palette> = {
  classic: {
    label: "Classic",
    swatches: ["#eceff3", "#c9cfd8", "#2b59c3", "#f2b134", "#e0334f"],
    heat: { mid: "#f2b134", hot: "#e0334f" },
    ramp: ["#F7D58E", "#F2B134", "#EC7A3F", "#E0334F"],
    accent: "#E0334F",
    accentDark: "#A5192F",
    ink3: "#8A929E",
    tab: "#15171C",
    vars: {},
  },
  // Ink, border and background tokens with a teal ramp and a coral accent:
  // sidebar text is ink, and teal appears only in the map fill, the active
  // layer tab and the legend bar.
  teal: {
    label: "Teal, coral",
    swatches: ["#EEF6F5", "#BFE0DC", "#7FC2BA", "#2F8F86", "#0B5450", "#F2603D"],
    heat: { mid: "#7FC2BA", hot: "#2F8F86" },
    ramp: ["#BFE0DC", "#7FC2BA", "#2F8F86", "#0B5450"],
    accent: "#F2603D",
    accentDark: "#C9431F",
    ink3: "#8A9694",
    tab: "#0B5450",
    vars: {
      "--background": "#FAFAF8",
      "--foreground": "#12211F",
      "--card": "#FFFFFF",
      "--card-foreground": "#12211F",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#12211F",
      "--primary": "#12211F",
      "--primary-foreground": "#FAFAF8",
      "--secondary": "#EEF6F5",
      "--secondary-foreground": "#12211F",
      "--muted": "#F1F3F2",
      "--muted-foreground": "#5B6B69",
      "--accent": "#F2603D",
      "--accent-foreground": "#FFFFFF",
      "--border": "#E3E8E7",
      "--input": "#E3E8E7",
      "--ring": "#5B6B69",
      "--heat-cool": "#0B5450",
      "--heat-mid": "#7FC2BA",
      "--heat-hot": "#2F8F86",
    },
  },
  blue: {
    label: "Blue, lime",
    // #EEF2F8 #BCCBE3 #7895C4 #33589B #14264D, accent #C6F432
    swatches: ["#EEF2F8", "#BCCBE3", "#7895C4", "#33589B", "#14264D", "#C6F432"],
    heat: { mid: "#7895C4", hot: "#33589B" },
    ramp: ["#BCCBE3", "#7895C4", "#33589B", "#14264D"],
    accent: "#C6F432",
    accentDark: "#8DB515",
    ink3: "#7895C4",
    tab: "#14264D",
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
    ramp: ["#CFC8F0", "#9D8FDD", "#6650C2", "#33228A"],
    accent: "#F2A516",
    accentDark: "#C07F00",
    ink3: "#9D8FDD",
    tab: "#33228A",
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
    ramp: ["#C7E9B4", "#41B6C4", "#1D91C0", "#08306B"],
    accent: "#FEB24C",
    accentDark: "#D98A1E",
    ink3: "#2C6EA8",
    tab: "#08306B",
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
  const palette = PALETTES[settings.palette];
  for (const [name, value] of Object.entries(palette.vars)) root.style.setProperty(name, value);
  root.style.setProperty("--accent-dark", palette.accentDark);
  root.style.setProperty("--ink-3", palette.ink3);
  root.style.setProperty("--tab-active", palette.tab);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    current = {
      corners: saved.corners === "sharp" ? "sharp" : "rounded",
      palette: saved.palette in PALETTES ? saved.palette : DEFAULTS.palette,
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

"use client";

import { useSyncExternalStore } from "react";

// Experimental interface settings, kept in localStorage and applied to the
// document root so every page picks them up. Each setting is a plain value in
// one small store, read with useSettings().

export type Corners = "rounded" | "sharp";
export type PaletteId = "default" | "blue";
export type Settings = { corners: Corners; palette: PaletteId };

const DEFAULTS: Settings = { corners: "rounded", palette: "default" };
const STORAGE_KEY = "placewise-settings";

/** The heatmap's colours, which the map needs as plain values rather than CSS variables. */
export type Heat = { mid: string; hot: string };

export const PALETTES: Record<PaletteId, { label: string; swatches: string[]; heat: Heat; vars: Record<string, string> }> = {
  default: {
    label: "Default",
    swatches: ["#eceff3", "#c9cfd8", "#2b59c3", "#f2b134", "#e0334f"],
    heat: { mid: "#f2b134", hot: "#e0334f" },
    vars: {},
  },
  blue: {
    label: "Blue and lime",
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

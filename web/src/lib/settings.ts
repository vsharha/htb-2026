"use client";

import { useSyncExternalStore } from "react";

import type { LayerId } from "@/lib/gap";

// Experimental interface settings, kept in localStorage and applied to the
// document root so every page picks them up. Each setting is a plain value in
// one small store, read with useSettings().

export type Corners = "rounded" | "sharp";
export type PaletteId = "warm" | "classic" | "teal" | "blue" | "purple" | "navy";
/** "fade" paints five percentile classes with the bottom half clear; "classic" is the earlier ramp that tints every tract by its score. */
export type HeatStyle = "fade" | "classic";
/** Competition depends only on distance to the nearest ad, so percentile classes would draw distance rings around the ads. */
export function layerHeatStyle(layer: LayerId, style: HeatStyle): HeatStyle {
  return layer === "competition" ? "classic" : style;
}
/** "system" follows the operating system's preference; the other two are a choice made in the settings menu. */
export type Mode = "system" | "light" | "dark";
export type Settings = {
  corners: Corners;
  palette: PaletteId;
  heat: HeatStyle;
  cost: boolean;
  mode: Mode;
  /** The mode in effect: mode itself, or the system preference while mode is "system". */
  dark: boolean;
};

const DEFAULTS: Settings = { corners: "rounded", palette: "warm", heat: "fade", cost: true, mode: "system", dark: false };
// Bumped when the default palette changed, so saved choices do not hide it.
const STORAGE_KEY = "placewise-settings-4";

/** The heatmap's colours, which the map needs as plain values rather than CSS variables. */
export type Heat = { mid: string; hot: string };

/** Everything about a palette that changes between light and night mode. */
export type PaletteTheme = {
  swatches: string[];
  heat: Heat;
  /** The background glow's lightest blob; the other blobs use the heat variables. */
  glow: string;
  /** The four filled map classes, from the 50th to 75th percentile up to the top 3%. */
  ramp: [string, string, string, string];
  /** Placement markers, and the colour of the selected one. */
  accent: string;
  accentDark: string;
  /** The faintest text, for small codes. */
  ink3: string;
  /** The active layer tab. */
  tab: string;
  vars: Record<string, string>;
};

export type Palette = {
  label: string;
  note?: string;
  light: PaletteTheme;
  night: PaletteTheme;
};

const CLASSIC_NIGHT_VARS: Record<string, string> = {
  "--background": "#14161B",
  "--foreground": "#E7EAF0",
  "--card": "#1B1E25",
  "--card-foreground": "#E7EAF0",
  "--popover": "#20242C",
  "--popover-foreground": "#F1F3F7",
  "--primary": "#E7EAF0",
  "--primary-foreground": "#14161B",
  "--secondary": "#242A34",
  "--secondary-foreground": "#E7EAF0",
  "--muted": "#242A34",
  "--muted-foreground": "#A4ACBB",
  "--accent": "#F4F6FA",
  "--accent-foreground": "#14161B",
  "--border": "#343B48",
  "--input": "#3B4351",
  "--ring": "#6E95EA",
  "--heat-cool": "#10214A",
  "--heat-mid": "#F2B134",
  "--heat-hot": "#E0334F",
};

export const PALETTES: Record<PaletteId, Palette> = {
  // The background glow is built from exactly the map's four class colours.
  // Light mode's heat variables are the :root defaults in globals.css, so the
  // page paints this palette before the saved settings load.
  warm: {
    label: "Amber, red",
    light: {
      swatches: ["#eceff3", "#c9cfd8", "#f7d58e", "#f2b134", "#ec7a3f", "#e0334f"],
      heat: { mid: "#f2b134", hot: "#e0334f" },
      glow: "#F7D58E",
      ramp: ["#F7D58E", "#F2B134", "#EC7A3F", "#E0334F"],
      accent: "#E0334F",
      accentDark: "#C9CFD8",
      ink3: "#8A929E",
      tab: "#15171C",
      vars: {},
    },
    night: {
      swatches: ["#14161b", "#343b48", "#f7d58e", "#f2b134", "#ec7a3f", "#e0334f"],
      heat: { mid: "#f2b134", hot: "#e0334f" },
      glow: "#F7D58E",
      ramp: ["#F7D58E", "#F2B134", "#EC7A3F", "#E0334F"],
      accent: "#F4F6FA",
      accentDark: "#C9CFD8",
      ink3: "#8792A2",
      tab: "#E7EAF0",
      vars: { ...CLASSIC_NIGHT_VARS, "--heat-cool": "#EC7A3F" },
    },
  },
  classic: {
    label: "Classic",
    light: {
      swatches: ["#eceff3", "#c9cfd8", "#2b59c3", "#f2b134", "#e0334f"],
      heat: { mid: "#f2b134", hot: "#e0334f" },
      glow: "#5B86E5",
      ramp: ["#F7D58E", "#F2B134", "#EC7A3F", "#E0334F"],
      accent: "#E0334F",
      accentDark: "#C9CFD8",
      ink3: "#8A929E",
      tab: "#15171C",
      vars: { "--heat-cool": "#2B59C3" },
    },
    night: {
      swatches: ["#14161b", "#343b48", "#2b59c3", "#f2b134", "#e0334f"],
      heat: { mid: "#f2b134", hot: "#e0334f" },
      glow: "#5B86E5",
      ramp: ["#F7D58E", "#F2B134", "#EC7A3F", "#E0334F"],
      accent: "#F4F6FA",
      accentDark: "#C9CFD8",
      ink3: "#8792A2",
      tab: "#E7EAF0",
      vars: CLASSIC_NIGHT_VARS,
    },
  },
  // Ink, border and background tokens with a teal ramp and a coral accent:
  // sidebar text is ink, and teal appears only in the map fill, the active
  // layer tab and the legend bar.
  teal: {
    label: "Teal, coral",
    light: {
      swatches: ["#EEF6F5", "#BFE0DC", "#7FC2BA", "#2F8F86", "#0B5450", "#F2603D"],
      heat: { mid: "#7FC2BA", hot: "#2F8F86" },
      glow: "#5B86E5",
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
    night: {
      swatches: ["#0c1614", "#263632", "#7fc2ba", "#2f8f86", "#f2603d"],
      heat: { mid: "#4FB3A8", hot: "#BFE0DC" },
      glow: "#5B86E5",
      ramp: ["#2F8F86", "#5CBFB4", "#8FD8D0", "#C6EDE8"],
      accent: "#F2603D",
      accentDark: "#FF8163",
      ink3: "#7E938F",
      tab: "#E4EFEC",
      vars: {
        "--background": "#0C1614",
        "--foreground": "#E4EFEC",
        "--card": "#121F1C",
        "--card-foreground": "#E4EFEC",
        "--popover": "#16241F",
        "--popover-foreground": "#EDF5F2",
        "--primary": "#E4EFEC",
        "--primary-foreground": "#0C1614",
        "--secondary": "#182522",
        "--secondary-foreground": "#E4EFEC",
        "--muted": "#1A2724",
        "--muted-foreground": "#96A8A4",
        "--accent": "#F2603D",
        "--accent-foreground": "#1A0906",
        "--border": "#263632",
        "--input": "#2C3D38",
        "--ring": "#7FC2BA",
        "--heat-cool": "#06302D",
        "--heat-mid": "#4FB3A8",
        "--heat-hot": "#BFE0DC",
      },
    },
  },
  blue: {
    label: "Blue, lime",
    light: {
      swatches: ["#EEF2F8", "#BCCBE3", "#7895C4", "#33589B", "#14264D", "#C6F432"],
      heat: { mid: "#7895C4", hot: "#33589B" },
      glow: "#5B86E5",
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
    night: {
      swatches: ["#0b1220", "#24344f", "#7895c4", "#33589b", "#c6f432"],
      heat: { mid: "#7895C4", hot: "#D6E6FB" },
      glow: "#5B86E5",
      ramp: ["#33589B", "#6288C6", "#9CBDE8", "#D6E6FB"],
      accent: "#C6F432",
      accentDark: "#DCFF74",
      ink3: "#7E97BD",
      tab: "#E2EAF6",
      vars: {
        "--background": "#0B1220",
        "--foreground": "#E2EAF6",
        "--card": "#111B2C",
        "--card-foreground": "#E2EAF6",
        "--popover": "#152037",
        "--popover-foreground": "#EDF3FA",
        "--primary": "#E2EAF6",
        "--primary-foreground": "#0B1220",
        "--secondary": "#17233A",
        "--secondary-foreground": "#E2EAF6",
        "--muted": "#192740",
        "--muted-foreground": "#96A8C6",
        "--accent": "#C6F432",
        "--accent-foreground": "#0B1220",
        "--border": "#24344F",
        "--input": "#2B3E5C",
        "--ring": "#7895C4",
        "--heat-cool": "#08152E",
        "--heat-mid": "#7895C4",
        "--heat-hot": "#D6E6FB",
      },
    },
  },
  purple: {
    label: "Purple, amber",
    light: {
      swatches: ["#F2F0FB", "#CFC8F0", "#9D8FDD", "#6650C2", "#33228A", "#F2A516"],
      heat: { mid: "#9D8FDD", hot: "#6650C2" },
      glow: "#5B86E5",
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
    night: {
      swatches: ["#100d1b", "#2e2748", "#9d8fdd", "#6650c2", "#f2a516"],
      heat: { mid: "#9D8FDD", hot: "#E3DDF8" },
      glow: "#5B86E5",
      ramp: ["#5A48A8", "#8372D2", "#B3A6E8", "#E3DDF8"],
      accent: "#F2A516",
      accentDark: "#FFC24D",
      ink3: "#9789C0",
      tab: "#EAE6F7",
      vars: {
        "--background": "#100D1B",
        "--foreground": "#EAE6F7",
        "--card": "#171327",
        "--card-foreground": "#EAE6F7",
        "--popover": "#1B1630",
        "--popover-foreground": "#F2EFFA",
        "--primary": "#EAE6F7",
        "--primary-foreground": "#100D1B",
        "--secondary": "#201A35",
        "--secondary-foreground": "#EAE6F7",
        "--muted": "#221C38",
        "--muted-foreground": "#A79CC8",
        "--accent": "#F2A516",
        "--accent-foreground": "#241304",
        "--border": "#2E2748",
        "--input": "#372F55",
        "--ring": "#9D8FDD",
        "--heat-cool": "#180C33",
        "--heat-mid": "#9D8FDD",
        "--heat-hot": "#E3DDF8",
      },
    },
  },
  // The heat colours darken from light to dark rather than changing hue alone,
  // so a reader who cannot tell the hues apart still ranks the tracts. That is
  // what the five themes above lack: their lightness peaks at heat-mid, which
  // leaves heat-cool and heat-hot equally bright. Night mode keeps the same
  // idea with the lightness running the other way, since a dark map needs the
  // hot tracts to be the bright ones.
  navy: {
    label: "Navy, amber",
    note: "Colour-blind friendly",
    light: {
      swatches: ["#F7FBFF", "#C7E9B4", "#41B6C4", "#1D91C0", "#08306B", "#FEB24C"],
      heat: { mid: "#41B6C4", hot: "#08306B" },
      glow: "#5B86E5",
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
    night: {
      swatches: ["#08101c", "#20334a", "#41b6c4", "#1d91c0", "#feb24c"],
      heat: { mid: "#41B6C4", hot: "#D9F6F8" },
      glow: "#5B86E5",
      ramp: ["#1D6B75", "#41B6C4", "#8FE0E6", "#D9F6F8"],
      accent: "#FEB24C",
      accentDark: "#FFD08A",
      ink3: "#7FA6C4",
      tab: "#E6EFF8",
      vars: {
        "--background": "#08101C",
        "--foreground": "#E6EFF8",
        "--card": "#0E1927",
        "--card-foreground": "#E6EFF8",
        "--popover": "#12202F",
        "--popover-foreground": "#EEF5FB",
        "--primary": "#E6EFF8",
        "--primary-foreground": "#08101C",
        "--secondary": "#142334",
        "--secondary-foreground": "#E6EFF8",
        "--muted": "#16263A",
        "--muted-foreground": "#93A6BA",
        "--accent": "#FEB24C",
        "--accent-foreground": "#1A1002",
        "--border": "#20334A",
        "--input": "#273D57",
        "--ring": "#41B6C4",
        "--heat-cool": "#062A3A",
        "--heat-mid": "#41B6C4",
        "--heat-hot": "#D9F6F8",
      },
    },
  },
};

/** The palette as it looks in the mode in effect. */
export function paletteTheme(id: PaletteId, dark: boolean): PaletteTheme {
  return PALETTES[id][dark ? "night" : "light"];
}

let current: Settings = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function systemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveDark(mode: Mode) {
  return mode === "system" ? systemDark() : mode === "dark";
}

function withoutTransitions(change: () => void) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  change();
  // Forces a style recalculation, so the new colours settle before transitions return.
  void document.documentElement.offsetHeight;
  style.remove();
}

function apply(settings: Settings) {
  withoutTransitions(() => {
    const root = document.documentElement;
    root.dataset.corners = settings.corners;
    root.classList.toggle("dark", settings.dark);
    root.style.colorScheme = settings.dark ? "dark" : "light";
    for (const palette of Object.values(PALETTES)) {
      for (const { vars } of [palette.light, palette.night]) {
        for (const name of Object.keys(vars)) root.style.removeProperty(name);
      }
    }
    const theme = paletteTheme(settings.palette, settings.dark);
    for (const [name, value] of Object.entries(theme.vars)) root.style.setProperty(name, value);
    root.style.setProperty("--accent-dark", theme.accentDark);
    root.style.setProperty("--ink-3", theme.ink3);
    root.style.setProperty("--tab-active", theme.tab);
    root.style.setProperty("--heat-glow", theme.glow);
  });
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const mode: Mode = saved.mode === "light" || saved.mode === "dark" ? saved.mode : "system";
    current = {
      corners: saved.corners === "sharp" ? "sharp" : "rounded",
      palette: saved.palette in PALETTES ? saved.palette : DEFAULTS.palette,
      heat: saved.heat === "classic" ? "classic" : "fade",
      cost: saved.cost !== false,
      mode,
      dark: resolveDark(mode),
    };
  } catch {
    current = { ...DEFAULTS, dark: systemDark() };
  }
  apply(current);
  // While following the system, a change there switches the app with it.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (current.mode !== "system") return;
    current = { ...current, dark: event.matches };
    apply(current);
    listeners.forEach((l) => l());
  });
}

export function updateSettings(patch: Partial<Omit<Settings, "dark">>) {
  load();
  const mode = patch.mode ?? current.mode;
  current = { ...current, ...patch, mode, dark: resolveDark(mode) };
  const { corners, palette, heat, cost } = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ corners, palette, heat, cost, mode }));
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

"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";

import { PALETTES, paletteTheme, updateSettings, useSettings, type PaletteId } from "@/lib/settings";
import { cn } from "@/lib/utils";

/**
 * A gear button that opens the experimental interface settings: night mode,
 * sharp corners and the colour palette. All are saved in the browser and apply
 * everywhere.
 */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const { corners, palette, heat, cost, mode, dark } = useSettings();

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
        >
          <h2 className="font-heading text-base font-semibold">Settings</h2>
          <p className="text-xs text-muted-foreground">Experimental interface options, saved in this browser.</p>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={dark}
              onChange={(e) => updateSettings({ mode: e.target.checked ? "dark" : "light" })}
              className="mt-0.5 size-4 accent-[var(--tab-active)]"
            />
            <span>
              Night mode
              <span className="block text-xs text-muted-foreground">
                {mode === "system" ? "Following the system setting." : "Chosen for this browser."}
              </span>
            </span>
          </label>
          {mode !== "system" && (
            <button
              type="button"
              onClick={() => updateSettings({ mode: "system" })}
              className="mt-1 cursor-pointer text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Follow the system setting again
            </button>
          )}

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={corners === "sharp"}
              onChange={(e) => updateSettings({ corners: e.target.checked ? "sharp" : "rounded" })}
              className="mt-0.5 size-4 accent-[var(--tab-active)]"
            />
            <span>
              Sharp corners
              <span className="block text-xs text-muted-foreground">Every border radius becomes 1px. Unchecked, corners are rounded.</span>
            </span>
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={heat === "fade"}
              onChange={(e) => updateSettings({ heat: e.target.checked ? "fade" : "classic" })}
              className="mt-0.5 size-4 accent-[var(--tab-active)]"
            />
            <span>
              Percentile classes
              <span className="block text-xs text-muted-foreground">
                On: four classes by percentile, with the bottom half unpainted. Off: the earlier ramp, where every tract is tinted by its score.
              </span>
            </span>
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={cost}
              onChange={(e) => updateSettings({ cost: e.target.checked })}
              className="mt-0.5 size-4 accent-[var(--tab-active)]"
            />
            <span>
              Cost estimate
              <span className="block text-xs text-muted-foreground">
                Shows an invented price per customer on each placement, sorts by it and tags the lowest. Off: no prices, listed by area.
              </span>
            </span>
          </label>

          <fieldset className="mt-4">
            <legend className="text-sm">Colour palette</legend>
            <div className="mt-2 flex flex-col gap-2">
              {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                    palette === id ? "border-foreground" : "border-border",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="palette"
                      checked={palette === id}
                      onChange={() => updateSettings({ palette: id })}
                      className="size-4 accent-[var(--tab-active)]"
                    />
                    <span>
                      {PALETTES[id].label}
                      {PALETTES[id].note && <span className="block text-xs text-muted-foreground">{PALETTES[id].note}</span>}
                    </span>
                  </span>
                  <span aria-hidden className="flex">
                    {paletteTheme(id, dark).swatches.map((c) => (
                      <span key={c} className="size-4 border border-foreground/10 first:rounded-l-sm last:rounded-r-sm" style={{ background: c }} />
                    ))}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-popover text-foreground shadow-md transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <SettingsIcon className="size-5" aria-hidden />
      </button>
    </div>
  );
}

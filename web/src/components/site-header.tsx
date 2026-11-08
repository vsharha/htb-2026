"use client";

import { Moon, Sun } from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import { updateSettings, useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** The wordmark, with a quick switch between day and night. */
export function SiteHeader({ className }: { className?: string }) {
  const { dark } = useSettings();
  const Icon = dark ? Sun : Moon;
  return (
    <header className="flex items-center justify-between gap-4">
      <Wordmark className={cn("text-2xl", className)} />
      <button
        type="button"
        aria-label={dark ? "Switch to light mode" : "Switch to night mode"}
        aria-pressed={dark}
        onClick={() => updateSettings({ mode: dark ? "light" : "dark" })}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon className="size-4" aria-hidden />
      </button>
    </header>
  );
}

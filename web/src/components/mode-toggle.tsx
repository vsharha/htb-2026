"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useId } from "react";

import { updateSettings, useSettings, type Mode } from "@/lib/settings";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: Mode; label: string; Icon: LucideIcon }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: Monitor },
];

/** An icon-only choice between light, dark and following the system setting. */
export function ModeToggle({ className }: { className?: string }) {
  const { mode } = useSettings();
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label="Night mode"
      className={cn("inline-flex shrink-0 rounded-full border border-border p-0.5", className)}
    >
      {OPTIONS.map(({ mode: option, label, Icon }) => (
        <label
          key={option}
          title={label}
          className="flex size-7.5 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
        >
          <input
            type="radio"
            name={name}
            aria-label={label}
            checked={mode === option}
            onChange={() => updateSettings({ mode: option })}
            className="sr-only"
          />
          <Icon className="size-4" aria-hidden />
        </label>
      ))}
    </div>
  );
}

"use client";

import { Lightbulb } from "lucide-react";
import { useState } from "react";

import type { Brief } from "@/lib/contract";
import { EXAMPLE_BRIEFS } from "@/lib/example-briefs";

/**
 * A button opposite the settings gear that fills the form with a brief already
 * run through live research, so a rehearsal can switch examples without typing.
 */
export function ExampleBriefs({ onPick }: { onPick: (brief: Brief) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2">
      {open && (
        <div
          role="dialog"
          aria-label="Example briefs"
          className="w-80 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
        >
          <h2 className="font-heading text-base font-semibold">Example briefs</h2>
          <p className="text-xs text-muted-foreground">Prefill the form with a brief tested against live research in New York.</p>
          <div className="mt-3 flex flex-col gap-2">
            {EXAMPLE_BRIEFS.map(({ name, note, brief }) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onPick(brief);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-lg border border-border px-3 py-2 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="block text-sm font-medium">{name}</span>
                <span className="block text-xs text-muted-foreground">{note}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label="Example briefs"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-popover text-foreground shadow-md transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Lightbulb className="size-5" aria-hidden />
      </button>
    </div>
  );
}

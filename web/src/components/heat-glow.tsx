"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/** How far and how slowly a blob drifts; each differs so the blobs never move in step. */
function drift(x: string, y: string, seconds: number): CSSProperties {
  return { "--drift-x": x, "--drift-y": y, "--drift-duration": `${seconds}s` } as CSSProperties;
}

/** How much faster the glow moves while the results slide in. */
const HURRY = 12;

/**
 * Full-page backdrop of blurred blobs in the palette's heat colours, with a
 * highlight blob in palettes that set one. The form card covers most
 * of the page, so the glow spins slowly to sweep colour through the visible
 * edges, and each blob drifts on its own loop. The highlight stays out of the
 * spin and drifts along the bottom edge, where the card never hides it.
 * While `hurrying`, the same animations play faster; changing the playback
 * rate keeps their progress, so the speed-up does not jump.
 */
export function HeatGlow({ hurrying = false }: { hurrying?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for (const animation of root.current?.getAnimations({ subtree: true }) ?? []) {
      animation.updatePlaybackRate(hurrying ? HURRY : 1);
    }
  }, [hurrying]);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-heat-cool">
      <div className="heat-glow-spin absolute inset-0">
        <div className="heat-glow-drift absolute -top-[20%] -right-[10%] size-[55vmax] rounded-full bg-heat-glow blur-[120px]" style={drift("-42vmax", "34vmax", 8)} />
        <div className="heat-glow-drift absolute -bottom-[25%] -left-[15%] size-[60vmax] rounded-full bg-heat-hot blur-[140px]" style={drift("46vmax", "-28vmax", 10)} />
        <div className="heat-glow-drift absolute -right-[20%] -bottom-[30%] size-[60vmax] rounded-full bg-heat-mid blur-[140px]" style={drift("-36vmax", "-40vmax", 7)} />
        <div className="heat-glow-drift absolute bottom-[-35%] left-[35%] size-[40vmax] rounded-full bg-heat-hot/80 blur-[120px]" style={drift("-50vmax", "-22vmax", 9)} />
      </div>
      <div className="heat-glow-drift absolute -bottom-[15vmax] left-[3%] size-[36vmax] rounded-full bg-heat-highlight blur-[120px]" style={drift("50vmax", "-3vmax", 11)} />
    </div>
  );
}

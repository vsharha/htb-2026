import type { CSSProperties } from "react";

/** How far and how slowly a blob drifts; each differs so the blobs never move in step. */
function drift(x: string, y: string, seconds: number): CSSProperties {
  return { "--drift-x": x, "--drift-y": y, "--drift-duration": `${seconds}s` } as CSSProperties;
}

/**
 * Full-page backdrop of blurred blobs in the heatmap's three colours. Each
 * blob drifts on its own loop; the wrapper is left free for the rotation
 * that plays while the results slide in.
 */
export function HeatGlow({ rotating = false }: { rotating?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-heat-cool">
      <div className={`absolute inset-0${rotating ? " heat-glow-rotate" : ""}`}>
        <div className="heat-glow-drift absolute -top-[20%] -right-[10%] size-[55vmax] rounded-full bg-[#5b86e5] blur-[120px]" style={drift("-12vmax", "10vmax", 23)} />
        <div className="heat-glow-drift absolute -bottom-[25%] -left-[15%] size-[60vmax] rounded-full bg-heat-hot blur-[140px]" style={drift("14vmax", "-8vmax", 29)} />
        <div className="heat-glow-drift absolute -right-[20%] -bottom-[30%] size-[60vmax] rounded-full bg-heat-mid blur-[140px]" style={drift("-10vmax", "-12vmax", 19)} />
        <div className="heat-glow-drift absolute bottom-[-35%] left-[35%] size-[40vmax] rounded-full bg-heat-hot/80 blur-[120px]" style={drift("-16vmax", "-6vmax", 31)} />
      </div>
    </div>
  );
}

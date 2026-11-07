"use client";

import { useMemo } from "react";

import { MapPanel } from "@/components/map-panel";
import { campaignsOf, type RunState } from "@/components/use-audience-run";
import { computeLayers, strongest } from "@/lib/gap";
import { tractLabel } from "@/lib/tracts";
import { cn } from "@/lib/utils";

/** The heatmap's colour for a score from 0 to 1. */
export function heatColor(score: number) {
  return score < 0.5
    ? `color-mix(in oklch, var(--heat-mid) ${score * 200}%, var(--heat-cool))`
    : `color-mix(in oklch, var(--heat-hot) ${(score - 0.5) * 200}%, var(--heat-mid))`;
}

const MEASURE_LABEL = { lives: "lives", works: "works", passes: "passes through" } as const;

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4 border-t-2 border-foreground pt-4", className)}>
      <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Pending({ children }: { children: React.ReactNode }) {
  return <p className="animate-pulse text-sm text-muted-foreground">{children}</p>;
}

export function RunResults({ run }: { run: RunState }) {
  const weights = run.fit?.weights.filter((w) => w.weight > 0).sort((a, b) => b.weight - a.weight);
  const campaigns = useMemo(() => campaignsOf(run.events), [run.events]);
  const competitors = run.events.filter((e) => e.type === "competitor");
  const layers = useMemo(
    () => (run.shapes && run.fit ? computeLayers(run.shapes, run.fit, campaigns) : null),
    [run.shapes, run.fit, campaigns],
  );

  return (
    <div className="flex flex-col gap-12">
      {run.error && (
        <p role="alert" className="border-l-4 border-heat-hot pl-4 text-heat-hot">
          The run stopped: {run.error}
        </p>
      )}

      <MapPanel shapes={run.shapes} layers={layers} campaigns={campaigns} placements={run.placements} />

      <div className="grid gap-12 lg:grid-cols-3">
        <Panel title="Who we looked for">
          {!weights ? (
            <Pending>Reading your target customer…</Pending>
          ) : (
            <ul className="flex flex-col gap-3">
              {weights.map((w) => (
                <li key={w.column} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{w.description}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {MEASURE_LABEL[w.measures]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-foreground/10">
                    <div className="h-full bg-foreground" style={{ width: `${w.weight * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Biggest gaps">
          {!layers ? (
            <Pending>Scoring 2,324 census tracts…</Pending>
          ) : (
            <ol className="flex flex-col">
              {strongest(layers, "gap", 10).map((geoid) => (
                <li key={geoid} className="flex items-center gap-3 border-b border-border py-2 text-sm">
                  <span className="size-3 shrink-0 rounded-full" style={{ background: heatColor(layers[geoid].gap) }} />
                  <span className="flex-1">{tractLabel(geoid)}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {layers[geoid].gap.toFixed(2)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {layers && !run.agentDone && <Pending>Updating as competitors&rsquo; ads are found…</Pending>}
        </Panel>

        <Panel title="Where competitors advertise">
          <p className="font-mono text-xs text-muted-foreground">
            {competitors.length} competitors · {campaigns.length} campaigns found
          </p>
          <ol className="flex flex-col gap-2 text-sm" aria-live="polite">
            {run.events.map((e, i) => {
              if (e.type === "step")
                return <li key={i} className="text-muted-foreground">{e.message}</li>;
              if (e.type === "competitor")
                return (
                  <li key={i}>
                    <span className="font-semibold">{e.competitor.name}</span>{" "}
                    <span className="text-muted-foreground">— {e.competitor.reason}</span>
                  </li>
                );
              if (e.type === "campaign")
                return (
                  <li key={i} className="border-l-4 border-heat-hot pl-3">
                    <a href={e.campaign.sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                      {e.campaign.competitor}: {e.campaign.title}
                    </a>
                    <div className="font-mono text-xs text-muted-foreground">
                      {e.campaign.station ? e.campaign.station.name : "No station matched"} · {e.campaign.kind}
                    </div>
                  </li>
                );
              if (e.type === "error")
                return <li key={i} className="text-heat-hot">{e.message}</li>;
              return null;
            })}
          </ol>
          {!run.agentDone && !run.error && <Pending>Searching…</Pending>}
        </Panel>
      </div>

      <Panel title="Placements to buy">
        {!run.placements ? (
          <Pending>Finding kiosks and bus shelters in your strongest areas…</Pending>
        ) : run.placements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No kiosks or bus shelters in these areas fit your budget. Raise the budget or add boroughs.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="font-mono text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 font-normal">Placement</th>
                  <th className="py-2 font-normal">Area</th>
                  <th className="py-2 text-right font-normal">Est. cost per customer reached</th>
                  <th className="py-2 pl-6 font-normal">Measure with</th>
                </tr>
              </thead>
              <tbody>
                {run.placements.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2">
                      <div>{p.kind === "linknyc" ? "LinkNYC kiosk" : "Bus shelter"}</div>
                      <div className="text-xs text-muted-foreground">{p.address}</div>
                    </td>
                    <td className="py-2">{tractLabel(p.geoid)}</td>
                    <td className="py-2 text-right font-mono tabular-nums">${p.costPerAudienceMember.toFixed(3)}</td>
                    <td className="py-2 pl-6">{p.measurement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

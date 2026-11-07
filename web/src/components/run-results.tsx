"use client";

import { useMemo } from "react";

import { MapPanel } from "@/components/map-panel";
import { campaignsOf, type RunState } from "@/components/use-audience-run";
import type { Campaign } from "@/lib/contract";
import { computeLayers, strongest, type TractLayers } from "@/lib/gap";
import { tractLabel } from "@/lib/tracts";

/** The heatmap's colour for a score from 0 to 1. */
export function heatColor(score: number) {
  return score < 0.5
    ? `color-mix(in oklch, var(--heat-mid) ${score * 200}%, var(--heat-cool))`
    : `color-mix(in oklch, var(--heat-hot) ${(score - 0.5) * 200}%, var(--heat-mid))`;
}

const MEASURE_LABEL = { lives: "lives", works: "works", passes: "passes through" } as const;

/** The campaigns found so far and the map layers they produce. */
export function useRunView(run: RunState) {
  const campaigns = useMemo(() => campaignsOf(run.events), [run.events]);
  const layers = useMemo(
    () => (run.shapes && run.fit ? computeLayers(run.shapes, run.fit, campaigns) : null),
    [run.shapes, run.fit, campaigns],
  );
  return { campaigns, layers };
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Pending({ children }: { children: React.ReactNode }) {
  return <p className="animate-pulse text-sm text-muted-foreground">{children}</p>;
}

/** The results as one column, ordered from what to act on to how it was worked out. */
export function ResultsList({
  run,
  layers,
  campaigns,
}: {
  run: RunState;
  layers: TractLayers | null;
  campaigns: Campaign[];
}) {
  const weights = run.fit?.weights.filter((w) => w.weight > 0).sort((a, b) => b.weight - a.weight);
  const competitors = run.events.filter((e) => e.type === "competitor");

  return (
    <div className="flex flex-col gap-8">
      {run.error && (
        <p role="alert" className="border-l-4 border-heat-hot pl-4 text-sm text-heat-hot">
          The run stopped: {run.error}
        </p>
      )}

      <Section title="Biggest gaps">
        {!layers ? (
          <Pending>Scoring 2,324 census tracts…</Pending>
        ) : (
          <ol className="flex flex-col">
            {strongest(layers, "gap", 10).map((geoid) => (
              <li key={geoid} className="flex items-center gap-3 border-b border-border py-2 text-sm last:border-0">
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
      </Section>

      <Section title="Placements to buy" aside={run.placements && `${run.placements.length} found`}>
        {!run.placements ? (
          <Pending>Finding kiosks and bus shelters in the biggest gaps…</Pending>
        ) : run.placements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No kiosks or bus shelters in these areas fit your budget. Raise the budget to include bus shelters.
          </p>
        ) : (
          <ul className="flex flex-col">
            {run.placements.map((p) => (
              <li key={p.id} className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-0">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{p.kind === "linknyc" ? "LinkNYC kiosk" : "Bus shelter"}</span>
                  <span className="font-mono tabular-nums">
                    ${p.costPerAudienceMember.toFixed(3)}
                    <span className="text-xs text-muted-foreground"> / customer</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                  <span>{p.address} · {tractLabel(p.geoid)}</span>
                  <span className="shrink-0">{p.measurement}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Where competitors advertise" aside={`${competitors.length} competitors · ${campaigns.length} ads`}>
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
      </Section>

      <Section title="Who we looked for">
        {!weights ? (
          <Pending>Reading your target customer…</Pending>
        ) : (
          <ul className="flex flex-col gap-3">
            {weights.map((w) => (
              <li key={w.column} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{w.description}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{MEASURE_LABEL[w.measures]}</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${w.weight * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/** Map above the results, for pages that scroll as a whole. */
export function RunResults({ run }: { run: RunState }) {
  const { campaigns, layers } = useRunView(run);
  return (
    <div className="flex flex-col gap-10">
      <MapPanel
        shapes={run.shapes}
        layers={layers}
        campaigns={campaigns}
        placements={run.placements}
        className="h-[70vh] min-h-[28rem] rounded-2xl"
      />
      <ResultsList run={run} layers={layers} campaigns={campaigns} />
    </div>
  );
}

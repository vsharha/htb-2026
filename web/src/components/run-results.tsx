"use client";

import { useMemo, useState } from "react";

import { LayerTabs } from "@/components/layer-tabs";
import { MapPanel } from "@/components/map-panel";
import { campaignsOf, type RunState } from "@/components/use-audience-run";
import type { Campaign } from "@/lib/contract";
import { computeLayers, strongest, type LayerId, type TractLayers } from "@/lib/gap";
import { tractLabel } from "@/lib/tracts";

/** The heatmap's colour for a score from 0 to 1. */
export function heatColor(score: number) {
  return score < 0.5
    ? `color-mix(in oklch, var(--heat-mid) ${score * 200}%, var(--heat-cool))`
    : `color-mix(in oklch, var(--heat-hot) ${(score - 0.5) * 200}%, var(--heat-mid))`;
}

const MEASURE_LABEL = { lives: "lives", works: "works", passes: "passes through" } as const;

/** How many tracts each tab ranks. */
const TOP_TRACTS = 5;

/** The selected layer, the campaigns found so far and the map layers they produce. */
export function useRunView(run: RunState) {
  const [layer, setLayer] = useState<LayerId>("gap");
  const campaigns = useMemo(() => campaignsOf(run.events), [run.events]);
  const layers = useMemo(
    () => (run.shapes && run.fit ? computeLayers(run.shapes, run.fit, campaigns) : null),
    [run.shapes, run.fit, campaigns],
  );
  return { layer, setLayer, campaigns, layers };
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
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

function TractRanking({ layers, layer, value }: { layers: TractLayers; layer: LayerId; value: (score: number) => string }) {
  return (
    <ol className="flex flex-col">
      {strongest(layers, layer, TOP_TRACTS).map((geoid) => (
        <li key={geoid} className="flex items-center gap-3 border-b border-border py-2 text-sm last:border-0">
          <span className="size-3 shrink-0 rounded-full" style={{ background: heatColor(layers[geoid][layer]) }} />
          <span className="flex-1">{tractLabel(geoid)}</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{value(layers[geoid][layer])}</span>
        </li>
      ))}
    </ol>
  );
}

function GapTab({ run, layers }: { run: RunState; layers: TractLayers | null }) {
  return (
    <>
      <Section title="Biggest gaps">
        {!layers ? (
          <Pending>Scoring 2,324 census tracts…</Pending>
        ) : (
          <TractRanking layers={layers} layer="gap" value={(s) => s.toFixed(2)} />
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
    </>
  );
}

function CustomersTab({ run, layers }: { run: RunState; layers: TractLayers | null }) {
  const weights = run.fit?.weights.filter((w) => w.weight > 0).sort((a, b) => b.weight - a.weight);
  return (
    <>
      <Section title="Most customers">
        {!layers ? (
          <Pending>Scoring 2,324 census tracts…</Pending>
        ) : (
          <TractRanking layers={layers} layer="fit" value={(s) => `top ${Math.max((1 - s) * 100, 0.1).toFixed(1)}%`} />
        )}
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
    </>
  );
}

function CompetitorsTab({ run, campaigns }: { run: RunState; campaigns: Campaign[] }) {
  const competitors = run.events.flatMap((e) => (e.type === "competitor" ? [e.competitor] : []));
  const steps = run.events.flatMap((e) => (e.type === "step" ? [e.message] : []));
  const errors = run.events.flatMap((e) => (e.type === "error" ? [e.message] : []));

  return (
    <>
      <Section title="Competitors" aside={`${competitors.length} found`}>
        {competitors.length === 0 && !run.agentDone ? (
          <Pending>Finding competitors…</Pending>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {competitors.map((c) => (
              <li key={c.name}>
                <span className="font-semibold">{c.name}</span>{" "}
                <span className="text-muted-foreground">— {c.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Their ads" aside={`${campaigns.length} found`}>
        <ul className="flex flex-col gap-2.5 text-sm" aria-live="polite">
          {campaigns.map((c) => (
            <li key={c.sourceUrl} className="border-l-4 border-heat-hot pl-3">
              <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                {c.competitor}: {c.title}
              </a>
              <div className="font-mono text-xs text-muted-foreground">
                {c.station ? c.station.name : "No station matched"} · {c.kind}
              </div>
            </li>
          ))}
        </ul>
        {!run.agentDone && !run.error && <Pending>{steps.at(-1) ?? "Searching…"}</Pending>}
        {errors.map((m) => (
          <p key={m} className="text-sm text-heat-hot">{m}</p>
        ))}
      </Section>
    </>
  );
}

/** What explains the selected layer, optionally under the layer tabs. */
export function ResultsList({
  run,
  layers,
  campaigns,
  layer,
  onLayerChange,
}: {
  run: RunState;
  layers: TractLayers | null;
  campaigns: Campaign[];
  layer: LayerId;
  /** Shows the layer tabs at the top; omit when the page places them itself. */
  onLayerChange?: (layer: LayerId) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {onLayerChange && <LayerTabs layer={layer} onChange={onLayerChange} />}
      {run.error && (
        <p role="alert" className="border-l-4 border-heat-hot pl-4 text-sm text-heat-hot">
          The run stopped: {run.error}
        </p>
      )}
      {layer === "gap" && <GapTab run={run} layers={layers} />}
      {layer === "fit" && <CustomersTab run={run} layers={layers} />}
      {layer === "competition" && <CompetitorsTab run={run} campaigns={campaigns} />}
    </div>
  );
}

/** Map above the results, for pages that scroll as a whole. */
export function RunResults({ run }: { run: RunState }) {
  const { layer, setLayer, campaigns, layers } = useRunView(run);
  return (
    <div className="flex flex-col gap-10">
      <MapPanel
        shapes={run.shapes}
        layers={layers}
        campaigns={campaigns}
        placements={run.placements}
        layer={layer}
        className="h-[70vh] min-h-[28rem] rounded-2xl"
      />
      <ResultsList run={run} layers={layers} campaigns={campaigns} layer={layer} onLayerChange={setLayer} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { campaignsOf, type RunState } from "@/components/use-audience-run";
import { usePlacementFocus, type PlacementFocus } from "@/components/use-placement-focus";
import type { Campaign, Placement } from "@/lib/contract";
import { getCampaignLocation, LOCATION_PRECISION_LABELS } from "@/lib/campaign-location";
import { computeLayers, recommendationLayer, strongest, type LayerId, type TractLayers } from "@/lib/gap";
import { researchOutcome } from "@/lib/research-outcome";
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

/** The selected layer, the campaigns found so far, the map layers they produce and the focused placement. */
export function useRunView(run: RunState) {
  const [layer, setLayer] = useState<LayerId>("gap");
  const campaigns = useMemo(() => campaignsOf(run.events), [run.events]);
  const layers = useMemo(
    () => (run.shapes && run.fit ? computeLayers(run.shapes, run.fit, campaigns) : null),
    [run.shapes, run.fit, campaigns],
  );
  const focus = usePlacementFocus();
  return { layer, setLayer, campaigns, layers, focus };
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

function PlacementRow({ placement: p, number, focus }: { placement: Placement; number: number; focus: PlacementFocus }) {
  const row = useRef<HTMLButtonElement>(null);
  const active = focus.hovered === p.id || focus.selected?.id === p.id;

  // A click on the marker scrolls its row into view.
  const selected = focus.selected;
  useEffect(() => {
    if (selected?.id === p.id && selected.from === "map") row.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected, p.id]);

  return (
    <li className="border-b border-border last:border-0">
      <button
        ref={row}
        type="button"
        onMouseEnter={() => focus.hover(p.id)}
        onMouseLeave={() => focus.hover(null)}
        onFocus={() => focus.hover(p.id)}
        onBlur={() => focus.hover(null)}
        onClick={() => focus.select(p.id, "list")}
        className={
          "-mx-2 flex w-[calc(100%+1rem)] cursor-pointer gap-3 rounded-lg px-2 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
          (active ? "bg-foreground/5" : "")
        }
      >
        <span
          className={
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-foreground font-mono text-[10px] font-semibold tabular-nums " +
            (active ? "bg-foreground text-background" : "bg-background")
          }
        >
          {number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{p.kind === "linknyc" ? "LinkNYC kiosk" : "Bus shelter"}</span>
            <span className="font-mono tabular-nums">
              ${p.costPerAudienceMember.toFixed(3)}
              <span className="text-xs text-muted-foreground"> / customer</span>
            </span>
          </span>
          <span className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
            <span>{p.address} · {tractLabel(p.geoid)}</span>
            <span className="shrink-0">{p.measurement}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function GapTab({ run, layers, focus }: { run: RunState; layers: TractLayers | null; focus: PlacementFocus }) {
  const ranking = recommendationLayer(campaignsOf(run.events));
  const audienceOnly = ranking === "fit";
  return (
    <>
      <Section title={audienceOnly ? "Best audience locations" : "Biggest observed gaps"}>
        {!layers ? (
          <Pending>Scoring 2,324 census tracts…</Pending>
        ) : (
          <TractRanking layers={layers} layer={ranking} value={(s) => s.toFixed(2)} />
        )}
        {layers && !run.agentDone && !run.error && <Pending>{audienceOnly ? "Researching competitors; placements currently follow audience fit…" : "Updating as more competitors’ ads are found…"}</Pending>}
        <p className="text-xs text-muted-foreground">
          {audienceOnly
            ? "Competition coverage unknown. These placements follow audience fit; they are not confirmed gaps in competitors’ advertising."
            : "Ranked against the current campaigns we could locate, not a complete inventory. Missing evidence means unknown coverage."}
        </p>
      </Section>

      <Section title="Placements to buy" aside={run.placements && `${run.placements.length} found`}>
        {!run.placements ? (
          <Pending>{audienceOnly ? "Finding kiosks and bus shelters near your audience…" : "Finding kiosks and bus shelters in the observed gaps…"}</Pending>
        ) : run.placements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No kiosks or bus shelters in these areas fit your budget. Raise the budget to include bus shelters.
          </p>
        ) : (
          <ol className="flex flex-col">
            {run.placements.map((p, i) => (
              <PlacementRow key={p.id} placement={p} number={i + 1} focus={focus} />
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}

function CustomersTab({ run, layers }: { run: RunState; layers: TractLayers | null }) {
  // Traits that count for or against the customer, strongest either way first.
  const weights = run.fit?.weights.filter((w) => w.weight !== 0).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  const aside = run.fit && (run.fit.source === "jev" ? "weighted by Jev" : "weighted by keywords");
  return (
    <>
      <Section title="Most customers">
        {!layers ? (
          <Pending>Scoring 2,324 census tracts…</Pending>
        ) : (
          <TractRanking layers={layers} layer="fit" value={(s) => `top ${Math.max((1 - s) * 100, 0.1).toFixed(1)}%`} />
        )}
      </Section>

      <Section title="Who we looked for" aside={aside}>
        {run.fit?.source === "keywords" && (
          <p className="text-xs text-muted-foreground">
            Jev couldn&rsquo;t be reached, so these weights come from keywords in your target customer.
          </p>
        )}
        {!weights ? (
          <Pending>Reading your target customer…</Pending>
        ) : (
          <ul className="flex flex-col gap-3">
            {weights.map((w) => (
              <li key={w.column} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    {w.weight < 0 && <span className="text-muted-foreground">Less likely: </span>}
                    {w.description}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{MEASURE_LABEL[w.measures]}</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10">
                  <div
                    className={"h-full rounded-full " + (w.weight < 0 ? "bg-heat-cool" : "bg-foreground")}
                    style={{ width: `${Math.abs(w.weight) * 100}%` }}
                  />
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
  const outcome = researchOutcome(run.events, run.agentDone || !!run.error);

  return (
    <>
      <Section title="Competitors" aside={`${competitors.length} found`}>
        {competitors.length === 0 ? (
          !run.agentDone && !run.error ? <Pending>Finding competitors…</Pending> : <p className="text-sm text-muted-foreground">No source-supported competitor matches are available from this run.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {competitors.map((c) => (
              <li key={c.name}>
                {c.sourceUrl ? <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">{c.name}</a> : <span className="font-semibold">{c.name}</span>}{" "}
                <span className="text-muted-foreground">— {c.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Their ads" aside={`${campaigns.length} found`}>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground" role="status">
          <p className="font-medium text-foreground">{outcome.label}</p>
          {outcome.summary && <p>{outcome.summary.competitorsSearched.length} of {competitors.length} competitors searched; {outcome.summary.competitorsCompleted.length} completed. {outcome.summary.searches} searches; {outcome.summary.sources} source URLs found.</p>}
          {!!outcome.summary?.rejectedSources && <p>{outcome.summary.rejectedSources} {outcome.summary.rejectedSources === 1 ? "finding rejected" : "findings rejected"} because the source URL was absent from this research.</p>}
          {campaigns.length > 0 && <p>{outcome.qualifying} campaigns have current dates and precise locations; {outcome.historical} historical; {outcome.unknownDates} with current dates unconfirmed.</p>}
        </div>
        <ul className="flex flex-col gap-2.5 text-sm" aria-live="polite">
          {campaigns.map((c, i) => {
            const location = getCampaignLocation(c);
            return <li key={`${c.sourceUrl}|${c.title}|${i}`} className="border-l-4 border-heat-hot pl-3">
              <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                {c.competitor}: {c.title}
              </a>
              <div className="font-mono text-xs text-muted-foreground">
                {location ? LOCATION_PRECISION_LABELS[location.precision] : "Location not resolved"} · {c.kind}
              </div>
              <p className="text-xs text-muted-foreground">
                {c.coverage === "current" ? "Confirmed current dates" : c.coverage === "historical" ? "Historical campaign" : "Current coverage unknown"}
                {(c.startsOn || c.endsOn) && `: ${c.startsOn ?? "unknown start"} to ${c.endsOn ?? "unknown end"}`}
              </p>
              {(location || c.location) && <p className="text-xs text-muted-foreground">{location?.label ?? c.location}</p>}
              {!location && <p className="text-xs text-muted-foreground">{c.locationNote ?? "The source does not identify a specific location we can map."}</p>}
              {c.evidence && <p className="mt-1 text-xs text-muted-foreground">{c.evidence}</p>}
            </li>;
          })}
        </ul>
        {outcome.unmapped > 0 && (
          <p className="text-xs text-muted-foreground">
            {outcome.unmapped === 1 ? "1 ad isn’t on the map" : `${outcome.unmapped} ads aren’t on the map`}: no reliable location match.
          </p>
        )}
        {!run.agentDone && !run.error && <Pending>{steps.at(-1) ?? "Searching…"}</Pending>}
        {(run.agentDone || run.error) && campaigns.length === 0 && <p className="text-sm text-muted-foreground">{outcome.empty}</p>}
        {campaigns.length > 0 && outcome.qualifying === 0 && <p className="text-sm text-muted-foreground">Campaign evidence was found, but none establishes current coverage at a precise location. Placement recommendations use audience fit.</p>}
        {errors.map((m) => (
          <p key={m} className="text-sm text-heat-hot">{m}</p>
        ))}
      </Section>
    </>
  );
}

/** What explains the selected layer. */
export function ResultsList({
  run,
  layers,
  campaigns,
  layer,
  focus,
}: {
  run: RunState;
  layers: TractLayers | null;
  campaigns: Campaign[];
  layer: LayerId;
  focus: PlacementFocus;
}) {
  const recording = run.events.find((e) => e.type === "recording");
  return (
    <div className="flex flex-col gap-8">
      {recording?.type === "recording" && <p className="text-sm text-muted-foreground">Showing recorded research from {recording.recordedAt.slice(0, 10)} because live research could not finish.</p>}
      {run.error && (
        <p role="alert" className="border-l-4 border-heat-hot pl-4 text-sm text-heat-hot">
          The run stopped: {run.error}
        </p>
      )}
      {layer === "gap" && <GapTab run={run} layers={layers} focus={focus} />}
      {layer === "fit" && <CustomersTab run={run} layers={layers} />}
      {layer === "competition" && <CompetitorsTab run={run} campaigns={campaigns} />}
    </div>
  );
}

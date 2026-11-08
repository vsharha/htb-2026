"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CompetitorLogo } from "@/components/competitor-logo";
import { campaignId, campaignsOf, competitorsOf, type RunState } from "@/components/use-audience-run";
import { useMapFocus, type MapFocus } from "@/components/use-map-focus";
import type { Campaign, Competitor, Placement, TraceEntry } from "@/lib/contract";
import { getCampaignLocation, LOCATION_PRECISION_LABELS } from "@/lib/campaign-location";
import { computeLayers, recommendationLayer, type LayerId, type TractLayers } from "@/lib/gap";
import { researchOutcome } from "@/lib/research-outcome";
import { useSettings } from "@/lib/settings";
import { tractCode, tractName } from "@/lib/tracts";

const MEASURE_LABEL = { lives: "lives", works: "works", passes: "passes through" } as const;

/** How many neighbourhoods each tab ranks, and the share of tracts counted as the top. */
const TOP_NEIGHBORHOODS = 5;
const TOP_TIER = 0.97;

/** The selected layer, the campaigns found so far, the map layers they produce and the focused placement and campaign. */
export function useRunView(run: RunState) {
  const [chosen, setLayer] = useState<LayerId>("gap");
  const campaigns = useMemo(() => campaignsOf(run.events), [run.events]);
  const hasGap = recommendationLayer(campaigns) === "gap";
  // The Gap tab exists only once a campaign from the past 12 months has a precise location.
  // Until then the default choice of Gap shows Customers, so the Gap tab
  // opens by itself when it appears unless another tab was picked.
  const layer = chosen === "gap" && !hasGap ? "fit" : chosen;
  const competitors = useMemo(() => competitorsOf(run.events), [run.events]);
  const layers = useMemo(
    () => (run.shapes && run.fit ? computeLayers(run.shapes, run.fit, campaigns) : null),
    [run.shapes, run.fit, campaigns],
  );
  // A marker's row exists only on the tab that lists it, so a click on a
  // marker opens that tab before the row can scroll into view.
  const placementMarks = useMapFocus();
  const focus: MapFocus = {
    ...placementMarks,
    select: (id, from) => {
      if (from === "map") setLayer(hasGap ? "gap" : "fit");
      placementMarks.select(id, from);
    },
  };
  const campaignMarks = useMapFocus();
  const campaignFocus: MapFocus = {
    ...campaignMarks,
    select: (id, from) => {
      if (from === "map") setLayer("competition");
      campaignMarks.select(id, from);
    },
  };
  return { layer, setLayer, hasGap, campaigns, competitors, layers, focus, campaignFocus };
}

function Throbber() {
  return (
    <span
      aria-hidden
      className="mb-px inline-block size-3 shrink-0 animate-spin rounded-full border-[1.5px] border-muted-foreground/30 border-t-muted-foreground motion-reduce:animate-none"
    />
  );
}

function Section({
  title,
  aside,
  busy,
  collapsible,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  busy?: boolean;
  /** The heading becomes a button that folds the section's content away; it starts open. */
  collapsible?: boolean;
  children: React.ReactNode;
}) {
  const header = (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        {busy && <Throbber />}
      </div>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {aside}
        {collapsible && <ChevronDown aria-hidden className="size-4 self-center transition-transform group-open:rotate-180 motion-reduce:transition-none" />}
      </span>
    </div>
  );
  if (collapsible) {
    return (
      <details open className="group flex flex-col gap-3">
        <summary className="cursor-pointer list-none outline-none marker:hidden focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          {header}
        </summary>
        <div className="mt-3 flex flex-col gap-3">{children}</div>
      </details>
    );
  }
  return (
    <section className="flex flex-col gap-3">
      {header}
      {children}
    </section>
  );
}

function Pending({ children }: { children: React.ReactNode }) {
  return <p className="animate-pulse text-sm text-muted-foreground">{children}</p>;
}

/**
 * The wait while the self-hosted decision model scores every tract. The count
 * shows the page is working, because CPU inference takes about a minute and a
 * half and a still spinner reads as a hang.
 */
function Scoring() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <Pending>Scoring 2,324 census tracts with the self-hosted model… {seconds}s</Pending>;
}

/**
 * The neighbourhoods holding the most tracts in the top 3% on a layer, with
 * how many each holds. Grouping by neighbourhood reads as places a marketer
 * knows, where a list of tracts reads as codes.
 */
function NeighborhoodRanking({ layers, layer }: { layers: TractLayers; layer: LayerId }) {
  const groups = useMemo(() => {
    const entries = Object.entries(layers);
    const sorted = entries.map(([, v]) => v[layer]).sort((a, b) => a - b);
    const cut = sorted[Math.min(sorted.length - 1, Math.floor(TOP_TIER * sorted.length))];
    const byName = new Map<string, { count: number; best: number }>();
    for (const [geoid, values] of entries) {
      if (values[layer] < cut || values[layer] <= 0) continue;
      const name = tractName(geoid);
      const group = byName.get(name) ?? { count: 0, best: 0 };
      byName.set(name, { count: group.count + 1, best: Math.max(group.best, values[layer]) });
    }
    return [...byName.entries()]
      .sort((a, b) => b[1].count - a[1].count || b[1].best - a[1].best)
      .slice(0, TOP_NEIGHBORHOODS);
  }, [layers, layer]);

  return (
    <>
      <ol className="flex flex-col">
        {groups.map(([name, { count }]) => (
          <li key={name} className="border-b border-border py-2 text-sm text-foreground last:border-0">
            {name}
            <span className="text-muted-foreground"> · {count} {count === 1 ? "tract" : "tracts"}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-3">Neighbourhoods with the most tracts in the top 3%.</p>
    </>
  );
}

function PlacementRow({ placement: p, number, focus }: { placement: Placement; number: number; focus: MapFocus }) {
  const row = useRef<HTMLButtonElement>(null);
  const chosen = focus.selected?.id === p.id;
  const active = focus.hovered === p.id || chosen;
  // Rows read like the tract rankings: a divider between each, no cards. The
  // list is sorted by cost, so the first placement is the lowest cost one and is tagged, and the picked one is shaded.
  const { cost } = useSettings();
  const best = cost && number === 1;

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
          "-mx-2 flex w-[calc(100%+1rem)] cursor-pointer gap-3 rounded-r-lg border-l-[3px] px-2 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
          (chosen ? "border-accent bg-accent/10" : active ? "border-transparent bg-foreground/5" : "border-transparent")
        }
      >
        <span
          className={
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold tabular-nums text-accent-foreground " +
            (chosen ? "bg-accent-dark" : "bg-accent")
          }
        >
          {number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {best && <span className="w-fit bg-accent px-1.5 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase">Lowest cost</span>}
          <span className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0">
              <span className={best || chosen ? "font-semibold" : "font-medium"}>{p.address}</span>
              <span className="text-muted-foreground"> · {tractName(p.geoid)}</span>
              <span className="ml-1.5 text-[10px] text-ink-3">{tractCode(p.geoid)}</span>
            </span>
            {cost && (
              <span className="shrink-0 text-right">
                <span className="font-mono tabular-nums text-foreground">${p.costPerAudienceMember.toFixed(3)}</span>
                <span className="text-xs text-muted-foreground"> / customer</span>
              </span>
            )}
          </span>
          <span className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
            <span>{p.kind === "linknyc" ? "LinkNYC kiosk" : "Bus shelter"}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function PlacementsSection({ run, focus, audienceOnly }: { run: RunState; focus: MapFocus; audienceOnly: boolean }) {
  const { cost } = useSettings();
  return (
    <Section title="Placements to buy" aside={run.placements && `${run.placements.length} found`}>
      {cost && <p className="text-xs text-muted-foreground">Sorted by estimated cost per customer, lowest first.</p>}
      {audienceOnly && (
        <p className="text-xs text-muted-foreground">
          Chosen by audience fit. Competition coverage is unknown, so these are not confirmed gaps in competitors&rsquo; advertising.
          {!run.agentDone && !run.error && " They are re-ranked if competitors’ recent ads are found."}
        </p>
      )}
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
  );
}

function GapTab({ run, layers, focus }: { run: RunState; layers: TractLayers | null; focus: MapFocus }) {
  return (
    <>
      <Section title="Biggest observed gaps">
        {!layers ? (
          <Scoring />
        ) : (
          <NeighborhoodRanking layers={layers} layer="gap" />
        )}
        {layers && !run.agentDone && !run.error && <Pending>Updating as more competitors&rsquo; ads are found…</Pending>}
        <p className="text-xs text-muted-foreground">
          Ranked against campaigns from the past 12 months that we could locate, not a complete inventory. An ad may no longer be up, and missing evidence means unknown coverage.
        </p>
      </Section>

      <PlacementsSection run={run} focus={focus} audienceOnly={false} />
    </>
  );
}

/** Without a Gap tab, the placements chosen by audience fit are listed here. */
function CustomersTab({ run, layers, focus, placements }: { run: RunState; layers: TractLayers | null; focus: MapFocus; placements: boolean }) {
  // Traits that count for or against the customer, strongest either way first.
  const weights = run.fit?.weights.filter((w) => w.weight !== 0).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  const aside =
    run.fit &&
    (run.fit.source === "systemone" ? "weighted by decision model" : run.fit.source === "jev" ? "weighted by Jev" : "weighted by keywords");
  return (
    <>
      <Section title="Most customers">
        {!layers ? (
          <Scoring />
        ) : (
          <NeighborhoodRanking layers={layers} layer="fit" />
        )}
      </Section>

      {placements && <PlacementsSection run={run} focus={focus} audienceOnly />}

      <Section title="Who we looked for" aside={aside}>
        {run.fit?.source === "keywords" && (
          <p className="text-xs text-muted-foreground">
            The decision model couldn&rsquo;t be reached, so these weights come from keywords in your target customer.
          </p>
        )}
        {run.fit?.stats && (
          <p className="text-xs text-muted-foreground">
            {run.fit.stats.model} answered 21 traits in {(run.fit.stats.durationMs / 1000).toFixed(1)} s
            {run.fit.stats.inputTokens ? ` from ${run.fit.stats.inputTokens.toLocaleString()} input tokens` : ""} on Vultr CPU.
          </p>
        )}
        {!weights ? (
          <Pending>Reading your target customer…</Pending>
        ) : (
          <ul className="flex flex-col gap-3">
            {weights.map((w) => (
              <li key={w.column} className="group flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    {w.weight < 0 && <span className="text-muted-foreground">Less likely: </span>}
                    {w.description}
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted-foreground">
                    <span className="group-hover:hidden">{MEASURE_LABEL[w.measures]}</span>
                    <span className="hidden font-mono tabular-nums group-hover:inline">{w.weight > 0 ? "+" : ""}{w.weight.toFixed(2)}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10">
                  <div
                    className={"h-full rounded-full " + (w.weight < 0 ? "bg-ink-3" : "bg-foreground")}
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

function CampaignRow({ campaign: c, id, website, focus }: { campaign: Campaign; id: string; website: string | null; focus: MapFocus }) {
  const row = useRef<HTMLLIElement>(null);
  const location = getCampaignLocation(c);
  const active = !!location && (focus.hovered === id || focus.selected?.id === id);

  // A click on the marker scrolls its row into view.
  const selected = focus.selected;
  useEffect(() => {
    if (selected?.id === id && selected.from === "map") row.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected, id]);

  return (
    <li
      ref={row}
      onMouseEnter={location ? () => focus.hover(id) : undefined}
      onMouseLeave={location ? () => focus.hover(null) : undefined}
      className={"-mr-2 rounded-r-lg border-l-4 border-ink-3 py-1 pr-2 pl-3 transition-colors " + (active ? "bg-foreground/5" : "")}
    >
      <div className="flex gap-2.5">
        <CompetitorLogo name={c.competitor} website={website} className="mt-0.5 size-7" />
        <div className="min-w-0 flex-1">
          <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
            {c.competitor}: {c.title}
          </a>
          <div className="text-xs text-muted-foreground">
            {location ? LOCATION_PRECISION_LABELS[location.precision] : c.reach === "citywide" ? "Citywide, no fixed location" : c.reach === "borough" ? "Borough-wide, no fixed location" : "No location found"} · {c.kind}
          </div>
          <p className="text-xs text-muted-foreground">
            {c.coverage === "current" ? "Confirmed current dates" : c.coverage === "recent" ? "Ran in the past 12 months" : c.coverage === "historical" ? "Older campaign" : "Undated campaign"}
            {c.startsOn || c.endsOn ? `: ${c.startsOn ?? "unknown start"} to ${c.endsOn ?? "unknown end"}` : c.latestEvidenceOn && `: latest evidence ${c.latestEvidenceOn}`}
          </p>
          {location ? (
            <button
              type="button"
              onFocus={() => focus.hover(id)}
              onBlur={() => focus.hover(null)}
              onClick={() => focus.select(id, "list")}
              className="flex cursor-pointer items-center gap-1 text-left text-xs text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <MapPin className="size-3 shrink-0" aria-hidden />
              {location.label}
              <span className="sr-only">: show on map</span>
            </button>
          ) : (
            <>
              {c.location && <p className="text-xs text-muted-foreground">{c.location}</p>}
              {!c.reach && <p className="text-xs text-muted-foreground">{c.locationNote ?? "The research found no place named for this campaign."}</p>}
            </>
          )}
          {c.evidence && <p className="mt-1 text-xs text-muted-foreground">{c.evidence}</p>}
          {location && <p className="mt-1 text-[10px] text-muted-foreground">Location: {location.attribution}</p>}
        </div>
      </div>
    </li>
  );
}

/** What each tool the agent can call is shown as. */
const TOOL_LABEL: Record<string, string> = {
  web_search: "Web search",
  open_page: "Open page",
  reportCompetitor: "Report competitor",
  reportCampaign: "Report campaign",
  finishDiscovery: "Finish discovery",
  finishResearch: "Finish research",
  geocode: "Locate on map",
};

/** Reasoning summaries mark their headings with **double asterisks**; show those as bold instead of raw markers. */
function Emphasised({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold not-italic text-foreground">{part}</strong> : part));
}

/**
 * What the agent did: the tools it called, with counts, then its reasoning and
 * each call in order, grouped by the phase or competitor it was working on.
 */
function AgentTrace({ trace, researching, recorded }: { trace: TraceEntry[]; researching: boolean; recorded: boolean }) {
  const toolCounts = new Map<string, number>();
  const stages = new Map<string, TraceEntry[]>();
  for (const entry of trace) {
    if (entry.kind === "tool") toolCounts.set(entry.tool, (toolCounts.get(entry.tool) ?? 0) + 1);
    stages.set(entry.stage, [...(stages.get(entry.stage) ?? []), entry]);
  }
  return (
    <Section title="How the agent worked" aside={trace.length > 0 ? `${trace.length} steps` : undefined} busy={researching} collapsible>
      {trace.length === 0 ? (
        researching ? (
          <Pending>Waiting for the agent&rsquo;s first step…</Pending>
        ) : (
          <p className="text-sm text-muted-foreground">
            {recorded ? "Recorded research keeps the findings but not the agent\u2019s steps." : "The agent recorded no steps for this run."}
          </p>
        )
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">Tools used</p>
            <ul className="flex flex-wrap gap-1.5">
              {[...toolCounts].map(([tool, count]) => (
                <li key={tool} className="rounded-lg border border-border bg-muted px-2 py-0.5 text-xs text-foreground">
                  {TOOL_LABEL[tool] ?? tool} <span className="text-muted-foreground">×</span>{" "}
                  <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            {[...stages].map(([stage, entries]) => (
              <div key={stage} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
                <ol className="flex flex-col gap-2 border-l border-border pl-3">
                  {entries.map((entry, i) =>
                    entry.kind === "thought" ? (
                      <li key={i} className="text-sm whitespace-pre-line text-muted-foreground italic">
                        <Emphasised text={entry.text} />
                      </li>
                    ) : (
                      <li key={i} className="flex items-baseline gap-2 text-xs">
                        <span className="shrink-0 rounded-lg border border-border bg-muted px-1.5 py-0.5 text-foreground">{TOOL_LABEL[entry.tool] ?? entry.tool}</span>
                        <span className="min-w-0 break-words text-muted-foreground">{entry.detail}</span>
                      </li>
                    ),
                  )}
                </ol>
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

function CompetitorsTab({ run, competitors, campaigns, focus }: { run: RunState; competitors: Competitor[]; campaigns: Campaign[]; focus: MapFocus }) {
  const steps = run.events.flatMap((e) => (e.type === "step" ? [e.message] : []));
  const errors = run.events.flatMap((e) => (e.type === "error" ? [e.message] : []));
  const outcome = researchOutcome(run.events, run.agentDone || !!run.error);
  const researching = !run.agentDone && !run.error;
  const websites = Object.fromEntries(competitors.map((c) => [c.name, c.website]));

  return (
    <>
      <Section title="Competitors" aside={`${competitors.length} found`} busy={researching}>
        {competitors.length === 0 ? (
          !run.agentDone && !run.error ? <Pending>Finding competitors…</Pending> : <p className="text-sm text-muted-foreground">No source-supported competitor matches are available from this run.</p>
        ) : (
          <ul className="flex flex-col text-sm">
            {competitors.map((c) => (
              <li key={c.name} className="flex items-start gap-3 border-b border-border py-2.5 last:border-0">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {c.sourceUrl ? <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="w-fit font-semibold underline underline-offset-2">{c.name}</a> : <span className="font-semibold">{c.name}</span>}
                  <span className="text-muted-foreground">{c.reason}</span>
                </span>
                <CompetitorLogo name={c.name} website={c.website} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Their ads" aside={`${campaigns.length} found`} busy={researching}>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground" role="status">
          <p className="font-medium text-foreground">{outcome.label}</p>
          {outcome.summary && <p>{outcome.summary.competitorsSearched.length} of {competitors.length} competitors searched; {outcome.summary.competitorsCompleted.length} completed. {outcome.summary.searches} searches; {outcome.summary.sources} source URLs found.</p>}
          {!!outcome.summary?.rejectedSources && <p>{outcome.summary.rejectedSources} {outcome.summary.rejectedSources === 1 ? "finding rejected" : "findings rejected"} because the source URL was absent from this research.</p>}
          {campaigns.length > 0 && <p>{outcome.qualifying} {outcome.qualifying === 1 ? "campaign" : "campaigns"} from the past 12 months {outcome.qualifying === 1 ? "has a precise location" : "have precise locations"}; {outcome.historical} older; {outcome.unknownDates} undated.</p>}
        </div>
        <ul className="flex flex-col gap-2.5 text-sm" aria-live="polite">
          {campaigns.map((c, i) => (
            <CampaignRow key={campaignId(c, i)} campaign={c} id={campaignId(c, i)} website={websites[c.competitor] ?? null} focus={focus} />
          ))}
        </ul>
        {outcome.unmapped > 0 && (
          <p className="text-xs text-muted-foreground">
            {outcome.unmapped === 1 ? "1 ad isn’t on the map" : `${outcome.unmapped} ads aren’t on the map`}: no reliable location match.
          </p>
        )}
        {outcome.widespread > 0 && (
          <p className="text-xs text-muted-foreground">
            {outcome.widespread === 1 ? "1 ad runs" : `${outcome.widespread} ads run`} across the city or a borough, so {outcome.widespread === 1 ? "it has" : "they have"} no single point on the map.
          </p>
        )}
        {!run.agentDone && !run.error && <Pending>{steps.at(-1) ?? "Searching…"}</Pending>}
        {(run.agentDone || run.error) && campaigns.length === 0 && <p className="text-sm text-muted-foreground">{outcome.empty}</p>}
        {campaigns.length > 0 && outcome.qualifying === 0 && <p className="text-sm text-muted-foreground">Campaign evidence was found, but none shows a campaign from the past 12 months at a precise location. Placement recommendations use audience fit.</p>}
        {errors.map((m) => (
          <p key={m} className="text-sm text-destructive">{m}</p>
        ))}
      </Section>

      <AgentTrace
        trace={run.events.flatMap((e) => (e.type === "trace" ? [e.entry] : []))}
        researching={researching}
        recorded={run.events.some((e) => e.type === "recording")}
      />
    </>
  );
}

/** What explains the selected layer. */
export function ResultsList({
  run,
  layers,
  campaigns,
  competitors,
  layer,
  hasGap,
  focus,
  campaignFocus,
}: {
  run: RunState;
  layers: TractLayers | null;
  campaigns: Campaign[];
  competitors: Competitor[];
  layer: LayerId;
  hasGap: boolean;
  focus: MapFocus;
  campaignFocus: MapFocus;
}) {
  const recording = run.events.find((e) => e.type === "recording");
  return (
    <div className="flex flex-col gap-8">
      {recording?.type === "recording" && <p className="text-sm text-muted-foreground">Showing recorded research from {recording.recordedAt.slice(0, 10)} because live research could not finish.</p>}
      {run.error && (
        <p role="alert" className="border-l-4 border-destructive pl-4 text-sm text-destructive">
          The run stopped: {run.error}
        </p>
      )}
      {layer === "gap" && <GapTab run={run} layers={layers} focus={focus} />}
      {layer === "fit" && <CustomersTab run={run} layers={layers} focus={focus} placements={!hasGap} />}
      {layer === "competition" && <CompetitorsTab run={run} competitors={competitors} campaigns={campaigns} focus={campaignFocus} />}
    </div>
  );
}

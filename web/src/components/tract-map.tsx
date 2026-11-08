"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Map, { Layer, Marker, NavigationControl, Popup, Source, useMap, type MapRef } from "react-map-gl/maplibre";

import { CompetitorLogo } from "@/components/competitor-logo";
import { campaignId } from "@/components/use-audience-run";
import type { MapFocus } from "@/components/use-map-focus";

import type { Campaign, Competitor, Placement } from "@/lib/contract";
import { campaignAffectsHeatmap, campaignCompetitionWeight, getCampaignLocation, LOCATION_PRECISION_LABELS } from "@/lib/campaign-location";
import { recommendationLayer, type LayerId, type TractLayers, type TractShapes } from "@/lib/gap";
import { clusterByDistance, worldPixel } from "@/lib/cluster";
import { layerHeatStyle, paletteTheme, useSettings, type HeatStyle, type PaletteTheme } from "@/lib/settings";
import { tractCode, tractName } from "@/lib/tracts";

// MapLibre looks for its worker next to its own module, where the bundler
// leaves nothing. This hands the bundler the worker file to emit and serve.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// MapLibre paints with plain colour values, not CSS variables, so the fill
// colours come from the chosen palette in lib/settings.ts. The classes are
// percentiles of the layer's own values: below the 50th nothing is painted,
// then four classes up to the top 3%. The legend in map-panel.tsx draws the
// same classes.
const CLASS_PERCENTILES = [0.5, 0.75, 0.9, 0.97];
const CLASS_OPACITY = 0.85;

/** Placement markers closer than this many pixels are merged into one. */
const CLUSTER_PX = 26;

function quantile(sorted: number[], q: number) {
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

/** "#rrggbb" as "r, g, b" for an rgba() colour. */
function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function heatRamp(id: LayerId, layers: TractLayers | null, palette: PaletteTheme, style: HeatStyle): ExpressionSpecification {
  if (style === "classic") {
    // The earlier ramp: fixed score stops, so every tract is tinted by its score.
    return [
      "interpolate", ["linear"], ["get", id],
      0, `rgba(${rgb(palette.heat.mid)}, 0.1)`,
      0.5, `rgba(${rgb(palette.heat.mid)}, 0.45)`,
      1, `rgba(${rgb(palette.heat.hot)}, 0.75)`,
    ];
  }
  const values = Object.values(layers ?? {}).map((t) => t[id]);
  // Before any scores arrive there is nothing to rank, so nothing is painted.
  const sorted = (values.length ? values : [0, 1]).sort((a, b) => a - b);
  // Step stops must strictly rise, and a bunched layer repeats values.
  const breaks: number[] = [];
  for (const q of CLASS_PERCENTILES) {
    const v = quantile(sorted, q);
    breaks.push(breaks.length && v <= breaks[breaks.length - 1] ? breaks[breaks.length - 1] + 1e-6 : v);
  }
  return [
    "step", ["get", id], "rgba(0, 0, 0, 0)",
    breaks[0], palette.ramp[0],
    breaks[1], palette.ramp[1],
    breaks[2], palette.ramp[2],
    breaks[3], palette.ramp[3],
  ];
}

/** CARTO's basemaps: light in day mode, and the matching dark one at night, so the tract colours stay in front. */
const LIGHT_BASEMAP = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DARK_BASEMAP = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** The value a hovered tract shows, labelled the way its tab's ranking labels it. */
const TRACT_VALUE: Record<LayerId, { label: string; format: (value: number) => string }> = {
  fit: { label: "Audience fit", format: (value) => `top ${Math.max((1 - value) * 100, 0.1).toFixed(1)}%` },
  competition: { label: "Competition", format: (value) => value.toFixed(2) },
  gap: { label: "Gap", format: (value) => value.toFixed(2) },
};

function boundsOf(sites: Placement[]): [[number, number], [number, number]] {
  const lngs = sites.map((p) => p.longitude);
  const lats = sites.map((p) => p.latitude);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}

/** Several placements that overlap at this zoom; clicking it zooms to fit them. */
function ClusterMarker({ sites }: { sites: Placement[] }) {
  const { current } = useMap();
  const longitude = sites.reduce((sum, p) => sum + p.longitude, 0) / sites.length;
  const latitude = sites.reduce((sum, p) => sum + p.latitude, 0) / sites.length;
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center" style={{ zIndex: 1 }}>
      <button
        type="button"
        aria-label={`${sites.length} placements close together, zoom in`}
        onClick={() => current?.fitBounds(boundsOf(sites), { padding: 80, maxZoom: 17, duration: 600 })}
        className="size-8 cursor-pointer rounded-full border-2 border-white bg-accent shadow-sm ring-4 ring-accent/30 outline-none focus-visible:ring-ring/50"
      />
    </Marker>
  );
}

function HoverPopup({ longitude, latitude, offset, children }: { longitude: number; latitude: number; offset: number; children: ReactNode }) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      offset={offset}
      closeButton={false}
      closeOnClick={false}
      maxWidth="220px"
      className="pointer-events-none"
      // Markers carry z-index 1 to 4, and the popup shares their container.
      style={{ zIndex: 5 }}
    >
      {children}
    </Popup>
  );
}

export function TractMap({
  shapes,
  layers,
  layer,
  campaigns,
  competitors,
  placements,
  focus,
  campaignFocus,
}: {
  shapes: TractShapes;
  layers: TractLayers | null;
  layer: LayerId;
  campaigns: Campaign[];
  competitors: Competitor[];
  placements: Placement[] | null;
  focus: MapFocus;
  campaignFocus: MapFocus;
}) {
  const { palette, heat, dark } = useSettings();
  const heatStyle = layerHeatStyle(layer, heat);
  const map = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(10.2);

  // When a run's placements first arrive the map frames them, so they are in
  // view without panning. The next run frames its own.
  const framed = useRef(false);
  useEffect(() => {
    if (!placements?.length) {
      framed.current = false;
      return;
    }
    if (framed.current || !map.current) return;
    framed.current = true;
    map.current.fitBounds(boundsOf(placements), { padding: 60, maxZoom: 15, duration: 800 });
  }, [placements]);

  // A click on a placement or campaign row brings its marker into view, once.
  // Placements and campaigns get a new array on every run update, so the
  // effects below must remember which click they acted on: otherwise each
  // event of a still-running run pulls the map back to the same item.
  const handledPlacement = useRef<string | null>(null);
  const handledCampaign = useRef<string | null>(null);

  const selected = focus.selected;
  useEffect(() => {
    if (selected?.from !== "list") return;
    const click = `${selected.id}:${selected.at}`;
    if (handledPlacement.current === click) return;
    const p = placements?.find((x) => x.id === selected.id);
    if (!p) return;
    handledPlacement.current = click;
    map.current?.flyTo({ center: [p.longitude, p.latitude], zoom: Math.max(map.current.getZoom(), 14) });
    // On phones the map sits above the scrolling column, so selecting a
    // placement from the list scrolls back up to it.
    map.current?.getContainer().scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selected, placements]);

  const selectedCampaign = campaignFocus.selected;
  useEffect(() => {
    if (selectedCampaign?.from !== "list") return;
    const click = `${selectedCampaign.id}:${selectedCampaign.at}`;
    if (handledCampaign.current === click) return;
    const c = campaigns.find((x, i) => campaignId(x, i) === selectedCampaign.id);
    const location = c && getCampaignLocation(c);
    if (!location) return;
    handledCampaign.current = click;
    map.current?.flyTo({ center: [location.longitude, location.latitude], zoom: Math.max(map.current.getZoom(), 14) });
  }, [selectedCampaign, campaigns]);

  const tracts = useMemo(
    () => ({
      ...shapes,
      features: shapes.features.flatMap((f) => {
        const values = layers?.[f.properties.geoid];
        return values ? [{ ...f, properties: { ...f.properties, ...values } }] : [];
      }),
    }),
    [shapes, layers],
  );

  // Placement markers that would overlap at this zoom merge into one unnumbered
  // marker, because a number on the map always identifies a single placement in
  // the list. The selected one always stays on its own so it is never hidden
  // inside a group.
  const placementGroups = useMemo(() => {
    const points = (placements ?? []).map((placement, i) => ({
      ...worldPixel(placement.longitude, placement.latitude, zoom),
      id: placement.id,
      placement,
      number: i + 1,
    }));
    const pinned = points.filter((pt) => pt.id === focus.selected?.id);
    const rest = points.filter((pt) => pt.id !== focus.selected?.id);
    return [...clusterByDistance(rest, CLUSTER_PX), ...pinned.map((pt) => [pt])];
  }, [placements, zoom, focus.selected?.id]);

  const websitesByCompetitor: Record<string, string | null> = Object.fromEntries(competitors.map((c) => [c.name, c.website]));
  const campaignMarkers = campaigns.flatMap((campaign, i) => {
    const location = getCampaignLocation(campaign);
    return location ? [{ campaign, location, id: campaignId(campaign, i) }] : [];
  });
  const audienceOnly = recommendationLayer(campaigns) === "fit";
  const showTracts = layer !== "competition" || campaigns.some((campaign) => campaignCompetitionWeight(campaign) > 0);
  const [hoveredTract, setHoveredTract] = useState<{ geoid: string; value: number; longitude: number; latitude: number } | null>(null);
  // Separate from campaignFocus.hovered, which a sidebar row also sets: the row already names its app.
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const hoveredMarker = layer !== "fit" ? campaignMarkers.find((m) => m.id === hoveredMarkerId) : undefined;
  const hoverMarker = (id: string | null) => {
    setHoveredMarkerId(id);
    campaignFocus.hover(id);
  };

  return (
    <Map
      ref={map}
      initialViewState={{ longitude: -73.94, latitude: 40.71, zoom: 10.2 }}
      minZoom={9}
      maxBounds={[-74.6, 40.35, -73.4, 41.1]}
      mapStyle={dark ? DARK_BASEMAP : LIGHT_BASEMAP}
      // Diffing the two basemaps would fade their colours over MapLibre's default 300ms.
      styleDiffing={false}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onMove={(event) => setZoom(Math.round(event.viewState.zoom * 20) / 20)}
      onMouseMove={(event) => {
        // Mouse moves can arrive before the style has loaded and the layer has been added.
        const geoid = showTracts && map.current?.getLayer("tract-fill")
          ? (map.current.queryRenderedFeatures(event.point, { layers: ["tract-fill"] })[0]?.properties?.geoid as string | undefined)
          : undefined;
        const value = geoid ? layers?.[geoid]?.[layer] : undefined;
        setHoveredTract(
          geoid && value !== undefined
            ? { geoid, value, longitude: event.lngLat.lng, latitude: event.lngLat.lat }
            : null,
        );
      }}
      onMouseLeave={() => setHoveredTract(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Source id="tracts" type="geojson" data={tracts}>
        <Layer id="tract-fill" type="fill" paint={{ "fill-color": heatRamp(layer, layers, paletteTheme(palette, dark), heatStyle), "fill-opacity": showTracts ? (heatStyle === "classic" ? 1 : CLASS_OPACITY) : 0 }} />
        <Layer id="tract-line" type="line" paint={{ "line-color": "#ffffff", "line-width": 0.5, "line-opacity": showTracts ? 1 : 0 }} />
      </Source>
      {layer !== "fit" &&
        campaignMarkers.map(({ campaign, location, id }) => {
          const active = campaignFocus.hovered === id || campaignFocus.selected?.id === id;
          const counted = campaignAffectsHeatmap(campaign);
          return (
            <Marker key={id} longitude={location.longitude} latitude={location.latitude} anchor="center" style={{ zIndex: active ? 4 : 3 }}>
              <button
                type="button"
                aria-label={`Campaign: ${campaign.competitor}, ${campaign.title}. ${LOCATION_PRECISION_LABELS[location.precision]}`}
                onMouseEnter={() => hoverMarker(id)}
                onMouseLeave={() => hoverMarker(null)}
                onFocus={() => hoverMarker(id)}
                onBlur={() => hoverMarker(null)}
                onClick={() => campaignFocus.select(id, "map")}
                className={
                  "flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-foreground shadow-sm transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
                  (counted ? "" : "border-dashed ") +
                  (active ? "scale-125 " : "") +
                  // The background runs under the border, so a foreground fill would hide the dashes.
                  (active && counted ? "bg-foreground" : "bg-background/95")
                }
              >
                <CompetitorLogo
                  name={campaign.competitor}
                  website={websitesByCompetitor[campaign.competitor] ?? null}
                  className="size-full rounded-full border-0 bg-transparent"
                />
              </button>
            </Marker>
          );
        })}
      {/* With a Gap tab, the Customers layer keeps placement numbers separate from audience traits. */}
      {(layer !== "fit" || audienceOnly) &&
        placementGroups.map((group) => {
          if (group.length > 1) {
            return <ClusterMarker key={`cluster-${group.map((m) => m.id).join("|")}`} sites={group.map((m) => m.placement)} />;
          }
          const { placement: p, number } = group[0];
          const selected = focus.selected?.id === p.id;
          const hovered = focus.hovered === p.id;
          return (
            <Marker key={p.id} longitude={p.longitude} latitude={p.latitude} anchor="center" style={{ zIndex: selected ? 3 : hovered ? 2 : 1 }}>
              <button
                type="button"
                aria-label={`Placement ${number}: ${p.address}`}
                onMouseEnter={() => focus.hover(p.id)}
                onMouseLeave={() => focus.hover(null)}
                onFocus={() => focus.hover(p.id)}
                onBlur={() => focus.hover(null)}
                onClick={() => focus.select(p.id, "map")}
                className={
                  "flex cursor-pointer items-center justify-center rounded-full border-2 border-white font-mono font-bold tabular-nums text-accent-foreground shadow-sm transition-[width,height,background-color] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
                  (selected ? "size-[30px] bg-accent-dark text-sm" : "size-6 text-xs " + (hovered ? "bg-accent-dark" : "bg-accent"))
                }
              >
                {number}
              </button>
            </Marker>
          );
        })}
      {hoveredMarker && (
        <HoverPopup longitude={hoveredMarker.location.longitude} latitude={hoveredMarker.location.latitude} offset={20}>
          <p className="font-sans text-xs leading-tight font-medium text-foreground">{hoveredMarker.campaign.competitor}</p>
        </HoverPopup>
      )}
      {showTracts && hoveredTract && !hoveredMarker && (
        <HoverPopup longitude={hoveredTract.longitude} latitude={hoveredTract.latitude} offset={12}>
          <div className="font-sans text-xs leading-tight text-foreground">
            <p className="font-medium">{tractName(hoveredTract.geoid)}</p>
            <p className="text-[10px] text-ink-3">{tractCode(hoveredTract.geoid)}</p>
            <p className="mt-0.5 text-muted-foreground">
              {TRACT_VALUE[layer].label}{" "}
              <span className="font-mono tabular-nums text-foreground">{TRACT_VALUE[layer].format(hoveredTract.value)}</span>
            </p>
          </div>
        </HoverPopup>
      )}
    </Map>
  );
}

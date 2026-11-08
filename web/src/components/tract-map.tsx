"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";

import { CompetitorLogo } from "@/components/competitor-logo";
import { campaignId } from "@/components/use-audience-run";
import type { MapFocus } from "@/components/use-map-focus";

import type { Campaign, Competitor, Placement } from "@/lib/contract";
import { campaignAffectsHeatmap, getCampaignLocation, LOCATION_PRECISION_LABELS } from "@/lib/campaign-location";
import { recommendationLayer, type LayerId, type TractLayers, type TractShapes } from "@/lib/gap";

// MapLibre looks for its worker next to its own module, where the bundler
// leaves nothing. This hands the bundler the worker file to emit and serve.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// MapLibre paints with plain colour values, not CSS variables, so these
// repeat --heat-cool, --heat-mid and --heat-hot from globals.css, with the
// alpha rising from 0.15 to 0.75 so weak tracts let the basemap show through.
function heatRamp(id: LayerId): ExpressionSpecification {
  return [
    "interpolate", ["linear"], ["get", id],
    0, "rgba(43, 89, 195, 0.15)",
    0.5, "rgba(242, 177, 52, 0.45)",
    1, "rgba(224, 51, 79, 0.75)",
  ];
}

/** CARTO's light basemap: streets and water in greys, so the tract colours carry the map. */
const BASEMAP = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

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
  const map = useRef<MapRef>(null);

  // A click on a placement or campaign row brings its marker into view.
  const selected = focus.selected;
  useEffect(() => {
    if (selected?.from !== "list") return;
    const p = placements?.find((x) => x.id === selected.id);
    if (p) map.current?.flyTo({ center: [p.longitude, p.latitude], zoom: Math.max(map.current.getZoom(), 14) });
  }, [selected, placements]);
  const selectedCampaign = campaignFocus.selected;
  useEffect(() => {
    if (selectedCampaign?.from !== "list") return;
    const c = campaigns.find((x, i) => campaignId(x, i) === selectedCampaign.id);
    const location = c && getCampaignLocation(c);
    if (location) map.current?.flyTo({ center: [location.longitude, location.latitude], zoom: Math.max(map.current.getZoom(), 14) });
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

  const websitesByCompetitor: Record<string, string | null> = Object.fromEntries(competitors.map((c) => [c.name, c.website]));
  const campaignMarkers = campaigns.flatMap((campaign, i) => {
    const location = getCampaignLocation(campaign);
    return location ? [{ campaign, location, id: campaignId(campaign, i) }] : [];
  });
  const audienceOnly = recommendationLayer(campaigns) === "fit";
  const paintLayer = layer === "gap" && audienceOnly ? "fit" : layer;
  const showTracts = layer !== "competition" || !audienceOnly;

  return (
    <Map
      ref={map}
      initialViewState={{ longitude: -73.94, latitude: 40.71, zoom: 10.2 }}
      minZoom={9}
      maxBounds={[-74.6, 40.35, -73.4, 41.1]}
      mapStyle={BASEMAP}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Source id="tracts" type="geojson" data={tracts}>
        <Layer id="tract-fill" type="fill" paint={{ "fill-color": heatRamp(paintLayer), "fill-opacity": showTracts ? 1 : 0 }} />
        <Layer id="tract-line" type="line" paint={{ "line-color": "#ffffff", "line-width": 0.3, "line-opacity": showTracts ? 0.6 : 0 }} />
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
                onMouseEnter={() => campaignFocus.hover(id)}
                onMouseLeave={() => campaignFocus.hover(null)}
                onFocus={() => campaignFocus.hover(id)}
                onBlur={() => campaignFocus.hover(null)}
                onClick={() => campaignFocus.select(id, "map")}
                className={
                  "flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-foreground shadow-sm transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
                  (counted ? "" : "border-dashed ") +
                  // A solid fill would hide the dashed border, so those markers only tint.
                  (active ? "scale-125 " + (counted ? "bg-foreground" : "bg-foreground/25") : "bg-background/95")
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
      {/* The recommendations tab keeps placement numbers separate from audience traits. */}
      {layer !== "fit" &&
        placements?.map((p, i) => {
          const active = focus.hovered === p.id || focus.selected?.id === p.id;
          return (
            <Marker key={p.id} longitude={p.longitude} latitude={p.latitude} anchor="center" style={{ zIndex: active ? 2 : 1 }}>
              <button
                type="button"
                aria-label={`Placement ${i + 1}: ${p.address}`}
                onMouseEnter={() => focus.hover(p.id)}
                onMouseLeave={() => focus.hover(null)}
                onFocus={() => focus.hover(p.id)}
                onBlur={() => focus.hover(null)}
                onClick={() => focus.select(p.id, "map")}
                className={
                  "flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-foreground font-mono text-[11px] font-semibold tabular-nums shadow-sm transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
                  (active ? "scale-125 bg-foreground text-background" : "bg-background text-foreground")
                }
              >
                {i + 1}
              </button>
            </Marker>
          );
        })}
    </Map>
  );
}

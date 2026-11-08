"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Popup, Source, type MapRef } from "react-map-gl/maplibre";

import { CompetitorLogo } from "@/components/competitor-logo";
import { campaignId } from "@/components/use-audience-run";
import type { MapFocus } from "@/components/use-map-focus";

import type { Campaign, Competitor, Placement } from "@/lib/contract";
import { campaignAffectsHeatmap, getCampaignLocation, LOCATION_PRECISION_LABELS } from "@/lib/campaign-location";
import { recommendationLayer, type LayerId, type TractLayers, type TractShapes } from "@/lib/gap";
import { tractLabel } from "@/lib/tracts";

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

/** The value a hovered tract shows, labelled the way its tab's ranking labels it. */
const TRACT_VALUE: Record<LayerId, { label: string; format: (value: number) => string }> = {
  fit: { label: "Audience fit", format: (value) => `top ${Math.max((1 - value) * 100, 0.1).toFixed(1)}%` },
  competition: { label: "Competition", format: (value) => value.toFixed(2) },
  gap: { label: "Gap", format: (value) => value.toFixed(2) },
};

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
  const showTracts = layer !== "competition" || !audienceOnly;
  const [hoveredTract, setHoveredTract] = useState<{ geoid: string; value: number; longitude: number; latitude: number } | null>(null);

  return (
    <Map
      ref={map}
      initialViewState={{ longitude: -73.94, latitude: 40.71, zoom: 10.2 }}
      minZoom={9}
      maxBounds={[-74.6, 40.35, -73.4, 41.1]}
      mapStyle={BASEMAP}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      onMouseMove={(event) => {
        const geoid = showTracts
          ? (map.current?.queryRenderedFeatures(event.point, { layers: ["tract-fill"] })[0]?.properties?.geoid as string | undefined)
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
        <Layer id="tract-fill" type="fill" paint={{ "fill-color": heatRamp(layer), "fill-opacity": showTracts ? 1 : 0 }} />
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
      {/* With a Gap tab, the Customers layer keeps placement numbers separate from audience traits. */}
      {(layer !== "fit" || audienceOnly) &&
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
      {showTracts && hoveredTract && (
        <Popup
          longitude={hoveredTract.longitude}
          latitude={hoveredTract.latitude}
          offset={12}
          closeButton={false}
          closeOnClick={false}
          maxWidth="220px"
          className="pointer-events-none"
        >
          <div className="font-sans text-xs leading-tight text-foreground">
            <p className="font-medium">{tractLabel(hoveredTract.geoid)}</p>
            <p className="mt-0.5 text-muted-foreground">
              {TRACT_VALUE[layer].label}{" "}
              <span className="font-mono tabular-nums text-foreground">{TRACT_VALUE[layer].format(hoveredTract.value)}</span>
            </p>
          </div>
        </Popup>
      )}
    </Map>
  );
}

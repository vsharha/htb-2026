"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";

import type { PlacementFocus } from "@/components/use-placement-focus";

import type { Campaign, Placement } from "@/lib/contract";
import type { LayerId, TractLayers, TractShapes } from "@/lib/gap";

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
const INK = "#15171c";

/** CARTO's light basemap: streets and water in greys, so the tract colours carry the map. */
const BASEMAP = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function TractMap({
  shapes,
  layers,
  layer,
  campaigns,
  placements,
  focus,
}: {
  shapes: TractShapes;
  layers: TractLayers | null;
  layer: LayerId;
  campaigns: Campaign[];
  placements: Placement[] | null;
  focus: PlacementFocus;
}) {
  const map = useRef<MapRef>(null);

  // A click on a placement row brings its marker into view.
  const selected = focus.selected;
  useEffect(() => {
    if (selected?.from !== "list") return;
    const p = placements?.find((x) => x.id === selected.id);
    if (p) map.current?.flyTo({ center: [p.longitude, p.latitude], zoom: Math.max(map.current.getZoom(), 14) });
  }, [selected, placements]);

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

  const stations = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: campaigns.flatMap((c) =>
        c.station && c.coverage === "current"
          ? [{
              type: "Feature" as const,
              properties: { name: c.station.name },
              geometry: { type: "Point" as const, coordinates: [c.station.longitude, c.station.latitude] },
            }]
          : [],
      ),
    }),
    [campaigns],
  );

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
        <Layer id="tract-fill" type="fill" paint={{ "fill-color": heatRamp(layer) }} />
        <Layer id="tract-line" type="line" paint={{ "line-color": "#ffffff", "line-width": 0.3, "line-opacity": 0.6 }} />
      </Source>
      <Source id="stations" type="geojson" data={stations}>
        <Layer
          id="station-ring"
          type="circle"
          layout={{ visibility: layer === "fit" ? "none" : "visible" }}
          paint={{ "circle-radius": 7, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": INK, "circle-stroke-width": 2 }}
        />
      </Source>
      {/* Placements come from the gap, so the customers view leaves them out. */}
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

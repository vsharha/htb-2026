"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { setWorkerUrl } from "maplibre-gl";
import { useMemo } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl/maplibre";

import type { Campaign, Placement } from "@/lib/contract";
import type { LayerId, TractLayers, TractShapes } from "@/lib/gap";

// MapLibre looks for its worker next to its own module, where the bundler
// leaves nothing. This hands the bundler the worker file to emit and serve.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// MapLibre paints with plain colour values, not CSS variables, so these
// repeat --heat-cool, --heat-mid and --heat-hot from globals.css.
const HEAT = { cool: "#2b59c3", mid: "#f2b134", hot: "#e0334f" };
const INK = "#15171c";

/** CARTO's light basemap: streets and water in greys, so the tract colours carry the map. */
const BASEMAP = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function TractMap({
  shapes,
  layers,
  layer,
  campaigns,
  placements,
}: {
  shapes: TractShapes;
  layers: TractLayers | null;
  layer: LayerId;
  campaigns: Campaign[];
  placements: Placement[] | null;
}) {
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
        c.station
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

  const pins = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: (placements ?? []).map((p) => ({
        type: "Feature" as const,
        properties: { id: p.id },
        geometry: { type: "Point" as const, coordinates: [p.longitude, p.latitude] },
      })),
    }),
    [placements],
  );

  return (
    <Map
      initialViewState={{ longitude: -73.94, latitude: 40.71, zoom: 10.2 }}
      minZoom={9}
      maxBounds={[-74.6, 40.35, -73.4, 41.1]}
      mapStyle={BASEMAP}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Source id="tracts" type="geojson" data={tracts}>
        <Layer
          id="tract-fill"
          type="fill"
          paint={{
            "fill-color": ["interpolate", ["linear"], ["get", layer], 0, HEAT.cool, 0.5, HEAT.mid, 1, HEAT.hot],
            "fill-opacity": ["interpolate", ["linear"], ["get", layer], 0, 0.15, 1, 0.75],
          }}
        />
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
      <Source id="placements" type="geojson" data={pins}>
        <Layer
          id="placement-dot"
          type="circle"
          paint={{ "circle-radius": 4, "circle-color": INK, "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.5 }}
        />
      </Source>
    </Map>
  );
}

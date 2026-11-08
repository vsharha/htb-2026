"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Popup, Source, type MapRef } from "react-map-gl/maplibre";

import type { PlacementFocus } from "@/components/use-placement-focus";

import type { Campaign, Placement } from "@/lib/contract";
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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

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

  const campaignMarkers = campaigns.flatMap((campaign, i) => {
    const location = getCampaignLocation(campaign);
    return location ? [{ campaign, location, id: i }] : [];
  });
  const popupCampaign = selectedCampaign && campaigns.includes(selectedCampaign) ? selectedCampaign : null;
  const popupLocation = popupCampaign && getCampaignLocation(popupCampaign);
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
      {layer !== "fit" && campaignMarkers.map(({ campaign, location, id }) => (
        <Marker key={id} longitude={location.longitude} latitude={location.latitude} anchor="center" style={{ zIndex: selectedCampaign === campaign ? 5 : 3 }}>
          <button
            type="button"
            aria-label={`Campaign: ${campaign.competitor}, ${campaign.title}. ${LOCATION_PRECISION_LABELS[location.precision]}`}
            onClick={() => {
              map.current?.easeTo({ center: [location.longitude, location.latitude], duration: 250 });
              setSelectedCampaign(campaign);
            }}
            className={"flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-background/95 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " + (campaignAffectsHeatmap(campaign) ? "" : "border-dashed")}
          >
            {campaignAffectsHeatmap(campaign) && <span className="size-2 rounded-full bg-foreground" />}
          </button>
        </Marker>
      ))}
      {layer !== "fit" && popupCampaign && popupLocation && (
        <Popup longitude={popupLocation.longitude} latitude={popupLocation.latitude} offset={16} maxWidth="280px" closeOnClick={false} onClose={() => setSelectedCampaign(null)}>
          <div className="flex max-h-[calc(27.5dvh-4rem)] flex-col gap-1.5 overflow-y-auto p-1 font-sans text-sm text-foreground lg:max-h-[calc(50dvh-4rem)]">
            <strong>{popupCampaign.competitor}: {popupCampaign.title}</strong>
            <span>{popupLocation.label}</span>
            <span className="text-xs text-muted-foreground">{LOCATION_PRECISION_LABELS[popupLocation.precision]}</span>
            <span className="text-xs text-muted-foreground">{popupCampaign.coverage === "current" ? "Confirmed current dates" : popupCampaign.coverage === "historical" ? "Historical campaign" : "Campaign dates unknown"}</span>
            <a href={popupCampaign.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">Read campaign source</a>
            <span className="text-[10px] text-muted-foreground">{popupLocation.attribution}</span>
          </div>
        </Popup>
      )}
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

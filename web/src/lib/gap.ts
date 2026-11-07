// Combines audience fit with the competitor campaigns into the three map
// layers. Runs in the browser, because it needs only the tract shapes the
// map already loads and the results of the two server calls.

import type { AudienceFit, Campaign } from "@/lib/contract";
import { campaignAffectsHeatmap, getCampaignLocation } from "@/lib/campaign-location";

type Position = [number, number];

export type TractShapes = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { geoid: string; borough: string };
    geometry:
      | { type: "Polygon"; coordinates: Position[][] }
      | { type: "MultiPolygon"; coordinates: Position[][][] };
  }[];
};

export type LayerId = "gap" | "fit" | "competition";

/** Per tract, each layer's value from 0 to 1. */
export type TractLayers = Record<string, Record<LayerId, number>>;

/** A campaign's reach falls to about a third at this distance from its matched location. */
const CAMPAIGN_REACH_KM = 1;

/** Mean of the outer ring's vertices; close enough to the centre for tract-sized shapes. */
function centre(geometry: TractShapes["features"][number]["geometry"]): Position {
  const ring = geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates[0][0];
  let x = 0;
  let y = 0;
  for (const [lng, lat] of ring) {
    x += lng;
    y += lat;
  }
  return [x / ring.length, y / ring.length];
}

function distanceKm([lng1, lat1]: Position, [lng2, lat2]: Position) {
  const kmPerDegLat = 111.2;
  const kmPerDegLng = kmPerDegLat * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return Math.hypot((lng1 - lng2) * kmPerDegLng, (lat1 - lat2) * kmPerDegLat);
}

export function computeLayers(
  shapes: TractShapes,
  fit: AudienceFit,
  campaigns: Campaign[],
): TractLayers {
  const locations: Position[] = campaigns.flatMap((campaign) => {
    const location = getCampaignLocation(campaign);
    return campaignAffectsHeatmap(campaign) && location ? [[location.longitude, location.latitude] as Position] : [];
  });
  const layers: TractLayers = {};
  for (const feature of shapes.features) {
    const { geoid } = feature.properties;
    const audience = fit.scores[geoid];
    if (audience === undefined) continue;
    const here = centre(feature.geometry);
    let competition = 0;
    for (const s of locations) {
      const d = distanceKm(here, s) / CAMPAIGN_REACH_KM;
      competition = Math.max(competition, Math.exp(-d * d));
    }
    layers[geoid] = {
      fit: audience,
      competition,
      gap: audience * (1 - competition),
    };
  }
  return layers;
}

export function strongest(layers: TractLayers, layer: LayerId, n: number) {
  return Object.entries(layers)
    .sort((a, b) => b[1][layer] - a[1][layer])
    .slice(0, n)
    .map(([geoid]) => geoid);
}

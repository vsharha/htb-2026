import type { Campaign, CampaignLocation } from "@/lib/contract";

export const LOCATION_PRECISION_LABELS = {
  station: "Station match",
  address: "Address match",
  area: "Approximate location",
} as const;

export function getCampaignLocation(campaign: Campaign): CampaignLocation | null {
  if (campaign.mapLocation) return campaign.mapLocation;
  if (!campaign.station) return null;
  return {
    latitude: campaign.station.latitude,
    longitude: campaign.station.longitude,
    label: campaign.station.name,
    precision: "station",
    source: "station",
    attribution: "MTA subway station data",
  };
}

export function campaignAffectsHeatmap(campaign: Campaign) {
  const location = getCampaignLocation(campaign);
  return campaign.coverage === "current" && location !== null && location.precision !== "area";
}

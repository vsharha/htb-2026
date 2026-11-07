import type { Placement, PlacementQuery } from "./contract";

const MIN_DISTANCE_METRES = 500;
const MAX_PLACEMENTS = 12;

function distanceMetres(a: Placement, b: Placement) {
  const radians = Math.PI / 180;
  const latitude = (b.latitude - a.latitude) * radians;
  const longitude = (b.longitude - a.longitude) * radians;
  const haversine = Math.sin(latitude / 2) ** 2 +
    Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(longitude / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

/** Keeps tract rank first, choosing at most one site per tract and spacing sites apart. */
export function selectPlacements(placements: Placement[], query: PlacementQuery): Placement[] {
  const rank = new Map(query.geoids.map((geoid, i) => [geoid, i]));
  // The stand-in minimum spend excludes bus shelters below $2,000 a month.
  const candidates = placements
    .filter((p) => rank.has(p.geoid) && p.carriesAds !== "no" &&
      (query.monthlyBudget >= 2000 || p.kind === "linknyc"))
    .sort((a, b) => rank.get(a.geoid)! - rank.get(b.geoid)! ||
      a.costPerAudienceMember - b.costPerAudienceMember);
  const selected: Placement[] = [];
  const tracts = new Set<string>();

  for (const placement of candidates) {
    if (tracts.has(placement.geoid)) continue;
    if (selected.some((other) => distanceMetres(placement, other) < MIN_DISTANCE_METRES)) continue;
    selected.push(placement);
    tracts.add(placement.geoid);
    if (selected.length === MAX_PLACEMENTS) break;
  }
  return selected;
}

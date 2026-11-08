import type { Borough } from "@/lib/contract";
import type { TractShapes } from "@/lib/gap";

const COUNTIES: Record<string, Borough> = {
  "36061": "Manhattan",
  "36047": "Brooklyn",
  "36081": "Queens",
  "36005": "Bronx",
  "36085": "Staten Island",
};

// The shapes the browser loads once carry each tract's neighbourhood. They are
// remembered here so any component can name a tract from its GEOID alone.
const neighborhoods = new Map<string, string>();

export function registerNeighborhoods(shapes: TractShapes) {
  for (const { properties } of shapes.features) {
    if (properties.neighborhood) neighborhoods.set(properties.geoid, properties.neighborhood);
  }
}

/** The city's name for the area a tract is in, such as "Chelsea-Hudson Yards", or its borough if it has none. */
export function tractName(geoid: string) {
  return neighborhoods.get(geoid) ?? COUNTIES[geoid.slice(0, 5)] ?? "New York";
}

/** "Tract 37.6, Bronx" from a GEOID such as 36005037600, for small grey text beside the name. */
export function tractCode(geoid: string) {
  const borough = COUNTIES[geoid.slice(0, 5)] ?? "New York";
  const tract = Number(geoid.slice(5)) / 100;
  return `Tract ${tract}, ${borough}`;
}

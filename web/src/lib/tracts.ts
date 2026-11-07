import type { Borough } from "@/lib/contract";

const COUNTIES: Record<string, Borough> = {
  "36061": "Manhattan",
  "36047": "Brooklyn",
  "36081": "Queens",
  "36005": "Bronx",
  "36085": "Staten Island",
};

/** "Tract 37.6, Bronx" from a GEOID such as 36005037600. */
export function tractLabel(geoid: string) {
  const borough = COUNTIES[geoid.slice(0, 5)] ?? "New York";
  const tract = Number(geoid.slice(5)) / 100;
  return `Tract ${tract}, ${borough}`;
}

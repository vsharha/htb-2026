import type { Borough } from "@/lib/contract";

/** Normalisation shared with `tools/src/tools/sources/streets.py`, which writes the intersection table. */
const WORDS: Record<string, string> = {
  STREET: "ST", AVENUE: "AVE", AV: "AVE", PLACE: "PL", ROAD: "RD", BOULEVARD: "BLVD", DRIVE: "DR",
  SQUARE: "SQ", PARKWAY: "PKWY", LANE: "LN", TERRACE: "TER", COURT: "CT", EXPRESSWAY: "EXPY", HIGHWAY: "HWY",
  WEST: "W", EAST: "E", NORTH: "N", SOUTH: "S",
  FIRST: "1", SECOND: "2", THIRD: "3", FOURTH: "4", FIFTH: "5", SIXTH: "6",
  SEVENTH: "7", EIGHTH: "8", NINTH: "9", TENTH: "10", ELEVENTH: "11", TWELFTH: "12",
};
const ALIASES: Record<string, string> = { "AVE OF THE AMERICAS": "6 AVE" };

export function streetKey(name: string) {
  let tokens = name.toUpperCase().replace(/[^A-Z0-9 ]+/g, " ").split(/\s+/).filter(Boolean)
    .map((token) => token.replace(/^(\d+)(ST|ND|RD|TH)$/, "$1"))
    .map((token) => WORDS[token] ?? token);
  if (tokens.length > 1 && ["W", "E", "N", "S"].includes(tokens[0])) tokens = tokens.slice(1);
  const key = tokens.join(" ");
  return ALIASES[key] ?? key;
}

const NEIGHBOURHOODS: Record<Borough, string[]> = {
  Manhattan: ["manhattan", "soho", "noho", "tribeca", "chelsea", "midtown", "harlem", "greenwich village", "west village", "east village",
    "hell's kitchen", "hells kitchen", "flatiron", "lower east side", "upper east side", "upper west side", "financial district",
    "fidi", "nolita", "chinatown", "murray hill", "gramercy", "union square", "times square", "hudson yards", "kips bay",
    "washington heights", "inwood", "lower manhattan"],
  Brooklyn: ["brooklyn", "williamsburg", "greenpoint", "bushwick", "dumbo", "park slope", "fort greene", "bed-stuy",
    "bedford-stuyvesant", "crown heights", "prospect heights", "red hook", "cobble hill", "boerum hill", "sunset park",
    "bay ridge", "flatbush", "coney island", "clinton hill", "gowanus"],
  Queens: ["queens", "astoria", "long island city", "lic", "flushing", "jamaica", "jackson heights", "ridgewood", "sunnyside",
    "woodside", "forest hills", "elmhurst"],
  Bronx: ["bronx", "fordham", "mott haven", "riverdale", "hunts point"],
  "Staten Island": ["staten island", "st. george", "st george"],
};

const SUFFIX = /\b(street|st|avenue|ave|av|place|pl|road|rd|boulevard|blvd|drive|dr|square|sq|parkway|pkwy|lane|ln|terrace|ter|court|ct)\.?$/i;

/** The same name with a common suffix added, for sources that write "Lafayette" for Lafayette Street. */
export function withSuffixes(key: string) {
  return SUFFIX.test(key) || /^\d+$/.test(key) ? [key] : [key, `${key} ST`, `${key} AVE`];
}

export type ParsedIntersection = {
  /** One or two street pairs; "A between B and C" gives A with B and A with C, placed at their midpoint. */
  pairs: [string, string][];
  borough: Borough | null;
};

/** Reads a street corner such as "SE corner of 54th Street and Broadway, Manhattan"; null for anything else. */
export function parseIntersection(text: string): ParsedIntersection | null {
  const lower = ` ${text.toLowerCase()} `;
  const boroughs = (Object.keys(NEIGHBOURHOODS) as Borough[])
    .filter((borough) => NEIGHBOURHOODS[borough].some((name) => new RegExp(`[^a-z]${name.replace(/[.]/g, "\\.")}[^a-z]`).test(lower)));
  const borough = boroughs.length === 1 ? boroughs[0] : null;
  const place = text.split(/[,;(]/)[0]
    .replace(/^\s*(the\s+)?((north|south)?(east|west)?(ern)?\s+)?(corner|intersection)\s+(of|at)\s+/i, "")
    .trim();
  const between = place.match(/^(.+?)\s+between\s+(.+?)\s+and\s+(.+)$/i);
  let parts = between ? null : place.split(/\s+(?:&|and|at|x)\s+|\s*\/\s*/i);
  // "Lafayette and Prince Streets" shares one plural suffix between both names.
  const shared = parts?.length === 2 ? parts[1].match(/^(.+?)\s+(streets|avenues|sts|aves)$/i) : null;
  if (parts && shared && !SUFFIX.test(parts[0])) {
    const suffix = /^st/i.test(shared[2]) ? "Street" : "Avenue";
    parts = [`${parts[0]} ${suffix}`, `${shared[1]} ${suffix}`];
  }
  const pairs: [string, string][] = between
    ? [[between[1], between[2]], [between[1], between[3]]]
    : parts && parts.length === 2 ? [[parts[0], parts[1]]] : [];
  const keyed = pairs.map(([a, b]) => [streetKey(a), streetKey(b)] as [string, string]).filter(([a, b]) => a && b && a !== b);
  return keyed.length === pairs.length && keyed.length > 0 ? { pairs: keyed, borough } : null;
}

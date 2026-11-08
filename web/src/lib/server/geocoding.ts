import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Borough, CampaignLocation } from "@/lib/contract";
import { parseIntersection, withSuffixes } from "@/lib/street-names";

type GeocodingResult = { location: CampaignLocation | null; note?: string };
const CACHE_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { expires: number; result: GeocodingResult }>();
const NYC_COUNTIES = new Set(["new york", "kings", "queens", "bronx", "richmond"]);
const BOROUGH_NAMES = new Set(["manhattan", "brooklyn", "queens", "bronx", "the bronx", "staten island", "new york", "new york city", "nyc"]);
const NYC_CITIES = new Set(["new york", "new york city", "brooklyn", "queens", "bronx", "the bronx", "staten island"]);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function candidate(value: unknown, query: string) {
  if (!record(value) || !record(value.rank)) return null;
  const { lon, lat, formatted, result_type: type } = value;
  const confidence = value.rank.confidence;
  if (typeof lon !== "number" || typeof lat !== "number" || !Number.isFinite(lon) || !Number.isFinite(lat)
    || lon < -74.26 || lon > -73.7 || lat < 40.477 || lat > 40.917
    || typeof formatted !== "string" || typeof confidence !== "number" || !Number.isFinite(confidence) || confidence < 0.7
    || ["country", "state", "county", "city", "postcode", "unknown"].includes(String(type))) return null;
  const county = typeof value.county === "string" ? normalize(value.county).replace(/ county$/, "") : "";
  const city = typeof value.city === "string" ? normalize(value.city) : "";
  if (value.country_code !== "us" || (value.state_code !== "NY" && value.state !== "New York")
    || (!NYC_COUNTIES.has(county) && !NYC_CITIES.has(city))) return null;
  const text = ` ${normalize(query)} `;
  const addressMatch = type === "building" && typeof value.housenumber === "string" && typeof value.street === "string"
    && text.includes(` ${normalize(value.housenumber)} `) && text.includes(` ${normalize(value.street)} `)
    && typeof value.rank.confidence_street_level === "number" && value.rank.confidence_street_level >= 0.9
    && confidence >= 0.9;
  const attribution = record(value.datasource) && typeof value.datasource.attribution === "string"
    ? value.datasource.attribution : "© OpenStreetMap contributors";
  const location: CampaignLocation = {
    latitude: lat, longitude: lon, label: formatted,
    precision: addressMatch ? "address" : "area",
    source: "geoapify", attribution,
  };
  return { location, confidence };
}

export function selectGeocodingResult(payload: unknown, query: string): GeocodingResult {
  if (!record(payload) || !Array.isArray(payload.results)) return { location: null, note: "Location lookup returned an invalid response." };
  const matches = payload.results.flatMap((value) => {
    const match = candidate(value, query);
    return match ? [match] : [];
  }).sort((a, b) => b.confidence - a.confidence);
  const best = matches[0];
  if (!best) return { location: null, note: "No reliable, specific New York location was found." };
  const next = matches[1];
  if (next && best.confidence - next.confidence < 0.1) {
    const distance = Math.hypot((best.location.longitude - next.location.longitude) * 84, (best.location.latitude - next.location.latitude) * 111);
    if (distance > 0.5) return { location: null, note: "Several New York locations match; a more specific address is needed." };
  }
  return { location: best.location };
}

type Intersection = { borough: Borough; latitude: number; longitude: number };
let intersections: Promise<Map<string, Intersection[]>> | null = null;

/** The prepared table of street intersections, keyed by the two normalised street names in alphabetical order. */
function intersectionTable() {
  intersections ??= readFile(path.join(process.cwd(), "..", "data", "streets", "intersections.csv"), "utf8").then((csv) => {
    const table = new Map<string, Intersection[]>();
    for (const line of csv.trim().split("\n").slice(1)) {
      const [a, b, borough, latitude, longitude] = line.split(",");
      const key = `${a}|${b}`;
      table.set(key, [...(table.get(key) ?? []), { borough: borough as Borough, latitude: Number(latitude), longitude: Number(longitude) }]);
    }
    return table;
  });
  return intersections;
}

/**
 * Geoapify's free-text search does not understand street corners: for "41st Street & 7th Avenue" it confidently
 * returns Madison Avenue & 41st Street. Corners are therefore placed only from the city's own street centerline.
 */
export async function locateIntersection(query: string): Promise<GeocodingResult | null> {
  const parsed = parseIntersection(query);
  if (!parsed) return null;
  const table = await intersectionTable();
  const points: Intersection[] = [];
  for (const [a, b] of parsed.pairs) {
    const keys = withSuffixes(a).flatMap((x) => withSuffixes(b).map((y) => [x, y].sort().join("|")));
    const matches = (table.get(keys.find((key) => table.has(key)) ?? "") ?? []).filter((point) => !parsed.borough || point.borough === parsed.borough);
    if (matches.length === 0) return { location: null, note: `No New York intersection of ${a} and ${b} was found.` };
    if (matches.length > 1) return { location: null, note: `${a} and ${b} meet in more than one place; the source does not say which borough.` };
    points.push(matches[0]);
  }
  const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
  const label = parsed.pairs.length === 1 ? `${parsed.pairs[0][0]} & ${parsed.pairs[0][1]}, ${points[0].borough}` : `${parsed.pairs[0][0]} between ${parsed.pairs[0][1]} and ${parsed.pairs[1][1]}, ${points[0].borough}`;
  return { location: { latitude, longitude, label, precision: "address", source: "street-centerline", attribution: "NYC Street Centerline (CSCL), NYC Open Data" } };
}

export async function geocodeCampaignLocation(query: string, signal?: AbortSignal): Promise<GeocodingResult> {
  const key = normalize(query);
  if (!key || query.length > 500) return { location: null, note: "No specific campaign location was provided." };
  if (["new york", "new york city", "nyc", "new york ny", "new york new york"].includes(key)) {
    return { location: null, note: "The source names only the city, not a specific campaign location." };
  }
  if (query.split(",").every((part) => BOROUGH_NAMES.has(normalize(part)) || ["ny", "usa", "us", "united states", "united states of america"].includes(normalize(part)))) {
    return { location: null, note: "The source names only a borough, not a specific campaign location." };
  }
  const corner = await locateIntersection(query);
  if (corner) return corner;
  signal?.throwIfAborted();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.result;
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return { location: null, note: "Location lookup is unavailable: GEOAPIFY_API_KEY is not configured." };
  // Geoapify can miss a place followed by its borough ("Times Square, Manhattan") that it finds on its own.
  const head = query.split(",")[0].trim();
  const texts = head !== query.trim() && !BOROUGH_NAMES.has(normalize(head)) ? [query, head] : [query];
  try {
    let result: GeocodingResult = { location: null, note: "No reliable, specific New York location was found." };
    for (const text of texts) {
      const url = new URL("https://api.geoapify.com/v1/geocode/search");
      url.search = new URLSearchParams({
        text: `${text}, New York City, NY`,
        filter: "rect:-74.26,40.477,-73.7,40.917|countrycode:us",
        bias: "proximity:-73.985,40.758", format: "json", limit: "3", lang: "en", apiKey,
      }).toString();
      const response = await fetch(url, {
        signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(8000)]),
        cache: "no-store",
      });
      if (!response.ok) return {
        location: null,
        note: response.status === 401 || response.status === 403 ? "The geocoding service rejected its API key." : "Location lookup is temporarily unavailable.",
      };
      result = selectGeocodingResult(await response.json(), text);
      if (result.location) break;
    }
    if (result.location) {
      if (cache.size >= 500) cache.delete(cache.keys().next().value ?? "");
      cache.set(key, { expires: Date.now() + CACHE_MS, result });
    }
    return result;
  } catch {
    signal?.throwIfAborted();
    return { location: null, note: "Location lookup could not finish. The campaign evidence is kept." };
  }
}

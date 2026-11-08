import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { campaignAffectsHeatmap, getCampaignLocation } from "../src/lib/campaign-location.ts";

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  if (specifier.startsWith("@/")) return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  return nextResolve(specifier, context);
} });
const { geocodeCampaignLocation, locateIntersection, selectGeocodingResult } = await import("../src/lib/server/geocoding.ts");
const { parseIntersection, streetKey } = await import("../src/lib/street-names.ts");

const timesSquare = {
  lon: -73.9851, lat: 40.758, name: "Times Square", formatted: "Times Square, Manhattan, New York, United States",
  city: "New York", county: "New York County", state_code: "NY", country_code: "us",
  result_type: "amenity", rank: { confidence: 1 }, datasource: { attribution: "© OpenStreetMap contributors" },
};
const payload = (...results) => ({ results });

test("a Times Square landmark becomes an approximate marker without an invented address", () => {
  const { location } = selectGeocodingResult(payload(timesSquare), "Times Square");
  assert.equal(location.precision, "area");
  assert.equal(location.longitude, timesSquare.lon);
  assert.equal(location.source, "geoapify");
  assert.equal(location.attribution, timesSquare.datasource.attribution);
});

test("address precision requires a matching house number and street in the query", () => {
  const address = { ...timesSquare, result_type: "building", housenumber: "620", street: "8th Avenue", rank: { confidence: 1, confidence_street_level: 1 } };
  assert.equal(selectGeocodingResult(payload(address), "620 8th Avenue").location.precision, "address");
  assert.equal(selectGeocodingResult(payload(address), "Times Square").location.precision, "area");
});

test("citywide, weak, invalid and outside-city results stay unmapped", () => {
  for (const result of [
    { ...timesSquare, result_type: "city" },
    { ...timesSquare, rank: { confidence: 0.4 } },
    { ...timesSquare, lon: -0.12, lat: 51.5 },
    { ...timesSquare, lon: NaN },
    { ...timesSquare, state_code: "NJ", city: "Jersey City", county: "Hudson County" },
    { ...timesSquare, city: "Hempstead", county: "Nassau County" },
  ]) assert.equal(selectGeocodingResult(payload(result), "Times Square").location, null);
  assert.equal(selectGeocodingResult({}, "Times Square").location, null);
});

test("equally likely locations far apart require a more specific address", () => {
  const other = { ...timesSquare, lon: -73.95, lat: 40.7 };
  const result = selectGeocodingResult(payload(timesSquare, other), "Broadway");
  assert.equal(result.location, null);
  assert.match(result.note, /Several/);
});

test("marker visibility is independent of dates and heatmap eligibility", () => {
  const location = selectGeocodingResult(payload(timesSquare), "Times Square").location;
  const campaign = { station: null, mapLocation: location, coverage: "unknown" };
  assert.equal(getCampaignLocation(campaign), location);
  assert.equal(campaignAffectsHeatmap(campaign), false);
  assert.equal(campaignAffectsHeatmap({ ...campaign, coverage: "current" }), false);
  assert.equal(campaignAffectsHeatmap({ ...campaign, coverage: "current", mapLocation: { ...location, precision: "address" } }), true);
  assert.equal(campaignAffectsHeatmap({ ...campaign, coverage: "recent", mapLocation: { ...location, precision: "address" } }), true);
  assert.equal(campaignAffectsHeatmap({ ...campaign, coverage: "recent" }), false);
  assert.equal(campaignAffectsHeatmap({ ...campaign, coverage: "historical", mapLocation: { ...location, precision: "address" } }), false);
});

test("old station-only recordings still have a marker", () => {
  const campaign = { station: { name: "Grand Central", latitude: 40.75, longitude: -73.98 }, coverage: "unknown" };
  assert.equal(getCampaignLocation(campaign).precision, "station");
  assert.equal(campaignAffectsHeatmap(campaign), false);
});

test("citywide campaign descriptions do not make a location request", async () => {
  const result = await geocodeCampaignLocation("New York City");
  assert.equal(result.location, null);
  assert.match(result.note, /only the city/);
});

test("server lookup restricts NYC results and caches successful repeated queries", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "test-placeholder";
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    assert.equal(url.hostname, "api.geoapify.com");
    assert.match(url.searchParams.get("filter"), /rect:.*countrycode:us/);
    assert.match(url.searchParams.get("text"), /New York City/);
    return Response.json(payload(timesSquare));
  };
  try {
    const first = await geocodeCampaignLocation("Times Square cache test");
    const second = await geocodeCampaignLocation(" TIMES SQUARE CACHE TEST ");
    assert.deepEqual(first, second);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = originalKey;
  }
});

test("failures keep credentials out of messages and cancellation propagates", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "test-placeholder";
  globalThis.fetch = async () => { throw new Error("apiKey=test-placeholder"); };
  try {
    const result = await geocodeCampaignLocation("Lookup failure test");
    assert.equal(result.location, null);
    assert.doesNotMatch(result.note, /test-placeholder|apiKey=/);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(geocodeCampaignLocation("Cancellation test", controller.signal), { name: "AbortError" });
    delete process.env.GEOAPIFY_API_KEY;
    const missing = await geocodeCampaignLocation("Missing configuration test");
    assert.match(missing.note, /not configured/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = originalKey;
  }
});

test("street names normalise the way the intersection table does", () => {
  assert.equal(streetKey("West 54th Street"), "54 ST");
  assert.equal(streetKey("Seventh Avenue"), "7 AVE");
  assert.equal(streetKey("Avenue of the Americas"), "6 AVE");
  assert.equal(streetKey("Broadway"), "BROADWAY");
  assert.equal(streetKey("Avenue N"), "AVE N");
});

test("street corners are parsed with a borough hint, and other places are not", () => {
  assert.deepEqual(parseIntersection("Southeast corner of 54th Street and Broadway, Manhattan"), { pairs: [["54 ST", "BROADWAY"]], borough: "Manhattan" });
  assert.deepEqual(parseIntersection("Kent Avenue & Grand Street, Williamsburg"), { pairs: [["KENT AVE", "GRAND ST"]], borough: "Brooklyn" });
  assert.deepEqual(parseIntersection("Lafayette St between Spring St and Kenmare St, SoHo"), { pairs: [["LAFAYETTE ST", "SPRING ST"], ["LAFAYETTE ST", "KENMARE ST"]], borough: "Manhattan" });
  assert.deepEqual(parseIntersection("Corner of Lafayette and Prince Streets"), { pairs: [["LAFAYETTE ST", "PRINCE ST"]], borough: null });
  assert.equal(parseIntersection("Times Square"), null);
  assert.equal(parseIntersection("401 Avenue of the Americas"), null);
});

test("street corners are placed from the city's centerline, never from a different corner", async () => {
  const corner = await locateIntersection("41st Street & 7th Avenue, Manhattan");
  assert.equal(corner.location.precision, "address");
  assert.equal(corner.location.source, "street-centerline");
  assert.ok(Math.abs(corner.location.latitude - 40.7554) < 0.001 && Math.abs(corner.location.longitude + 73.9875) < 0.001);
  const ambiguous = await locateIntersection("41st Street and 7th Avenue");
  assert.equal(ambiguous.location, null);
  assert.match(ambiguous.note, /more than one place/);
  const missing = await locateIntersection("Kent Avenue and 54th Street, Brooklyn");
  assert.equal(missing.location, null);
  assert.equal(await locateIntersection("Times Square"), null);
  const bare = await locateIntersection("Lafayette and Prince, SoHo");
  assert.equal(bare.location.precision, "address");
});

const brooklynItself = { ...timesSquare, lon: -73.9497, lat: 40.6526, name: "Brooklyn", formatted: "Brooklyn, New York, NY, United States", county: "Kings County", result_type: "suburb" };
const fortGreene = { ...brooklynItself, lon: -73.9766, lat: 40.6908, name: "Fort Greene", formatted: "Brooklyn, Fort Greene, New York, NY, United States" };

test("a neighbourhood becomes an approximate marker at the neighbourhood, never the centre of its borough", () => {
  assert.equal(selectGeocodingResult(payload(brooklynItself), "Fort Greene, Brooklyn").location, null);
  const { location } = selectGeocodingResult(payload(fortGreene), "Fort Greene");
  assert.equal(location.precision, "area");
  assert.equal(location.latitude, fortGreene.lat);
});

test("a neighbourhood named exactly is accepted at Geoapify's lower confidence, unlike other weak matches", () => {
  const soho = { ...fortGreene, name: "SoHo", rank: { confidence: 0.5 } };
  assert.equal(selectGeocodingResult(payload(soho), "SoHo").location.precision, "area");
  assert.equal(selectGeocodingResult(payload(soho), "Tribeca").location, null);
});

test("a neighbourhood is not taken for a street that shares its words", () => {
  const street = (name) => ({ ...timesSquare, name, result_type: "street" });
  assert.equal(selectGeocodingResult(payload(street("Concourse Village West")), "West Village, Manhattan").location, null);
  assert.equal(selectGeocodingResult(payload(street("Chelsea Road")), "Chelsea, Manhattan").location, null);
  assert.equal(selectGeocodingResult(payload(street("West 42nd Street")), "42nd Street").location.precision, "area");
});

test("a business named after a neighbourhood is not taken for the neighbourhood", () => {
  const clinic = { ...timesSquare, name: "Upper East Side Veterinary Center", rank: { confidence: 0.81 } };
  assert.equal(selectGeocodingResult(payload(clinic), "Upper East Side, Manhattan").location, null);
});

test("a location naming only the city is citywide, and one naming a borough is borough-wide", async () => {
  assert.equal((await geocodeCampaignLocation("New York City, New York")).reach, "citywide");
  assert.equal((await geocodeCampaignLocation("Brooklyn, New York")).reach, "borough");
});

test("a location naming only a borough is not geocoded", async () => {
  const result = await geocodeCampaignLocation("Manhattan, New York, NY, United States of America");
  assert.equal(result.location, null);
  assert.match(result.note, /only a borough/);
});

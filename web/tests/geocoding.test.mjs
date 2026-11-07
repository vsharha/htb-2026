import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { campaignAffectsHeatmap, getCampaignLocation } from "../src/lib/campaign-location.ts";

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  return nextResolve(specifier, context);
} });
const { geocodeCampaignLocation, selectGeocodingResult } = await import("../src/lib/server/geocoding.ts");

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

import assert from "node:assert/strict";
import test from "node:test";
import { selectPlacements } from "../src/lib/placement-selection.ts";

function site(id, geoid, metresNorth, overrides = {}) {
  return {
    id, geoid, kind: "linknyc", address: id, borough: "Manhattan",
    latitude: 40.7 + metresNorth / 6_371_000 * 180 / Math.PI,
    longitude: -74, carriesAds: "yes", costPerAudienceMember: 0.02,
    ...overrides,
  };
}
const query = (geoids, monthlyBudget = 5000) => ({ geoids, monthlyBudget });

test("one site per tract, in gap rank order, using cost only within a tract", () => {
  const sites = [site("second", "b", 2000), site("expensive", "a", 0, { costPerAudienceMember: 0.04 }), site("cheap", "a", 1000)];
  assert.deepEqual(selectPlacements(sites, query(["a", "b"])).map((p) => p.id), ["cheap", "second"]);
});

test("rejects sites within 500 metres, including across tract boundaries, and tries alternatives", () => {
  const sites = [site("first", "a", 0), site("close", "b", 499), site("alternative", "b", 501, { costPerAudienceMember: 0.03 })];
  assert.deepEqual(selectPlacements(sites, query(["a", "b"])).map((p) => p.id), ["first", "alternative"]);
});

test("fills up to twelve from lower-ranked tracts without relaxing spacing or repeating tracts", () => {
  const sites = Array.from({ length: 30 }, (_, i) => site(`site-${i}`, `tract-${i}`, i * 300));
  const selected = selectPlacements(sites.toReversed(), query(sites.map((p) => p.geoid)));
  assert.equal(selected.length, 12);
  assert.deepEqual(selected.map((p) => p.id), Array.from({ length: 12 }, (_, i) => `site-${i * 2}`));
  assert.deepEqual(selectPlacements(sites.slice(0, 2), query(sites.map((p) => p.geoid))).map((p) => p.id), ["site-0"]);
});

test("preserves market, advertising eligibility and budget filters", () => {
  const sites = [
    site("outside", "outside", 0),
    site("non-ad", "a", 1000, { carriesAds: "no" }),
    site("shelter", "b", 2000, { kind: "bus_shelter" }),
    site("unknown", "c", 3000, { carriesAds: "unknown" }),
  ];
  assert.deepEqual(selectPlacements(sites, query(["a", "b", "c"], 1999)).map((p) => p.id), ["unknown"]);
  assert.deepEqual(selectPlacements(sites, query(["a", "b", "c"], 2000)).map((p) => p.id), ["shelter", "unknown"]);
});

import assert from "node:assert/strict";
import test from "node:test";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { campaignCoverage, confirmedSource, matchStation, parseStations, sourceUrl } from "../src/lib/server/campaign-evidence.ts";
import { runCompetitorAgent } from "../src/lib/competitor-agent.ts";
import { computeLayers } from "../src/lib/gap.ts";

const stations = [
  { id: "1", name: "Grand Central-42 St (4,5,6)", borough: "Manhattan", latitude: 40.75, longitude: -73.98, weeklyRiders: 10 },
  { id: "2", name: "Fulton St", borough: "Manhattan" },
  { id: "3", name: "Fulton St", borough: "Brooklyn" },
];

test("quoted station names preserve their coordinates and borough", () => {
  const parsed = parseStations('id,name,borough,latitude,longitude,weekly_riders\n610,"Grand Central-42 St (4,5,6)",Manhattan,40.75,-73.98,200\n');
  assert.deepEqual(parsed[0], { ...stations[0], id: "610", weeklyRiders: 200 });
});

test("campaign links must be HTTP sources actually returned by research", () => {
  const sources = new Set(["https://agency.example/campaign"]);
  assert.equal(confirmedSource("https://agency.example/campaign/#section", sources), "https://agency.example/campaign");
  assert.equal(confirmedSource("https://agency.example/unseen", sources), null);
  for (const value of ["javascript:alert(1)", "file:///tmp/a", "https://user:password@example.com", "not a url"]) {
    assert.equal(sourceUrl(value), null);
  }
});

test("only explicit, unambiguous subway station names are matched", () => {
  assert.equal(matchStation(stations, "Grand Central-42 St", "Posters ran at Grand Central-42 St."), stations[0]);
  assert.equal(matchStation(stations, "Grand Central-42 St", "Billboards across Midtown."), null);
  assert.equal(matchStation(stations, "Fulton St", "Posters at Fulton St."), null);
  assert.equal(matchStation(stations, "Fulton St", "Posters at Fulton St in Brooklyn."), stations[2]);
  assert.equal(matchStation(stations, null, "A citywide campaign."), null);
});

test("publication dates and incomplete dates cannot establish current coverage", () => {
  const today = "2026-11-07";
  assert.equal(campaignCoverage("2026-11-01", "2026-11-30", today), "current");
  assert.equal(campaignCoverage(null, "2020-01-01", today), "historical");
  assert.equal(campaignCoverage("2026-11-01", null, today), "unknown");
  assert.equal(campaignCoverage(null, null, today), "unknown");
  assert.equal(campaignCoverage("2026-11-30", "2026-11-01", today), "unknown");
  assert.equal(campaignCoverage("2026-02-30", "2026-12-01", today), "unknown");
});

test("historical and undated campaigns cannot lower the gap score", () => {
  const shapes = { features: [{ properties: { geoid: "1" }, geometry: { type: "Polygon", coordinates: [[[-73.98, 40.75], [-73.98, 40.75]]] } }] };
  const fit = { scores: { "1": 0.8 } };
  for (const coverage of ["historical", "unknown"]) {
    assert.equal(computeLayers(shapes, fit, [{ station: stations[0], coverage }])["1"].gap, 0.8);
  }
  assert.equal(computeLayers(shapes, fit, [{ station: stations[0], coverage: "current" }])["1"].gap, 0);
});

test("SDK transport decodes split SSE chunks and emits each finding once", async () => {
  const originalFetch = globalThis.fetch;
  const events = [{ type: "step", message: "Searching New York" }, { type: "competitor", competitor: { name: "Example", reason: "Same customers" } }, { type: "done" }];
  globalThis.fetch = async () => {
    const response = createUIMessageStreamResponse({ stream: createUIMessageStream({ execute({ writer }) {
      writer.write({ type: "start" });
      for (const data of events) writer.write({ type: "data-agent", data });
      writer.write({ type: "finish" });
    } }) });
    const bytes = new Uint8Array(await response.arrayBuffer());
    return new Response(new ReadableStream({ start(controller) {
      for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7));
      controller.close();
    } }), { headers: response.headers });
  };
  try {
    assert.deepEqual(await Array.fromAsync(runCompetitorAgent({})), events);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an interrupted stream keeps findings and reports incomplete coverage", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => createUIMessageStreamResponse({ stream: createUIMessageStream({ execute({ writer }) {
    writer.write({ type: "start" });
    writer.write({ type: "data-agent", data: { type: "step", message: "Searching" } });
    writer.write({ type: "finish" });
  } }) });
  try {
    const events = await Array.fromAsync(runCompetitorAgent({}));
    assert.equal(events[0].type, "step");
    assert.equal(events[1].type, "error");
    assert.match(events[1].message, /disconnected/);
    assert.equal(events[2].type, "done");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("cancelling research does not emit a failure for the replacement run", async () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async () => { throw controller.signal.reason; };
  try {
    assert.deepEqual(await Array.fromAsync(runCompetitorAgent({}, controller.signal)), []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

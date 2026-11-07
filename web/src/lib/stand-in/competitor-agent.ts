// Stand-in for the competitor-campaign agent. It replays a scripted run with
// pauses between events, so the UI is built against streaming timing.
// Competitor names and source links are placeholders, not real campaigns;
// the stations are real.

import type { AgentEvent, Brief, Station } from "@/lib/contract";

const STATIONS: Station[] = [
  { id: "611", name: "Times Sq-42 St", borough: "Manhattan", latitude: 40.755745, longitude: -73.98758, weeklyRiders: 922728 },
  { id: "610", name: "Grand Central-42 St", borough: "Manhattan", latitude: 40.75199, longitude: -73.977356, weeklyRiders: 731653 },
  { id: "607", name: "34 St-Herald Sq", borough: "Manhattan", latitude: 40.74964, longitude: -73.987885, weeklyRiders: 514184 },
  { id: "602", name: "14 St-Union Sq", borough: "Manhattan", latitude: 40.735065, longitude: -73.99042, weeklyRiders: 495234 },
  { id: "628", name: "Fulton St", borough: "Manhattan", latitude: 40.71009, longitude: -74.007835, weeklyRiders: 395997 },
  { id: "120", name: "Bedford Av", borough: "Brooklyn", latitude: 40.717304, longitude: -73.95687, weeklyRiders: 178992 },
];

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(signal.reason);
    });
  });

export async function* runCompetitorAgent(
  brief: Brief,
  signal?: AbortSignal,
): AsyncGenerator<AgentEvent> {
  const industry = brief.industry.toLowerCase();
  const script: AgentEvent[] = [
    { type: "step", message: `Finding ${industry} competitors that sell in New York` },
    { type: "competitor", competitor: { name: "Competitor A", reason: `Sells to the same customer in ${industry}` } },
    { type: "competitor", competitor: { name: "Competitor B", reason: "Named alongside the startup in trade press" } },
    { type: "step", message: "Searching press for “Competitor A subway ad”" },
    { type: "campaign", campaign: { competitor: "Competitor A", title: "Station takeover", kind: "subway", sourceUrl: "https://example.com/stand-in/a-takeover", station: STATIONS[3] } },
    { type: "campaign", campaign: { competitor: "Competitor A", title: "Platform posters", kind: "subway", sourceUrl: "https://example.com/stand-in/a-posters", station: STATIONS[4] } },
    { type: "step", message: "Searching social media for “Competitor B billboard NYC”" },
    { type: "campaign", campaign: { competitor: "Competitor B", title: "Billboard near the station", kind: "billboard", sourceUrl: "https://example.com/stand-in/b-billboard", station: STATIONS[5] } },
    { type: "step", message: "Reading a trade site article on Competitor B" },
    { type: "campaign", campaign: { competitor: "Competitor B", title: "Wall of posters in the passage", kind: "subway", sourceUrl: "https://example.com/stand-in/b-passage", station: STATIONS[0] } },
    { type: "campaign", campaign: { competitor: "Competitor B", title: "Bus shelter campaign, location unclear", kind: "bus shelter", sourceUrl: "https://example.com/stand-in/b-shelters", station: null } },
    { type: "done" },
  ];
  for (const event of script) {
    await wait(event.type === "step" ? 900 : 450, signal);
    yield event;
  }
}

import type { Campaign, Station } from "@/lib/contract";

export function parseStations(csv: string): Station[] {
  return csv.trim().split("\n").slice(1).map((line) => {
    const fields = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((field) => field.replace(/^"|"$/g, "").replace(/""/g, '"'));
    const [id, name, borough, latitude, longitude, weeklyRiders] = fields;
    return { id, name, borough: borough as Station["borough"], latitude: Number(latitude), longitude: Number(longitude), weeklyRiders: Number(weeklyRiders) };
  });
}

export function sourceUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    url.hash = "";
    return url.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function confirmedSource(value: string, sources: Set<string>) {
  const url = sourceUrl(value);
  return url && sources.has(url) ? url : null;
}

function normalized(value: string) {
  return value.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Repeated station names need a borough; neighbourhoods never imply a station. */
export function matchStation(stations: Station[], location: string | null, evidence: string) {
  if (!location) return null;
  const name = normalized(location);
  const text = ` ${normalized(evidence)} `;
  if (!name || !text.includes(` ${name} `)) return null;
  const matches = stations.filter((station) => normalized(station.name) === name);
  if (matches.length === 1) return matches[0];
  const inBorough = matches.filter((station) => text.includes(` ${normalized(station.borough)} `));
  return inBorough.length === 1 ? inBorough[0] : null;
}

export function campaignCoverage(startsOn: string | null, endsOn: string | null, today: string): Campaign["coverage"] {
  const valid = (date: string | null): date is string => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  };
  if ((startsOn && !valid(startsOn)) || (endsOn && !valid(endsOn))) return "unknown";
  if (startsOn && endsOn && startsOn > endsOn) return "unknown";
  if (endsOn && endsOn < today) return "historical";
  if (startsOn && endsOn && startsOn <= today && endsOn >= today) return "current";
  return "unknown";
}

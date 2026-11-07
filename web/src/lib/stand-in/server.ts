"use server";

// Stand-in for the placement Server Function. It reads the real kiosks and
// shelters, but invents their costs, measurement methods and minimum spends.

import type { Borough, Placement, PlacementQuery } from "@/lib/contract";

import { delay, hashUnit, readAnalysisCsv } from "./data-files";

const MEASUREMENTS: Placement["measurement"][] = ["QR code", "promo code", "landing page"];

export async function findPlacements(query: PlacementQuery): Promise<Placement[]> {
  const rows = await readAnalysisCsv("nyc_placements.csv");
  const rank = new Map(query.geoids.map((g, i) => [g, i]));

  const placements: Placement[] = rows
    .filter((r) => rank.has(r.geoid) && r.carries_ads !== "no")
    .map((r) => {
      const base = r.kind === "linknyc" ? 0.02 : 0.035;
      return {
        id: r.placement_id,
        kind: r.kind as Placement["kind"],
        address: r.address,
        borough: r.borough as Borough,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        geoid: r.geoid,
        carriesAds: r.carries_ads as Placement["carriesAds"],
        costPerAudienceMember: Number((base * (0.6 + hashUnit(r.placement_id))).toFixed(3)),
        measurement: MEASUREMENTS[Math.floor(hashUnit(r.placement_id + "m") * 3)],
      };
    });

  // Stand-in minimum spends: a budget under $2,000 a month rules out bus shelters.
  const affordable = placements.filter(
    (p) => query.monthlyBudget >= 2000 || p.kind === "linknyc",
  );
  affordable.sort(
    (a, b) =>
      rank.get(a.geoid)! - rank.get(b.geoid)! ||
      a.costPerAudienceMember - b.costPerAudienceMember,
  );

  await delay(400);
  return affordable.slice(0, 12);
}

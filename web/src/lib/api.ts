// The only module the UI imports server calls from. Audience scoring is real
// (Jev); placements and the competitor agent are still stand-ins in
// `stand-in/`, with the same signatures from `contract.ts` the real versions
// will keep.

export { scoreAudience } from "@/lib/server/audience";
export { findPlacements } from "@/lib/stand-in/server";
export { runCompetitorAgent } from "@/lib/stand-in/competitor-agent";

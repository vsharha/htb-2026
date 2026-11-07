// The only module the UI imports server calls from. Audience scoring is real;
// placements and the competitor agent are still stand-ins in `stand-in/`.

export { scoreAudience } from "@/lib/server/audience";
export { findPlacements } from "@/lib/stand-in/placements";
export { runCompetitorAgent } from "@/lib/stand-in/competitor-agent";

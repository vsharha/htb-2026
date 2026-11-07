// The only module the UI imports server calls from. Audience scoring is real
// (Jev), and competitor research streams from a Route Handler. Placement
// pricing remains a stand-in with the signature from `contract.ts`.

export { scoreAudience } from "@/lib/server/audience";
export { findPlacements } from "@/lib/stand-in/server";
export { runCompetitorAgent } from "@/lib/competitor-agent";

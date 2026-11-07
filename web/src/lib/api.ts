// The only module the UI imports server calls from. Each export points at a
// stand-in in `stand-in/`; the real backend replaces them here with the same
// signatures from `contract.ts`.

export { scoreAudience, findPlacements } from "@/lib/stand-in/server";
export { runCompetitorAgent } from "@/lib/stand-in/competitor-agent";

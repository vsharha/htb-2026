import type { AgentEvent } from "./contract";
import { campaignAffectsHeatmap, getCampaignLocation } from "./campaign-location";

export function researchOutcome(events: AgentEvent[], done: boolean) {
  const summary = events.findLast((event) => event.type === "research")?.summary;
  const campaigns = events.flatMap((event) => event.type === "campaign" ? [event.campaign] : []);
  const recorded = events.some((event) => event.type === "recording");
  const hasErrors = events.some((event) => event.type === "error");
  const status = hasErrors && summary?.status === "complete" ? "partial" : summary?.status ?? (hasErrors ? "failed" : "partial");
  const label = !done ? "Research in progress" : recorded ? "Recorded research" : {
    complete: "Search completed",
    partial: "Research incomplete",
    failed: "Research failed",
    "timed-out": "Research timed out",
  }[status];
  const empty = status === "complete" && !recorded
    ? "The completed searches found no source-supported outdoor campaigns. Competition coverage remains unknown."
    : "Research did not establish outdoor campaign coverage. Missing findings do not show that competitors are absent.";
  return {
    label,
    summary,
    empty,
    unmapped: campaigns.filter((campaign) => !getCampaignLocation(campaign)).length,
    historical: campaigns.filter((campaign) => campaign.coverage === "historical").length,
    unknownDates: campaigns.filter((campaign) => campaign.coverage === "unknown").length,
    qualifying: campaigns.filter(campaignAffectsHeatmap).length,
  };
}

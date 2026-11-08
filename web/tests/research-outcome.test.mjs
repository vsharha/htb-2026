import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { MockLanguageModelV4 } from "ai/test";

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  if (specifier.startsWith("@/")) return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier) && context.parentURL?.includes("/src/")) return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context);
  return nextResolve(specifier, context);
} });
const { runCompetitorResearch } = await import("../src/lib/server/competitor-agent.ts");
const { getCompetitorAI } = await import("../src/lib/server/ai.ts");
const { researchOutcome } = await import("../src/lib/research-outcome.ts");
const { recommendationLayer } = await import("../src/lib/gap.ts");

const brief = { industry: "Fintech", description: "a shared budgeting app", targetCustomer: "roommates", city: "new-york" };
const competitors = ["Alpha", "Beta", "Gamma"];
const url = (name) => `https://agency.example/${name.toLowerCase()}`;
const finding = (name) => ({ competitor: name, title: "NYC subway campaign", kind: "subway", sourceUrl: url(name), evidence: "A source-supported NYC subway campaign.", stationName: null, locations: [], citywide: false, startsOn: null, endsOn: null, latestEvidenceOn: null });

function adapter({ fail, timeout, unfinished, rejectSource = false, empty = false, findings = {}, discoveryFinding, discoveryCompetitors = 3 } = {}) {
  const steps = new Map();
  const model = new MockLanguageModelV4({ doStream: async (options) => {
    const discovery = options.tools.some((tool) => tool.name === "finishDiscovery");
    const prompt = options.prompt.find((message) => message.role === "user").content.map((part) => part.text ?? "").join("");
    const name = discovery ? "discovery" : competitors.find((candidate) => prompt.includes(`"name":"${candidate}"`));
    assert.ok(name, "Every campaign phase must be assigned a competitor");
    const step = steps.get(name) ?? 0;
    steps.set(name, step + 1);
    if (discovery) assert.match(prompt, /Do not search with the broad industry label alone/);
    else {
      assert.match(prompt, /station domination/);
      assert.match(prompt, /site:outfront.com/);
    }
    if (step === 0) assert.deepEqual(options.toolChoice, { type: "tool", toolName: "web_search" });
    if (name === fail) throw new Error("Search provider unavailable");
    if (name === timeout) throw new DOMException("Search deadline reached", "TimeoutError");
    let toolName, input, result;
    if (step < 2) {
      toolName = "web_search";
      input = { query: `${name} NYC campaign ${step}` };
      result = { sources: (discovery ? competitors : [name]).flatMap((candidate) => [url(candidate), ...[1, 2, 3, 4, 5].map((n) => `${url(candidate)}/${n}`)]).map((value) => ({ type: "url", url: value })), action: { type: "search", query: input.query } };
    } else if (discovery && step <= 1 + discoveryCompetitors) {
      toolName = "reportCompetitor";
      input = { name: competitors[step - 2], reason: "Same customers", sourceUrl: url(competitors[step - 2]) };
    } else if (discovery && step === 5 && discoveryFinding) {
      toolName = "reportCampaign";
      input = discoveryFinding;
    } else if (discovery) {
      toolName = "finishDiscovery";
      input = {};
    } else if (findings[name]?.[step - 2]) {
      toolName = "reportCampaign";
      input = findings[name][step - 2];
    } else if (findings[name]) {
      toolName = "finishResearch";
      input = {};
    } else if (!empty && (step === 2 || rejectSource && step === 3 || name === unfinished)) {
      toolName = "reportCampaign";
      input = finding(name);
      if (rejectSource && step === 2) input.sourceUrl = "https://unseen.example/campaign";
    } else {
      toolName = "finishResearch";
      input = {};
    }
    const toolCallId = `${name}-${step}`;
    const parts = [{ type: "stream-start", warnings: [] }];
    if (discovery && step === 0) parts.push({ type: "reasoning-start", id: "r1" }, { type: "reasoning-delta", id: "r1", delta: "Shoppers say roommate budgeting app." }, { type: "reasoning-end", id: "r1" });
    parts.push({ type: "tool-call", toolCallId, toolName, input: JSON.stringify(input), ...(result ? { providerExecuted: true } : {}) });
    if (result) parts.push({ type: "tool-result", toolCallId, toolName, result });
    parts.push({ type: "finish", finishReason: { unified: "tool-calls" }, usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } } });
    return { stream: new ReadableStream({ start(controller) { for (const part of parts) controller.enqueue(part); controller.close(); } }) };
  } });
  return { ...getCompetitorAI(), configured: true, model };
}

async function research(options) {
  const events = [];
  const complete = await runCompetitorResearch(brief, new AbortController().signal, (event) => events.push(event), adapter(options));
  return { complete, events, summary: events.findLast((event) => event.type === "research").summary };
}

test("each competitor gets its own placement search and can report undated, unmapped campaigns", async () => {
  const { complete, events, summary } = await research();
  assert.equal(complete, true);
  assert.deepEqual(summary.competitorsSearched.sort(), competitors);
  assert.deepEqual(summary.competitorsCompleted.sort(), competitors);
  assert.equal(summary.searches, 8);
  assert.equal(summary.status, "complete");
  assert.equal(events.filter((event) => event.type === "campaign").length, 3);
  const outcome = researchOutcome(events, true);
  assert.equal(outcome.unmapped, 3);
  assert.equal(outcome.unknownDates, 3);
  assert.equal(outcome.qualifying, 0);
});

const campaignsOf = (events) => events.filter((event) => event.type === "campaign").map((event) => event.campaign);
const corner = "Lafayette and Prince Streets, Manhattan";

test("discovery cannot finish on one competitor until it has searched more widely", async () => {
  const { complete, summary } = await research({ discoveryCompetitors: 1 });
  assert.equal(complete, false);
  assert.deepEqual(summary.competitorsSearched, ["Alpha"]);
});

test("a campaign found during discovery is kept and not repeated by the placement search", async () => {
  const { events } = await research({ discoveryFinding: { ...finding("Alpha"), citywide: true }, findings: { Alpha: [{ ...finding("Alpha"), citywide: true }] } });
  const alpha = campaignsOf(events).filter((campaign) => campaign.competitor === "Alpha");
  assert.equal(alpha.length, 1);
  assert.equal(alpha[0].reach, "citywide");
  assert.equal(researchOutcome(events, true).widespread, 1);
});

test("each place in a finding becomes its own row and a named borough is labelled, not pinned", async () => {
  const { events } = await research({ findings: { Alpha: [{ ...finding("Alpha"), kind: "other", locations: [corner, "Brooklyn"] }] } });
  const [placed, borough] = campaignsOf(events).filter((campaign) => campaign.competitor === "Alpha");
  assert.equal(placed.location, corner);
  assert.equal(placed.mapLocation.precision, "address");
  assert.equal(placed.reach, undefined);
  assert.equal(borough.mapLocation, null);
  assert.equal(borough.reach, "borough");
});

test("a named place that cannot be located is not labelled citywide", async () => {
  const { events } = await research({ findings: { Alpha: [{ ...finding("Alpha"), kind: "other", citywide: true, locations: ["Brooklyn"] }] } });
  assert.equal(campaignsOf(events).find((campaign) => campaign.competitor === "Alpha").reach, "borough");
});

test("findings without a place cannot use up the allowance for located ones", async () => {
  const vague = [1, 2, 3, 4].map((n) => ({ ...finding("Alpha"), sourceUrl: `${url("Alpha")}/${n}` }));
  const { events } = await research({ findings: { Alpha: [...vague, { ...finding("Alpha"), kind: "other", locations: [corner] }] } });
  const alpha = campaignsOf(events).filter((campaign) => campaign.competitor === "Alpha");
  assert.equal(alpha.filter((campaign) => !campaign.mapLocation).length, 3);
  assert.equal(alpha.filter((campaign) => campaign.mapLocation).length, 1);
});

test("failed and timed-out competitors do not discard other competitors' findings", async (context) => {
  const logged = context.mock.method(console, "error", () => {});
  for (const options of [{ fail: "Beta" }, { timeout: "Beta" }]) {
    const { complete, events, summary } = await research(options);
    assert.equal(complete, false);
    assert.deepEqual(summary.competitorsCompleted.sort(), ["Alpha", "Gamma"]);
    assert.deepEqual(events.filter((event) => event.type === "campaign").map((event) => event.campaign.competitor).sort(), ["Alpha", "Gamma"]);
    assert.equal(summary.status, options.timeout ? "timed-out" : "partial");
  }
  assert.equal(logged.mock.callCount(), 2);
});

test("a competitor exhausting its step budget cannot consume another competitor's search budget", async () => {
  const { complete, summary } = await research({ unfinished: "Beta" });
  assert.equal(complete, false);
  assert.equal(summary.status, "partial");
  assert.deepEqual(summary.competitorsSearched.sort(), competitors);
  assert.deepEqual(summary.competitorsCompleted.sort(), ["Alpha", "Gamma"]);
});

test("unseen source URLs are counted and never accepted as campaign evidence", async () => {
  const { events, summary } = await research({ rejectSource: true });
  assert.equal(summary.rejectedSources, 3);
  assert.equal(events.filter((event) => event.type === "campaign").length, 3);
  assert.ok(events.filter((event) => event.type === "campaign").every((event) => event.campaign.sourceUrl.startsWith("https://agency.example/")));
});

test("completed empty searches differ from failure, partial research and timeouts", async () => {
  const { events } = await research({ empty: true });
  assert.equal(researchOutcome(events, true).label, "Search completed");
  assert.match(researchOutcome(events, true).empty, /completed searches/);
  for (const [status, label] of [["failed", "Research failed"], ["partial", "Research incomplete"], ["timed-out", "Research timed out"]]) {
    const outcome = researchOutcome([{ type: "research", summary: { status } }], true);
    assert.equal(outcome.label, label);
    assert.doesNotMatch(outcome.empty, /completed searches/);
  }
  assert.equal(researchOutcome([...events, { type: "error", message: "Disconnected" }], true).label, "Research incomplete");
});

test("recommendations use audience fit unless current or recent, precisely located campaign evidence exists", () => {
  const campaign = { ...finding("Alpha"), coverage: "unknown", station: null, mapLocation: { latitude: 40.75, longitude: -73.98, precision: "area" } };
  assert.equal(recommendationLayer([]), "fit");
  assert.equal(recommendationLayer([campaign]), "fit");
  assert.equal(recommendationLayer([{ ...campaign, coverage: "current" }]), "fit");
  assert.equal(recommendationLayer([{ ...campaign, coverage: "historical", mapLocation: { ...campaign.mapLocation, precision: "address" } }]), "fit");
  assert.equal(recommendationLayer([{ ...campaign, coverage: "current", mapLocation: { ...campaign.mapLocation, precision: "address" } }]), "gap");
  assert.equal(recommendationLayer([{ ...campaign, coverage: "recent", mapLocation: { ...campaign.mapLocation, precision: "address" } }]), "gap");
});

test("the trace lists the reasoning and every tool the agent used, by stage", async () => {
  const { events } = await research();
  const trace = events.flatMap((event) => (event.type === "trace" ? [event.entry] : []));
  const tools = trace.filter((entry) => entry.kind === "tool");
  const count = (name) => tools.filter((entry) => entry.tool === name).length;
  assert.equal(count("web_search"), 8);
  assert.equal(count("reportCompetitor"), 3);
  assert.equal(count("finishDiscovery"), 1);
  assert.equal(count("reportCampaign"), 3);
  assert.equal(count("finishResearch"), 3);
  assert.deepEqual(tools.filter((entry) => entry.tool === "reportCompetitor").map((entry) => entry.detail), competitors);
  assert.deepEqual(trace.filter((entry) => entry.kind === "thought"), [{ kind: "thought", stage: "Finding competitors", text: "Shoppers say roommate budgeting app." }]);
  assert.ok(tools.filter((entry) => entry.tool === "reportCampaign").every((entry) => competitors.includes(entry.stage)));
});

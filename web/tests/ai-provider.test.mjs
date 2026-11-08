import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

// Next.js supplies this server boundary marker when compiling the app.
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  return nextResolve(specifier, context);
} });
const { AI_MODELS, getCompetitorAI, getAudienceModel, hasAudienceCredentials } = await import("../src/lib/server/ai.ts");

function withEnvironment(values, run) {
  const previous = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  try {
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    return run();
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test("model defaults resolve through the SDK registry and ignore environment model overrides", () => {
  withEnvironment({ OPENAI_COMPETITOR_MODEL: "not-a-model", COMPETITOR_MODEL: "not-a-model", AUDIENCE_MODEL: "not-a-model" }, () => {
    assert.equal(AI_MODELS.competitor, "openai:gpt-5.6-luna");
    assert.equal(getCompetitorAI().model.modelId, "gpt-5.6-luna");
    assert.equal(getAudienceModel().modelId, "typesafe-ai/jev");
  });
});

test("switching an OpenAI model keeps the compatible hosted search setup", () => {
  const research = getCompetitorAI("openai:another-model");
  assert.equal(research.model.modelId, "another-model");
  assert.equal(research.tools.web_search.id, "openai.web_search");
  assert.equal(research.providerOptions.openai.store, false);
  assert.throws(() => getCompetitorAI("gateway:openai/gpt-5.6-luna"), /no search adapter/);
});

test("credentials are checked separately for research and audience scoring", () => {
  withEnvironment({ OPENAI_API_KEY: undefined, AI_GATEWAY_API_KEY: undefined, VERCEL_OIDC_TOKEN: undefined }, () => {
    assert.equal(getCompetitorAI().configured, false);
    assert.equal(hasAudienceCredentials(), false);
    withEnvironment({ OPENAI_API_KEY: "test-placeholder" }, () => {
      assert.equal(getCompetitorAI().configured, true);
      assert.equal(hasAudienceCredentials(), false);
    });
    withEnvironment({ AI_GATEWAY_API_KEY: "test-placeholder" }, () => assert.equal(hasAudienceCredentials(), true));
    withEnvironment({ VERCEL_OIDC_TOKEN: "test-placeholder" }, () => assert.equal(hasAudienceCredentials(), true));
  });
});

test("research events expose only URL sources and readable search progress", () => {
  const research = getCompetitorAI();
  assert.deepEqual(research.readEvent({ type: "source", sourceType: "url", url: "https://agency.example" }), { urls: ["https://agency.example"] });
  assert.deepEqual(research.readEvent({ type: "tool-result", toolName: "web_search", output: {
    sources: [{ type: "url", url: "https://agency.example" }, { type: "api", name: "other" }, null],
    action: { type: "search", queries: ["NYC subway ads", "brand billboards", 42] },
  } }), { urls: ["https://agency.example"], message: "Searching: NYC subway ads; brand billboards", searched: true, tool: "web_search" });
  assert.deepEqual(research.readEvent({ type: "tool-result", toolName: "web_search", output: { action: { type: "openPage", url: "https://agency.example/campaign" } } }), {
    urls: ["https://agency.example/campaign"], message: "Reading agency.example", tool: "open_page",
  });
});

test("reporting tools and malformed search events do not become research sources", () => {
  const research = getCompetitorAI();
  for (const event of [
    { type: "tool-result", toolName: "reportCampaign", output: { sources: [{ type: "url", url: "https://unverified.example" }] } },
    { type: "tool-result", toolName: "web_search", output: null },
    { type: "tool-result", toolName: "web_search", output: { action: { type: "openPage", url: "invalid" } } },
    { type: "tool-result", toolName: "web_search", output: { action: { type: "openPage", url: "file:///tmp/file" } } },
  ]) assert.deepEqual(research.readEvent(event), { urls: [] });
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

class TestWebError extends Error {
  constructor(message, code, options) {
    super(message, options);
    this.code = code;
  }
}

const sourcePath = path.resolve(__dirname, "..", "src", "provider.js");
const source = fs.readFileSync(sourcePath, "utf8")
  .replace(/^import[^;]+;\s*/gm, "")
  .replace(/\bexport\s+/g, "");
const factory = new Function(
  "WebError",
  "credentialRef",
  "launchEnvironmentOf",
  `${source}\nreturn { BochaSearchProvider, mapBochaResponse, isValidBaseURL, isValidFreshness, resolveBochaOptions };`
);
const { BochaSearchProvider, mapBochaResponse, isValidBaseURL, isValidFreshness, resolveBochaOptions } = factory(
  TestWebError,
  (value) => value,
  () => ({ get: () => undefined })
);
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "fixtures", "bocha-web-search-success.json"), "utf8"));
const failure = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "fixtures", "bocha-web-search-error.json"), "utf8"));

async function run() {
  assert.equal(isValidBaseURL("https://api.bochaai.com/v1/web-search"), true);
  assert.equal(isValidBaseURL("https://api.bocha.cn/v1/web-search"), true);
  assert.equal(isValidBaseURL("https://example.invalid/v1/web-search"), false);
  assert.equal(isValidBaseURL("https://api.bochaai.com/proxy/v1/web-search"), false);
  assert.equal(isValidBaseURL("https://api.bochaai.com/v1/web-search?key=1"), false);
  assert.equal(isValidBaseURL("https://api.bochaai.com:8443/v1/web-search"), false);
  assert.equal(isValidFreshness("noLimit"), true);
  assert.equal(isValidFreshness("2026-01-01..2026-01-31"), true);
  const limited = mapBochaResponse(success, 1);
  assert.equal(limited.sources.length, 1);
  assert.equal(limited.truncated, true);
  const complete = mapBochaResponse(success, 10);
  assert.equal(complete.sources.length, 2);
  assert.equal(complete.truncated, false);
  assert.throws(() => mapBochaResponse(failure, 10), (error) => error.code === "WEB_PROVIDER_ERROR");

  const credentialsContext = {
    get: (name) => name === "credentials" ? { resolve: async () => ({ value: "secret-from-credentials" }) } : undefined
  };
  const resolvedOptions = resolveBochaOptions(credentialsContext, {
    apiKeyEnv: "BOCHA_API_KEY",
    baseURL: "https://api.bochaai.com/v1/web-search",
    freshness: "noLimit",
    count: 10,
    timeoutMs: 1000
  });
  assert.equal(await resolvedOptions.resolveApiKey(), "secret-from-credentials");

  const ambientContext = { get: () => undefined };
  const ambientOptions = factory(
    TestWebError,
    (value) => value,
    () => ({ get: () => ({ value: "secret-from-launch-env" }) })
  ).resolveBochaOptions(ambientContext, { apiKeyEnv: "BOCHA_API_KEY" });
  assert.equal(await ambientOptions.resolveApiKey(), "secret-from-launch-env");

  const originalFetch = globalThis.fetch;
  try {
    let requestUrl;
    let requestOptions;
    globalThis.fetch = async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return { ok: true, status: 200, json: async () => success };
    };
    const provider = new BochaSearchProvider(() => ({
      apiKey: "test-key",
      apiKeyEnv: "BOCHA_API_KEY",
      baseURL: "https://api.bochaai.com/v1/web-search",
      freshness: "noLimit",
      count: 10,
      timeoutMs: 1000
    }));
    assert.equal(provider.available(), true);
    const result = await provider.search({ query: "  dsh  ", maxResults: 1 });
    assert.equal(requestUrl, "https://api.bochaai.com/v1/web-search");
    assert.equal(requestOptions.method, "POST");
    assert.equal(requestOptions.headers.authorization, "Bearer test-key");
    assert.equal(requestOptions.headers["user-agent"], "dsh-bocha-web-search-plugin/0.2.2");
    assert.equal(JSON.parse(requestOptions.body).query, "dsh");
    assert.equal(JSON.parse(requestOptions.body).count, 1);
    assert.equal(result.sources.length, 1);
    assert.equal(result.truncated, true);
    const emptyResult = await provider.search({ query: "zero", maxResults: 0 });
    assert.equal(JSON.parse(requestOptions.body).count, 1);
    assert.equal(emptyResult.sources.length, 0);
    assert.equal(emptyResult.truncated, true);

    globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
    const timedProvider = new BochaSearchProvider(() => ({
      apiKey: "test-key",
      apiKeyEnv: "BOCHA_API_KEY",
      baseURL: "https://api.bochaai.com/v1/web-search",
      freshness: "noLimit",
      count: 10,
      timeoutMs: 10
    }));
    await assert.rejects(timedProvider.search({ query: "timeout" }), (error) => error.code === "WEB_PROVIDER_TIMEOUT");
  } finally {
    globalThis.fetch = originalFetch;
  }

  const indexSource = fs.readFileSync(path.resolve(__dirname, "..", "src", "index.js"), "utf8");
  const applySource = indexSource.match(/export function apply\(ctx, config\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(applySource, "Bocha host plugin must export apply(ctx, config)");
  const resolverStart = indexSource.indexOf("function resolveDeepSeekOptions(ctx) {");
  const applyStart = indexSource.indexOf("export function apply(ctx, config) {", resolverStart);
  assert.ok(resolverStart >= 0 && applyStart > resolverStart, "DeepSeek resolver must remain testable in the plugin source");
  const resolverSource = indexSource.slice(resolverStart, applyStart);
  const resolveDeepSeekOptions = new Function(
    "launchEnvironmentOf", "DEEPSEEK_API_KEY_ENV", "DEEPSEEK_SEARCH_BASE_URL_ENV",
    "DEEPSEEK_ACCOUNT_PROVIDER", "DEEPSEEK_DEFAULT_BASE_URL", "DEEPSEEK_DEFAULT_MODEL",
    "DEEPSEEK_DEFAULT_API_VERSION", "DEEPSEEK_DEFAULT_MAX_TOKENS", "DEEPSEEK_DEFAULT_MAX_USES",
    `${resolverSource}\nreturn resolveDeepSeekOptions;`
  )(
    (ctx) => ctx.environment,
    "credential:DEEPSEEK_API_KEY",
    "DEEPSEEK_SEARCH_BASE_URL",
    "deepseek-account",
    "https://api.deepseek.com/anthropic/v1",
    "deepseek-v4-flash",
    "2023-06-01",
    4096,
    5
  );
  let recordedRequest;
  const initiator = { session: {
    requestContext: () => ({ provider: "deepseek-account" }),
    append: (type, request) => { recordedRequest = { type, request }; }
  } };
  const credentials = { resolve: async (ref) => {
    assert.equal(ref, "credential:DEEPSEEK_API_KEY");
    return { value: "deepseek-secret" };
  } };
  const deepseekCtx = {
    environment: { get: (name) => name === "DEEPSEEK_SEARCH_BASE_URL" ? { value: "https://search.example/v1" } : undefined },
    get: (name) => ({ agents: { currentInitiator: () => initiator }, credentials,
      deepseekAccount: { resolveToken: async (endpoint) => `account:${endpoint}` } })[name]
  };
  const deepseekOptions = resolveDeepSeekOptions(deepseekCtx);
  assert.equal(deepseekOptions.baseURL, "https://search.example/v1");
  assert.equal(deepseekOptions.model, "deepseek-v4-flash");
  assert.equal(await deepseekOptions.resolveApiKey(), "deepseek-secret");
  assert.equal(await deepseekOptions.resolveAccountToken("https://search.example/v1/messages"), "account:https://search.example/v1/messages");
  deepseekOptions.recordRequest({ endpoint: "https://search.example/v1/messages" });
  assert.equal(recordedRequest.type, "web/deepseek-search-llm-request");

  const ambientDeepSeekOptions = resolveDeepSeekOptions({
    environment: { get: (name) => name === "credential:DEEPSEEK_API_KEY" ? { value: "deepseek-from-env" } : undefined },
    get: () => undefined
  });
  assert.equal(await ambientDeepSeekOptions.resolveApiKey(), "deepseek-from-env");

  let selectedEngine = "bocha";
  let deepseekCalls = 0;
  class TestDeepSeekSearchProvider {
    constructor(resolveOptions) { this.resolveOptions = resolveOptions; }
    available() { return true; }
    async search(request) {
      assert.equal(this.resolveOptions().provider, "deepseek-test");
      deepseekCalls += 1;
      return { content: `DeepSeek:${request.query}`, sources: [], truncated: false };
    }
  }
  const apply = new Function(
    "BochaSearchProvider", "DeepSeekSearchProvider", "resolveBochaOptions",
    "resolveDeepSeekOptions", "BOCHA_PROVIDER_ID",
    `return (${applySource.replace(/^export\s+/, "")})`
  )(BochaSearchProvider, TestDeepSeekSearchProvider, resolveBochaOptions, () => ({ provider: "deepseek-test" }), "bocha");
  const providers = new Map();
  const ctx = {
    get: () => undefined,
    web: {
      registerSearchProvider(provider) {
        assert.equal(providers.has(provider.id), false, `duplicate provider ${provider.id}`);
        providers.set(provider.id, provider);
        return () => providers.delete(provider.id);
      }
    }
  };
  const config = {
    searchEngine: { get: () => selectedEngine },
    apiKey: { get: () => "test-bocha-key" },
    apiKeyEnv: { get: () => "BOCHA_API_KEY" },
    baseURL: { get: () => "https://api.bochaai.com/v1/web-search" },
    freshness: { get: () => "noLimit" },
    count: { get: () => 10 },
    timeoutMs: { get: () => 15000 }
  };
  const originalFetchForRouter = globalThis.fetch;
  let bochaCalls = 0;
  try {
    globalThis.fetch = async (url, options) => {
      bochaCalls += 1;
      assert.equal(url, "https://api.bochaai.com/v1/web-search");
      assert.equal(options.method, "POST");
      return { ok: true, status: 200, json: async () => success };
    };
    const dispose = apply(ctx, config);
    const router = providers.get("bocha");
    assert.equal(router.id, "bocha");
    assert.equal(router.available(), true);

    const bochaResult = await router.search({ query: "Bocha route" });
    assert.equal(bochaCalls, 1);
    assert.equal(bochaResult.sources.length, 2);
    assert.equal(bochaResult.content, "Search provider: Bocha (bocha).", "Bocha results must identify the provider actually used");

    selectedEngine = "deepseek-official";
    const deepseekResult = await router.search({ query: "DeepSeek route" });
    assert.equal(deepseekResult.content, "Search provider: DeepSeek (deepseek-official).\n\nDeepSeek:DeepSeek route");
    assert.equal(deepseekCalls, 1);
    assert.equal(bochaCalls, 1, "DeepSeek selection must not call Bocha");

    selectedEngine = "bocha";
    const bochaAgainResult = await router.search({ query: "Bocha again" });
    assert.equal(bochaAgainResult.content, "Search provider: Bocha (bocha).", "the next search must update its vendor marker with the selection");
    assert.equal(bochaCalls, 2, "the next search must observe the updated selection");
    dispose();
    assert.equal(providers.has("bocha"), false, "the router registration must dispose cleanly");
  } finally {
    globalThis.fetch = originalFetchForRouter;
  }

  const clientSource = fs.readFileSync(path.resolve(__dirname, "..", "src", "client.js"), "utf8");
  assert.ok(clientSource.includes('name: "settings.general.item"'));
  assert.ok(clientSource.includes('form.set("searchEngine"'));
  assert.ok(clientSource.includes('name: "plugins.bundle.config"'));
  assert.ok(clientSource.includes('key: BUNDLE_CONFIG_KEY'));
  assert.ok(clientSource.includes('inject: () => ({ remote, form: bochaForm })'));
  assert.ok(clientSource.includes('React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)'), "the bundle-level form should subscribe to live configuration updates");
  assert.ok(clientSource.includes('summary: "Configure the Bocha API key and search options directly on this bundle\'s page."'), "the bundle summary should identify its configuration surface");
  assert.ok(clientSource.includes('summary: "可在此组合包页面直接配置博查 API Key 和搜索参数。"'), "the Chinese bundle summary should identify its configuration surface");
  assert.ok(clientSource.includes('className: "bocha-engine-settings"'), "the General Settings selector must not use the boxed plugin card style");
  assert.ok(clientSource.includes('.bocha-engine-settings .bocha-card-description{font-size:12px;line-height:18px;margin:4px 0 0}'), "the selector description must match the official 12px General Settings typography");
  const searchEngineSchema = indexSource.match(/searchEngine:\s*(.+),\s*apiKey:/)?.[1];
  assert.equal(searchEngineSchema, 'z.union(["bocha", "deepseek-official"]).default("bocha").volatile()', "the setting form requires a live field; accepted values persist to the profile patch");
  assert.ok(applySource.includes('=== "deepseek-official"'), "the saved DeepSeek choice must route through the official DeepSeek provider");
  assert.ok(clientSource.includes('value: "deepseek-official"'), "the General Settings selector must store the official provider id");
  const patchSource = fs.readFileSync(path.resolve(__dirname, "..", "cordis.patch.yml"), "utf8");
  assert.ok(patchSource.includes("searchProvider: bocha"));
  assert.ok(patchSource.includes("searchEngine: bocha"));
  assert.ok(!patchSource.includes("disabled: true"), "the bundle must not disable the DeepSeek provider");
  const packageManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));
  assert.equal(packageManifest.peerDependencies["@deepseek-ai/dsh-web-search-deepseek"], "0.2.0-rc.2");

  console.log("provider static and live engine routing checks: OK");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

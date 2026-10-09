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

  console.log("provider static checks: OK");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

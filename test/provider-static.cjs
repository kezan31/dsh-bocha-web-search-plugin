const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

class TestWebError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

const sourcePath = path.resolve(__dirname, "..", "src", "provider.js");
const source = fs.readFileSync(sourcePath, "utf8")
  .replace(/^import[^;]+;\s*/gm, "")
  .replace(/\bexport\s+/g, "");
const factory = new Function("WebError", `${source}\nreturn { mapBochaResponse, isValidBaseURL, isValidFreshness };`);
const { mapBochaResponse, isValidBaseURL, isValidFreshness } = factory(TestWebError);
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "fixtures", "bocha-web-search-success.json"), "utf8"));
const failure = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "fixtures", "bocha-web-search-error.json"), "utf8"));

assert.equal(isValidBaseURL("https://api.bochaai.com/v1/web-search"), true);
assert.equal(isValidBaseURL("https://example.invalid/v1/web-search"), false);
assert.equal(isValidFreshness("noLimit"), true);
assert.equal(isValidFreshness("2026-01-01..2026-01-31"), true);
const limited = mapBochaResponse(success, 1);
assert.equal(limited.sources.length, 1);
assert.equal(limited.truncated, true);
const complete = mapBochaResponse(success, 10);
assert.equal(complete.sources.length, 2);
assert.equal(complete.truncated, false);
assert.throws(() => mapBochaResponse(failure, 10), (error) => error.code === "WEB_PROVIDER_ERROR");
console.log("provider static mapping: OK");

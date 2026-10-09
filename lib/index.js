import z from "@deepseek-ai/schemastery";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { WebError } from "@deepseek-ai/dsh-web";
import { BochaSearchProvider, BOCHA_DEFAULT_API_KEY_ENV, BOCHA_DEFAULT_BASE_URL, BOCHA_DEFAULT_COUNT, BOCHA_DEFAULT_FRESHNESS, BOCHA_DEFAULT_TIMEOUT_MS, BOCHA_MAX_COUNT, BOCHA_PROVIDER_ID, isValidBaseURL, isValidFreshness, mapBochaResponse, resolveBochaOptions } from "./provider.js";

const name = "web-search-bocha";
const inject = ["web"];
const WEB_SEARCH_BOCHA_SETTINGS_NAMESPACE = settingsNamespace("web-search-bocha");
const Config = z.object({
  apiKey: z.string().role("secret").default(""),
  apiKeyEnv: z.string().role("credential-ref").default(BOCHA_DEFAULT_API_KEY_ENV),
  baseURL: z.string().pattern(/^https:\/\/api\.bocha(?:ai\.com|\.cn)\/v1\/web-search$/).default(BOCHA_DEFAULT_BASE_URL),
  freshness: z.string().pattern(/^(?:noLimit|day|week|month|year|oneDay|oneWeek|oneMonth|oneYear|\d{4}-\d{2}-\d{2}(?:\.\.\d{4}-\d{2}-\d{2})?)$/).default(BOCHA_DEFAULT_FRESHNESS),
  count: z.number().step(1).min(1).max(BOCHA_MAX_COUNT).default(BOCHA_DEFAULT_COUNT),
  timeoutMs: z.number().step(1).min(1000).max(60000).default(BOCHA_DEFAULT_TIMEOUT_MS)
});
function apply(ctx, config) {
  let current = () => config;
  installSettingsSection(ctx, WEB_SEARCH_BOCHA_SETTINGS_NAMESPACE, Config, config, { setSource: (source) => { current = source; }, onChange: () => {} });
  ctx.web.registerSearchProvider(new BochaSearchProvider(() => resolveBochaOptions(ctx, current())));
}
export { BOCHA_DEFAULT_API_KEY_ENV, BOCHA_DEFAULT_BASE_URL, BOCHA_DEFAULT_COUNT, BOCHA_DEFAULT_FRESHNESS, BOCHA_DEFAULT_TIMEOUT_MS, BOCHA_MAX_COUNT, BOCHA_PROVIDER_ID, BochaSearchProvider, Config, WEB_SEARCH_BOCHA_SETTINGS_NAMESPACE, WebError, apply, inject, isValidBaseURL, isValidFreshness, mapBochaResponse, name, resolveBochaOptions };

import z from "@deepseek-ai/schemastery";
import { WebError } from "@deepseek-ai/dsh-web";
import {
  BochaSearchProvider,
  BOCHA_DEFAULT_API_KEY_ENV,
  BOCHA_DEFAULT_BASE_URL,
  BOCHA_DEFAULT_COUNT,
  BOCHA_DEFAULT_FRESHNESS,
  BOCHA_DEFAULT_TIMEOUT_MS,
  BOCHA_MAX_COUNT,
  BOCHA_PROVIDER_ID,
  isValidBaseURL,
  isValidFreshness,
  mapBochaResponse,
  resolveBochaOptions
} from "./provider.js";

export const name = "web-search-bocha";
export const inject = ["web"];

export const Config = z.object({
  apiKey: z.string().role("secret").volatile(),
  apiKeyEnv: z.string().role("credential-ref").default(BOCHA_DEFAULT_API_KEY_ENV).volatile(),
  baseURL: z.string()
    .pattern(/^https:\/\/api\.bocha(?:ai\.com|\.cn)\/v1\/web-search$/)
    .default(BOCHA_DEFAULT_BASE_URL)
    .volatile(),
  freshness: z.string()
    .pattern(/^(?:noLimit|day|week|month|year|oneDay|oneWeek|oneMonth|oneYear|\d{4}-\d{2}-\d{2}(?:\.\.\d{4}-\d{2}-\d{2})?)$/)
    .default(BOCHA_DEFAULT_FRESHNESS)
    .volatile(),
  count: z.number().step(1).min(1).max(BOCHA_MAX_COUNT).default(BOCHA_DEFAULT_COUNT).volatile(),
  timeoutMs: z.number().step(1).min(1000).max(60000).default(BOCHA_DEFAULT_TIMEOUT_MS).volatile()
});

export function apply(ctx, config) {
  return ctx.web.registerSearchProvider(new BochaSearchProvider(() => resolveBochaOptions(ctx, {
    apiKey: config.apiKey.get(),
    apiKeyEnv: config.apiKeyEnv.get(),
    baseURL: config.baseURL.get(),
    freshness: config.freshness.get(),
    count: config.count.get(),
    timeoutMs: config.timeoutMs.get()
  })));
}

export {
  BochaSearchProvider,
  WebError,
  BOCHA_DEFAULT_API_KEY_ENV,
  BOCHA_DEFAULT_BASE_URL,
  BOCHA_DEFAULT_COUNT,
  BOCHA_DEFAULT_FRESHNESS,
  BOCHA_DEFAULT_TIMEOUT_MS,
  BOCHA_MAX_COUNT,
  BOCHA_PROVIDER_ID,
  isValidBaseURL,
  isValidFreshness,
  mapBochaResponse,
  resolveBochaOptions
};

import z from "@deepseek-ai/schemastery";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { WebError } from "@deepseek-ai/dsh-web";
import {
  DeepSeekSearchProvider,
  DEEPSEEK_DEFAULT_API_VERSION,
  DEEPSEEK_DEFAULT_BASE_URL,
  DEEPSEEK_DEFAULT_MAX_TOKENS,
  DEEPSEEK_DEFAULT_MAX_USES,
  DEEPSEEK_DEFAULT_MODEL
} from "@deepseek-ai/dsh-web-search-deepseek";
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
  // DSH settings forms edit volatile fields and persist accepted values to the profile patch.
  searchEngine: z.union(["bocha", "deepseek-official"]).default("bocha").volatile(),
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

const DEEPSEEK_API_KEY_ENV = credentialRef("DEEPSEEK_API_KEY");
const DEEPSEEK_SEARCH_BASE_URL_ENV = "DEEPSEEK_SEARCH_BASE_URL";
const DEEPSEEK_ACCOUNT_PROVIDER = "deepseek-account";

function resolveDeepSeekOptions(ctx) {
  const environment = launchEnvironmentOf(ctx);
  return {
    resolveAccountToken: async (endpoint) => {
      const provider = ctx.get("agents")?.currentInitiator()?.session.requestContext()?.provider;
      if (provider !== DEEPSEEK_ACCOUNT_PROVIDER) return undefined;
      return await ctx.get("deepseekAccount")?.resolveToken(endpoint);
    },
    resolveApiKey: async () => {
      const credentials = ctx.get("credentials");
      if (credentials !== undefined) return (await credentials.resolve(DEEPSEEK_API_KEY_ENV))?.value;
      const ambient = environment.get(DEEPSEEK_API_KEY_ENV);
      return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined;
    },
    apiKeyEnv: DEEPSEEK_API_KEY_ENV,
    baseURL: environment.get(DEEPSEEK_SEARCH_BASE_URL_ENV)?.value ?? DEEPSEEK_DEFAULT_BASE_URL,
    model: DEEPSEEK_DEFAULT_MODEL,
    apiVersion: DEEPSEEK_DEFAULT_API_VERSION,
    maxTokens: DEEPSEEK_DEFAULT_MAX_TOKENS,
    maxUses: DEEPSEEK_DEFAULT_MAX_USES,
    recordRequest: (request) => {
      ctx.get("agents")?.currentInitiator()?.session.append("web/deepseek-search-llm-request", request);
    }
  };
}

export function apply(ctx, config) {
  const bochaProvider = new BochaSearchProvider(() => resolveBochaOptions(ctx, {
    apiKey: config.apiKey.get(),
    apiKeyEnv: config.apiKeyEnv.get(),
    baseURL: config.baseURL.get(),
    freshness: config.freshness.get(),
    count: config.count.get(),
    timeoutMs: config.timeoutMs.get()
  }));
  const deepseekProvider = new DeepSeekSearchProvider(() => resolveDeepSeekOptions(ctx));
  const selectedEngine = () => config.searchEngine?.get() === "deepseek-official" ? "deepseek-official" : "bocha";
  const providerFor = (engine) => engine === "deepseek-official" ? deepseekProvider : bochaProvider;

  return ctx.web.registerSearchProvider({
    id: BOCHA_PROVIDER_ID,
    available: () => providerFor(selectedEngine()).available(),
    search: async (request, signal) => {
      const engine = selectedEngine();
      const result = await providerFor(engine).search(request, signal);
      const vendor = engine === "deepseek-official" ? "DeepSeek (deepseek-official)" : "Bocha (bocha)";
      const marker = `Search provider: ${vendor}.`;
      const content = typeof result.content === "string" ? result.content.trim() : "";
      return {
        ...result,
        content: content.length > 0 ? `${marker}\n\n${content}` : marker
      };
    }
  });
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

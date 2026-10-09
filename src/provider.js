import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { WebError } from "@deepseek-ai/dsh-web";

export const BOCHA_PROVIDER_ID = "bocha";
export const BOCHA_DEFAULT_BASE_URL = "https://api.bochaai.com/v1/web-search";
export const BOCHA_DEFAULT_API_KEY_ENV = "BOCHA_API_KEY";
export const BOCHA_DEFAULT_FRESHNESS = "noLimit";
export const BOCHA_DEFAULT_COUNT = 10;
export const BOCHA_DEFAULT_TIMEOUT_MS = 15000;
export const BOCHA_MAX_COUNT = 50;

const BOCHA_HOSTS = new Set(["api.bochaai.com", "api.bocha.cn"]);

export function isValidBaseURL(value) {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" && BOCHA_HOSTS.has(parsed.hostname) && parsed.pathname.endsWith("/v1/web-search");
  } catch (_error) {
    return false;
  }
}

export function isValidFreshness(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;
  if (["noLimit", "day", "week", "month", "year", "oneDay", "oneWeek", "oneMonth", "oneYear"].includes(value)) return true;
  return /^\d{4}-\d{2}-\d{2}(\.\.\d{4}-\d{2}-\d{2})?$/.test(value);
}

function positiveInteger(value, fallback, minimum, maximum) {
  return Number.isInteger(value) && value >= minimum && value <= maximum ? value : fallback;
}

function webFailure(message, code, cause) {
  return new WebError(message, code, cause === undefined ? undefined : { cause });
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw webFailure("Bocha search aborted", "WEB_ABORTED", signal.reason);
}

function isAbortError(error) {
  return error instanceof DOMException && error.name === "AbortError";
}

function citationSource(item) {
  if (item === null || typeof item !== "object" || typeof item.url !== "string" || item.url.length === 0) return undefined;
  const title = typeof item.name === "string" && item.name.length > 0 ? item.name : undefined;
  const snippetValue = typeof item.summary === "string" && item.summary.length > 0 ? item.summary : item.snippet;
  const snippet = typeof snippetValue === "string" && snippetValue.length > 0 ? snippetValue : undefined;
  const publishedAt = typeof item.datePublished === "string" && item.datePublished.length > 0 ? item.datePublished : undefined;
  return {
    url: item.url,
    ...(title === undefined ? {} : { title }),
    ...(snippet === undefined ? {} : { snippet }),
    ...(publishedAt === undefined ? {} : { publishedAt })
  };
}

export function mapBochaResponse(response, maxResults) {
  const code = response?.code;
  if (code !== undefined && code !== null) {
    const numericCode = Number(code);
    if (numericCode !== 0 && numericCode !== 200) {
      const detail = response.msg ?? response.message ?? `HTTP/API code ${String(code)}`;
      throw webFailure(`Bocha API error: ${String(detail)}`, "WEB_PROVIDER_ERROR");
    }
  }
  const values = response?.data?.webPages?.value;
  if (!Array.isArray(values)) throw webFailure("Bocha returned no data.webPages.value results", "WEB_PROVIDER_ERROR");
  const seen = new Set();
  const sources = [];
  for (const item of values) {
    const source = citationSource(item);
    if (source === undefined || seen.has(source.url)) continue;
    seen.add(source.url);
    sources.push(source);
  }
  const limit = maxResults === undefined ? sources.length : Math.max(0, Math.trunc(maxResults));
  return {
    sources: sources.slice(0, limit),
    truncated: sources.length > limit
  };
}

export class BochaSearchProvider {
  id = BOCHA_PROVIDER_ID;

  constructor(resolveOptions) {
    this.resolveOptions = resolveOptions;
  }

  available() {
    const options = this.resolveOptions();
    return (options.apiKey?.length > 0 || options.resolveApiKey !== undefined)
      && isValidBaseURL(options.baseURL)
      && Number.isInteger(options.count)
      && options.count > 0
      && Number.isInteger(options.timeoutMs)
      && options.timeoutMs > 0;
  }

  async search(request, signal) {
    const options = this.resolveOptions();
    const apiKey = await this.resolveApiKey(options, signal);
    throwIfAborted(signal);
    const query = typeof request?.query === "string" ? request.query.trim() : "";
    if (query.length === 0) throw webFailure("Bocha search query must not be empty", "WEB_PROVIDER_ERROR");
    const maxResults = request?.maxResults === undefined ? options.count : Math.min(options.count, Math.max(1, Math.trunc(request.maxResults)));
    const body = {
      query,
      summary: true,
      freshness: options.freshness,
      count: Math.min(BOCHA_MAX_COUNT, maxResults)
    };
    let response;
    try {
      response = await fetch(options.baseURL, {
        method: "POST",
        redirect: "error",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          accept: "application/json",
          "user-agent": "dsh-web-search-bocha/0.1.0"
        },
        body: JSON.stringify(body),
        ...(signal === undefined ? {} : { signal })
      });
    } catch (error) {
      if (signal?.aborted || isAbortError(error)) throw webFailure("Bocha search aborted", "WEB_ABORTED", error);
      throw webFailure(`Bocha search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", error);
    }
    if (!response.ok) {
      let detail = `Bocha API error (HTTP ${response.status})`;
      try {
        const errorBody = await response.json();
        detail = errorBody?.msg ?? errorBody?.message ?? errorBody?.error?.message ?? detail;
      } catch (error) {
        if (signal?.aborted || isAbortError(error)) throw webFailure("Bocha search aborted", "WEB_ABORTED", error);
      }
      throw webFailure(String(detail), "WEB_PROVIDER_ERROR");
    }
    let parsed;
    try {
      parsed = await response.json();
    } catch (error) {
      if (signal?.aborted || isAbortError(error)) throw webFailure("Bocha search aborted", "WEB_ABORTED", error);
      throw webFailure(`Bocha returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", error);
    }
    return mapBochaResponse(parsed, maxResults);
  }

  async resolveApiKey(options, signal) {
    throwIfAborted(signal);
    if (options.apiKey !== undefined && options.apiKey.length > 0) return options.apiKey;
    let resolved;
    try {
      resolved = await options.resolveApiKey?.();
    } catch (error) {
      throw webFailure(`Bocha search credential resolution failed: ${String(error)}`, "WEB_PROVIDER_ERROR", error);
    }
    throwIfAborted(signal);
    if (resolved !== undefined && resolved.length > 0) return resolved;
    throw webFailure(`Bocha search has no API key for "${String(options.apiKeyEnv)}"; store it through the credentials service or launching environment`, "WEB_PROVIDER_CREDENTIAL_MISSING");
  }
}

export function resolveBochaOptions(ctx, config) {
  const apiKeyEnv = credentialRef(config.apiKeyEnv ?? BOCHA_DEFAULT_API_KEY_ENV);
  const literalApiKey = typeof config.apiKey === "string" && config.apiKey.length > 0 ? config.apiKey : undefined;
  return {
    ...(literalApiKey === undefined ? {} : { apiKey: literalApiKey }),
    apiKeyEnv,
    baseURL: config.baseURL ?? BOCHA_DEFAULT_BASE_URL,
    freshness: isValidFreshness(config.freshness) ? config.freshness : BOCHA_DEFAULT_FRESHNESS,
    count: positiveInteger(config.count, BOCHA_DEFAULT_COUNT, 1, BOCHA_MAX_COUNT),
    timeoutMs: positiveInteger(config.timeoutMs, BOCHA_DEFAULT_TIMEOUT_MS, 1000, 60000),
    resolveApiKey: async () => {
      const credentials = ctx.get("credentials");
      if (credentials !== undefined) return (await credentials.resolve(apiKeyEnv))?.value;
      const ambient = launchEnvironmentOf(ctx).get(apiKeyEnv);
      return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined;
    }
  };
}

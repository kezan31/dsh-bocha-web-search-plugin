# Bocha Web Search for DSH

[简体中文](README.md) | [English](README.en.md)

A Cordis bundle that provides web search through DeepSeek Harness (DSH)'s `ctx.web` capability. This is version **0.2.2**, targeting DSH `0.2.0-rc.2` and Cordis `~4.0.4`.

## Features

- Routes DSH's fixed web provider ID, `bocha`, to Bocha or DSH's official DeepSeek search provider.
- Lets you select the search engine in DSH Settings. Fresh installations default to Bocha, and the selection is saved in the current Profile.
- Labels each successful result with the provider actually used: `Search provider: Bocha (bocha).` or `Search provider: DeepSeek (deepseek-official).`
- Exposes Bocha API key and search settings directly on the **Bocha Web Search** bundle details page; no separate plugin-row configuration page is required.
- Stores the API key through DSH's credentials service instead of writing it to Profile configuration.
- Reuses DSH's built-in DeepSeek search provider and does not disable the official DeepSeek plugin.

## Install and first use

This is a DSH bundle targeting DSH `0.2.0-rc.2` and Cordis `~4.0.4`. Install the DSH CLI first. After the package is published to npm, install it into the Profile that will run DSH:

```sh
dsh plugin --profile my-profile add dsh-bocha-web-search-plugin
```

Replace `my-profile` with your Profile name. This DSH command installs the npm package and adds the bundle to that Profile; running `npm install` in an unrelated project does not register a bundle with DSH. See the [official DSH plugin-install guide](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish).

Then complete the first-use steps:

1. Start or restart the DSH Web UI with the same Profile and confirm **Bocha Web Search** is enabled on the **Plugins** page.
2. Save your Bocha API key on the bundle details page (see the next section); create/get a key from the [Bocha Open Platform](https://open.bochaai.com/). DSH stores it in its credentials store.
3. Go to **Settings → General Settings → Search Engine** and select **Bocha**.
4. In a new conversation, try “Search for today's AI news and cite the sources.” and confirm the result includes `Search provider: Bocha (bocha).`.

Example of the enabled bundle in the Plugins list:

![Bocha Web Search enabled in the DSH plugin list](docs/bocha插件开启.jpg)

## Configure Bocha

1. Open the **Bocha Web Search** bundle from the plugin list.
2. Enter and save your Bocha API key on the bundle details page. DSH stores it in its credentials store, not in a configuration file.
3. Adjust the endpoint, freshness, maximum result count, and request timeout as needed.

Bundle configuration example:

![Bocha Web Search bundle configuration page](docs/bocha插件配置.jpg)

The screenshots use the Chinese DSH interface. Default Bocha settings:

| Setting | Default | Description |
| --- | --- | --- |
| API key reference | `BOCHA_API_KEY` | Resolved through DSH credentials |
| Endpoint | `https://api.bochaai.com/v1/web-search` | Bocha Web Search API |
| Freshness | `noLimit` | No time limit; API-supported date ranges may also be used |
| Maximum results | `10` | Maximum number of results per search |
| Request timeout | `15000` ms | Bocha request timeout |

## Use DeepSeek search

Select **DeepSeek** as the search engine in DSH Settings to route searches through DSH's built-in DeepSeek search provider. This route uses DSH's standard `DEEPSEEK_API_KEY` credential reference, account-token path, and optional `DEEPSEEK_SEARCH_BASE_URL` launch-environment override. Keep DSH's built-in DeepSeek search plugin enabled. Custom settings configured only on that plugin's separate row are not mirrored by this router.

Switch between Bocha and DeepSeek under **Settings → General Settings → Search Engine**:

![Switching the web search provider in DSH Settings](docs/bocha插件切换搜索来源.jpeg)

## Result labels

When the model calls DSH's `web_search` tool, successful results include the actual search provider before `Sources:`. For example:

```text
Search provider: Bocha (bocha).
```

or:

```text
Search provider: DeepSeek (deepseek-official).
```

The label identifies the route used for that request; it does not change the DSH `web_search` tool name or source-list format.

## Roadmap / TODO

- [ ] Extend this integration to cover Bocha's full search API set, using the [official API documentation](https://aq6ky2b8nql.feishu.cn/wiki/HmtOw1z6vik14Fkdu5uc9VaInBb):
  - **Web Search API (`bocha-web-search`)**: natural-language queries, time/site filters, and summaries; returns page titles, URLs, snippets, summaries, site metadata, publication time, and images (the platform overview also advertises video search).
  - **AI Search API (`bocha-ai-search`)**: `answer` and `stream` control generated summaries and streaming; results include pages, images, specialist modality cards (e.g. weather, encyclopedia, medical, rail, currency, and stocks), and follow-up questions.
  - **Agent Search API (`bocha-agent-search`)**: specialist-agent search, in-depth answers, and follow-up questions.
  - **Semantic Reranker API**: semantic document ranking and scores.
- [ ] Add per-API configuration, credentials, routing, normalized results, and tests; verify parameters, permissions, and billing in the account-gated docs first.
- This plugin currently implements only Web Search API; AI Search, Agent Search, and Semantic Reranker are not implemented.

## Search and related API prices (normalized)

> Common basis: **CNY per 1,000 API calls**, averaged per call; snapshot date **2026-10-11**. USD prices use the 2026-10-09 reference rate **USD 1 = CNY 6.7330**, rounded to two decimals ([rate report](https://www.sohu.com/a/1086126179_122014422)). Show a range where package, peak/off-peak, or search depth changes.

| API | Normalized price (CNY / 1,000 calls) | Pricing basis / notes |
| --- | ---: | --- |
| **Bocha Web Search** | **¥3.60–¥36** | Paid resource-package average; pay-as-you-go is ¥36/1,000 calls. Includes a 1,000-call free trial (3 months); bulk tiers decrease to ¥32/¥30/¥28/¥25 per 1,000 calls. [Bocha price list](https://aq6ky2b8nql.feishu.cn/wiki/JYSbwzdPIiFnz4kDYPXcHSDrnZb) |
| **Bocha AI Search** | **¥60** | Pay-as-you-go is ¥0.060/call; all listed resource packages are ¥60 per 1,000 calls, valid for 1 year. [Bocha price list](https://aq6ky2b8nql.feishu.cn/wiki/JYSbwzdPIiFnz4kDYPXcHSDrnZb) |
| **Bocha GTE Reranker** | **¥5** | `gte-rerank` is ¥0.005/call, billed since 2025-11-01; this is a reranking call, not a search request. [Bocha price list](https://aq6ky2b8nql.feishu.cn/wiki/JYSbwzdPIiFnz4kDYPXcHSDrnZb) |
| **DeepSeek native search (estimate)** | **¥5.05–¥10.10** | Assumes 1,000 uncached input tokens + 1,000 output tokens per search; the range reflects off-peak/peak API-key rates. Actual usage varies with token count. [Official pricing](https://api-docs.deepseek.com/quick_start/pricing) |
| **Brave Search** | **¥33.67** | Fixed rate of $5 per 1,000 requests, converted at the rate above; includes $5 in monthly credits. [Official pricing](https://brave.com/search/api/) |
| **Tavily Search** | **¥53.86–¥107.73** | Pay-as-you-go range: Basic uses 1 credit, Advanced 2, at $0.008/credit. Monthly plans are about ¥33.67–¥50.50 (Basic) and ¥67.33–¥101.00 (Advanced); free tier provides 1,000 credits/month. [Credits and pricing](https://docs.tavily.com/documentation/api-credits.md), [official pricing](https://www.tavily.com/pricing) |

Prices and package terms may change; verify them on the [Bocha price list](https://aq6ky2b8nql.feishu.cn/wiki/JYSbwzdPIiFnz4kDYPXcHSDrnZb) and provider pricing pages.

## Development and tests

```sh
npm install
npm test
```

`npm test` builds the browser module, checks JavaScript syntax, and exercises provider routing, credential resolution, and response handling. Tests use controlled responses and do not replace a live API verification.

- [Production composition patch](cordis.patch.yml)
- [Standalone composition example](composition.example.yml)
- `src/index.js`, `src/provider.js`: Host provider and routing implementation
- `src/client.js`: Settings and bundle configuration UI
- `docs/`: screenshots for enabling and configuring the plugin

## Project statement, license, and thanks

This repository is independently developed and maintained by an individual; it is not an official Bocha AI, DeepSeek, or DSH project. When Bocha is selected, search requests go to the Bocha-provided API; use is subject to Bocha's terms of service, privacy policy, and quotas. The repository source code is licensed under the MIT License (see the `license` field in [`package.json`](package.json)). Bocha, DeepSeek, and DSH names and trademarks belong to their respective owners. Do not commit API keys, Profile data, or `node_modules`.

Thanks to **DeepSeek Harness (DSH)** for the plugin runtime and web-search extension points, and to **Bocha** for providing the search service and API.

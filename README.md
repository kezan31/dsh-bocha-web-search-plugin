# Bocha Web Search for DSH

A Cordis bundle providing Bocha AI web search through DSH's `ctx.web` capability. This release targets DSH `0.2.0-rc.2` and Cordis `~4.0.4`.

## Features

- Routes the fixed `bocha` web-provider id to Bocha or the exported DSH DeepSeek search provider, reading the choice for every search.
- Adds a localized Bocha/DeepSeek selector to General Settings; the profile-persisted choice defaults to Bocha on fresh installation.
- Keeps the shipped `web-search-deepseek` plugin active and uses its exported provider implementation for DeepSeek searches.
- Resolves Bocha and DeepSeek credentials through DSH's credentials service, with launch-environment fallback when that service is unavailable.
- Applies the configured Bocha request timeout and normalizes both providers to DSH web-search results.
- Labels each successful search result with the provider actually used: Bocha or DeepSeek.
- Shows a localized Bocha configuration form directly on the bundle page through `plugins.bundle.config`, avoiding a separate row-level Configure page.
- Stores the Bocha API key in DSH credentials rather than the profile configuration.
- Uses DeepSeek's standard `DEEPSEEK_API_KEY` credential reference, account-token route, and optional `DEEPSEEK_SEARCH_BASE_URL` launch-environment override. Custom values configured only on the separate DeepSeek plugin row are not mirrored by this router.

The bundle patch selects the Bocha router as the web seam's fixed provider and inserts the plugin row. The General Settings choice then routes each request inside this plugin, without changing DSH source. See [`cordis.patch.yml`](cordis.patch.yml) and [`composition.example.yml`](composition.example.yml).

## Configure Bocha

Open **Plugins** and select the **Bocha Web Search** bundle. Its page shows the Bocha configuration form directly, with no need to open a separate `web-search-bocha` row. Set the API key, endpoint, freshness, maximum results, and timeout there. The API key is stored through DSH credentials, not in profile configuration. The General Settings row is reserved for choosing Bocha or DeepSeek.

## Development

```sh
npm install
npm test
```

`npm test` rebuilds the browser module, runs JavaScript syntax checks, and exercises Bocha/DeepSeek routing, credential resolution, and provider response tests with controlled responses.

## Layout

- `src/index.js` and `src/provider.js`: Host plugin and provider source.
- `src/client.js`: localized Client configuration page.
- `scripts/build-client.mjs`: emits the DSH lazy Client module wrapper.
- `lib/`: package runtime entry points.
- `locale/`: Plugin Manager display metadata.
- `fixtures/` and `test/`: response fixtures and provider tests.

Do not commit API keys, profile data, or `node_modules/`.

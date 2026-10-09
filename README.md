# Bocha Web Search for DSH

A Cordis bundle providing Bocha AI web search through DSH's `ctx.web` capability. This release targets DSH `0.2.0-rc.2` and Cordis `~4.0.4`.

## Features

- Registers the Bocha provider as `bocha` and validates the official HTTPS endpoints.
- Resolves `BOCHA_API_KEY` through DSH's credentials service, with launch-environment fallback when that service is unavailable.
- Applies the configured request timeout and normalizes Bocha responses to DSH web-search results.
- Adds a localized configuration page to the bundle row through the current `plugins.row.config` slot.
- Stores the API key in DSH credentials rather than the profile configuration.

The bundle patch selects Bocha as the web search provider and inserts the plugin row. See [`cordis.patch.yml`](cordis.patch.yml) and [`composition.example.yml`](composition.example.yml).

## Development

```sh
npm install
npm test
```

`npm test` rebuilds the browser module, runs JavaScript syntax checks, and exercises the static provider response tests.

## Layout

- `src/index.js` and `src/provider.js`: Host plugin and provider source.
- `src/client.js`: localized Client configuration page.
- `scripts/build-client.mjs`: emits the DSH lazy Client module wrapper.
- `lib/`: package runtime entry points.
- `locale/`: Plugin Manager display metadata.
- `fixtures/` and `test/`: response fixtures and provider tests.

Do not commit API keys, profile data, or `node_modules/`.

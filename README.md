# dsh-web-search-bocha

Production-oriented Bocha Web Search provider for DeepSeek Harness.

This package is the production replacement for the dynamic test adapter. It is source-persisted outside the deployed DSH installation and is linked into the user-owned `web` profile at `$DSH_HOME/profiles/web/node_modules/dsh-web-search-bocha`. The profile composition is mounted and has been externally reloaded successfully.

## Production differences

- Uses Node's native `fetch` instead of shell/PowerShell, so it does not depend on the Windows ACL sandbox runner.
- Uses `redirect: "error"` so the Bocha credential cannot follow an HTTP redirect.
- Throws DSH `WebError` with `WEB_PROVIDER_*` codes.
- Registers the durable `web-search-bocha` Settings namespace through `installSettingsSection`.
- Resolves `BOCHA_API_KEY` per request through the credentials service, with launching-environment fallback when the credentials service is absent.
- Validates official `api.bochaai.com` and `api.bocha.cn` HTTPS endpoints.
- Ships a Client settings card under the existing Plugins → Plugin configuration ledger using key `web-search-bocha`.
- Reuses the existing DSH `web_search` tool and web result card through the normalized `WebSearchResult` seam.

## Composition

See `composition.example.yml`. In a copied/local composition, select `searchProvider: bocha`, mount this package, and remove or disable the DeepSeek search provider row to avoid multiple usable providers.

The package does not put a secret in composition. Store the `BOCHA_API_KEY` reference through the existing DSH credentials UI/credentials service.

## Layout

- `src/provider.js`: native HTTP provider, WebError mapping, response mapper.
- `src/index.js`: Host plugin, Config schema, Settings namespace.
- `src/client.js`: source Client settings card.
- `lib/provider.js`: bundled production provider entry.
- `lib/index.js`: production Host entry.
- `lib/client.js`: browser lazy-CJS entry for the DSH client module loader.
- `test/provider-static.cjs`: dependency-light mapper tests.
- `fixtures/`: Bocha success/error response fixtures.

## Verification

```text
node --check src/provider.js
node --check src/index.js
node --check src/client.js
node --check lib/provider.js
node --check lib/index.js
node --check lib/client.js
node test/provider-static.cjs
```

Before publishing to a registry, rebuild the browser entry with the repository's normal client bundler and run the package/integration tests from the actual DeepSeek Harness source checkout. The current user profile now links this prepared package for verification; the shipped global DSH installation was not modified.

## References

- https://github.com/Bocha-Labs/bocha-search-mcp
- https://github.com/BochaAI/bocha-search-mcp
- https://raw.githubusercontent.com/1c7/bocha-search/main/docs/web-search.md

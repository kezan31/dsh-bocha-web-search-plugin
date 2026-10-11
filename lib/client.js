window.__ModuleLoader__.load({
  id: "dsh-bocha-web-search-plugin",
  factory: (require) => {
    const module = { exports: {} };
    const reactModule = require("react");
    const React = reactModule.default ?? reactModule;

    const PACKAGE_NAME = "dsh-bocha-web-search-plugin";
    const BUNDLE_CONFIG_KEY = PACKAGE_NAME;
    const LOCALE_NAMESPACE = "webSearchBocha";
    const DEFAULT_API_KEY_REF = "BOCHA_API_KEY";
    const DEFAULT_BASE_URL = "https://api.bochaai.com/v1/web-search";
    const DEFAULT_FRESHNESS = "noLimit";
    const DEFAULT_COUNT = 10;
    const DEFAULT_TIMEOUT_MS = 15000;

    const CSS = `
    .bocha-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:16px;color:var(--dsw-alias-label-primary)}
    .bocha-card-title{font-size:15px;font-weight:600;line-height:1.4;margin:0}
    .bocha-card-description{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.5;margin:4px 0 14px}
    .bocha-section{border-top:1px solid var(--dsw-alias-border-l2);padding-top:14px;margin-top:14px}
    .bocha-field{display:flex;flex-direction:column;gap:6px;padding:8px 0}
    .bocha-label{font-size:13px;font-weight:500;line-height:1.5}
    .bocha-input{box-sizing:border-box;width:100%;height:36px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 11px;font:inherit;font-size:13px}
    .bocha-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}
    .bocha-input:disabled{color:var(--dsw-alias-label-secondary);cursor:default}
    .bocha-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5;margin:0}
    .bocha-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px}
    .bocha-status{font-size:12px;line-height:1.5;margin:8px 0 0}
    .bocha-status-error{color:var(--dsw-alias-state-error-primary)}
    .bocha-status-success{color:var(--dsw-alias-state-success-primary)}
    .bocha-badge{align-self:flex-start;border-radius:999px;padding:2px 9px;font-size:11px;line-height:17px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
    .bocha-button{appearance:none;cursor:pointer;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:7px 14px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
    .bocha-button:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
    .bocha-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
    .bocha-button:disabled{opacity:.55;cursor:default}
    .bocha-button-primary{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}
    .bocha-button-primary:hover:not(:disabled){filter:brightness(.96)}
    .bocha-engine-settings{color:var(--dsw-alias-label-primary)}
    .bocha-engine-settings .bocha-card-title{font-size:14px;font-weight:400;line-height:20px}
    .bocha-engine-settings .bocha-card-description{font-size:12px;line-height:18px;margin:4px 0 0}
    .bocha-engine-row{border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0}
    .bocha-engine-copy{min-width:0}
    .bocha-engine-select{min-width:160px}
    @media(max-width:520px){.bocha-card{padding:12px}.bocha-actions{flex-wrap:wrap}.bocha-engine-row{align-items:stretch;flex-direction:column}.bocha-engine-select{width:100%}}
    `;

    const en = {
      title: "Bocha Web Search",
      description: "Configure Bocha search settings and its API key.",
      endpoint: "Endpoint",
      endpointHint: "Use the official Bocha endpoint. Reset restores the profile default.",
      freshness: "Freshness",
      freshnessHint: "Use noLimit, a supported period, or a YYYY-MM-DD date range.",
      count: "Maximum results",
      timeout: "Request timeout (ms)",
      apiKey: "API key",
      apiKeyHint: "Stored in DSH credentials, not in the profile configuration.",
      apiKeyReference: "Credential reference",
      configured: "Configured",
      notConfigured: "Not configured",
      credentialReadFailed: "Credential status could not be read.",
      readOnlyCredential: "The active credential source is read-only.",
      settingsReadOnly: "This profile does not allow configuration changes.",
      loading: "Loading configuration…",
      unavailable: "Configuration is not available for this plugin.",
      save: "Save settings",
      saveKey: "Save API key",
      clearKey: "Remove stored key",
      reset: "Reset endpoint",
      saving: "Saving…",
      saved: "Saved.",
      saveFailed: "DSH did not accept the changes.",
      keyRequired: "Enter an API key first.",
      invalidEndpoint: "Enter a valid official Bocha HTTPS endpoint.",
      invalidFreshness: "Enter a supported freshness value.",
      invalidCount: "Maximum results must be an integer from 1 to 50.",
      invalidTimeout: "Timeout must be an integer from 1000 to 60000 ms.",
      summary: "Configure the Bocha API key and search options directly on this bundle's page.",
      searchEngineTitle: "Search engine",
      searchEngineDescription: "Choose which backend the web_search tool uses. Your choice is saved to this profile and used for later searches.",
      searchEngineLabel: "Search engine",
      bochaEngine: "Bocha",
      deepseekEngine: "DeepSeek",
      engineSaved: "Search engine saved.",
      engineSaveFailed: "DSH did not accept the search engine change."
    };

    const zh = {
      title: "博查网页搜索",
      description: "配置博查搜索参数和 API Key。",
      endpoint: "接口地址",
      endpointHint: "仅支持博查官方接口；重置将恢复配置文件中的默认值。",
      freshness: "时间范围",
      freshnessHint: "可用 noLimit、支持的周期，或 YYYY-MM-DD 日期范围。",
      count: "最多返回结果数",
      timeout: "请求超时（毫秒）",
      apiKey: "API Key",
      apiKeyHint: "密钥存储在 DSH 凭据库中，不写入配置文件。",
      apiKeyReference: "凭据引用",
      configured: "已配置",
      notConfigured: "未配置",
      credentialReadFailed: "无法读取凭据状态。",
      readOnlyCredential: "当前凭据来源为只读。",
      settingsReadOnly: "此配置文件不允许修改设置。",
      loading: "正在加载配置…",
      unavailable: "当前无法读取此插件的配置。",
      save: "保存设置",
      saveKey: "保存 API Key",
      clearKey: "删除已保存的密钥",
      reset: "重置接口地址",
      saving: "保存中…",
      saved: "已保存。",
      saveFailed: "DSH 未接受这些修改。",
      keyRequired: "请先输入 API Key。",
      invalidEndpoint: "请输入有效的博查官方 HTTPS 接口地址。",
      invalidFreshness: "请输入支持的时间范围。",
      invalidCount: "结果数必须是 1 到 50 之间的整数。",
      invalidTimeout: "超时时间必须是 1000 到 60000 毫秒之间的整数。",
      summary: "可在此组合包页面直接配置博查 API Key 和搜索参数。",
      searchEngineTitle: "搜索引擎",
      searchEngineDescription: "选择 web_search 使用的后端；该选择将保存到当前配置文件，并用于后续搜索。",
      searchEngineLabel: "搜索引擎",
      bochaEngine: "博查",
      deepseekEngine: "DeepSeek",
      engineSaved: "搜索引擎已保存。",
      engineSaveFailed: "DSH 未接受搜索引擎修改。"
    };

    function fieldValue(state, field, fallback) {
      const value = state?.value?.[field];
      return value === undefined || value === null ? fallback : value;
    }

    function draftFrom(state) {
      return {
        baseURL: String(fieldValue(state, "baseURL", DEFAULT_BASE_URL)),
        freshness: String(fieldValue(state, "freshness", DEFAULT_FRESHNESS)),
        count: String(fieldValue(state, "count", DEFAULT_COUNT)),
        timeoutMs: String(fieldValue(state, "timeoutMs", DEFAULT_TIMEOUT_MS))
      };
    }

    function responseError(response, fallback) {
      return response?.error?.message ?? fallback;
    }

    function validBaseURL(value) {
      try {
        const normalized = value.trim();
        const parsed = new URL(normalized);
        return parsed.protocol === "https:"
          && ["api.bochaai.com", "api.bocha.cn"].includes(parsed.hostname)
          && parsed.pathname === "/v1/web-search"
          && parsed.port.length === 0
          && parsed.username.length === 0
          && parsed.password.length === 0
          && parsed.search.length === 0
          && parsed.hash.length === 0
          && parsed.href === normalized;
      } catch (_error) {
        return false;
      }
    }

    function validFreshness(value) {
      return ["noLimit", "day", "week", "month", "year", "oneDay", "oneWeek", "oneMonth", "oneYear"].includes(value)
        || /^\d{4}-\d{2}-\d{2}(\.\.\d{4}-\d{2}-\d{2})?$/.test(value);
    }

    function BochaConfig({ view, form, remote, t }) {
      const h = React.createElement;
      const subscribe = React.useCallback((listener) => (
        typeof form?.subscribe === "function" ? form.subscribe(listener) : () => {}
      ), [form]);
      const getSnapshot = React.useCallback(() => (
        typeof form?.getSnapshot === "function" ? form.getSnapshot() : form?.state
      ), [form]);
      const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      const revision = state?.revision;
      const [draft, setDraft] = React.useState(() => draftFrom(state));
      const [apiKey, setApiKey] = React.useState("");
      const [credential, setCredential] = React.useState({ loading: true, configured: false, writable: false });
      const [credentialRevision, setCredentialRevision] = React.useState(0);
      const [busy, setBusy] = React.useState(false);
      const [message, setMessage] = React.useState("");
      const [error, setError] = React.useState("");
      const ref = String(fieldValue(state, "apiKeyEnv", DEFAULT_API_KEY_REF) || DEFAULT_API_KEY_REF);

      React.useEffect(() => {
        setDraft(draftFrom(state));
        setMessage("");
        setError("");
      }, [revision]);

      React.useEffect(() => {
        if (view !== "page") return undefined;
        let active = true;
        setCredential({ loading: true, configured: false, writable: false });
        remote.credentials.describe([ref]).then((response) => {
          if (!response.ok) throw new Error(responseError(response, t("credentialReadFailed")));
          const info = response.value?.[ref];
          if (active) {
            setCredential({
              loading: false,
              configured: info?.configured === true,
              writable: info?.writable ?? true
            });
          }
        }).catch((reason) => {
          if (active) {
            setCredential({ loading: false, configured: false, writable: false });
            setError(String(reason?.message ?? reason));
          }
        });
        return () => {
          active = false;
        };
      }, [view, remote, ref, credentialRevision]);

      React.useEffect(() => {
        if (view !== "page" || typeof remote?.$on !== "function") return undefined;
        return remote.$on("credentials/reference-updated", (changedRef) => {
          if (changedRef === ref) setCredentialRevision((current) => current + 1);
        });
      }, [view, remote, ref]);

      if (view === "summary") return h("span", null, t("summary"));

      const settingsWritable = state?.status === "ready" && state.writable === true;
      const credentialWritable = credential.loading === false && credential.writable === true;

      async function saveSettings() {
        if (!form || !settingsWritable) return;
        const baseURL = draft.baseURL.trim();
        const freshness = draft.freshness.trim();
        const count = Number(draft.count);
        const timeoutMs = Number(draft.timeoutMs);
        if (!validBaseURL(baseURL)) return setError(t("invalidEndpoint"));
        if (!validFreshness(freshness)) return setError(t("invalidFreshness"));
        if (!Number.isInteger(count) || count < 1 || count > 50) return setError(t("invalidCount"));
        if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) return setError(t("invalidTimeout"));

        const nextValues = { baseURL, freshness, count, timeoutMs };
        const operations = Object.entries(nextValues).flatMap(([field, value]) => {
          const previous = fieldValue(state, field, undefined);
          const hasOverride = state.user !== null
            && typeof state.user === "object"
            && Object.prototype.hasOwnProperty.call(state.user, field);
          const baseValue = state.base !== null && typeof state.base === "object" ? state.base[field] : undefined;
          if (hasOverride && baseValue !== undefined && String(baseValue) === String(value)) {
            return [{ op: "unset", path: [field] }];
          }
          return String(previous) === String(value) ? [] : [{ op: "set", path: [field], value }];
        });
        if (operations.length === 0) {
          setError("");
          setMessage(t("saved"));
          return;
        }

        setBusy(true);
        setMessage("");
        setError("");
        try {
          const accepted = await form.mutate(operations, state.revision);
          if (!accepted) throw new Error(t("saveFailed"));
          setMessage(t("saved"));
        } catch (reason) {
          setError(String(reason?.message ?? reason));
        } finally {
          setBusy(false);
        }
      }

      async function resetEndpoint() {
        if (!form || !settingsWritable) return;
        setBusy(true);
        setMessage("");
        setError("");
        try {
          const accepted = await form.mutate([{ op: "unset", path: ["baseURL"] }], state.revision);
          if (!accepted) throw new Error(t("saveFailed"));
          setDraft((current) => ({ ...current, baseURL: String(state.base?.baseURL ?? DEFAULT_BASE_URL) }));
          setMessage(t("saved"));
        } catch (reason) {
          setError(String(reason?.message ?? reason));
        } finally {
          setBusy(false);
        }
      }

      async function saveApiKey() {
        const value = apiKey.trim();
        if (!value) return setError(t("keyRequired"));
        if (!credentialWritable) return;
        setBusy(true);
        setMessage("");
        setError("");
        try {
          const response = await remote.credentials.set(ref, value);
          if (!response.ok) throw new Error(responseError(response, t("saveFailed")));
          setApiKey("");
          setMessage(t("saved"));
          setCredentialRevision((current) => current + 1);
        } catch (reason) {
          setError(String(reason?.message ?? reason));
        } finally {
          setBusy(false);
        }
      }

      async function clearApiKey() {
        if (!credentialWritable || !credential.configured) return;
        setBusy(true);
        setMessage("");
        setError("");
        try {
          const response = await remote.credentials.unset(ref);
          if (!response.ok) throw new Error(responseError(response, t("saveFailed")));
          setApiKey("");
          setMessage(t("saved"));
          setCredentialRevision((current) => current + 1);
        } catch (reason) {
          setError(String(reason?.message ?? reason));
        } finally {
          setBusy(false);
        }
      }

      if (state === undefined) {
        return h("div", { className: "bocha-card" }, t("unavailable"));
      }
      if (state.status === "loading") {
        return h("div", { className: "bocha-card" }, t("loading"));
      }
      if (state.status === "unavailable") {
        return h("div", { className: "bocha-card" }, t("unavailable"));
      }

      const textInput = (field, label, value, onChange, type = "text", extra = {}) => h("label", { className: "bocha-field", key: field },
        h("span", { className: "bocha-label" }, label),
        h("input", {
          className: "bocha-input",
          type,
          value,
          disabled: !settingsWritable || busy,
          onChange: (event) => onChange(event.target.value),
          ...extra
        })
      );

      return h(React.Fragment, null,
        h("style", { "data-dsh-plugin": PACKAGE_NAME }, CSS),
        h("section", { className: "bocha-card" },
        h("h3", { className: "bocha-card-title" }, t("title")),
        h("p", { className: "bocha-card-description" }, t("description")),
        !settingsWritable ? h("p", { className: "bocha-hint" }, t("settingsReadOnly")) : null,
        h("div", { className: "bocha-field" },
          h("span", { className: "bocha-label" }, t("apiKeyReference")),
          h("span", { className: "bocha-badge" }, ref)
        ),
        h("div", { className: "bocha-field" },
          h("label", { className: "bocha-label", htmlFor: "bocha-api-key" }, t("apiKey")),
          h("input", {
            id: "bocha-api-key",
            className: "bocha-input",
            type: "password",
            autoComplete: "new-password",
            value: apiKey,
            disabled: !credentialWritable || busy,
            onChange: (event) => {
              setApiKey(event.target.value);
              setError("");
            }
          }),
          h("p", { className: "bocha-hint" }, credential.loading ? t("loading") : credential.configured ? t("configured") : t("notConfigured")),
          h("p", { className: "bocha-hint" }, t("apiKeyHint")),
          credential.loading === false && !credential.writable ? h("p", { className: "bocha-hint" }, t("readOnlyCredential")) : null,
          h("div", { className: "bocha-actions" },
            h("button", { className: "bocha-button", type: "button", disabled: busy || !credentialWritable || !credential.configured, onClick: clearApiKey }, t("clearKey")),
            h("button", { className: "bocha-button bocha-button-primary", type: "button", disabled: busy || !credentialWritable || apiKey.trim().length === 0, onClick: saveApiKey }, busy ? t("saving") : t("saveKey"))
          )
        ),
        h("div", { className: "bocha-section" },
          textInput("baseURL", t("endpoint"), draft.baseURL, (value) => setDraft((current) => ({ ...current, baseURL: value }))),
          h("p", { className: "bocha-hint" }, t("endpointHint")),
          textInput("freshness", t("freshness"), draft.freshness, (value) => setDraft((current) => ({ ...current, freshness: value }))),
          h("p", { className: "bocha-hint" }, t("freshnessHint")),
          textInput("count", t("count"), draft.count, (value) => setDraft((current) => ({ ...current, count: value })), "number", { min: 1, max: 50, step: 1 }),
          textInput("timeoutMs", t("timeout"), draft.timeoutMs, (value) => setDraft((current) => ({ ...current, timeoutMs: value })), "number", { min: 1000, max: 60000, step: 1000 }),
          h("div", { className: "bocha-actions" },
            h("button", { className: "bocha-button", type: "button", disabled: busy || !settingsWritable, onClick: resetEndpoint }, t("reset")),
            h("button", { className: "bocha-button bocha-button-primary", type: "button", disabled: busy || !settingsWritable, onClick: saveSettings }, busy ? t("saving") : t("save"))
          )
        ),
        error ? h("p", { className: "bocha-status bocha-status-error", role: "alert" }, error) : null,
        message ? h("p", { className: "bocha-status bocha-status-success", role: "status" }, message) : null
      ));
    }

    function SearchEngineRow({ form, t }) {
      const h = React.createElement;
      const [snapshot, setSnapshot] = React.useState(() => form.getSnapshot());
      const [saving, setSaving] = React.useState(false);
      const [error, setError] = React.useState("");
      const [message, setMessage] = React.useState("");

      React.useEffect(() => {
        const sync = () => setSnapshot(form.getSnapshot());
        sync();
        return form.subscribe(sync);
      }, [form]);

      const rawEngine = snapshot?.value?.searchEngine ?? snapshot?.base?.searchEngine ?? "bocha";
      const selectedEngine = rawEngine === "deepseek-official" ? "deepseek-official" : "bocha";
      const writable = snapshot?.status === "ready" && snapshot.writable;
      const disabled = !writable || saving;

      async function changeEngine(event) {
        const next = event.currentTarget.value;
        if ((next !== "bocha" && next !== "deepseek-official") || next === selectedEngine) return;
        setError("");
        setMessage("");
        setSaving(true);
        try {
          const accepted = await form.set("searchEngine", next);
          if (!accepted) throw new Error(t("engineSaveFailed"));
          setMessage(t("engineSaved"));
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause));
        } finally {
          setSaving(false);
        }
      }

      return h(React.Fragment, null,
        h("style", { "data-dsh-plugin": PACKAGE_NAME }, CSS),
        h("section", { className: "bocha-engine-settings", "aria-labelledby": "bocha-search-engine-title" },
          h("div", { className: "bocha-engine-row" },
            h("div", { className: "bocha-engine-copy" },
              h("h3", { id: "bocha-search-engine-title", className: "bocha-card-title" }, t("searchEngineTitle")),
              h("p", { className: "bocha-card-description" }, t("searchEngineDescription"))
            ),
            h("label", { className: "bocha-field", htmlFor: "bocha-search-engine" },
              h("span", { className: "bocha-label" }, t("searchEngineLabel")),
              h("select", {
                id: "bocha-search-engine",
                className: "bocha-input bocha-engine-select",
                value: selectedEngine,
                disabled,
                onChange: changeEngine
              },
              h("option", { value: "bocha" }, t("bochaEngine")),
              h("option", { value: "deepseek-official" }, t("deepseekEngine")))
            )
          ),
          !writable ? h("p", { className: "bocha-hint" }, snapshot?.status === "loading" ? t("loading") : t("settingsReadOnly")) : null,
          error ? h("p", { className: "bocha-status bocha-status-error", role: "alert" }, error) : null,
          message ? h("p", { className: "bocha-status bocha-status-success", role: "status" }, message) : null
        )
      );
    }

    const inject = ["slots", "locale", "remote", "remote.credentials", "configForms"];

    function apply(ctx) {
      const slots = ctx.slots;
      const locale = ctx.locale;
      const remote = ctx.remote;
      const configForms = ctx.configForms;
      if (slots === undefined || locale === undefined || remote === undefined || configForms === undefined) return;

      const bochaForm = configForms.get("web-search-bocha");
      ctx.effect(() => locale.register(LOCALE_NAMESPACE, { en, zh }), "dsh-bocha-web-search-plugin: locale");
      ctx.effect(() => slots.inject("plugins.bundle.config", () => slots.register({
        name: "plugins.bundle.config",
        key: BUNDLE_CONFIG_KEY,
        locale: LOCALE_NAMESPACE,
        inject: () => ({ remote, form: bochaForm })
      }, BochaConfig)), "dsh-bocha-web-search-plugin: bundle configuration");
      ctx.effect(() => configForms.whileServed(["web-search-bocha"], () => slots.inject("settings.general.item", () => slots.register({
        name: "settings.general.item",
        id: "web-search-engine",
        order: 5,
        locale: LOCALE_NAMESPACE,
        inject: () => ({ form: bochaForm })
      }, SearchEngineRow))), "dsh-bocha-web-search-plugin: general search engine setting");
    }

    Object.assign(module.exports, { apply, inject });
    return module.exports;
  }
});

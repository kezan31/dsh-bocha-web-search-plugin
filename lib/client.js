window.__ModuleLoader__.load({
  id: "dsh-web-search-bocha",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    const reactModule = require("react");
    const React = reactModule.default ?? reactModule;
    const SETTINGS_NAMESPACE = "web-search-bocha";
    const DEFAULT_API_KEY_REF = "BOCHA_API_KEY";
    const DEFAULT_BASE_URL = "https://api.bochaai.com/v1/web-search";
    const DEFAULT_FRESHNESS = "noLimit";
    const DEFAULT_COUNT = 10;
    const DEFAULT_TIMEOUT_MS = 15000;
    const CSS = ".bocha-prod-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;padding:16px;color:var(--dsw-alias-label-primary)}.bocha-prod-head{display:flex;align-items:flex-start;gap:12px}.bocha-prod-head-text{min-width:0;flex:1}.bocha-prod-title{font-size:15px;font-weight:600;line-height:1.4;margin:0}.bocha-prod-description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5;margin:4px 0 0}.bocha-prod-badge{white-space:nowrap;border-radius:999px;padding:2px 9px;font-size:11px;line-height:17px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}.bocha-prod-badge-muted{white-space:nowrap;border-radius:999px;padding:2px 9px;font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary)}.bocha-prod-fields{border-top:1px solid var(--dsw-alias-border-l2);margin-top:14px}.bocha-prod-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}.bocha-prod-field+.bocha-prod-field{border-top:1px solid var(--dsw-alias-border-l2)}.bocha-prod-label{font-size:13px;font-weight:500;line-height:1.5}.bocha-prod-input{box-sizing:border-box;width:100%;height:34px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font:inherit;font-size:13px}.bocha-prod-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.bocha-prod-input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.bocha-prod-hint{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5;margin:0}.bocha-prod-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;border-top:1px solid var(--dsw-alias-border-l2);padding-top:12px}.bocha-prod-status{color:var(--dsw-alias-label-tertiary);font-size:12px;margin-right:auto}.bocha-prod-button{appearance:none;cursor:pointer;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 14px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}.bocha-prod-button-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}.bocha-prod-button:disabled{cursor:default;opacity:.55}.bocha-prod-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.5;margin:12px 0 0}.bocha-prod-message{color:var(--dsw-alias-state-success-primary);font-size:12px;line-height:1.5;margin:12px 0 0}";
    function installStyle() {
      if (typeof document === "undefined") return () => {};
      const selector = 'style[data-dsh-plugin="dsh-web-search-bocha"]';
      if (document.querySelector(selector) !== null) return () => {};
      const tag = document.createElement("style");
      tag.dataset.dshPlugin = "dsh-web-search-bocha";
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return () => tag.remove();
    }
    function installStyle() {
      if (typeof document === "undefined") return () => {};
      const selector = 'style[data-dsh-plugin="dsh-web-search-bocha"]';
      if (document.querySelector(selector) !== null) return () => {};
      const tag = document.createElement("style");
      tag.dataset.dshPlugin = "dsh-web-search-bocha";
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return () => tag.remove();
    }
    function valueOf(snapshot, field, fallback) {
      const value = snapshot.value?.[field];
      return value === undefined ? fallback : value;
    }
    function BochaCard({ scope, api }) {
      const h = React.createElement;
      const snapshot = scope.getSnapshot();
      const revision = snapshot.revision;
      const [draft, setDraft] = React.useState(() => ({ baseURL: valueOf(snapshot, "baseURL", DEFAULT_BASE_URL), freshness: valueOf(snapshot, "freshness", DEFAULT_FRESHNESS), count: String(valueOf(snapshot, "count", DEFAULT_COUNT)), timeoutMs: String(valueOf(snapshot, "timeoutMs", DEFAULT_TIMEOUT_MS)) }));
      const [apiKey, setApiKey] = React.useState("");
      const [credential, setCredential] = React.useState({ configured: false, writable: true, loading: true });
      const [busy, setBusy] = React.useState(false);
      const [message, setMessage] = React.useState("");
      const [error, setError] = React.useState("");
      const [version, setVersion] = React.useState(0);
      const ref = valueOf(snapshot, "apiKeyEnv", DEFAULT_API_KEY_REF) || DEFAULT_API_KEY_REF;
      React.useEffect(() => scope.subscribe(() => setVersion((value) => value + 1)), [scope]);
      React.useEffect(() => { setDraft({ baseURL: valueOf(snapshot, "baseURL", DEFAULT_BASE_URL), freshness: valueOf(snapshot, "freshness", DEFAULT_FRESHNESS), count: String(valueOf(snapshot, "count", DEFAULT_COUNT)), timeoutMs: String(valueOf(snapshot, "timeoutMs", DEFAULT_TIMEOUT_MS)) }); }, [revision, version]);
      React.useEffect(() => { let alive = true; setCredential((current) => ({ ...current, loading: true })); api.credentials.describe({ refs: [ref] }).then((response) => { if (!alive) return; const view = response.result.ok ? response.result.value.credentials[ref] : undefined; setCredential({ configured: view?.configured === true, writable: view?.writable !== false, loading: false }); }).catch(() => { if (alive) setCredential({ configured: false, writable: true, loading: false }); }); return () => { alive = false; }; }, [api, ref, revision]);
      async function save() { setBusy(true); setError(""); setMessage(""); try { await scope.set("baseURL", draft.baseURL); await scope.set("freshness", draft.freshness); await scope.set("count", Number(draft.count)); await scope.set("timeoutMs", Number(draft.timeoutMs)); if (apiKey.trim().length > 0) { const response = await api.credentials.set({ ref, value: apiKey.trim() }); if (!response.result.ok) throw new Error(response.result.error?.message ?? "凭据保存失败"); setApiKey(""); } setMessage("已保存博查配置。"); } catch (reason) { setError(String(reason)); } finally { setBusy(false); } }
      async function clearKey() { setBusy(true); setError(""); setMessage(""); try { const response = await api.credentials.unset({ ref }); if (!response.result.ok) throw new Error(response.result.error?.message ?? "凭据清除失败"); setCredential({ configured: false, writable: credential.writable, loading: false }); setMessage("已清除 API Key。"); } catch (reason) { setError(String(reason)); } finally { setBusy(false); } }
      function resetField(field) { scope.unset(field).catch((reason) => setError(String(reason))); }
      const field = (id, label, value, onChange, hint, type = "text") => h("div", { className: "bocha-prod-field", key: id }, h("label", { className: "bocha-prod-label", htmlFor: id }, label), h("input", { id, className: "bocha-prod-input", type, value, autoComplete: type === "password" ? "off" : undefined, disabled: busy || snapshot.writable !== true, onChange: (event) => onChange(event.target.value) }), h("p", { className: "bocha-prod-hint" }, hint));
      if (snapshot.status === "loading") return h("div", { className: "bocha-prod-card", "aria-busy": true }, h("p", { className: "bocha-prod-description" }, "正在读取博查配置…"));
      if (snapshot.status === "unavailable") return h("div", { className: "bocha-prod-card" }, h("p", { className: "bocha-prod-error" }, "当前部署未提供 web-search-bocha 设置。"));
      const writable = snapshot.writable === true;
      const configured = credential.configured;
      const options = [h("option", { value: "noLimit", key: "noLimit" }, "不限"), h("option", { value: "day", key: "day" }, "最近一天"), h("option", { value: "week", key: "week" }, "最近一周"), h("option", { value: "month", key: "month" }, "最近一月"), h("option", { value: "year", key: "year" }, "最近一年")];
      const fields = [field("bocha-prod-api-key", "API Key", apiKey, setApiKey, configured ? "留空表示保持当前密钥；密钥只写入凭据存储。" : "配置后才能执行博查搜索。", "password"), field("bocha-prod-base-url", "接口地址", draft.baseURL, (value) => setDraft((current) => ({ ...current, baseURL: value })), "仅支持官方 Bocha HTTPS Web Search endpoint。"), h("div", { className: "bocha-prod-field", key: "freshness" }, h("label", { className: "bocha-prod-label", htmlFor: "bocha-prod-freshness" }, "时间范围"), h("select", { id: "bocha-prod-freshness", className: "bocha-prod-input", value: draft.freshness, disabled: busy || !writable, onChange: (event) => setDraft((current) => ({ ...current, freshness: event.target.value })) }, ...options), h("p", { className: "bocha-prod-hint" }, "对应 Bocha Web Search 的 freshness 参数。")), field("bocha-prod-count", "单次最多返回结果", draft.count, (value) => setDraft((current) => ({ ...current, count: value })), "范围 1–50；DSH web_search 仍按自身上限截断。"), field("bocha-prod-timeout", "请求超时（毫秒）", draft.timeoutMs, (value) => setDraft((current) => ({ ...current, timeoutMs: value })), "默认 15000 毫秒。")];
      return h("div", { className: "bocha-prod-card" }, h("div", { className: "bocha-prod-head" }, h("div", { className: "bocha-prod-head-text" }, h("h3", { className: "bocha-prod-title" }, "网页搜索"), h("p", { className: "bocha-prod-description" }, "博查 Web Search 提供方；结果沿用 DSH 当前网页搜索卡片。")), h("span", { className: configured ? "bocha-prod-badge" : "bocha-prod-badge-muted" }, configured ? "已配置密钥" : "未配置密钥")), h("div", { className: "bocha-prod-fields" }, ...fields), h("p", { className: "bocha-prod-hint" }, `凭据引用：${ref}`), error ? h("p", { className: "bocha-prod-error", role: "alert" }, error) : null, message ? h("p", { className: "bocha-prod-message", role: "status" }, message) : null, h("div", { className: "bocha-prod-actions" }, h("span", { className: "bocha-prod-status" }, writable ? "设置可写" : "设置只读"), h("button", { className: "bocha-prod-button", type: "button", disabled: busy || !configured || !credential.writable, onClick: clearKey }, "清除密钥"), h("button", { className: "bocha-prod-button", type: "button", disabled: busy || !writable, onClick: () => resetField("baseURL") }, "重置地址"), h("button", { className: "bocha-prod-button bocha-prod-button-primary", type: "button", disabled: busy || !writable, onClick: save }, busy ? "保存中…" : "保存")));
    }
    const inject = ["slots", "connection", "settingsScope"];
    function apply(ctx) { const slots = ctx.get("slots"); const connection = ctx.get("connection"); const settingsScope = ctx.get("settingsScope"); if (slots === undefined || connection === undefined || settingsScope === undefined) return; const scope = settingsScope.bind({ namespace: SETTINGS_NAMESPACE }); const api = connection.api; const disposeStyle = installStyle(); ctx.effect(() => disposeStyle, "dsh-web-search-bocha: styles"); slots.inject("settings.plugin.item", () => slots.register({ name: "settings.plugin.item", key: SETTINGS_NAMESPACE }, () => React.createElement(BochaCard, { scope, api }))); }
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});

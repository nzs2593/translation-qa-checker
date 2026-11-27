import { LANGUAGE_PROFILES } from "./profiles.js";
import { formatTimezone, getTimezoneRule, seasonalOffsetMinutes, setSharedTimezoneRules, timezoneSourceLanguage } from "./timezone-rules.js";
import { profileLabel, t } from "./i18n.js";

const $ = (id) => document.getElementById(id);

function clockAt(offsetMinutes) {
  const total = (20 * 60 + 59 + offsetMinutes + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function initGmtView({ getLocale, onChange }) {
  const body = $("gmt-table-body");
  const status = $("gmt-status");
  const codeInput = $("gmt-member-code");
  let api = "";
  let sharedData = null;
  try { codeInput.value = localStorage.getItem("checkform-member-code-v1") ?? ""; } catch { /* storage unavailable */ }
  codeInput.addEventListener("change", () => {
    try { localStorage.setItem("checkform-member-code-v1", codeInput.value.trim()); } catch { /* code still works this session */ }
  });

  async function refreshShared() {
    try {
      if (!codeInput.value) codeInput.value = localStorage.getItem("checkform-member-code-v1") ?? "";
      const configResponse = await fetch(new URL("data/collaboration-config.json", document.baseURI), { cache: "no-store" });
      const config = configResponse.ok ? await configResponse.json() : {};
      api = /^https:\/\//u.test(config.collabApi ?? "") ? config.collabApi.replace(/\/$/u, "") : "";
      if (!api) throw new Error("Общая таблица GMT недоступна.");
      const response = await fetch(`${api}/v1/timezones`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Ошибка загрузки GMT: ${response.status}`);
      const data = await response.json();
      if (!setSharedTimezoneRules(data)) throw new Error("Некорректные правила GMT.");
      sharedData = data;
      refresh();
      onChange();
      status.textContent = `Общие правила GMT загружены · версия ${data.version}.`;
      return true;
    } catch (error) { status.textContent = error.message; return false; }
  }

  function refresh() {
    const locale = getLocale();
    for (const [id, key] of [
      ["gmt-tab", "gmtTab"], ["gmt-title", "gmtTitle"], ["gmt-intro", "gmtIntro"],
      ["gmt-note", "gmtNote"], ["gmt-language-heading", "goalLanguage"],
      ["gmt-source-heading", "gmtSource"], ["gmt-rule-heading", "gmtRule"],
      ["gmt-marker-heading", "gmtMarker"], ["gmt-offset-heading", "gmtOffset"],
      ["gmt-example-heading", "gmtExample"], ["gmt-examples-title", "gmtExamplesTitle"],
      ["gmt-examples-copy", "gmtExamplesCopy"]
    ]) $(id).textContent = t(locale, key);
    body.replaceChildren();
    for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
      const rule = getTimezoneRule(code);
      const row = document.createElement("tr");
      row.dataset.language = code;
      const language = document.createElement("td");
      language.textContent = profileLabel(locale, code, profile.label);
      const source = document.createElement("td");
      const sourceCode = timezoneSourceLanguage(code);
      source.textContent = profileLabel(locale, sourceCode, LANGUAGE_PROFILES[sourceCode].label);
      const modeCell = document.createElement("td");
      const mode = document.createElement("select"); mode.dataset.field = "mode";
      mode.add(new Option(t(locale, "gmtInherit"), "source"));
      mode.add(new Option(t(locale, "gmtEquivalent"), "equivalent"));
      mode.add(new Option(t(locale, "gmtFixed"), "fixed"));
      if (rule.zone || ["da", "uk"].includes(code)) mode.add(new Option(t(locale, "gmtSeasonal"), "seasonal"));
      mode.value = rule.mode; modeCell.append(mode);
      const labelCell = document.createElement("td");
      const label = document.createElement("select"); label.dataset.field = "label";
      for (const value of ["GMT", "UTC", "МСК", "MSK"]) label.add(new Option(value, value));
      label.value = rule.label; label.disabled = rule.mode !== "fixed"; labelCell.append(label);
      const offsetCell = document.createElement("td");
      const offset = document.createElement("input"); offset.dataset.field = "offset";
      offset.type = "number"; offset.min = "-12"; offset.max = "14"; offset.step = "0.25";
      offset.value = String(rule.offsetMinutes / 60);
      offset.disabled = rule.mode !== "fixed" || ["MSK", "МСК"].includes(rule.label);
      offset.setAttribute("aria-label", `${code} · ${t(locale, "gmtOffset")}`); offsetCell.append(offset);
      const example = document.createElement("td"); example.className = "gmt-example";
      example.textContent = rule.mode === "seasonal" ?
        `20:59 GMT → ${clockAt(seasonalOffsetMinutes(rule.zone, Date.UTC(2026, 0, 15)))} ${formatTimezone("GMT", seasonalOffsetMinutes(rule.zone, Date.UTC(2026, 0, 15)))} (Jan); ${clockAt(seasonalOffsetMinutes(rule.zone, Date.UTC(2026, 6, 15)))} ${formatTimezone("GMT", seasonalOffsetMinutes(rule.zone, Date.UTC(2026, 6, 15)))} (Jul)`
        : rule.mode === "source" ? "20:59 GMT → 20:59 GMT"
        : rule.mode === "equivalent" ? "20:59 GMT ↔ 23:59 МСК"
          : `20:59 GMT → ${clockAt(rule.offsetMinutes)} ${formatTimezone(rule.label, rule.offsetMinutes)}`;
      row.append(language, source, modeCell, labelCell, offsetCell, example);
      body.append(row);
    }
  }

  body.addEventListener("change", async (event) => {
    const input = event.target.closest("select, input");
    const row = input?.closest("tr[data-language]");
    if (!row) return;
    const code = row.dataset.language;
    const mode = row.querySelector('[data-field="mode"]').value;
    const label = row.querySelector('[data-field="label"]').value;
    const offset = Number(row.querySelector('[data-field="offset"]').value);
    const next = {
      mode, label, offsetMinutes: ["MSK", "МСК"].includes(label) ? 180 : Math.round(offset * 60),
      ...(mode === "seasonal" ? { zone: getTimezoneRule(code).zone ?? (code === "da" ? "Europe/Copenhagen" : "Europe/Kyiv") } : {})
    };
    if (!Number.isFinite(offset) || Math.abs(offset * 60 - next.offsetMinutes) > 0.001) {
      status.textContent = t(getLocale(), "gmtSaveError");
      refresh();
      return;
    }
    const memberCode = codeInput.value.trim();
    if (!api || !sharedData || !memberCode) {
      status.textContent = "Для изменения общей таблицы GMT введите личный код.";
      refresh();
      return;
    }
    input.disabled = true;
    status.textContent = "Сохраняю правило GMT для команды…";
    try {
      const response = await fetch(`${api}/v1/timezone-changes`, { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${memberCode}` },
        body: JSON.stringify({ language: code, rule: next, baseVersion: sharedData.version }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Ошибка ${response.status}`);
      try { localStorage.setItem("checkform-member-code-v1", memberCode); } catch { /* session still works */ }
      await refreshShared();
      status.textContent = `Правило GMT опубликовано · версия ${result.version}, автор ${result.actor}.`;
    } catch (error) { status.textContent = error.message; refresh(); }
    finally { input.disabled = false; }
  });

  refresh();
  refreshShared();
  return { refresh, refreshShared };
}

import { runRuleEngine } from "../engine.js";
import { getGlossaryRows, loadGlossaryEdits } from "../glossary.js";
import { loadTimezoneRules } from "../timezone-rules.js";
import { issueDescription, severityLabel } from "../i18n.js";
import { editorLanguages, readCrowdinRows } from "./crowdin-adapter.js";
import { DEFAULT_CHECKS, enabledIssues, normalizeChecks } from "./check-settings.js";

const languages = editorLanguages(location.pathname);
const russian = navigator.language.toLowerCase().startsWith("ru");
const uiLocale = russian ? "ru" : "en";
const copy = russian ? {
  open: "Открыть замечания CHECKform", compare: "Сравнивать валюту и суммы",
  close: "Закрыть", findings: "замечаний", segments: "загруженных сегментов",
  segment: "Сегмент", empty: "В загруженных сегментах нарушений не найдено.", review: "Проверьте этот сегмент.",
  settings: "Настройки проверок", back: "К замечаниям", reset: "Включить все проверки",
  import: "Импорт словаря и GMT", settingsHint: "Выберите, какие замечания показывать в Crowdin.",
  checkLabels: { glossary: "Глоссарий", dates: "Даты, время и GMT", numbers: "Числа и проценты",
    currencyComparison: "Сравнение валют и сумм", moneyFormat: "Формат сумм в переводе",
    spacing: "Пробелы", punctuation: "Пунктуация и регистр", placeholders: "Плейсхолдеры", other: "Другие правила" }
} : {
  open: "Open CHECKform findings", compare: "Compare currency and amounts",
  close: "Close", findings: "findings", segments: "loaded segments",
  segment: "Segment", empty: "No rule violations in loaded segments.", review: "Review this segment.",
  settings: "Check settings", back: "Back to findings", reset: "Enable all checks",
  import: "Import glossary and GMT", settingsHint: "Choose which findings to show in Crowdin.",
  checkLabels: { glossary: "Glossary", dates: "Dates, time and GMT", numbers: "Numbers and percentages",
    currencyComparison: "Compare currencies and amounts", moneyFormat: "Target money format",
    spacing: "Spacing", punctuation: "Punctuation and case", placeholders: "Placeholders", other: "Other rules" }
};
if (languages) start();

function start() {
  const state = { checks: normalizeChecks(), open: false, settingsOpen: false, results: [], selectedId: null, signatures: new Map() };
  const host = document.createElement("div");
  host.id = "checkform-extension-root";
  const shadow = host.attachShadow({ mode: "open" });
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = chrome.runtime.getURL("content.css");
  const toggle = document.createElement("button");
  toggle.className = "cf-toggle";
  toggle.type = "button";
  toggle.textContent = "CHECKform";
  toggle.setAttribute("aria-label", copy.open);
  const panel = document.createElement("section");
  panel.className = "cf-panel";
  panel.hidden = true;
  panel.innerHTML = `<header><strong>CHECKform <small>Chrome preview</small></strong><div class="cf-header-actions"><button class="cf-config" type="button" aria-label="${copy.settings}" title="${copy.settings}">⚙</button><button class="cf-close" type="button" aria-label="${copy.close}">×</button></div></header>
    <div class="cf-results-view"><div class="cf-controls"><span class="cf-lang"></span><button class="cf-open-settings" type="button">${copy.settings}</button></div>
    <div class="cf-summary"></div><div class="cf-list"></div></div>
    <div class="cf-settings-view" hidden><button class="cf-back" type="button">← ${copy.back}</button><h2>${copy.settings}</h2><p>${copy.settingsHint}</p><div class="cf-check-list"></div>
    <button class="cf-reset" type="button">${copy.reset}</button><button class="cf-import" type="button">${copy.import}</button></div>`;
  shadow.append(sheet, toggle, panel);
  document.documentElement.append(host);

  const close = () => { state.open = false; panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); };
  const open = () => { state.open = true; panel.hidden = false; toggle.setAttribute("aria-expanded", "true"); showSettings(false); renderPanel(); };
  const showSettings = (visible) => {
    state.settingsOpen = visible;
    panel.querySelector(".cf-results-view").hidden = visible;
    panel.querySelector(".cf-settings-view").hidden = !visible;
    panel.querySelector(".cf-config").setAttribute("aria-pressed", String(visible));
  };
  toggle.addEventListener("click", () => state.open ? close() : open());
  panel.querySelector(".cf-close").addEventListener("click", close);
  panel.querySelector(".cf-config").addEventListener("click", () => showSettings(!state.settingsOpen));
  panel.querySelector(".cf-open-settings").addEventListener("click", () => showSettings(true));
  panel.querySelector(".cf-back").addEventListener("click", () => showSettings(false));
  panel.querySelector(".cf-import").addEventListener("click", () => chrome.runtime.openOptionsPage());
  panel.querySelector(".cf-reset").addEventListener("click", () => {
    state.checks = { ...DEFAULT_CHECKS };
    persistChecks();
    syncCheckControls();
    scan();
  });
  panel.querySelector(".cf-lang").textContent = `${languages.sourceLanguage} → ${languages.targetLanguage}`;
  const checkList = panel.querySelector(".cf-check-list");
  for (const [key, label] of Object.entries(copy.checkLabels)) {
    const item = document.createElement("label");
    item.className = "cf-check-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.check = key;
    input.checked = state.checks[key];
    input.addEventListener("change", () => {
      state.checks[key] = input.checked;
      persistChecks();
      scan();
    });
    const text = document.createElement("span");
    text.textContent = label;
    item.append(input, text);
    checkList.append(item);
  }
  function syncCheckControls() {
    for (const input of checkList.querySelectorAll("input[data-check]")) input.checked = state.checks[input.dataset.check];
  }
  function persistChecks() {
    chrome.storage.local.set({ checks: state.checks });
    state.signatures.clear();
  }
  function loadSettings(saved) {
    const storage = { getItem: (key) => key === "checkform-glossary-edits-v1" ? JSON.stringify(saved.glossarySettings ?? {})
      : key === "checkform-timezone-rules-v1" ? JSON.stringify(saved.timezoneSettings ?? {}) : null };
    loadGlossaryEdits(storage);
    loadTimezoneRules(storage);
  }
  chrome.storage.local.get({ checkCurrency: true, checks: null, glossarySettings: null, timezoneSettings: null }, (saved) => {
    loadSettings(saved);
    state.checks = normalizeChecks(saved.checks, saved.checkCurrency);
    syncCheckControls();
    scan();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || (!changes.glossarySettings && !changes.timezoneSettings && !changes.checks)) return;
    chrome.storage.local.get({ checkCurrency: true, checks: null, glossarySettings: null, timezoneSettings: null }, (saved) => {
      loadSettings(saved);
      state.checks = normalizeChecks(saved.checks, saved.checkCurrency);
      syncCheckControls();
      state.signatures.clear();
      scan();
    });
  });

  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(scan, 180); };
  const observer = new MutationObserver((records) => {
    if (records.every((record) => record.target.closest?.(".checkform-row-badge"))) return;
    schedule();
  });
  const watch = () => {
    const list = document.querySelector("#texts_list");
    if (!list || state.watchedList === list) return;
    observer.disconnect();
    observer.observe(list, { childList: true, subtree: true, characterData: true });
    state.watchedList = list;
    scan();
  };
  const mountObserver = new MutationObserver(watch);
  mountObserver.observe(document.body, { childList: true, subtree: true });
  watch();
  document.addEventListener("input", (event) => {
    if (event.target.matches?.("#texts_list textarea.side-by-side-textarea")) schedule();
  }, true);

  function scan() {
    const rows = readCrowdinRows();
    const glossaryRows = state.checks.glossary ? getGlossaryRows() : [];
    const currentIds = new Set();
    state.results = rows.map((item) => {
      currentIds.add(item.id);
      const signature = `${languages.sourceLanguage}|${languages.targetLanguage}|${JSON.stringify(state.checks)}|${item.sourceText}|${item.targetText}`;
      let cached = state.signatures.get(item.id);
      if (!cached || cached.signature !== signature) {
        const issues = item.sourceText && item.targetText ? enabledIssues(runRuleEngine({
          source: item.sourceText, target: item.targetText, ...languages,
          checkCurrency: state.checks.currencyComparison, glossaryRows
        }), state.checks) : [];
        cached = { signature, issues };
        state.signatures.set(item.id, cached);
      }
      updateBadge(item, cached.issues);
      return { ...item, issues: cached.issues };
    });
    for (const id of state.signatures.keys()) if (!currentIds.has(id)) state.signatures.delete(id);
    const count = state.results.reduce((sum, row) => sum + row.issues.length, 0);
    toggle.textContent = count ? `CHECKform · ${count}` : "CHECKform";
    renderPanel();
  }

  function updateBadge(item, issues) {
    const container = item.target.closest('[class*="suggestion_"]') ?? item.target.parentElement;
    if (!container) return;
    let badge = container.querySelector(".checkform-row-badge");
    if (!issues.length) { badge?.remove(); return; }
    if (!badge) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.className = "checkform-row-badge";
      badge.addEventListener("click", () => { state.selectedId = item.id; open(); renderPanel(); });
      container.append(badge);
    }
    if (badge.textContent !== String(issues.length)) badge.textContent = String(issues.length);
    badge.title = issues.map((issue) => `${issue.error_type}: ${issueDescription(uiLocale, issue)}`).join("\n");
    badge.setAttribute("aria-label", `${issues.length} CHECKform ${copy.findings}`);
  }

  function renderPanel() {
    const summary = panel.querySelector(".cf-summary");
    const list = panel.querySelector(".cf-list");
    const count = state.results.reduce((sum, row) => sum + row.issues.length, 0);
    summary.textContent = `${count} ${copy.findings} · ${state.results.length} ${copy.segments}`;
    if (!state.open) return;
    list.replaceChildren();
    for (const row of state.results) {
      if (!row.issues.length) continue;
      const group = document.createElement("div");
      group.className = "cf-group";
      if (row.id === state.selectedId) group.classList.add("cf-selected");
      const heading = document.createElement("button");
      heading.type = "button";
      heading.className = "cf-segment";
      heading.textContent = `${copy.segment} ${row.id} · ${row.issues.length} ${copy.findings}`;
      heading.addEventListener("click", () => {
        row.row.scrollIntoView({ block: "center", behavior: "smooth" });
        state.selectedId = row.id;
        renderPanel();
      });
      group.append(heading);
      for (const issue of row.issues) {
        const finding = document.createElement("div");
        finding.className = `cf-finding cf-${issue.severity.toLowerCase()}`;
        const type = document.createElement("strong");
        type.textContent = `${issue.error_type} · ${severityLabel(uiLocale, issue.severity)}`;
        const detail = document.createElement("p");
        detail.textContent = issueDescription(uiLocale, issue) || copy.review;
        const excerpt = document.createElement("code");
        const { start, end } = issue.location_in_target;
        excerpt.textContent = row.targetText.slice(start, end) || row.targetText.slice(0, 80);
        finding.append(type, detail, excerpt);
        group.append(finding);
      }
      list.append(group);
    }
    if (!list.children.length) {
      const empty = document.createElement("p");
      empty.className = "cf-empty";
      empty.textContent = copy.empty;
      list.append(empty);
    }
  }
}

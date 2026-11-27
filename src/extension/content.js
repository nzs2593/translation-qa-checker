import { runRuleEngine } from "../engine.js";
import { getGlossaryRows, loadGlossaryEdits, setSharedGlossary } from "../glossary.js";
import { loadTimezoneRules, setSharedTimezoneRules } from "../timezone-rules.js";
import { issueDescription, severityLabel } from "../i18n.js";
import { editorLanguages, readCrowdinRows } from "./crowdin-adapter.js";
import { DEFAULT_CHECKS, enabledIssues, normalizeChecks } from "./check-settings.js";
import { clampTogglePosition, movedEnough } from "./drag-position.js";
import { evaluateCharacterLimit, parseCharacterLimitHint, updateSelectedRows } from "./character-counter.js";
import { findingKey, rawTargetRange } from "./finding-actions.js";

const languages = editorLanguages(location.pathname);
const GLOSSARY_URL = "https://nzs2593.github.io/translation-qa-checker/?view=glossary";
const GMT_URL = "https://nzs2593.github.io/translation-qa-checker/?view=gmt";
const russian = navigator.language.toLowerCase().startsWith("ru");
const uiLocale = russian ? "ru" : "en";
const copy = russian ? {
  open: "Открыть замечания CHECKform", compare: "Сравнивать валюту и суммы",
  close: "Закрыть", findings: "замечаний", segments: "загруженных сегментов",
  segment: "Сегмент", empty: "В загруженных сегментах нарушений не найдено.", review: "Проверьте этот сегмент.",
  settings: "Настройки проверок", back: "К замечаниям", reset: "Включить все проверки",
  import: "Импорт словаря и GMT", glossary: "Открыть глоссарий", gmt: "Настроить GMT", glossaryRow: "Открыть термин в глоссарии", settingsHint: "Выберите, какие замечания показывать в Crowdin.",
  characters: "Символы в выбранных строках", limit: "Лимит", scope: "Считать", total: "Вместе", each: "На каждую",
  noLimit: "Без лимита", customLimit: "Свой лимит", chooseRows: "Отметьте нужные строки флажками в Crowdin.",
  tooManyRows: "Выбрано больше двух строк. Оставьте одну или две.", sourceCount: "Оригинал", targetCount: "Перевод",
  combined: "Итого", exceeded: "Лимит превышен", withinLimit: "В пределах лимита", charactersUnit: "симв.",
  fromSource: "В источнике", applyLimit: "Применить", rowLabel: "строка", focus: "Выделить в переводе", dismiss: "Отклонить", resetDismissed: "Вернуть отклонённые",
  checkLabels: { glossary: "Глоссарий", dates: "Даты, время и GMT", numbers: "Числа и проценты",
    currencyComparison: "Сравнение валют и сумм", moneyFormat: "Формат сумм в переводе",
    spacing: "Пробелы", punctuation: "Пунктуация и регистр", placeholders: "Плейсхолдеры", other: "Другие правила" }
} : {
  open: "Open CHECKform findings", compare: "Compare currency and amounts",
  close: "Close", findings: "findings", segments: "loaded segments",
  segment: "Segment", empty: "No rule violations in loaded segments.", review: "Review this segment.",
  settings: "Check settings", back: "Back to findings", reset: "Enable all checks",
  import: "Import glossary and GMT", glossary: "Open glossary", gmt: "Edit GMT rules", glossaryRow: "Open term in glossary", settingsHint: "Choose which findings to show in Crowdin.",
  characters: "Characters in selected strings", limit: "Limit", scope: "Apply to", total: "Together", each: "Each string",
  noLimit: "No limit", customLimit: "Custom limit", chooseRows: "Select the Crowdin strings to count using their checkboxes.",
  tooManyRows: "More than two strings selected. Leave one or two selected.", sourceCount: "Source", targetCount: "Translation",
  combined: "Total", exceeded: "Limit exceeded", withinLimit: "Within limit", charactersUnit: "chars",
  fromSource: "Source note", applyLimit: "Apply", rowLabel: "string", focus: "Select in translation", dismiss: "Dismiss", resetDismissed: "Restore dismissed",
  checkLabels: { glossary: "Glossary", dates: "Dates, time and GMT", numbers: "Numbers and percentages",
    currencyComparison: "Compare currencies and amounts", moneyFormat: "Target money format",
    spacing: "Spacing", punctuation: "Punctuation and case", placeholders: "Placeholders", other: "Other rules" }
};
if (languages) start();

function start() {
  const state = { checks: normalizeChecks(), characterLimit: null, characterScope: "total", open: false, settingsOpen: false, results: [], selectedId: null, signatures: new Map(), dismissed: new Set(), selectedRows: new Map(), editorPath: location.pathname };
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
  toggle.title = russian ? "Перетащите кнопку в удобное место; нажмите, чтобы открыть" : "Drag to move; click to open";
  const panel = document.createElement("section");
  panel.className = "cf-panel";
  panel.hidden = true;
  panel.innerHTML = `<header><strong>CHECKform</strong><div class="cf-header-actions"><button class="cf-config" type="button" aria-label="${copy.settings}" title="${copy.settings}">⚙</button><button class="cf-close" type="button" aria-label="${copy.close}">×</button></div></header>
    <div class="cf-results-view"><div class="cf-controls"><span class="cf-lang"></span><button class="cf-open-settings" type="button">${copy.settings}</button></div>
    <div class="cf-counter"><strong>${copy.characters}</strong><div class="cf-counter-controls">
    <label>${copy.limit} <select class="cf-limit-preset"><option value="">${copy.noLimit}</option><option value="15">15</option><option value="20">20</option><option value="30">30</option><option value="50">50</option><option value="80">80</option><option value="100">100</option><option value="custom">${copy.customLimit}</option></select></label>
    <input class="cf-limit-custom" type="number" min="1" step="1" inputmode="numeric" aria-label="${copy.customLimit}" hidden>
    <label>${copy.scope} <select class="cf-limit-scope"><option value="total">${copy.total}</option><option value="each">${copy.each}</option></select></label></div>
    <div class="cf-limit-hint" hidden></div><div class="cf-counter-rows" aria-live="polite"></div><div class="cf-counter-status" aria-live="polite"></div></div>
    <div class="cf-summary"><span class="cf-summary-count"></span><button class="cf-restore" type="button" hidden>${copy.resetDismissed}</button></div><div class="cf-list"></div></div>
    <div class="cf-settings-view" hidden><button class="cf-back" type="button">← ${copy.back}</button><h2>${copy.settings}</h2><p>${copy.settingsHint}</p><div class="cf-check-list"></div>
    <button class="cf-reset" type="button">${copy.reset}</button><a class="cf-glossary-link" href="${GLOSSARY_URL}&lang=${encodeURIComponent(languages.targetLanguage)}" target="_blank" rel="noopener noreferrer">${copy.glossary}</a><a class="cf-gmt-link" href="${GMT_URL}" target="_blank" rel="noopener noreferrer">${copy.gmt}</a><button class="cf-import" type="button">${copy.import}</button></div>`;
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
  let togglePosition = null;
  let drag = null;
  let suppressClick = false;
  const placeToggle = (position) => {
    togglePosition = clampTogglePosition(position, toggle.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight });
    toggle.style.left = `${togglePosition.x}px`;
    toggle.style.top = `${togglePosition.y}px`;
    toggle.style.right = "auto";
    toggle.style.bottom = "auto";
  };
  toggle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = toggle.getBoundingClientRect();
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      left: rect.left, top: rect.top, moved: false };
    toggle.setPointerCapture(event.pointerId);
  });
  toggle.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && !movedEnough(dx, dy)) return;
    drag.moved = true;
    toggle.classList.add("cf-dragging");
    placeToggle({ x: drag.left + dx, y: drag.top + dy });
    event.preventDefault();
  });
  const finishDrag = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      suppressClick = true;
      chrome.storage.local.set({ togglePosition });
      setTimeout(() => { suppressClick = false; }, 0);
    }
    toggle.classList.remove("cf-dragging");
    if (toggle.hasPointerCapture(event.pointerId)) toggle.releasePointerCapture(event.pointerId);
    drag = null;
  };
  toggle.addEventListener("pointerup", finishDrag);
  toggle.addEventListener("pointercancel", finishDrag);
  toggle.addEventListener("click", (event) => {
    if (suppressClick) { event.preventDefault(); return; }
    state.open ? close() : open();
  });
  window.addEventListener("resize", () => { if (togglePosition) placeToggle(togglePosition); });
  panel.querySelector(".cf-close").addEventListener("click", close);
  panel.querySelector(".cf-config").addEventListener("click", () => showSettings(!state.settingsOpen));
  panel.querySelector(".cf-open-settings").addEventListener("click", () => showSettings(true));
  panel.querySelector(".cf-back").addEventListener("click", () => showSettings(false));
  panel.querySelector(".cf-import").addEventListener("click", () => chrome.runtime.openOptionsPage());
  panel.querySelector(".cf-restore").addEventListener("click", () => {
    state.dismissed.clear();
    chrome.storage.local.set({ dismissedFindings: [] });
    scan();
  });
  panel.querySelector(".cf-reset").addEventListener("click", () => {
    state.checks = { ...DEFAULT_CHECKS };
    persistChecks();
    syncCheckControls();
    scan();
  });
  panel.querySelector(".cf-lang").textContent = `${languages.sourceLanguage} → ${languages.targetLanguage}`;
  const limitPreset = panel.querySelector(".cf-limit-preset");
  const limitCustom = panel.querySelector(".cf-limit-custom");
  const limitScope = panel.querySelector(".cf-limit-scope");
  const syncLimitControls = () => {
    const presetValues = [15, 20, 30, 50, 80, 100];
    limitPreset.value = state.characterLimit == null ? "" : presetValues.includes(state.characterLimit) ? String(state.characterLimit) : "custom";
    limitCustom.hidden = limitPreset.value !== "custom";
    if (state.characterLimit != null) limitCustom.value = String(state.characterLimit);
    limitScope.value = state.characterScope;
  };
  const persistLimit = () => chrome.storage.local.set({ characterLimitConfig: {
    limit: state.characterLimit, scope: state.characterScope
  } });
  limitPreset.addEventListener("change", () => {
    if (limitPreset.value === "custom") {
      limitCustom.value = String(state.characterLimit ?? 1);
      limitCustom.hidden = false;
      limitCustom.focus();
      return;
    }
    state.characterLimit = limitPreset.value ? Number(limitPreset.value) : null;
    syncLimitControls(); persistLimit(); renderCounter();
  });
  limitCustom.addEventListener("input", () => {
    const value = Number(limitCustom.value);
    state.characterLimit = Number.isInteger(value) && value > 0 ? value : null;
    persistLimit(); renderCounter();
  });
  limitScope.addEventListener("change", () => {
    state.characterScope = limitScope.value === "each" ? "each" : "total";
    persistLimit(); renderCounter();
  });
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
  chrome.storage.local.get({ checkCurrency: true, checks: null, glossarySettings: null, timezoneSettings: null, togglePosition: null, characterLimitConfig: null, dismissedFindings: [] }, (saved) => {
    if (saved.togglePosition && Number.isFinite(saved.togglePosition.x) && Number.isFinite(saved.togglePosition.y)) placeToggle(saved.togglePosition);
    loadSettings(saved);
    state.checks = normalizeChecks(saved.checks, saved.checkCurrency);
    const storedLimit = Number(saved.characterLimitConfig?.limit);
    state.characterLimit = Number.isInteger(storedLimit) && storedLimit > 0 ? storedLimit : null;
    state.characterScope = saved.characterLimitConfig?.scope === "each" ? "each" : "total";
    state.dismissed = new Set(Array.isArray(saved.dismissedFindings) ? saved.dismissedFindings.filter((key) => typeof key === "string") : []);
    syncLimitControls();
    syncCheckControls();
    scan();
  });
  const syncSharedGlossary = () => chrome.runtime.sendMessage({ type: "checkform-shared-glossary" }, (response) => {
    if (chrome.runtime.lastError || !response?.data || !setSharedGlossary(response.data)) return;
    state.signatures.clear();
    scan();
  });
  syncSharedGlossary();
  setInterval(syncSharedGlossary, 5 * 60 * 1000);
  const syncSharedTimezones = () => chrome.runtime.sendMessage({ type: "checkform-shared-timezones" }, (response) => {
    if (chrome.runtime.lastError || !response?.data || !setSharedTimezoneRules(response.data)) return;
    state.signatures.clear();
    scan();
  });
  syncSharedTimezones();
  setInterval(syncSharedTimezones, 5 * 60 * 1000);
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
  document.addEventListener("change", (event) => {
    if (event.target.matches?.('#texts_list input[name="translation_checkbox"]')) schedule();
  }, true);

  function scan() {
    if (state.editorPath !== location.pathname) {
      state.selectedRows.clear();
      state.editorPath = location.pathname;
    }
    const rows = readCrowdinRows();
    const glossaryRows = state.checks.glossary ? getGlossaryRows() : [];
    const currentIds = new Set();
    let caseNumber = 0;
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
      const issues = cached.issues.filter((issue) => !state.dismissed.has(findingKey(location.pathname, item.id, issue, item.targetText)));
      const ordinal = issues.length ? ++caseNumber : null;
      updateBadge(item, issues, ordinal);
      return { ...item, issues, ordinal };
    });
    // Crowdin may unmount rows while scrolling. Keep the last observed text for
    // checked rows and remove it only when the row is visibly unchecked.
    state.selectedRows = updateSelectedRows(state.selectedRows, state.results);
    for (const id of state.signatures.keys()) if (!currentIds.has(id)) state.signatures.delete(id);
    const count = state.results.reduce((sum, row) => sum + row.issues.length, 0);
    toggle.textContent = count ? `CHECKform · ${count}` : "CHECKform";
    if (togglePosition) placeToggle(togglePosition);
    renderPanel();
  }

  function updateBadge(item, issues, ordinal) {
    const container = item.target.closest('[class*="suggestion_"]') ?? item.target.parentElement;
    if (!container) return;
    let badge = container.querySelector(".checkform-row-badge");
    if (!issues.length) { badge?.remove(); return; }
    if (!badge) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.className = "checkform-row-badge";
      container.append(badge);
    }
    badge.onclick = () => { state.selectedId = item.id; open(); renderPanel(); if (issues[0]) focusFinding(item, issues[0]); };
    if (badge.textContent !== String(ordinal)) badge.textContent = String(ordinal);
    badge.title = issues.map((issue) => `${issue.error_type}: ${issueDescription(uiLocale, issue)}`).join("\n");
    badge.setAttribute("aria-label", `${copy.segment} ${ordinal}: ${issues.length} CHECKform ${copy.findings}`);
  }

  function renderPanel() {
    const summary = panel.querySelector(".cf-summary-count");
    const list = panel.querySelector(".cf-list");
    const count = state.results.reduce((sum, row) => sum + row.issues.length, 0);
    summary.textContent = `${count} ${copy.findings} · ${state.results.length} ${copy.segments}`;
    panel.querySelector(".cf-restore").hidden = state.dismissed.size === 0;
    if (!state.open) return;
    renderCounter();
    list.replaceChildren();
    for (const row of state.results) {
      if (!row.issues.length) continue;
      const group = document.createElement("div");
      group.className = "cf-group";
      if (row.id === state.selectedId) group.classList.add("cf-selected");
      const heading = document.createElement("button");
      heading.type = "button";
      heading.className = "cf-segment";
      heading.textContent = `${row.ordinal}. ${copy.segment} ${row.id} · ${row.issues.length} ${copy.findings}`;
      heading.addEventListener("click", () => {
        row.row.scrollIntoView({ block: "center", behavior: "smooth" });
        state.selectedId = row.id;
        renderPanel();
          if (row.issues[0]) focusFinding(row, row.issues[0]);
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
        const focus = document.createElement("button");
        focus.type = "button";
        focus.className = "cf-focus-finding";
        focus.textContent = copy.focus;
        focus.addEventListener("click", () => focusFinding(row, issue));
        const dismiss = document.createElement("button");
        dismiss.type = "button";
        dismiss.className = "cf-dismiss";
        dismiss.textContent = copy.dismiss;
        dismiss.addEventListener("click", () => {
          state.dismissed.add(findingKey(location.pathname, row.id, issue, row.targetText));
          chrome.storage.local.set({ dismissedFindings: [...state.dismissed] });
          scan();
        });
        finding.append(type, detail, excerpt);
        finding.append(focus, dismiss);
        if (issue.error_type.startsWith("GLOSSARY_") && issue.glossary?.rows?.length) {
          const link = document.createElement("a");
          link.className = "cf-glossary-row-link";
          link.href = `${GLOSSARY_URL}&lang=${encodeURIComponent(languages.targetLanguage)}&row=${encodeURIComponent(issue.glossary.rows[0])}`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = copy.glossaryRow;
          finding.append(link);
        }
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

  function focusFinding(row, issue) {
    row.row.scrollIntoView({ block: "center", behavior: "smooth" });
    row.target.focus({ preventScroll: true });
    const range = rawTargetRange(row.target.value, issue.location_in_target?.start, issue.location_in_target?.end);
    row.target.setSelectionRange(range.start, range.end);
  }

  function renderCounter() {
    const selected = [...state.selectedRows.values()];
    const lines = panel.querySelector(".cf-counter-rows");
    const status = panel.querySelector(".cf-counter-status");
    const hint = panel.querySelector(".cf-limit-hint");
    lines.replaceChildren();
    hint.replaceChildren();
    hint.hidden = true;
    status.classList.remove("cf-over-limit");
    if (!selected.length) {
      status.textContent = copy.chooseRows;
      return;
    }
    const result = evaluateCharacterLimit(selected, state.characterLimit, state.characterScope);
    const firstIndex = state.results.indexOf(selected[0]);
    const contextLimit = parseCharacterLimitHint(selected[0].limitContext);
    const appliesToSelection = contextLimit && (contextLimit.parts.length === 1 && selected.length === 1 ||
      contextLimit.parts.length === 2 && selected.length === 2 && firstIndex >= 0 && state.results[firstIndex + 1] === selected[1]);
    if (appliesToSelection) {
      hint.hidden = false;
      const label = document.createElement("span");
      label.textContent = `${copy.fromSource}: ${contextLimit.parts.join(" + ")} → ${contextLimit.total} ${copy.charactersUnit}`;
      const apply = document.createElement("button");
      apply.type = "button";
      apply.textContent = `${copy.applyLimit} ${contextLimit.total}`;
      apply.addEventListener("click", () => {
        state.characterLimit = contextLimit.total;
        state.characterScope = "total";
        syncLimitControls(); persistLimit(); renderCounter();
      });
      hint.append(label, apply);
    }
    for (const [index, item] of result.counts.entries()) {
      const line = document.createElement("div");
      line.textContent = `${index + 1}. ${copy.segment} ${item.id} · ${copy.sourceCount}: ${item.source} · ${copy.targetCount}: ${item.target} ${copy.charactersUnit}`;
      if (result.limit != null && state.characterScope === "each" && item.target > result.limit) line.classList.add("cf-count-over");
      lines.append(line);
    }
    if (result.counts.length > 1) {
      const total = document.createElement("strong");
      total.textContent = `${copy.combined}: ${copy.sourceCount} ${result.totalSource} · ${copy.targetCount} ${result.totalTarget} ${copy.charactersUnit}`;
      if (result.limit != null && state.characterScope === "total" && result.totalTarget > result.limit) total.classList.add("cf-count-over");
      lines.append(total);
    }
    if (result.limit == null) status.textContent = copy.noLimit;
    else if (result.exceeded.length) {
      status.classList.add("cf-over-limit");
      status.textContent = `${copy.exceeded}: ${result.exceeded.map((item) =>
        `${item.index ? `${copy.rowLabel} ${item.index} ` : ""}+${item.by} ${copy.charactersUnit}`).join("; ")}`;
    } else status.textContent = `${copy.withinLimit}: ${result.limit} ${copy.charactersUnit}`;
  }
}

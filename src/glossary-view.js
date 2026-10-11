import { GLOSSARY_LANGUAGES, addGlossaryRow, getGlossaryRows, glossaryEntryCount, glossarySourceLanguage, updateGlossaryTerm } from "./glossary.js?v=2.2";
import { LANGUAGE_PROFILES } from "./profiles.js";
import { profileLabel, t } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const PAGE_SIZE = 60;

export function initGlossaryView({ getLocale, getGoalLanguage, onChange }) {
  const languageSelect = $("glossary-language");
  const search = $("glossary-search");
  const tableBody = $("glossary-table-body");
  const status = $("glossary-status");
  const more = $("glossary-show-more");
  let visibleCount = PAGE_SIZE;
  let manuallySelected = false;
  let saveTimer;

  function currentLanguages() {
    const target = languageSelect.value || "ru";
    return { source: glossarySourceLanguage(target), target };
  }

  function populateLanguages() {
    const previous = languageSelect.value || (getGoalLanguage() === "en" ? "ru" : getGoalLanguage());
    languageSelect.replaceChildren();
    for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
      if (code === "en") continue;
      languageSelect.add(new Option(profileLabel(getLocale(), code, profile.label), code));
    }
    languageSelect.value = previous;
    if (!languageSelect.value) languageSelect.value = "ru";
  }

  function updateLabels() {
    const locale = getLocale();
    const { source, target } = currentLanguages();
    $("check-tab").textContent = t(locale, "checkTab");
    $("glossary-tab").textContent = t(locale, "glossaryTab");
    $("glossary-title").textContent = t(locale, "glossaryTitle");
    $("glossary-intro").textContent = t(locale, "glossaryIntro");
    $("glossary-language-label").textContent = t(locale, "goalLanguage");
    search.placeholder = t(locale, "glossarySearch");
    $("glossary-from-heading").textContent = `${t(locale, "glossaryFrom")} · ${profileLabel(locale, source, LANGUAGE_PROFILES[source].label)}`;
    $("glossary-to-heading").textContent = `${t(locale, "glossaryTo")} · ${profileLabel(locale, target, LANGUAGE_PROFILES[target].label)}`;
    $("glossary-notes-heading").textContent = t(locale, "glossaryNotes");
    $("glossary-add-source").placeholder = t(locale, "glossaryAddSource");
    $("glossary-add-target").placeholder = t(locale, "glossaryAddTarget");
    $("glossary-add-button").textContent = t(locale, "glossaryAdd");
    more.textContent = t(locale, "glossaryShowMore");
    $("glossary-source-rule").textContent = t(locale, "glossarySourceRule", { language: profileLabel(locale, source, LANGUAGE_PROFILES[source].label) });
  }

  function makeInput(row, language, placeholder) {
    const input = document.createElement("input");
    input.className = "glossary-term-input";
    input.value = row.terms[GLOSSARY_LANGUAGES[language]] ?? "";
    input.placeholder = placeholder;
    input.dataset.rowId = String(row.id);
    input.dataset.language = GLOSSARY_LANGUAGES[language];
    input.setAttribute("aria-label", `${language} · ${row.id}`);
    return input;
  }

  function renderRows() {
    const locale = getLocale();
    const { source, target } = currentLanguages();
    const query = search.value.trim().toLocaleLowerCase();
    const sourceCode = GLOSSARY_LANGUAGES[source];
    const targetCode = GLOSSARY_LANGUAGES[target];
    const matching = getGlossaryRows().filter((row) => {
      const sourceTerm = row.terms[sourceCode] ?? "";
      const targetTerm = row.terms[targetCode] ?? "";
      return (sourceTerm || targetTerm) && (!query || `${sourceTerm} ${targetTerm}`.toLocaleLowerCase().includes(query));
    });
    $("glossary-count").textContent = t(locale, "glossaryRows", { count: String(matching.length) });
    more.hidden = matching.length <= visibleCount;
    tableBody.replaceChildren();
    if (!matching.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td"); td.colSpan = 4; td.className = "glossary-empty"; td.textContent = t(locale, "glossaryEmpty");
      tr.append(td); tableBody.append(tr);
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const row of matching.slice(0, visibleCount)) {
      const tr = document.createElement("tr");
      const number = document.createElement("td"); number.className = "glossary-row-number"; number.textContent = String(row.id);
      const from = document.createElement("td"); from.append(makeInput(row, source, t(locale, "glossaryMissing")));
      const to = document.createElement("td"); to.append(makeInput(row, target, t(locale, "glossaryMissing")));
      const notes = document.createElement("td"); notes.className = "glossary-note";
      notes.textContent = [row.notes?.[sourceCode], row.notes?.[targetCode]].filter(Boolean).join(" · ");
      tr.append(number, from, to, notes);
      fragment.append(tr);
    }
    tableBody.append(fragment);
  }

  function refresh() {
    populateLanguages();
    updateLabels();
    renderRows();
  }

  function syncLanguage(code) {
    if (manuallySelected || !code || code === "en" || !GLOSSARY_LANGUAGES[code]) return;
    if (languageSelect.value !== code) {
      languageSelect.value = code;
      visibleCount = PAGE_SIZE;
      updateLabels();
      renderRows();
    }
  }

  languageSelect.addEventListener("change", () => {
    manuallySelected = true;
    visibleCount = PAGE_SIZE;
    updateLabels();
    renderRows();
  });
  search.addEventListener("input", () => { visibleCount = PAGE_SIZE; renderRows(); });
  more.addEventListener("click", () => { visibleCount += PAGE_SIZE; renderRows(); });
  tableBody.addEventListener("input", (event) => {
    const input = event.target.closest("input[data-row-id]");
    if (!input) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const saved = updateGlossaryTerm(input.dataset.rowId, input.dataset.language, input.value);
      status.textContent = t(getLocale(), saved ? "glossarySaved" : "glossarySaveError");
      onChange();
    }, 250);
  });
  tableBody.addEventListener("change", (event) => {
    const input = event.target.closest("input[data-row-id]");
    if (!input) return;
    clearTimeout(saveTimer);
    const saved = updateGlossaryTerm(input.dataset.rowId, input.dataset.language, input.value);
    status.textContent = t(getLocale(), saved ? "glossarySaved" : "glossarySaveError");
    onChange();
  });
  $("glossary-add-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const { source, target } = currentLanguages();
    const row = addGlossaryRow(source, target, $("glossary-add-source").value, $("glossary-add-target").value);
    if (!row) return;
    $("glossary-add-source").value = "";
    $("glossary-add-target").value = "";
    search.value = "";
    visibleCount = glossaryEntryCount();
    renderRows();
    tableBody.lastElementChild?.scrollIntoView({ block: "nearest" });
    status.textContent = t(getLocale(), "glossarySaved");
    onChange();
  });

  refresh();
  return { refresh, syncLanguage };
}

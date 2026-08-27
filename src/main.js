import { runRuleEngine } from "./engine.js?v=2.5";
import { detectLanguage } from "./language-detection.js?v=1.3";
import { LANGUAGE_PROFILES } from "./profiles.js";
import { readDocxText } from "./docx.js";
import { selectPrimaryLanguageBlock } from "./text-segmentation.js?v=1.4";
import { ISSUE_CATALOG, getLocale, issueDescription, poolLabel, profileLabel, setLocale, severityLabel, t } from "./i18n.js?v=1.2";

const $ = (id) => document.getElementById(id);
const sourceLanguage = $("source-language");
const targetLanguage = $("target-language");
const sourceText = $("source-text");
const targetText = $("target-text");
const issuesList = $("issues-list");
const fileInputs = {
  source: $("source-file-input"),
  target: $("target-file-input")
};
const exportPdfButton = $("export-pdf");
const pendingFileTexts = { source: null, target: null };
const rawFileTexts = { source: null, target: null };
const issuePreferences = new Map();
let filesCommitted = false;
let currentIssues = [];
let currentLocale = getLocale();

function populateLanguageOptions() {
  const sourceValue = sourceLanguage.value || "auto";
  const targetValue = targetLanguage.value || "auto";
  sourceLanguage.replaceChildren();
  targetLanguage.replaceChildren();
  sourceLanguage.add(new Option(t(currentLocale, "autoDetect"), "auto"));
  targetLanguage.add(new Option(t(currentLocale, "autoDetect"), "auto"));
  for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
    const label = profileLabel(currentLocale, code, profile.label);
    sourceLanguage.add(new Option(label, code));
    targetLanguage.add(new Option(label, code));
  }
  sourceLanguage.value = sourceValue;
  targetLanguage.value = targetValue;
}

function escapeHtml(value) {
  return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
}

function issueKey(issue) {
  return `${issue.error_type}:${issue.pool}:${issue.location_in_target.start}:${issue.location_in_target.end}`;
}

function getIssuePreference(issue) {
  const key = issueKey(issue);
  if (!issuePreferences.has(key)) issuePreferences.set(key, { included: true, explanation: issue.explanation ?? "", edited: false, editing: false });
  return issuePreferences.get(key);
}

function issueExplanation(issue, preference = getIssuePreference(issue)) {
  return preference.edited ? preference.explanation : issueDescription(currentLocale, issue);
}

function findingCount(count) {
  if (currentLocale === "en") return `${count} ${count === 1 ? t(currentLocale, "finding") : t(currentLocale, "findings")}`;
  if (count % 10 === 1 && count % 100 !== 11) return `${count} ошибка`;
  return `${count} ошибок`;
}

function detectionReason(reason) {
  if (currentLocale === "ru") return { "No text": "Нет текста", "Script and lexical markers": "По алфавиту и лексическим признакам", "Low-signal heuristic": "Недостаточно признаков" }[reason] ?? reason;
  return reason;
}

function applyTranslations() {
  document.documentElement.lang = currentLocale;
  $("eyebrow").textContent = t(currentLocale, "eyebrow");
  $("app-title").textContent = t(currentLocale, "title");
  $("app-subtitle").textContent = t(currentLocale, "subtitle");
  $("workspace-grid").setAttribute("aria-label", t(currentLocale, "workspace"));
  $("original-label").textContent = t(currentLocale, "original");
  $("source-heading").textContent = t(currentLocale, "sourceLanguage");
  $("target-language-heading").textContent = t(currentLocale, "goalLanguage");
  $("target-heading").textContent = t(currentLocale, "goalLanguage");
  $("source-language-label").textContent = t(currentLocale, "sourceLanguage");
  $("target-language-label").textContent = t(currentLocale, "goalLanguage");
  $("source-language").setAttribute("aria-label", t(currentLocale, "sourceLanguage"));
  $("target-language").setAttribute("aria-label", t(currentLocale, "goalLanguage"));
  $("source-open-file").textContent = t(currentLocale, "openFile");
  $("target-open-file").textContent = t(currentLocale, "openFile");
  $("source-drop-hint").textContent = t(currentLocale, "dropOriginal");
  $("goal-language-label").textContent = t(currentLocale, "goalLanguage").toUpperCase();
  $("target-review-label").textContent = t(currentLocale, "targetReview");
  $("profile-copy").textContent = t(currentLocale, "chooseProfile");
  $("goal-drop-copy").textContent = t(currentLocale, "dropGoalCopy");
  $("goal-drop-hint").textContent = t(currentLocale, "dropGoal");
  $("supported-profiles").textContent = t(currentLocale, "supportedProfiles");
  $("profiles-count").textContent = t(currentLocale, "profilesCount");
  $("issues-label").textContent = t(currentLocale, "issues");
  $("review-findings").textContent = t(currentLocale, "reviewFindings");
  $("export-pdf").textContent = t(currentLocale, "exportPdf");
  $("footer-copy").textContent = t(currentLocale, "footer");
  $("error-table-open").textContent = t(currentLocale, "errorTable");
  $("error-table-kicker").textContent = currentLocale === "ru" ? "СПРАВОЧНИК ОШИБОК" : "ERROR REFERENCE";
  $("error-table-title").textContent = t(currentLocale, "errorTableTitle");
  $("error-table-description").textContent = t(currentLocale, "errorTableDescription");
  $("profile-rules-title").textContent = t(currentLocale, "profileRulesTitle");
  $("error-table-close").setAttribute("aria-label", t(currentLocale, "close"));
  $("error-type-heading").textContent = t(currentLocale, "errorType");
  $("pool-heading").textContent = t(currentLocale, "pool");
  $("severity-heading").textContent = t(currentLocale, "severity");
  $("description-heading").textContent = t(currentLocale, "description");
  sourceText.placeholder = t(currentLocale, "sourcePlaceholder");
  targetText.placeholder = t(currentLocale, "targetPlaceholder");
  for (const button of document.querySelectorAll(".locale-button")) {
    const active = button.dataset.locale === currentLocale;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  populateLanguageOptions();
  renderErrorTable();
}

function renderErrorTable() {
  const body = $("error-table-body");
  if (!body) return;
  body.replaceChildren();
  for (const entry of ISSUE_CATALOG) {
    const row = document.createElement("tr");
    const type = document.createElement("td"); type.textContent = entry.type;
    const pool = document.createElement("td"); pool.textContent = poolLabel(currentLocale, entry.pool);
    const severity = document.createElement("td");
    const badge = document.createElement("span"); badge.className = `severity-badge ${entry.severity.toLowerCase()}`; badge.textContent = severityLabel(currentLocale, entry.severity); severity.append(badge);
    const description = document.createElement("td"); description.textContent = entry[currentLocale] ?? entry.en;
    row.append(type, pool, severity, description); body.append(row);
  }
}

function renderProfileRules(code) {
  const body = $("profile-rules-body");
  if (!body) return;
  const profile = LANGUAGE_PROFILES[code] ?? LANGUAGE_PROFILES.en;
  const dateFormats = { MDY: "MM/DD/YYYY", DMY: "DD/MM/YYYY", YMD: "YYYY-MM-DD" };
  const separatorLabel = (value) => value === "nbsp" ? (currentLocale === "ru" ? "неразрывный пробел (1 000)" : "non-breaking space (1 000)") : value;
  const currencySpace = profile.currencySpace === "nbsp" ? " " : profile.currencySpace ?? "";
  const currencyExample = profile.currencyPlacement === "prefix" ? `€${currencySpace}100` : `100${currencySpace}€`;
  const quoteExample = profile.quoteStyle === "guillemets" ? "«…»" : profile.quoteStyle === "uk-single" ? "‘…’" : profile.quoteStyle === "double" ? "“…”" : t(currentLocale, "notSpecified");
  const rows = [
    [t(currentLocale, "dateFormat"), dateFormats[profile.dateOrder] ?? t(currentLocale, "notSpecified")],
    [t(currentLocale, "decimalSeparator"), profile.decimal],
    [t(currentLocale, "thousandSeparator"), separatorLabel(profile.grouping)],
    [t(currentLocale, "currencyFormat"), `${currencyExample} (${profile.currencyPlacement === "prefix" ? t(currentLocale, "before") : t(currentLocale, "after")})`],
    [t(currentLocale, "percentageFormat"), `100${profile.percentSpace ? " " : ""}%`],
    [t(currentLocale, "quotationMarks"), quoteExample]
  ];
  body.replaceChildren();
  for (const [label, value] of rows) {
    const row = document.createElement("tr");
    const labelCell = document.createElement("td"); labelCell.textContent = label;
    const valueCell = document.createElement("td"); valueCell.textContent = value;
    row.append(labelCell, valueCell); body.append(row);
  }
}

function highlightedTextHtml(text, issues, locationKey = "location_in_target") {
  const ranges = issues
    .map((issue, index) => ({ ...(issue[locationKey] ?? {}), severity: issue.severity, label: issue.error_type, number: index + 1 }))
    .filter((range) => Number.isInteger(range.start) && Number.isInteger(range.end) && range.end > range.start)
    .sort((a, b) => a.start - b.start);
  const mergedRanges = [];
  for (const range of ranges) {
    const previous = mergedRanges[mergedRanges.length - 1];
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
      previous.number = `${previous.number}, ${range.number}`;
      previous.label = `${previous.label} · ${range.label}`;
    } else {
      mergedRanges.push({ ...range });
    }
  }
  let cursor = 0;
  let html = "";
  for (const range of mergedRanges) {
    html += escapeHtml(text.slice(cursor, range.start));
    html += `<mark class="${range.severity.toLowerCase()}" data-number="${range.number}" title="${escapeHtml(range.label)}">${escapeHtml(text.slice(range.start, range.end))}</mark>`;
    cursor = range.end;
  }
  return html + escapeHtml(text.slice(cursor));
}

function renderTargetHighlights(text, issues) {
  const layer = $("target-highlight-layer");
  layer.innerHTML = highlightedTextHtml(text, issues);
  layer.scrollTop = targetText.scrollTop;
  layer.scrollLeft = targetText.scrollLeft;
}

function renderSourceHighlights(text, issues) {
  const layer = $("source-highlight-layer");
  layer.innerHTML = highlightedTextHtml(text, issues, "location_in_source");
  layer.scrollTop = sourceText.scrollTop;
  layer.scrollLeft = sourceText.scrollLeft;
}

function focusIssue(issue) {
  const sourceRange = issue.location_in_source;
  const start = Math.max(0, Math.min(issue.location_in_target.start, targetText.value.length));
  const end = Math.max(start, Math.min(issue.location_in_target.end, targetText.value.length));
  if (sourceRange) {
    const sourceStart = Math.max(0, Math.min(sourceRange.start, sourceText.value.length));
    const sourceEnd = Math.max(sourceStart, Math.min(sourceRange.end, sourceText.value.length));
    sourceText.focus();
    sourceText.setSelectionRange(sourceStart, sourceEnd > sourceStart ? sourceEnd : Math.min(sourceStart + 1, sourceText.value.length));
  }
  targetText.focus();
  targetText.setSelectionRange(start, end > start ? end : Math.min(start + 1, targetText.value.length));
  requestAnimationFrame(() => {
    const sourceLayer = $("source-highlight-layer");
    sourceLayer.scrollTop = sourceText.scrollTop;
    sourceLayer.scrollLeft = sourceText.scrollLeft;
    const layer = $("target-highlight-layer");
    layer.scrollTop = targetText.scrollTop;
    layer.scrollLeft = targetText.scrollLeft;
  });
}

function render() {
  const sourceDetection = detectLanguage(sourceText.value);
  const targetDetection = detectLanguage(targetText.value);
  const sourceCode = sourceLanguage.value === "auto" ? sourceDetection.code : sourceLanguage.value;
  const targetCode = targetLanguage.value === "auto" ? targetDetection.code : targetLanguage.value;
  const sourceLabel = LANGUAGE_PROFILES[sourceCode].label;
  const targetLabel = LANGUAGE_PROFILES[targetCode].label;
  renderProfileRules(targetCode);
  $("source-heading").textContent = t(currentLocale, "sourceLanguage");
  $("target-language-heading").textContent = t(currentLocale, "goalLanguage");
  $("target-heading").textContent = t(currentLocale, "goalLanguage");
  $("language-state").textContent = targetLanguage.value === "auto" ? targetText.value.trim() ? `${t(currentLocale, "detected")} · ${detectionReason(targetDetection.reason)}` : t(currentLocale, "waitingForGoal") : t(currentLocale, "manualProfile");
  $("source-count").textContent = `${sourceText.value.length} characters`;
  $("target-count").textContent = `${targetText.value.length} characters`;
  const issues = runRuleEngine({ source: sourceText.value, target: targetText.value, sourceLanguage: sourceCode, targetLanguage: targetCode });
  currentIssues = issues;
  const includedIssues = issues.filter((issue) => getIssuePreference(issue).included);
  renderTargetHighlights(targetText.value, includedIssues);
  renderSourceHighlights(sourceText.value, includedIssues);
  $("issue-summary").textContent = includedIssues.length ? `${findingCount(includedIssues.length)}${includedIssues.length !== issues.length ? ` · ${issues.length - includedIssues.length} ${t(currentLocale, "excluded")}` : ""}` : issues.length ? `${issues.length} ${t(currentLocale, "excluded")}` : t(currentLocale, "noFindings");
  exportPdfButton.disabled = includedIssues.length === 0;
  $("checked-at").textContent = t(currentLocale, "checked", { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  issuesList.replaceChildren();
  if (!issues.length) {
    const empty = document.createElement("div"); empty.className = "empty-state"; empty.textContent = t(currentLocale, "noViolations"); issuesList.append(empty); return;
  }
  for (const issue of issues) {
    const preference = getIssuePreference(issue);
    const row = document.createElement("div"); row.className = `issue-row${preference.included ? "" : " excluded"}`;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", t(currentLocale, "goToIssue", { type: issue.error_type }));
    row.addEventListener("click", (event) => { if (!event.target.closest("button, input, textarea, label")) focusIssue(issue); });
    row.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button, input, textarea, label")) { event.preventDefault(); focusIssue(issue); } });
    const dot = document.createElement("span"); dot.className = `severity-dot ${issue.severity.toLowerCase()}`; dot.title = issue.severity;
    const type = document.createElement("div"); type.className = "issue-type";
    const issueNumber = document.createElement("span"); issueNumber.className = "issue-index"; issueNumber.textContent = preference.included ? String(includedIssues.indexOf(issue) + 1) : "—";
    type.append(issueNumber, document.createTextNode(issue.error_type));
    const meta = document.createElement("div"); meta.className = "issue-meta"; meta.textContent = `${poolLabel(currentLocale, issue.pool)} · ${severityLabel(currentLocale, issue.severity)}`;
    const explanation = document.createElement("div"); explanation.className = "issue-explanation"; explanation.textContent = issueExplanation(issue, preference);
    const controls = document.createElement("div"); controls.className = "issue-controls";
    const toggleLabel = document.createElement("label"); toggleLabel.className = "issue-toggle";
    const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = preference.included; checkbox.setAttribute("aria-label", `${t(currentLocale, "count")} ${issue.error_type}`);
    checkbox.addEventListener("change", () => { preference.included = checkbox.checked; render(); });
    const toggleText = document.createElement("span"); toggleText.textContent = t(currentLocale, "count"); toggleLabel.append(checkbox, toggleText);
    const editButton = document.createElement("button"); editButton.type = "button"; editButton.className = "edit-issue"; editButton.textContent = preference.editing ? t(currentLocale, "done") : t(currentLocale, "edit");
    editButton.addEventListener("click", () => { preference.editing = !preference.editing; render(); });
    controls.append(toggleLabel, editButton);
    row.append(dot, type, meta, explanation, controls);
    if (preference.editing) {
      const editor = document.createElement("div"); editor.className = "issue-edit-panel";
      const editorLabel = document.createElement("label"); editorLabel.textContent = t(currentLocale, "explanation");
      const editorInput = document.createElement("textarea"); editorInput.rows = 2; editorInput.value = issueExplanation(issue, preference); editorInput.addEventListener("input", () => { preference.explanation = editorInput.value; preference.edited = true; });
      editorLabel.append(editorInput); editor.append(editorLabel); row.append(editor);
    }
    issuesList.append(row);
  }
}

function exportPdf(issues) {
  const includedIssues = issues.filter((issue) => getIssuePreference(issue).included);
  if (!includedIssues.length) return;
  const sourceCode = sourceLanguage.value === "auto" ? detectLanguage(sourceText.value).code : sourceLanguage.value;
  const targetCode = targetLanguage.value === "auto" ? detectLanguage(targetText.value).code : targetLanguage.value;
  const sourceLabel = profileLabel(currentLocale, sourceCode, LANGUAGE_PROFILES[sourceCode]?.label ?? t(currentLocale, "sourceLanguage"));
  const targetLabel = profileLabel(currentLocale, targetCode, LANGUAGE_PROFILES[targetCode]?.label ?? t(currentLocale, "goalLanguage"));
  const issueItems = includedIssues.map((issue, index) => {
    const preference = getIssuePreference(issue);
    const fragment = targetText.value.slice(issue.location_in_target.start, issue.location_in_target.end);
    return `<li><div class="report-issue-title"><strong>${index + 1}. ${escapeHtml(issue.error_type)}</strong><span>${escapeHtml(poolLabel(currentLocale, issue.pool))} · ${escapeHtml(severityLabel(currentLocale, issue.severity))}</span></div><p>${escapeHtml(issueExplanation(issue, preference))}</p>${fragment ? `<code>${escapeHtml(currentLocale === "ru" ? "Перевод" : "Target")}: “${escapeHtml(fragment)}”</code>` : ""}</li>`;
  }).join("");
  const report = `<!doctype html><html lang="${currentLocale}"><head><meta charset="utf-8"><title>${escapeHtml(currentLocale === "ru" ? "Отчёт проверки перевода" : "Translation QA Report")}</title><style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#20231f;font:13px Arial,sans-serif;line-height:1.45}h1{margin:0 0 4px;font-size:22px}h2{margin:22px 0 8px;font-size:15px}.muted{color:#666f64}.meta{margin:0 0 18px;color:#666f64}.text{white-space:pre-wrap;overflow-wrap:anywhere;padding:12px;border:1px solid #d7dcd2;border-radius:6px;background:#fff;font:12px Consolas,"Courier New",monospace}.text mark{position:relative;padding:1px 2px;border-radius:3px;background:#ffe0ad}.text mark::before{content:attr(data-number);position:absolute;left:0;top:-1.25em;min-width:14px;padding:1px 3px;border-radius:8px;background:#006739;color:#fff;font:10px Arial,sans-serif;text-align:center}.text mark.critical{background:#ffd0cc}.text mark.minor{background:#ccefd9}ol{margin:0;padding-left:22px}li{margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #d7dcd2}.report-issue-title{display:flex;justify-content:space-between;gap:16px}.report-issue-title span{color:#666f64}li p{margin:4px 0;color:#424740}code{font:12px Consolas,"Courier New",monospace;color:#006739}footer{margin-top:24px;color:#666f64;font-size:11px}@media print{.text{break-inside:auto}li{break-inside:avoid}}
  </style></head><body><h1>${escapeHtml(currentLocale === "ru" ? "Отчёт проверки перевода" : "Translation QA Report")}</h1><p class="meta">${escapeHtml(sourceLabel)} → ${escapeHtml(targetLabel)} · ${escapeHtml(findingCount(includedIssues.length))}</p><h2>${escapeHtml(currentLocale === "ru" ? "Текст перевода с отмеченными ошибками" : "Target text with marked findings")}</h2><div class="text">${highlightedTextHtml(targetText.value, includedIssues)}</div><h2>${escapeHtml(currentLocale === "ru" ? "Ошибки" : "Findings")}</h2><ol>${issueItems}</ol><footer>${escapeHtml(currentLocale === "ru" ? "Создано Translation QA Checker · Ошибки только отмечены, текст не исправлялся автоматически." : "Generated by Translation QA Checker · Findings are reported only; target text was not auto-corrected.")}</footer></body></html>`;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) { $("issue-summary").textContent = t(currentLocale, "noPopup"); return; }
  reportWindow.document.open(); reportWindow.document.write(report); reportWindow.document.close(); reportWindow.focus();
  setTimeout(() => reportWindow.print(), 250);
}

function setTextAreaValue(kind, value) {
  const textarea = kind === "source" ? sourceText : targetText;
  textarea.value = value;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function htmlToText(html) {
  const documentParser = new DOMParser();
  return documentParser.parseFromString(html, "text/html").body.textContent.trim();
}

async function readFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "docx") {
    return readDocxText(file);
  }
  const contents = await file.text();
  return extension === "html" || extension === "htm" ? htmlToText(contents) : contents;
}

async function loadFile(kind, file) {
  if (!file) return;
  const dropZone = $(`${kind}-drop-zone`);
  try {
    rawFileTexts[kind] = await readFile(file);
    pendingFileTexts[kind] = kind === "source" ? selectPrimaryLanguageBlock(rawFileTexts[kind], sourceLanguage.value) : rawFileTexts[kind];
    dropZone.dataset.fileName = file.name;
    const otherKind = kind === "source" ? "target" : "source";
    const otherDropZone = $(`${otherKind}-drop-zone`);
    if (!filesCommitted && pendingFileTexts.source !== null && pendingFileTexts.target !== null) {
      setTextAreaValue("source", pendingFileTexts.source);
      setTextAreaValue("target", pendingFileTexts.target);
      filesCommitted = true;
      dropZone.dataset.fileStatus = t(currentLocale, "bothFilesLoaded");
      otherDropZone.dataset.fileStatus = t(currentLocale, "bothFilesLoaded");
    } else if (filesCommitted) {
      setTextAreaValue(kind, pendingFileTexts[kind]);
      dropZone.dataset.fileStatus = t(currentLocale, "fileLoaded");
    } else {
      dropZone.dataset.fileStatus = t(currentLocale, kind === "source" ? "sourceFileReceived" : "targetFileReceived");
    }
    setTimeout(() => { delete dropZone.dataset.fileStatus; }, 2200);
  } catch (error) {
    dropZone.dataset.fileError = error.message;
    setTimeout(() => delete dropZone.dataset.fileError, 3500);
  }
}

for (const kind of ["source", "target"]) {
  const input = fileInputs[kind];
  const zone = $(`${kind}-drop-zone`);
  input.addEventListener("change", () => loadFile(kind, input.files[0]));
  zone.addEventListener("dragenter", (event) => { event.preventDefault(); event.stopPropagation(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragover", (event) => { event.preventDefault(); event.stopPropagation(); if (event.dataTransfer) event.dataTransfer.dropEffect = "copy"; zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", (event) => { event.preventDefault(); event.stopPropagation(); if (!zone.contains(event.relatedTarget)) zone.classList.remove("drag-over"); });
  zone.addEventListener("drop", (event) => {
    event.preventDefault(); event.stopPropagation(); zone.classList.remove("drag-over"); loadFile(kind, event.dataTransfer?.files?.[0]);
  });
}

document.addEventListener("dragover", (event) => event.preventDefault());
document.addEventListener("drop", (event) => event.preventDefault());

let timer;
for (const element of [sourceText, targetText, sourceLanguage, targetLanguage]) {
  element.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 120); });
  element.addEventListener("change", render);
}
sourceLanguage.addEventListener("change", () => {
  if (rawFileTexts.source === null) return;
  pendingFileTexts.source = selectPrimaryLanguageBlock(rawFileTexts.source, sourceLanguage.value);
  setTextAreaValue("source", pendingFileTexts.source);
});
targetText.addEventListener("scroll", () => {
  $("target-highlight-layer").scrollTop = targetText.scrollTop;
  $("target-highlight-layer").scrollLeft = targetText.scrollLeft;
});
sourceText.addEventListener("scroll", () => {
  $("source-highlight-layer").scrollTop = sourceText.scrollTop;
  $("source-highlight-layer").scrollLeft = sourceText.scrollLeft;
});
exportPdfButton.addEventListener("click", () => exportPdf(currentIssues));

for (const button of document.querySelectorAll(".locale-button")) {
  button.addEventListener("click", () => {
    currentLocale = setLocale(button.dataset.locale);
    applyTranslations();
    render();
  });
}

const errorTableDialog = $("error-table-dialog");
$("error-table-open").addEventListener("click", () => {
  renderErrorTable();
  errorTableDialog.showModal();
});
$("error-table-close").addEventListener("click", () => errorTableDialog.close());
errorTableDialog.addEventListener("click", (event) => { if (event.target === errorTableDialog) errorTableDialog.close(); });

applyTranslations();
render();

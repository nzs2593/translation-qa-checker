import { runRuleEngine } from "./engine.js?v=2.4";
import { detectLanguage } from "./language-detection.js?v=1.3";
import { LANGUAGE_PROFILES } from "./profiles.js";
import { readDocxText } from "./docx.js";
import { selectPrimaryLanguageBlock } from "./text-segmentation.js?v=1.4";

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

for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
  sourceLanguage.add(new Option(profile.label, code));
  targetLanguage.add(new Option(profile.label, code));
}
sourceLanguage.add(new Option("Auto-detect", "auto"), 0);
targetLanguage.add(new Option("Auto-detect", "auto"), 0);
sourceLanguage.value = "auto";
targetLanguage.value = "auto";

function escapeHtml(value) {
  return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
}

function issueKey(issue) {
  return `${issue.error_type}:${issue.pool}:${issue.location_in_target.start}:${issue.location_in_target.end}`;
}

function getIssuePreference(issue) {
  const key = issueKey(issue);
  if (!issuePreferences.has(key)) issuePreferences.set(key, { included: true, explanation: issue.explanation ?? "", editing: false });
  return issuePreferences.get(key);
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
  $("source-heading").textContent = "Source language";
  $("target-language-heading").textContent = "Goal language";
  $("target-heading").textContent = "Goal language";
  $("language-state").textContent = targetLanguage.value === "auto" ? targetText.value.trim() ? `Detected · ${targetDetection.reason}` : "Waiting for goal text" : "Manual profile";
  $("source-count").textContent = `${sourceText.value.length} characters`;
  $("target-count").textContent = `${targetText.value.length} characters`;
  const issues = runRuleEngine({ source: sourceText.value, target: targetText.value, sourceLanguage: sourceCode, targetLanguage: targetCode });
  currentIssues = issues;
  const includedIssues = issues.filter((issue) => getIssuePreference(issue).included);
  renderTargetHighlights(targetText.value, includedIssues);
  renderSourceHighlights(sourceText.value, includedIssues);
  $("issue-summary").textContent = includedIssues.length ? `${includedIssues.length} finding${includedIssues.length === 1 ? "" : "s"}${includedIssues.length !== issues.length ? ` · ${issues.length - includedIssues.length} excluded` : ""}` : issues.length ? `${issues.length} excluded` : "No findings";
  exportPdfButton.disabled = includedIssues.length === 0;
  $("checked-at").textContent = `Checked ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  issuesList.replaceChildren();
  if (!issues.length) {
    const empty = document.createElement("div"); empty.className = "empty-state"; empty.textContent = "No rule violations found in this increment."; issuesList.append(empty); return;
  }
  for (const issue of issues) {
    const preference = getIssuePreference(issue);
    const row = document.createElement("div"); row.className = `issue-row${preference.included ? "" : " excluded"}`;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Go to ${issue.error_type} in target text`);
    row.addEventListener("click", (event) => { if (!event.target.closest("button, input, textarea, label")) focusIssue(issue); });
    row.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button, input, textarea, label")) { event.preventDefault(); focusIssue(issue); } });
    const dot = document.createElement("span"); dot.className = `severity-dot ${issue.severity.toLowerCase()}`; dot.title = issue.severity;
    const type = document.createElement("div"); type.className = "issue-type";
    const issueNumber = document.createElement("span"); issueNumber.className = "issue-index"; issueNumber.textContent = preference.included ? String(includedIssues.indexOf(issue) + 1) : "—";
    type.append(issueNumber, document.createTextNode(issue.error_type));
    const meta = document.createElement("div"); meta.className = "issue-meta"; meta.textContent = `${issue.pool} · ${issue.severity}`;
    const explanation = document.createElement("div"); explanation.className = "issue-explanation"; explanation.textContent = preference.explanation;
    const controls = document.createElement("div"); controls.className = "issue-controls";
    const toggleLabel = document.createElement("label"); toggleLabel.className = "issue-toggle";
    const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = preference.included; checkbox.setAttribute("aria-label", `Count ${issue.error_type}`);
    checkbox.addEventListener("change", () => { preference.included = checkbox.checked; render(); });
    const toggleText = document.createElement("span"); toggleText.textContent = "Count"; toggleLabel.append(checkbox, toggleText);
    const editButton = document.createElement("button"); editButton.type = "button"; editButton.className = "edit-issue"; editButton.textContent = preference.editing ? "Done" : "Edit";
    editButton.addEventListener("click", () => { preference.editing = !preference.editing; render(); });
    controls.append(toggleLabel, editButton);
    row.append(dot, type, meta, explanation, controls);
    if (preference.editing) {
      const editor = document.createElement("div"); editor.className = "issue-edit-panel";
      const editorLabel = document.createElement("label"); editorLabel.textContent = "Explanation";
      const editorInput = document.createElement("textarea"); editorInput.rows = 2; editorInput.value = preference.explanation; editorInput.addEventListener("input", () => { preference.explanation = editorInput.value; });
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
  const sourceLabel = LANGUAGE_PROFILES[sourceCode]?.label ?? "Source language";
  const targetLabel = LANGUAGE_PROFILES[targetCode]?.label ?? "Goal language";
  const issueItems = includedIssues.map((issue, index) => {
    const preference = getIssuePreference(issue);
    const fragment = targetText.value.slice(issue.location_in_target.start, issue.location_in_target.end);
    return `<li><div class="report-issue-title"><strong>${index + 1}. ${escapeHtml(issue.error_type)}</strong><span>${escapeHtml(issue.pool)} · ${escapeHtml(issue.severity)}</span></div><p>${escapeHtml(preference.explanation)}</p>${fragment ? `<code>Target: “${escapeHtml(fragment)}”</code>` : ""}</li>`;
  }).join("");
  const report = `<!doctype html><html><head><meta charset="utf-8"><title>Translation QA Report</title><style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#20231f;font:13px Arial,sans-serif;line-height:1.45}h1{margin:0 0 4px;font-size:22px}h2{margin:22px 0 8px;font-size:15px}.muted{color:#666f64}.meta{margin:0 0 18px;color:#666f64}.text{white-space:pre-wrap;overflow-wrap:anywhere;padding:12px;border:1px solid #d7dcd2;border-radius:6px;background:#fff;font:12px Consolas,"Courier New",monospace}.text mark{position:relative;padding:1px 2px;border-radius:3px;background:#ffe0ad}.text mark::before{content:attr(data-number);position:absolute;left:0;top:-1.25em;min-width:14px;padding:1px 3px;border-radius:8px;background:#006739;color:#fff;font:10px Arial,sans-serif;text-align:center}.text mark.critical{background:#ffd0cc}.text mark.minor{background:#ccefd9}ol{margin:0;padding-left:22px}li{margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #d7dcd2}.report-issue-title{display:flex;justify-content:space-between;gap:16px}.report-issue-title span{color:#666f64}li p{margin:4px 0;color:#424740}code{font:12px Consolas,"Courier New",monospace;color:#006739}footer{margin-top:24px;color:#666f64;font-size:11px}@media print{.text{break-inside:auto}li{break-inside:avoid}}
  </style></head><body><h1>Translation QA Report</h1><p class="meta">${escapeHtml(sourceLabel)} → ${escapeHtml(targetLabel)} · ${includedIssues.length} finding${includedIssues.length === 1 ? "" : "s"}</p><h2>Target text with marked findings</h2><div class="text">${highlightedTextHtml(targetText.value, includedIssues)}</div><h2>Findings</h2><ol>${issueItems}</ol><footer>Generated by Translation QA Checker · Findings are reported only; target text was not auto-corrected.</footer></body></html>`;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) { $("issue-summary").textContent = "Allow pop-ups to export PDF"; return; }
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
      dropZone.dataset.fileStatus = "Both files loaded";
      otherDropZone.dataset.fileStatus = "Both files loaded";
    } else if (filesCommitted) {
      setTextAreaValue(kind, pendingFileTexts[kind]);
      dropZone.dataset.fileStatus = "File loaded";
    } else {
      dropZone.dataset.fileStatus = "File received · waiting for the other file";
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
render();

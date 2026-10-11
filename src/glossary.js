import { GLOSSARY_DEFAULTS } from "./glossary-data.js";
import { createIssue, location } from "./domain.js";

export const GLOSSARY_LANGUAGES = Object.freeze({
  en: "en-GB", az: "az", da: "da", mn: "mn", "pt-BR": "pt-BR",
  ru: "ru", es: "es", "es-AR": "es-AR", uk: "uk",
  "uz-Latn": "uz", "uz-Cyrl": "uzb"
});

const STORAGE_KEY = "checkform-glossary-edits-v1";
let overrides = {};
let customRows = [];

function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

export function glossarySourceLanguage(targetLanguage) {
  return targetLanguage === "uk" ? "ru" : "en";
}

export function loadGlossaryEdits(storage = browserStorage()) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "{}");
    overrides = saved.overrides && typeof saved.overrides === "object" ? saved.overrides : {};
    customRows = Array.isArray(saved.customRows) ? saved.customRows : [];
  } catch {
    overrides = {};
    customRows = [];
  }
  return getGlossaryRows();
}

export function getGlossaryRows() {
  return [...GLOSSARY_DEFAULTS, ...customRows].map((row) => ({
    ...row,
    terms: { ...row.terms, ...(overrides[row.id] ?? {}) }
  }));
}

function persist(storage = browserStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ overrides, customRows }));
    return true;
  } catch {
    return false;
  }
}

export function updateGlossaryTerm(rowId, language, value, storage = browserStorage()) {
  if (!Object.values(GLOSSARY_LANGUAGES).includes(language)) return false;
  const clean = String(value ?? "").trim();
  const custom = customRows.find((row) => String(row.id) === String(rowId));
  if (custom) custom.terms[language] = clean;
  else {
    const original = GLOSSARY_DEFAULTS.find((row) => String(row.id) === String(rowId));
    if (!original) return false;
    overrides[rowId] ??= {};
    if ((original.terms[language] ?? "") === clean) delete overrides[rowId][language];
    else overrides[rowId][language] = clean;
    if (!Object.keys(overrides[rowId]).length) delete overrides[rowId];
  }
  return persist(storage);
}

export function addGlossaryRow(sourceLanguage, targetLanguage, sourceTerm, targetTerm, storage = browserStorage()) {
  const from = GLOSSARY_LANGUAGES[sourceLanguage];
  const to = GLOSSARY_LANGUAGES[targetLanguage];
  if (!from || !to || !String(sourceTerm).trim()) return null;
  const row = { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, terms: { [from]: String(sourceTerm).trim(), [to]: String(targetTerm).trim() } };
  customRows.push(row);
  persist(storage);
  return row;
}

export function glossaryEntryCount() {
  return GLOSSARY_DEFAULTS.length + customRows.length;
}

function phrasePattern(term, matchCase = false) {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
}

function targetAnchor(target, sourcePosition, sourceLength) {
  if (!target.length) return location(0, 0);
  const approximate = Math.min(target.length - 1, Math.floor(sourcePosition / Math.max(sourceLength, 1) * target.length));
  const after = target.slice(approximate).search(/[\p{L}\p{N}]/u);
  const before = [...target.slice(0, approximate + 1).matchAll(/[\p{L}\p{N}]/gu)].at(-1)?.index;
  const start = after >= 0 ? approximate + after : before ?? 0;
  const word = target.slice(start).match(/^[\p{L}\p{N}]+/u)?.[0] ?? target[start];
  return location(start, start + word.length);
}

export function checkGlossary(source, target, sourceLanguage, targetLanguage, rows = getGlossaryRows()) {
  if (sourceLanguage !== glossarySourceLanguage(targetLanguage) || !GLOSSARY_LANGUAGES[targetLanguage]) return [];
  const from = GLOSSARY_LANGUAGES[sourceLanguage];
  const to = GLOSSARY_LANGUAGES[targetLanguage];
  const groups = new Map();
  for (const row of rows) {
    const sourceTerm = row.terms?.[from]?.trim();
    const targetTerm = row.terms?.[to]?.trim();
    if (!sourceTerm) continue;
    const key = sourceTerm.toLocaleLowerCase();
    if (!groups.has(key)) groups.set(key, { sourceTerm, entries: [] });
    groups.get(key).entries.push({ id: row.id, sourceTerm, targetTerm });
  }
  const matched = [];
  const occupied = [];
  for (const group of [...groups.values()].sort((a, b) => b.sourceTerm.length - a.sourceTerm.length)) {
    for (const match of source.matchAll(phrasePattern(group.sourceTerm))) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      if (occupied.some((range) => start < range.end && end > range.start)) continue;
      occupied.push({ start, end });
      const exactEntries = group.entries.filter((entry) => entry.sourceTerm === match[0]);
      const entries = exactEntries.length ? exactEntries : group.entries;
      const expectedTerms = [...new Set(entries.map((entry) => entry.targetTerm).filter(Boolean))];
      if (!expectedTerms.length) continue;
      if (expectedTerms.some((term) => phrasePattern(term, true).test(target))) continue;
      const caseOnlyMatch = expectedTerms.map((term) => [...target.matchAll(phrasePattern(term))][0]).find(Boolean);
      const enforceCase = Boolean(exactEntries.length) &&
        (/[\p{Lu}]/u.test(match[0]) || expectedTerms.some((term) => /[\p{Lu}]/u.test(term)));
      if (caseOnlyMatch) {
        if (!enforceCase) continue;
        matched.push(createIssue({
          error_type: "GLOSSARY_CASE_MISMATCH", pool: "Terminology", severity: "Minor",
          location_in_source: location(start, end),
          location_in_target: location(caseOnlyMatch.index, caseOnlyMatch.index + caseOnlyMatch[0].length),
          glossary: { sourceTerm: match[0], expectedTerms, actualTerm: caseOnlyMatch[0], rows: entries.map((entry) => entry.id) },
          explanation: `Glossary translation has the wrong letter case. Expected: ${expectedTerms.join(" / ")}; found: ${caseOnlyMatch[0]}.`
        }));
        continue;
      }
      matched.push(createIssue({
        error_type: "GLOSSARY_TRANSLATION_MISSING", pool: "Terminology", severity: "Major",
        location_in_source: location(start, end),
        location_in_target: targetAnchor(target, start, source.length),
        glossary: { sourceTerm: match[0], expectedTerms, rows: entries.map((entry) => entry.id) },
        explanation: `Glossary term “${match[0]}” has no listed translation in this target passage. Expected: ${expectedTerms.join(" / ")}.`
      }));
    }
  }
  return matched;
}

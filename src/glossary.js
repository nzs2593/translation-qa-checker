import { GLOSSARY_DEFAULTS } from "./glossary-data.js";
import { createIssue, location } from "./domain.js";
import { CURATED_GLOSSARY_ROOTS, deriveGlossaryRoot, glossaryRootPattern } from "./glossary-roots.js";

export const GLOSSARY_LANGUAGES = Object.freeze({
  en: "en-GB", az: "az", da: "da", mn: "mn", "pt-BR": "pt-BR",
  ru: "ru", es: "es", "es-AR": "es-AR", uk: "uk",
  "uz-Latn": "uz", "uz-Cyrl": "uzb"
});

const STORAGE_KEY = "checkform-glossary-edits-v1";
let overrides = {};
let rootOverrides = {};
let customRows = [];
let sharedGlossary = { overrides: {}, rootOverrides: {}, customRows: [] };
const compiledGlossaries = new WeakMap();

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
    rootOverrides = saved.rootOverrides && typeof saved.rootOverrides === "object" ? saved.rootOverrides : {};
    customRows = Array.isArray(saved.customRows) ? saved.customRows : [];
  } catch {
    overrides = {};
    rootOverrides = {};
    customRows = [];
  }
  return getGlossaryRows();
}

export function getGlossaryRows() {
  const sharedRows = Array.isArray(sharedGlossary.customRows) ? sharedGlossary.customRows : [];
  return [...GLOSSARY_DEFAULTS, ...sharedRows, ...customRows].map((row) => {
    const terms = { ...row.terms, ...(sharedGlossary.overrides?.[row.id] ?? {}), ...(overrides[row.id] ?? {}) };
    const suggestedRoots = Object.fromEntries(Object.entries(terms).map(([language, term]) =>
      [language, term === row.terms[language] && CURATED_GLOSSARY_ROOTS[row.id]?.[language]
        ? CURATED_GLOSSARY_ROOTS[row.id][language] : deriveGlossaryRoot(term, language)]));
    return {
      ...row, terms,
      roots: { ...suggestedRoots, ...row.roots, ...(sharedGlossary.rootOverrides?.[row.id] ?? {}), ...(rootOverrides[row.id] ?? {}) }
    };
  });
}

export function setSharedGlossary(data, storage = null) {
  if (!data || data.schema !== "checkform-shared-glossary-v1" || !Number.isInteger(data.version) ||
      !data.overrides || typeof data.overrides !== "object" || Array.isArray(data.overrides) ||
      !data.rootOverrides || typeof data.rootOverrides !== "object" || Array.isArray(data.rootOverrides) ||
      !Array.isArray(data.customRows)) return false;
  sharedGlossary = { overrides: data.overrides, rootOverrides: data.rootOverrides, customRows: data.customRows };
  // Published decisions take precedence over older edits stored in one browser.
  for (const [id, languages] of Object.entries(data.overrides)) {
    for (const language of Object.keys(languages)) delete overrides[id]?.[language];
    if (overrides[id] && !Object.keys(overrides[id]).length) delete overrides[id];
  }
  for (const [id, languages] of Object.entries(data.rootOverrides)) {
    for (const language of Object.keys(languages)) delete rootOverrides[id]?.[language];
    if (rootOverrides[id] && !Object.keys(rootOverrides[id]).length) delete rootOverrides[id];
  }
  if (storage) persist(storage);
  return true;
}

function persist(storage = browserStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ overrides, rootOverrides, customRows }));
    return true;
  } catch {
    return false;
  }
}

export function updateGlossaryTerm(rowId, language, value, storage = browserStorage()) {
  if (!Object.values(GLOSSARY_LANGUAGES).includes(language)) return false;
  const clean = String(value ?? "").trim();
  const custom = customRows.find((row) => String(row.id) === String(rowId));
  if (custom) {
    custom.terms[language] = clean;
    delete custom.roots?.[language];
  }
  else {
    const original = GLOSSARY_DEFAULTS.find((row) => String(row.id) === String(rowId));
    if (!original) return false;
    overrides[rowId] ??= {};
    if ((original.terms[language] ?? "") === clean) delete overrides[rowId][language];
    else overrides[rowId][language] = clean;
    if (!Object.keys(overrides[rowId]).length) delete overrides[rowId];
  }
  if (rootOverrides[rowId]) {
    delete rootOverrides[rowId][language];
    if (!Object.keys(rootOverrides[rowId]).length) delete rootOverrides[rowId];
  }
  return persist(storage);
}

export function updateGlossaryRoot(rowId, language, value, storage = browserStorage()) {
  if (!Object.values(GLOSSARY_LANGUAGES).includes(language)) return false;
  const row = getGlossaryRows().find((item) => String(item.id) === String(rowId));
  if (!row || !row.terms[language]) return false;
  const root = value == null ? null : String(value).trim();
  if (root != null && root && !/^[\p{L}]+(?:['’ʻʼ‘][\p{L}]+)*(?:[ \u00a0-][\p{L}]+(?:['’ʻʼ‘][\p{L}]+)*){0,3}$/u.test(root)) return false;
  const custom = customRows.find((item) => String(item.id) === String(rowId));
  if (custom) {
    custom.roots ??= {};
    if (root == null) delete custom.roots[language];
    else custom.roots[language] = root;
  } else {
    rootOverrides[rowId] ??= {};
    const original = GLOSSARY_DEFAULTS.find((item) => String(item.id) === String(rowId));
    const suggested = original?.terms[language] === row.terms[language] && CURATED_GLOSSARY_ROOTS[rowId]?.[language]
      ? CURATED_GLOSSARY_ROOTS[rowId][language] : deriveGlossaryRoot(row.terms[language], language);
    if (root == null || root === suggested) delete rootOverrides[rowId][language];
    else rootOverrides[rowId][language] = root;
    if (!Object.keys(rootOverrides[rowId]).length) delete rootOverrides[rowId];
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
  return GLOSSARY_DEFAULTS.length + (sharedGlossary.customRows?.length ?? 0) + customRows.length;
}

function phrasePattern(term, matchCase = false) {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
}

// Attested alternatives in approved translations. Keep the workbook term as
// the primary display value, but do not flag an accepted full form as missing.
const ACCEPTED_VARIANTS = Object.freeze({
  199: { "es-AR": ["Apuesta Gratis"], az: ["fribet"] },
  318: { "es-AR": ["cantidad"] },
  356: { "es-AR": ["puesto"] },
  376: { "es-AR": ["pozo de premios"] },
  425: { "es-AR": ["liquidarse"] },
  445: { "es-AR": ["importe"] }
});

function targetTermMatch(target, entry, language, matchCase) {
  for (const variant of ACCEPTED_VARIANTS[entry.id]?.[language] ?? []) {
    const exact = [...target.matchAll(phrasePattern(variant, matchCase))][0];
    if (exact) return exact;
    const root = deriveGlossaryRoot(variant, language);
    const pattern = glossaryRootPattern(root, variant, language, matchCase);
    const inflected = pattern ? [...target.matchAll(pattern)][0] : null;
    if (inflected) return inflected;
  }
  if (entry.id === 6 && language === "ru" && entry.targetTerm === "Страховка на экспресс") {
    const form = /(?<![\p{L}\p{N}])Страхов(?:ка|ки|ке|ку|кой|кою|кам|ками|ках|ок)\s+на\s+экспресс(?:а|у|ом|е|ы|ов|ам|ами|ах)?(?![\p{L}\p{N}])/giu;
    const irregular = [...target.matchAll(new RegExp(form.source, matchCase ? "gu" : "giu"))][0];
    if (irregular) return irregular;
  }
  const alternatives = entry.targetTerm.split(/\s*\/\s*/u);
  const terms = alternatives.length > 1 && alternatives.every((part) => /^[\p{L} ]{3,}$/u.test(part))
    ? alternatives : [entry.targetTerm];
  const exact = terms.map((term) => [...target.matchAll(phrasePattern(term, matchCase))][0]).find(Boolean);
  if (exact) return exact;
  const root = entry.targetRoot === undefined ? deriveGlossaryRoot(entry.targetTerm, language) : entry.targetRoot;
  const pattern = glossaryRootPattern(root, entry.targetTerm, language, matchCase);
  return pattern ? [...target.matchAll(pattern)][0] : null;
}

function glossarySenseApplies(entry, source, match, targetLanguage) {
  const after = source.slice((match.index ?? 0) + match[0].length);
  if (entry.id === 285 && /^\s+of\b/iu.test(after)) return false;
  if (entry.id === 190 && /^\s+(?:in|higher\s+on)\b/iu.test(after)) return false;
  if (entry.id === 382 && /^\s+bets?\b/iu.test(after)) return false;
  if (entry.id === 172 && !/\b(curling|bowls)\b/iu.test(source)) return false;
  if (entry.id === 406 && !/\b(cricket|baseball|innings|batsman|bowler)\b/iu.test(source)) return false;
  if (entry.id === 353 && targetLanguage === "az" && /\bpromotional\s+period\b|\bpromotion\s+period\b/iu.test(source)) return false;
  if (entry.id === 177 && /\bin the event of\b/iu.test(source)) return false;
  if (entry.id === 356 && /^\s+(?:a|an|any|at least|single|pre-match|live|accumulators?|bets?|wagers?)\b/iu.test(after)) return false;
  return true;
}

function glossaryGroups(rows, from, to) {
  let languages = compiledGlossaries.get(rows);
  if (!languages) { languages = new Map(); compiledGlossaries.set(rows, languages); }
  const key = `${from}:${to}`;
  if (languages.has(key)) return languages.get(key);
  const groups = new Map();
  for (const row of rows) {
    const sourceTerm = row.terms?.[from]?.trim();
    const targetTerm = row.terms?.[to]?.trim();
    if (!sourceTerm) continue;
    const termKey = sourceTerm.toLocaleLowerCase();
    if (!groups.has(termKey)) groups.set(termKey, { sourceTerm, entries: [] });
    groups.get(termKey).entries.push({ id: row.id, sourceTerm, targetTerm,
      sourceRoot: row.roots?.[from], targetRoot: row.roots?.[to] });
  }
  const prepared = [...groups.values()].sort((a, b) => b.sourceTerm.length - a.sourceTerm.length).map((group) => ({
    ...group,
    needles: [...new Set([group.sourceTerm, ...group.entries.map((entry) => entry.sourceRoot || deriveGlossaryRoot(entry.sourceTerm, from)),
      ...(from === "en-GB" && /[^aeiou]y\b/iu.test(group.sourceTerm) ? [group.sourceTerm.replace(/y\b/iu, "")] : [])]
      .filter(Boolean).map((term) => term.split(/[ \u00a0-]/u)[0].toLocaleLowerCase()))],
    patterns: [phrasePattern(group.sourceTerm), ...group.entries.map((entry) =>
      glossaryRootPattern(entry.sourceRoot === undefined ? deriveGlossaryRoot(entry.sourceTerm, from) : entry.sourceRoot,
        entry.sourceTerm, from)).filter(Boolean)]
  }));
  languages.set(key, prepared);
  return prepared;
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
  const matched = [];
  const occupied = [];
  const foldedSource = source.toLocaleLowerCase();
  for (const group of glossaryGroups(rows, from, to)) {
    if (!group.needles.some((needle) => foldedSource.includes(needle))) continue;
    const sourceMatches = group.patterns.flatMap((pattern) => [...source.matchAll(pattern)])
      .sort((a, b) => a.index - b.index || b[0].length - a[0].length);
    for (const match of sourceMatches) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      // The sports noun "set" is unrelated to the phrasal verb "set up".
      if (group.sourceTerm.toLocaleLowerCase() === "set" && /^\s+up\b/iu.test(source.slice(end))) continue;
      if (occupied.some((range) => start < range.end && end > range.start)) continue;
      occupied.push({ start, end });
      const exactEntries = group.entries.filter((entry) => entry.sourceTerm === match[0]);
      const entries = (exactEntries.length ? exactEntries : group.entries)
        .filter((entry) => entry.targetTerm && glossarySenseApplies(entry, source, match, to));
      const expectedTerms = [...new Set(entries.map((entry) => entry.targetTerm).filter(Boolean))];
      if (!expectedTerms.length) continue;
      if (entries.some((entry) => targetTermMatch(target, entry, to, true))) continue;
      const caseOnlyMatch = entries.map((entry) => targetTermMatch(target, entry, to, false)).find(Boolean);
      const enforceCase = Boolean(exactEntries.length) && !entries.some((entry) => entry.id === 6) &&
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

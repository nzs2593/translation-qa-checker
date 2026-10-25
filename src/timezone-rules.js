import { LANGUAGE_PROFILES } from "./profiles.js";

const STORAGE_KEY = "checkform-timezone-rules-v1";
const SOURCE_LANGUAGE = Object.freeze({ uk: "ru" });
const DEFAULTS = Object.freeze(Object.fromEntries(Object.keys(LANGUAGE_PROFILES).map((code) => [code,
  code === "es-AR" ? { mode: "fixed", label: "GMT", offsetMinutes: -180 }
    : code === "ru" ? { mode: "fixed", label: "МСК", offsetMinutes: 180 }
      : code === "uk" ? { mode: "equivalent", label: "GMT", offsetMinutes: 0 }
        : code === "en" ? { mode: "fixed", label: "GMT", offsetMinutes: 0 }
        : { mode: "source", label: "GMT", offsetMinutes: 0 }
])));

let edits = {};

function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

export function timezoneSourceLanguage(targetLanguage) {
  return SOURCE_LANGUAGE[targetLanguage] ?? "en";
}

export function validTimezoneRule(rule) {
  return Boolean(rule && ["source", "fixed", "equivalent"].includes(rule.mode) &&
    ["GMT", "UTC", "MSK", "МСК"].includes(rule.label) &&
    Number.isInteger(rule.offsetMinutes) && rule.offsetMinutes >= -720 && rule.offsetMinutes <= 840 &&
    !(["MSK", "МСК"].includes(rule.label) && rule.offsetMinutes !== 180));
}

export function loadTimezoneRules(storage = browserStorage()) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "{}");
    edits = Object.fromEntries(Object.entries(parsed ?? {}).filter(([code, rule]) =>
      code in DEFAULTS && validTimezoneRule(rule)));
  } catch { edits = {}; }
  return getTimezoneRules();
}

export function getTimezoneRules() {
  return Object.fromEntries(Object.entries(DEFAULTS).map(([code, rule]) => [code, { ...(edits[code] ?? rule) }]));
}

export function getTimezoneRule(code) {
  return { ...(edits[code] ?? DEFAULTS[code] ?? DEFAULTS.en) };
}

export function updateTimezoneRule(code, rule, storage = browserStorage()) {
  if (!(code in DEFAULTS) || !validTimezoneRule(rule)) return false;
  const next = { ...edits, [code]: { mode: rule.mode, label: rule.label, offsetMinutes: rule.offsetMinutes } };
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(next)); edits = next; return true; }
  catch { return false; }
}

export function formatTimezone(label, offsetMinutes) {
  if (label === "MSK" || label === "МСК") return label;
  if (offsetMinutes === 0) return label;
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `${label}${offsetMinutes < 0 ? "-" : "+"}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

export function expectedTimezone(rule, sourceTimezone) {
  return rule?.mode === "fixed" ? { label: rule.label, offsetMinutes: rule.offsetMinutes }
    : rule?.mode === "source" && sourceTimezone ? { label: sourceTimezone.name, offsetMinutes: sourceTimezone.offsetMinutes } : null;
}

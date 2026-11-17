import { LANGUAGE_PROFILES } from "./profiles.js";

const STORAGE_KEY = "checkform-timezone-rules-v1";
const SOURCE_LANGUAGE = Object.freeze({ uk: "ru" });
const DEFAULTS = Object.freeze(Object.fromEntries(Object.keys(LANGUAGE_PROFILES).map((code) => [code,
  code === "es-AR" || code === "pt-BR" ? { mode: "fixed", label: "GMT", offsetMinutes: -180 }
    : code === "ru" ? { mode: "fixed", label: "МСК", offsetMinutes: 180 }
      : code === "az" ? { mode: "fixed", label: "GMT", offsetMinutes: 240 }
      : code === "uz-Cyrl" || code === "uz-Latn" ? { mode: "fixed", label: "GMT", offsetMinutes: 300 }
      : code === "mn" ? { mode: "fixed", label: "GMT", offsetMinutes: 480 }
      : code === "da" ? { mode: "seasonal", label: "GMT", offsetMinutes: 0, zone: "Europe/Copenhagen" }
      : code === "uk" ? { mode: "seasonal", label: "GMT", offsetMinutes: 0, zone: "Europe/Kyiv" }
      : code === "es" ? { mode: "equivalent", label: "GMT", offsetMinutes: 0 }
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
  return Boolean(rule && ["source", "fixed", "equivalent", "seasonal"].includes(rule.mode) &&
    ["GMT", "UTC", "MSK", "МСК"].includes(rule.label) &&
    Number.isInteger(rule.offsetMinutes) && rule.offsetMinutes >= -720 && rule.offsetMinutes <= 840 &&
    (rule.mode !== "seasonal" || ["Europe/Copenhagen", "Europe/Kyiv"].includes(rule.zone)) &&
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
  const next = { ...edits, [code]: { mode: rule.mode, label: rule.label, offsetMinutes: rule.offsetMinutes,
    ...(rule.mode === "seasonal" ? { zone: rule.zone } : {}) } };
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

export function seasonalOffsetMinutes(zone, utcMillis) {
  if (!Number.isFinite(utcMillis)) return null;
  const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" })
    .formatToParts(new Date(utcMillis)).find((item) => item.type === "timeZoneName")?.value;
  const match = /^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/u.exec(part ?? "");
  if (!match) return null;
  return (match[1] === "-" ? -1 : 1) * (Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0));
}

export function expectedTimezone(rule, sourceTimezone, utcMillis = null) {
  return rule?.mode === "fixed" ? { label: rule.label, offsetMinutes: rule.offsetMinutes }
    : rule?.mode === "seasonal" && Number.isFinite(utcMillis) ?
      { label: rule.label, offsetMinutes: seasonalOffsetMinutes(rule.zone, utcMillis) }
    : rule?.mode === "source" && sourceTimezone ? { label: sourceTimezone.name, offsetMinutes: sourceTimezone.offsetMinutes } : null;
}

export const POOLS = Object.freeze([
  "Numbers", "Currency", "Percentage", "Punctuation", "Spacing", "Capitalization",
  "Placeholders", "Terminology", "Formatting", "Transliteration", "Dates & Time", "File structure"
]);

export const SEVERITIES = Object.freeze(["Critical", "Major", "Minor", "Info"]);

export function createIssue({ error_type, pool, severity = "Minor", location_in_target, location_in_source, explanation }) {
  if (!error_type || !POOLS.includes(pool) || !SEVERITIES.includes(severity)) {
    throw new Error("Invalid issue contract");
  }
  return {
    error_type,
    pool,
    severity,
    location_in_target: location_in_target ?? { start: 0, end: 0 },
    ...(location_in_source ? { location_in_source } : {}),
    ...(explanation ? { explanation } : {})
  };
}

export function location(start, end) {
  return { start, end };
}

export const GLOSSARY_EXTENSION_POINT = Object.freeze({
  enabled: false,
  terms: [],
  note: "Glossary matching is reserved for a future layer."
});

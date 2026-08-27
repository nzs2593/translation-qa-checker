import { createIssue, location } from "./domain.js?v=1.1";

const MONTHS = {
  en: { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 },
  ru: { января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6, июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12 },
  es: { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 },
  pt: { janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 },
  da: { januar: 1, februar: 2, marts: 3, april: 4, maj: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, december: 12 },
  uk: { січня: 1, лютого: 2, березня: 3, квітня: 4, травня: 5, червня: 6, липня: 7, серпня: 8, вересня: 9, жовтня: 10, листопада: 11, грудня: 12 }
};

const MONTH_WORDS = Object.values(MONTHS).flatMap((months) => Object.keys(months)).join("|");
const TEMPORAL_RE = new RegExp(`(?:(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})|(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})|(\\d{1,2})\\s+(${MONTH_WORDS})\\s+(\\d{4}))?(?:\\s*(?:at|в|a las|às|,)?\\s*)?(\\d{1,2}):(\\d{2})(?::(\\d{2}))?\\s*(AM|PM|am|pm)?\\s*(?:(GMT|UTC)\\s*([+-])?\\s*(\\d{1,2})?(?::?(\\d{2}))?)?`, "i");
const DATE_ONLY_RE = new RegExp(`(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})|(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})|(\\d{1,2})\\s+(${MONTH_WORDS})\\s+(\\d{4})`, "i");

function parseTimezone(zone, sign, hours = "0", minutes = "0") {
  if (!zone) return null;
  const magnitude = Number(hours) * 60 + Number(minutes);
  const signed = sign === "-" ? -magnitude : magnitude;
  return { label: `${zone.toUpperCase()}${sign ?? "+"}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`, offsetMinutes: signed };
}

function resolveDate(match, dateOrder, language) {
  let year; let month; let day;
  if (match[1]) { year = Number(match[1]); month = Number(match[2]); day = Number(match[3]); }
  else if (match[4]) {
    const a = Number(match[4]); const b = Number(match[5]); year = Number(match[6]); year += year < 100 ? 2000 : 0;
    [day, month] = dateOrder === "MDY" ? [b, a] : [a, b];
  } else if (match[7]) {
    day = Number(match[7]); month = MONTHS[language]?.[match[8].toLowerCase()] ?? MONTHS.en[match[8].toLowerCase()]; year = Number(match[9]);
  }
  return year && month && day ? { year, month, day } : null;
}

export function parseTemporal(text, { dateOrder = "DMY", language = "en" } = {}) {
  const match = text.match(TEMPORAL_RE);
  if (!match) {
    const dateMatch = text.match(DATE_ONLY_RE);
    if (!dateMatch) return null;
    const date = resolveDate(dateMatch, dateOrder, language);
    if (!date) return null;
    const utcMillis = Date.UTC(date.year, date.month - 1, date.day);
    return {
      raw: dateMatch[0], index: dateMatch.index ?? 0, date, hasTime: false, hour: 0, minute: 0, second: 0, timezone: null,
      utcMillis, localKey: `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}T00:00:00`
    };
  }
  const date = resolveDate(match, dateOrder, language);
  const hasTime = Boolean(match[10]);
  if (!date && !hasTime) return null;
  let hour = hasTime ? Number(match[10]) : 0;
  const minute = hasTime ? Number(match[11]) : 0;
  const second = hasTime && match[12] ? Number(match[12]) : 0;
  const meridiem = hasTime ? match[13]?.toUpperCase() : null;
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const timezone = parseTimezone(match[14], match[15], match[16] ?? "0", match[17] ?? "0");
  const safeDate = date ?? { year: 1970, month: 1, day: 1 };
  const utcMillis = Date.UTC(safeDate.year, safeDate.month - 1, safeDate.day, hour, minute, second) - (timezone?.offsetMinutes ?? 0) * 60000;
  return {
    raw: match[0], index: match.index ?? 0, date, hasTime, hour, minute, second, timezone,
    utcMillis, localKey: `${safeDate.year}-${String(safeDate.month).padStart(2, "0")}-${String(safeDate.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
  };
}

export function checkDatesAndTime(source, target, { sourceProfile, targetProfile }) {
  const sourceTemporal = parseTemporal(source, sourceProfile);
  const targetTemporal = parseTemporal(target, targetProfile);
  if (!sourceTemporal || !targetTemporal) return [];
  const targetLocation = location(targetTemporal.index, targetTemporal.index + targetTemporal.raw.length);
  const sourceHasZone = Boolean(sourceTemporal.timezone);
  const targetHasZone = Boolean(targetTemporal.timezone);
  const sourceLocation = location(sourceTemporal.index, sourceTemporal.index + sourceTemporal.raw.length);

  if (sourceHasZone && !targetHasZone) {
    return [createIssue({ error_type: "TIMEZONE_MISSING", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Timezone is present in the source but missing in the target." })];
  }
  if (!sourceHasZone && targetHasZone) {
    return [createIssue({ error_type: "TIMEZONE_EXTRA", pool: "Dates & Time", severity: "Minor", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Target adds a timezone that is not present in the source." })];
  }
  if (sourceHasZone && targetHasZone && sourceTemporal.localKey === targetTemporal.localKey && sourceTemporal.timezone.offsetMinutes !== targetTemporal.timezone.offsetMinutes) {
    return [createIssue({ error_type: "TIMEZONE_MISMATCH", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "The local date/time matches, but the timezone offset differs." })];
  }
  if (sourceTemporal.date && targetTemporal.date && !sourceTemporal.hasTime && !targetTemporal.hasTime && sourceTemporal.localKey !== targetTemporal.localKey) {
    return [createIssue({ error_type: "DATE_MISMATCH", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Source and target contain different calendar dates." })];
  }
  if (sourceTemporal.hasTime && targetTemporal.hasTime && sourceTemporal.localKey.endsWith(sourceTemporal.localKey.slice(10)) !== targetTemporal.localKey.endsWith(targetTemporal.localKey.slice(10))) {
    return [createIssue({ error_type: "TIME_MISMATCH", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Source and target contain different clock times." })];
  }
  if (sourceTemporal.utcMillis !== targetTemporal.utcMillis) {
    return [createIssue({ error_type: "DATETIME_MISMATCH", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Source and target resolve to different moments in time after normalization." })];
  }
  return [];
}

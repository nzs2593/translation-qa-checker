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
const DATE_RE = new RegExp(`(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})|(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})|(\\d{1,2})\\s+(${MONTH_WORDS})\\s+(\\d{4})`, "giu");
const TIME_RE = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\s*(?:(GMT|UTC)\s*([+-])?\s*(\d{1,2})?(?::?(\d{2}))?)?/giu;

function parseTimezone(zone, sign, hours = "0", minutes = "0") {
  if (!zone) return null;
  const numericHours = Number(hours);
  const numericMinutes = Number(minutes);
  // A range such as “UTC - 20:50” is two clock times, not a UTC-20:50 offset.
  if (numericHours > 14 || numericMinutes > 59) return { label: `${zone.toUpperCase()}+00:00`, offsetMinutes: 0 };
  const magnitude = numericHours * 60 + numericMinutes;
  const signed = sign === "-" ? -magnitude : magnitude;
  return { label: `${zone.toUpperCase()}${sign ?? "+"}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`, offsetMinutes: signed };
}

function resolveDate(match, dateOrder, language) {
  let year; let month; let day;
  if (match[1]) {
    year = Number(match[1]); month = Number(match[2]); day = Number(match[3]);
  } else if (match[4]) {
    const a = Number(match[4]); const b = Number(match[5]); year = Number(match[6]); year += year < 100 ? 2000 : 0;
    [day, month] = dateOrder === "MDY" ? [b, a] : [a, b];
  } else if (match[7]) {
    day = Number(match[7]);
    const monthName = match[8].toLowerCase();
    month = MONTHS[language]?.[monthName] ?? MONTHS.en[monthName];
    year = Number(match[9]);
  }
  return year && month && day ? { year, month, day } : null;
}

function isValidDate(date) {
  if (!date) return true;
  const value = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return value.getUTCFullYear() === date.year && value.getUTCMonth() === date.month - 1 && value.getUTCDate() === date.day;
}

function localKey(date, hour, minute, second) {
  const safeDate = date ?? { year: 1970, month: 1, day: 1 };
  return `${safeDate.year}-${String(safeDate.month).padStart(2, "0")}-${String(safeDate.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

export function parseTemporal(text, { dateOrder = "DMY", language = "en" } = {}) {
  DATE_RE.lastIndex = 0;
  TIME_RE.lastIndex = 0;
  const dateMatch = DATE_RE.exec(text);
  DATE_RE.lastIndex = 0;
  const timeMatch = TIME_RE.exec(text);
  if (!dateMatch && !timeMatch) return null;

  const date = dateMatch ? resolveDate(dateMatch, dateOrder, language) : null;
  const validDate = isValidDate(date);
  const hasTime = Boolean(timeMatch);
  let hour = timeMatch ? Number(timeMatch[1]) : 0;
  const minute = timeMatch ? Number(timeMatch[2]) : 0;
  const second = timeMatch && timeMatch[3] ? Number(timeMatch[3]) : 0;
  const meridiem = timeMatch ? timeMatch[4]?.toUpperCase() : null;
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const timezone = timeMatch ? parseTimezone(timeMatch[5], timeMatch[6], timeMatch[7] ?? "0", timeMatch[8] ?? "0") : null;

  const dateStart = dateMatch?.index ?? Number.POSITIVE_INFINITY;
  const timeStart = timeMatch?.index ?? Number.POSITIVE_INFINITY;
  const index = Math.min(dateStart, timeStart);
  const end = Math.max(dateMatch ? dateStart + dateMatch[0].length : 0, timeMatch ? timeStart + timeMatch[0].length : 0);
  const safeDate = validDate && date ? date : { year: 1970, month: 1, day: 1 };
  const utcMillis = validDate
    ? Date.UTC(safeDate.year, safeDate.month - 1, safeDate.day, hour, minute, second) - (timezone?.offsetMinutes ?? 0) * 60000
    : null;
  const dateLocation = dateMatch ? location(dateStart, dateStart + dateMatch[0].length) : null;
  return {
    raw: text.slice(index, end), index, date, dateLocation, validDate, hasTime, hour, minute, second, timezone,
    utcMillis, localKey: localKey(date, hour, minute, second)
  };
}

export function checkDatesAndTime(source, target, { sourceProfile, targetProfile }) {
  const sourceTemporal = parseTemporal(source, sourceProfile);
  const targetTemporal = parseTemporal(target, targetProfile);
  if (!sourceTemporal || !targetTemporal) return [];

  const targetLocation = location(targetTemporal.index, targetTemporal.index + targetTemporal.raw.length);
  const sourceLocation = location(sourceTemporal.index, sourceTemporal.index + sourceTemporal.raw.length);
  const targetDateLocation = targetTemporal.dateLocation ?? targetLocation;
  const sourceDateLocation = sourceTemporal.dateLocation ?? sourceLocation;

  if (!sourceTemporal.validDate || !targetTemporal.validDate) {
    return [createIssue({
      error_type: "INVALID_DATE", pool: "Dates & Time", severity: "Major",
      location_in_source: sourceTemporal.validDate ? sourceLocation : sourceDateLocation,
      location_in_target: targetTemporal.validDate ? targetLocation : targetDateLocation,
      explanation: "A calendar date is not valid in the source or target."
    })];
  }

  const sourceHasZone = Boolean(sourceTemporal.timezone);
  const targetHasZone = Boolean(targetTemporal.timezone);
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
  if (sourceTemporal.utcMillis === targetTemporal.utcMillis) return [];
  if (!sourceTemporal.date && !targetTemporal.date && sourceTemporal.hasTime && targetTemporal.hasTime) {
    const sourceClock = (sourceTemporal.hour * 60 + sourceTemporal.minute - (sourceTemporal.timezone?.offsetMinutes ?? 0) + 1440) % 1440;
    const targetClock = (targetTemporal.hour * 60 + targetTemporal.minute - (targetTemporal.timezone?.offsetMinutes ?? 0) + 1440) % 1440;
    if (sourceClock === targetClock) return [];
  }
  const sameCalendarDate = sourceTemporal.date && targetTemporal.date && sourceTemporal.localKey.slice(0, 10) === targetTemporal.localKey.slice(0, 10);
  const sameClock = sourceTemporal.localKey.slice(11) === targetTemporal.localKey.slice(11);
  if (sourceTemporal.hasTime && targetTemporal.hasTime && sameCalendarDate && !sameClock) {
    return [createIssue({ error_type: "TIME_MISMATCH", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Source and target contain different clock times." })];
  }
  if (sourceTemporal.utcMillis !== targetTemporal.utcMillis) {
    return [createIssue({ error_type: "DATETIME_MISMATCH", pool: "Dates & Time", severity: "Major", location_in_source: sourceLocation, location_in_target: targetLocation, explanation: "Source and target resolve to different moments in time after timezone normalization." })];
  }
  return [];
}

import { createIssue, location } from "./domain.js?v=1.1";

const MONTHS = {
  en: "january february march april may june july august september october november december",
  es: "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre",
  ru: "января февраля марта апреля мая июня июля августа сентября октября ноября декабря",
  pt: "janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro",
  da: "januar februar marts april maj juni juli august september oktober november december",
  uk: "січня лютого березня квітня травня червня липня серпня вересня жовтня грудня"
};
const MONTH_MAP = Object.fromEntries(Object.entries(MONTHS).flatMap(([language, words]) => words.split(" ").map((word, index) => [`${language}:${word}`, index + 1])));
const MONTH_WORDS = Object.values(MONTHS).join("|").replaceAll(" ", "|");
const DATE_RE = new RegExp(`(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})|(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})|(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:de\\s+)?(${MONTH_WORDS})(?:\\s+(?:de|of))?\\s+(\\d{4})`, "giu");
const TIME_RE = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\s*(?:(GMT|UTC)\s*([+-])?\s*(\d{1,2})?(?::?(\d{2}))?)?/giu;

function parseTimezone(zone, sign, hours = "0", minutes = "0") {
  if (!zone) return null;
  const h = Number(hours); const m = Number(minutes);
  if (h > 14 || m > 59 || (h === 14 && m !== 0)) return null;
  return { label: `${zone.toUpperCase()}${sign ?? "+"}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`, offsetMinutes: (sign === "-" ? -1 : 1) * (h * 60 + m) };
}

function resolveDate(match, profile) {
  let year; let month; let day;
  if (match[1]) [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  else if (match[4]) {
    const a = Number(match[4]); const b = Number(match[5]); year = Number(match[6]);
    year += year < 100 ? 2000 : 0;
    [day, month] = profile.dateOrder === "MDY" ? [b, a] : [a, b];
  } else if (match[7]) {
    day = Number(match[7]); year = Number(match[9]);
    const word = match[8].toLowerCase();
    month = MONTH_MAP[`${profile.language ?? "en"}:${word}`] ?? MONTH_MAP[`en:${word}`];
  }
  return year && month && day ? { year, month, day } : null;
}

function validDate(date) {
  if (!date) return true;
  const value = new Date(0);
  value.setUTCFullYear(date.year, date.month - 1, date.day);
  return value.getUTCFullYear() === date.year && value.getUTCMonth() === date.month - 1 && value.getUTCDate() === date.day;
}

function makeTemporal(text, dateMatch, timeMatch, profile) {
  const date = dateMatch ? resolveDate(dateMatch, profile) : null;
  let hour = timeMatch ? Number(timeMatch[1]) : 0;
  const minute = timeMatch ? Number(timeMatch[2]) : 0;
  const second = timeMatch?.[3] ? Number(timeMatch[3]) : 0;
  const ampm = timeMatch?.[4]?.toUpperCase();
  const validTime = !timeMatch || (hour >= (ampm ? 1 : 0) && hour <= (ampm ? 12 : 23) && minute <= 59 && second <= 59);
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const timezone = timeMatch ? parseTimezone(timeMatch[5], timeMatch[6], timeMatch[7] ?? "0", timeMatch[8] ?? "0") : null;
  const validTimezone = !timeMatch?.[5] || Boolean(timezone);
  const index = Math.min(dateMatch?.index ?? Infinity, timeMatch?.index ?? Infinity);
  const end = Math.max(dateMatch ? dateMatch.index + dateMatch[0].length : 0, timeMatch ? timeMatch.index + timeMatch[0].length : 0);
  const base = date ?? { year: 1970, month: 1, day: 1 };
  const utc = new Date(0);
  utc.setUTCFullYear(base.year, base.month - 1, base.day);
  utc.setUTCHours(hour, minute, second, 0);
  return {
    raw: text.slice(index, end), index, date,
    dateLocation: dateMatch ? location(dateMatch.index, dateMatch.index + dateMatch[0].length) : null,
    validDate: validDate(date), validTime, validTimezone, hasTime: Boolean(timeMatch),
    hour, minute, second, timezone,
    utcMillis: validDate(date) && validTime && validTimezone ? utc.getTime() - (timezone?.offsetMinutes ?? 0) * 60000 : null,
    localKey: `${base.year}-${String(base.month).padStart(2, "0")}-${String(base.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
  };
}

function nearbyDate(text, time, dates, used, times) {
  let best = -1; let shortest = Infinity;
  for (const [index, date] of dates.entries()) {
    if (used.has(index)) continue;
    const gapStart = Math.min(time.index + time[0].length, date.index + date[0].length);
    const gapEnd = Math.max(time.index, date.index);
    const length = Math.max(0, gapEnd - gapStart);
    if (length > 32 || length >= shortest) continue;
    if (!/^[\s\u00a0,]*(?:(?:on|at|the|del|de|las?|el|a|às?|em)\s*)*$/iu.test(text.slice(gapStart, gapEnd))) continue;
    if (times.some((other) => other !== time && other.index >= gapStart && other.index < gapEnd)) continue;
    best = index; shortest = length;
  }
  return best;
}

export function parseTemporals(text, profile = {}) {
  const dates = [...text.matchAll(DATE_RE)];
  const times = [...text.matchAll(TIME_RE)];
  const used = new Set();
  const result = times.map((time) => {
    const index = nearbyDate(text, time, dates, used, times);
    if (index >= 0) used.add(index);
    return makeTemporal(text, index >= 0 ? dates[index] : null, time, profile);
  });
  for (const [index, date] of dates.entries()) {
    if (!used.has(index)) result.push(makeTemporal(text, date, null, profile));
  }
  return result.sort((a, b) => a.index - b.index);
}

export function parseTemporal(text, profile = {}) {
  return parseTemporals(text, profile)[0] ?? null;
}

function sameMoment(source, target) {
  if (Boolean(source.date) !== Boolean(target.date) || source.hasTime !== target.hasTime) return false;
  if (source.hasTime && Boolean(source.timezone) !== Boolean(target.timezone)) return false;
  if (source.date && source.hasTime) return source.utcMillis === target.utcMillis;
  if (source.date) return source.localKey === target.localKey;
  if (source.timezone) {
    const sourceClock = source.hour * 60 + source.minute - source.timezone.offsetMinutes;
    const targetClock = target.hour * 60 + target.minute - target.timezone.offsetMinutes;
    return (sourceClock - targetClock) % 1440 === 0 && source.second === target.second;
  }
  return source.localKey === target.localKey;
}

function issueFor(source, target, error_type, explanation) {
  return createIssue({
    error_type, pool: "Dates & Time", severity: error_type === "TIMEZONE_EXTRA" ? "Minor" : "Major",
    location_in_source: source ? location(source.index, source.index + source.raw.length) : location(0, 0),
    location_in_target: target ? location(target.index, target.index + target.raw.length) : location(0, 0),
    explanation
  });
}

export function checkDatesAndTime(source, target, { sourceProfile, targetProfile }) {
  const sourceItems = parseTemporals(source, sourceProfile);
  const targetItems = parseTemporals(target, targetProfile);
  const invalid = [...sourceItems, ...targetItems].filter((item) => !item.validDate || !item.validTime || !item.validTimezone);
  if (invalid.length) return invalid.map((item) => issueFor(sourceItems.includes(item) ? item : null, targetItems.includes(item) ? item : null, "INVALID_DATE", "A calendar date, clock time, or GMT offset is invalid in the source or target."));
  // The target may repeat the original GMT moments in a parenthesis. Those
  // repetitions cannot excuse an incorrect converted time earlier in the line.
  const pairs = sourceItems.map((sourceItem, index) => [sourceItem, targetItems[index]]);
  return pairs.flatMap(([sourceItem, targetItem]) => {
    if (targetItem && sameMoment(sourceItem, targetItem)) {
      const preferredOffset = targetProfile.preferredTimezoneOffsetMinutes;
      if (preferredOffset != null && sourceItem.timezone && targetItem.timezone &&
          sourceItem.timezone.offsetMinutes !== preferredOffset && targetItem.timezone.offsetMinutes !== preferredOffset) {
        return issueFor(sourceItem, targetItem, "TIMEZONE_MISMATCH", "Target time is equivalent, but does not use the selected locale's GMT offset.");
      }
      return [];
    }
    if (!targetItem) return issueFor(sourceItem, null, "DATETIME_MISMATCH", "A source date or time is missing from the target.");
    if (sourceItem.timezone && !targetItem.timezone) return issueFor(sourceItem, targetItem, "TIMEZONE_MISSING", "Timezone is present in the source but missing in the target.");
    if (!sourceItem.timezone && targetItem.timezone) return issueFor(sourceItem, targetItem, "TIMEZONE_EXTRA", "Target adds a timezone that is not present in the source.");
    if (sourceItem.timezone && targetItem.timezone && sourceItem.localKey === targetItem.localKey && sourceItem.timezone.offsetMinutes !== targetItem.timezone.offsetMinutes) return issueFor(sourceItem, targetItem, "TIMEZONE_MISMATCH", "The local date/time matches, but the timezone offset differs.");
    if (sourceItem.date && targetItem.date && !sourceItem.hasTime && !targetItem.hasTime) return issueFor(sourceItem, targetItem, "DATE_MISMATCH", "Source and target contain different calendar dates.");
    if (sourceItem.date && targetItem.date && sourceItem.hasTime && targetItem.hasTime && sourceItem.localKey.slice(0, 10) === targetItem.localKey.slice(0, 10) && sourceItem.localKey.slice(11) !== targetItem.localKey.slice(11)) return issueFor(sourceItem, targetItem, "TIME_MISMATCH", "Source and target contain different clock times.");
    return issueFor(sourceItem, targetItem, "DATETIME_MISMATCH", "Source and target resolve to different moments in time after timezone normalization.");
  }).flat();
}

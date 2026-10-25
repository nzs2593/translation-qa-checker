(() => {
  // src/domain.js?v=1.1
  var POOLS = Object.freeze([
    "Numbers",
    "Currency",
    "Percentage",
    "Punctuation",
    "Spacing",
    "Capitalization",
    "Placeholders",
    "Terminology",
    "Formatting",
    "Transliteration",
    "Dates & Time",
    "File structure"
  ]);
  var SEVERITIES = Object.freeze(["Critical", "Major", "Minor", "Info"]);
  function createIssue({ error_type, pool, severity = "Minor", location_in_target, location_in_source, explanation, glossary, timezone, format }) {
    if (!error_type || !POOLS.includes(pool) || !SEVERITIES.includes(severity)) {
      throw new Error("Invalid issue contract");
    }
    return {
      error_type,
      pool,
      severity,
      location_in_target: location_in_target ?? { start: 0, end: 0 },
      ...location_in_source ? { location_in_source } : {},
      ...explanation ? { explanation } : {},
      ...glossary ? { glossary } : {},
      ...timezone ? { timezone } : {},
      ...format ? { format } : {}
    };
  }
  function location(start, end) {
    return { start, end };
  }

  // src/profiles.js
  var LANGUAGE_PROFILES = Object.freeze({
    "en": {
      label: "English",
      dateOrder: "DMY",
      dateFormat: "DD/MM/YYYY",
      dateSeparator: "/",
      decimal: ".",
      grouping: ",",
      percentSpace: false,
      quoteStyle: "uk-single",
      currencyPlacement: "prefix",
      currencySpace: "",
      defaultTimezone: null
    },
    "ru": {
      label: "Russian",
      dateOrder: "DMY",
      dateFormat: "DD.MM.YYYY",
      dateSeparator: ".",
      decimal: ",",
      grouping: "nbsp",
      percentSpace: false,
      quoteStyle: "guillemets",
      currencyPlacement: "suffix",
      currencySpace: " ",
      defaultTimezone: null
    },
    "es": {
      label: "Spanish",
      dateOrder: "DMY",
      dateFormat: "DD/MM/YYYY",
      dateSeparator: "/",
      decimal: ",",
      grouping: ".",
      percentSpace: false,
      quoteStyle: null,
      currencyPlacement: "suffix",
      currencySpace: "",
      defaultTimezone: null,
      currencyRules: { "AR$": { placement: "prefix", space: "" }, "US$": { placement: "prefix", space: "" }, "$": { placement: "prefix", space: "" }, "USD": { placement: "suffix", space: " " }, "EUR": { placement: "suffix", space: " " } }
    },
    "es-AR": {
      label: "Argentine Spanish",
      dateOrder: "DMY",
      dateFormat: "DD/MM/YYYY",
      dateSeparator: "/",
      decimal: ",",
      grouping: ".",
      percentSpace: false,
      quoteStyle: null,
      currencyPlacement: "prefix",
      currencySpace: "",
      defaultTimezone: null,
      preferredTimezoneOffsetMinutes: -180,
      currencyRules: { "AR$": { placement: "prefix", space: "" }, "US$": { placement: "prefix", space: "" }, "$": { placement: "prefix", space: "" }, "USD": { placement: "prefix", space: " " }, "ARS": { placement: "prefix", space: " " } }
    },
    "uz-Cyrl": {
      label: "Uzbek Cyrillic",
      dateOrder: "DMY",
      dateFormat: "DD.MM.YYYY",
      dateSeparator: ".",
      decimal: ".",
      grouping: "nbsp",
      percentSpace: false,
      quoteStyle: "guillemets",
      currencyPlacement: "suffix",
      currencySpace: " ",
      defaultTimezone: null
    },
    "uz-Latn": {
      label: "Uzbek Latin",
      dateOrder: "DMY",
      dateFormat: "DD.MM.YYYY",
      dateSeparator: ".",
      decimal: ".",
      grouping: "nbsp",
      percentSpace: false,
      quoteStyle: "double",
      currencyPlacement: "suffix",
      currencySpace: " ",
      defaultTimezone: null
    },
    "uk": {
      label: "Ukrainian",
      dateOrder: "DMY",
      dateFormat: "DD.MM.YYYY",
      dateSeparator: ".",
      decimal: ",",
      grouping: "nbsp",
      percentSpace: false,
      quoteStyle: "guillemets",
      currencyPlacement: "prefix",
      currencySpace: "",
      defaultTimezone: null,
      currencyRules: { "UAH": { placement: "suffix", space: "nbsp" } }
    },
    "mn": {
      label: "Mongolian",
      dateOrder: "YMD",
      dateFormat: "YYYY/MM/DD",
      dateSeparator: "/",
      decimal: ",",
      grouping: "nbsp",
      percentSpace: false,
      quoteStyle: null,
      currencyPlacement: "prefix",
      currencySpace: "",
      defaultTimezone: null,
      currencyRules: { "MNT": { placement: "suffix", space: "" } }
    },
    "da": {
      label: "Danish",
      dateOrder: "DMY",
      dateFormat: "DD/MM/YYYY",
      dateSeparator: "/",
      decimal: ",",
      grouping: ".",
      percentSpace: true,
      quoteStyle: "double",
      currencyPlacement: "suffix",
      currencySpace: " ",
      defaultTimezone: null
    },
    "pt-BR": {
      label: "Brazilian Portuguese",
      dateOrder: "DMY",
      dateFormat: "DD/MM/YYYY",
      dateSeparator: "/",
      decimal: ",",
      grouping: ".",
      percentSpace: false,
      quoteStyle: "double",
      currencyPlacement: "prefix",
      currencySpace: "nbsp",
      defaultTimezone: null,
      currencyRules: { "BRL": { placement: "suffix", space: "nbsp" } }
    },
    "az": {
      label: "Azerbaijani",
      dateOrder: "DMY",
      dateFormat: "DD.MM.YYYY",
      dateSeparator: ".",
      decimal: ",",
      grouping: "nbsp",
      percentSpace: false,
      quoteStyle: "double",
      currencyPlacement: "suffix",
      currencySpace: "nbsp",
      defaultTimezone: null
    }
  });
  function getProfile(code) {
    return LANGUAGE_PROFILES[code] ?? LANGUAGE_PROFILES.en;
  }

  // src/timezone-rules.js
  var STORAGE_KEY = "checkform-timezone-rules-v1";
  var SOURCE_LANGUAGE = Object.freeze({ uk: "ru" });
  var DEFAULTS = Object.freeze(Object.fromEntries(Object.keys(LANGUAGE_PROFILES).map((code) => [
    code,
    code === "es-AR" ? { mode: "fixed", label: "GMT", offsetMinutes: -180 } : code === "ru" ? { mode: "fixed", label: "\u041C\u0421\u041A", offsetMinutes: 180 } : code === "uk" ? { mode: "equivalent", label: "GMT", offsetMinutes: 0 } : code === "en" ? { mode: "fixed", label: "GMT", offsetMinutes: 0 } : { mode: "source", label: "GMT", offsetMinutes: 0 }
  ])));
  var edits = {};
  function browserStorage() {
    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }
  function timezoneSourceLanguage(targetLanguage2) {
    return SOURCE_LANGUAGE[targetLanguage2] ?? "en";
  }
  function validTimezoneRule(rule) {
    return Boolean(rule && ["source", "fixed", "equivalent"].includes(rule.mode) && ["GMT", "UTC", "MSK", "\u041C\u0421\u041A"].includes(rule.label) && Number.isInteger(rule.offsetMinutes) && rule.offsetMinutes >= -720 && rule.offsetMinutes <= 840 && !(["MSK", "\u041C\u0421\u041A"].includes(rule.label) && rule.offsetMinutes !== 180));
  }
  function loadTimezoneRules(storage = browserStorage()) {
    try {
      const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "{}");
      edits = Object.fromEntries(Object.entries(parsed ?? {}).filter(([code, rule]) => code in DEFAULTS && validTimezoneRule(rule)));
    } catch {
      edits = {};
    }
    return getTimezoneRules();
  }
  function getTimezoneRules() {
    return Object.fromEntries(Object.entries(DEFAULTS).map(([code, rule]) => [code, { ...edits[code] ?? rule }]));
  }
  function getTimezoneRule(code) {
    return { ...edits[code] ?? DEFAULTS[code] ?? DEFAULTS.en };
  }
  function updateTimezoneRule(code, rule, storage = browserStorage()) {
    if (!(code in DEFAULTS) || !validTimezoneRule(rule)) return false;
    const next = { ...edits, [code]: { mode: rule.mode, label: rule.label, offsetMinutes: rule.offsetMinutes } };
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(next));
      edits = next;
      return true;
    } catch {
      return false;
    }
  }
  function formatTimezone(label, offsetMinutes) {
    if (label === "MSK" || label === "\u041C\u0421\u041A") return label;
    if (offsetMinutes === 0) return label;
    const absolute = Math.abs(offsetMinutes);
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;
    return `${label}${offsetMinutes < 0 ? "-" : "+"}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
  }
  function expectedTimezone(rule, sourceTimezone) {
    return rule?.mode === "fixed" ? { label: rule.label, offsetMinutes: rule.offsetMinutes } : rule?.mode === "source" && sourceTimezone ? { label: sourceTimezone.name, offsetMinutes: sourceTimezone.offsetMinutes } : null;
  }

  // src/dates-time.js?v=2.1
  var MONTHS = {
    en: "january february march april may june july august september october november december",
    es: "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre",
    ru: "\u044F\u043D\u0432\u0430\u0440\u044F \u0444\u0435\u0432\u0440\u0430\u043B\u044F \u043C\u0430\u0440\u0442\u0430 \u0430\u043F\u0440\u0435\u043B\u044F \u043C\u0430\u044F \u0438\u044E\u043D\u044F \u0438\u044E\u043B\u044F \u0430\u0432\u0433\u0443\u0441\u0442\u0430 \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F \u043E\u043A\u0442\u044F\u0431\u0440\u044F \u043D\u043E\u044F\u0431\u0440\u044F \u0434\u0435\u043A\u0430\u0431\u0440\u044F",
    pt: "janeiro fevereiro mar\xE7o abril maio junho julho agosto setembro outubro novembro dezembro",
    da: "januar februar marts april maj juni juli august september oktober november december",
    uk: "\u0441\u0456\u0447\u043D\u044F \u043B\u044E\u0442\u043E\u0433\u043E \u0431\u0435\u0440\u0435\u0437\u043D\u044F \u043A\u0432\u0456\u0442\u043D\u044F \u0442\u0440\u0430\u0432\u043D\u044F \u0447\u0435\u0440\u0432\u043D\u044F \u043B\u0438\u043F\u043D\u044F \u0441\u0435\u0440\u043F\u043D\u044F \u0432\u0435\u0440\u0435\u0441\u043D\u044F \u0436\u043E\u0432\u0442\u043D\u044F \u0433\u0440\u0443\u0434\u043D\u044F"
  };
  var MONTH_MAP = Object.fromEntries(Object.entries(MONTHS).flatMap(([language, words]) => words.split(" ").map((word, index) => [`${language}:${word}`, index + 1])));
  var MONTH_WORDS = Object.values(MONTHS).join("|").replaceAll(" ", "|");
  var DATE_RE = new RegExp(`(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})|(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})|(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:de\\s+)?(${MONTH_WORDS})(?:\\s+(?:de|of))?\\s+(\\d{4})`, "giu");
  var TIME_RE = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\s*(?:(GMT|UTC|MSK|МСК)(?:\s*([+\-−])\s*(\d{1,2})?(?::?(\d{2}))?)?)?/giu;
  function parseTimezone(zone, sign, hours = "0", minutes = "0") {
    if (!zone) return null;
    const name = zone.toUpperCase();
    const h = (name === "MSK" || name === "\u041C\u0421\u041A") && !sign ? 3 : Number(hours);
    const m = Number(minutes);
    if (h > 14 || m > 59 || h === 14 && m !== 0) return null;
    return { name, label: formatTimezone(name, (sign === "-" || sign === "\u2212" ? -1 : 1) * (h * 60 + m)), offsetMinutes: (sign === "-" || sign === "\u2212" ? -1 : 1) * (h * 60 + m) };
  }
  function resolveDate(match, profile) {
    let year;
    let month;
    let day;
    if (match[1]) [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    else if (match[4]) {
      const a = Number(match[4]);
      const b = Number(match[5]);
      year = Number(match[6]);
      year += year < 100 ? 2e3 : 0;
      [day, month] = profile.dateOrder === "MDY" ? [b, a] : [a, b];
    } else if (match[7]) {
      day = Number(match[7]);
      year = Number(match[9]);
      const word = match[8].toLowerCase();
      month = MONTH_MAP[`${profile.language ?? "en"}:${word}`] ?? MONTH_MAP[`en:${word}`];
    }
    return year && month && day ? { year, month, day } : null;
  }
  function validDate(date) {
    if (!date) return true;
    const value = /* @__PURE__ */ new Date(0);
    value.setUTCFullYear(date.year, date.month - 1, date.day);
    return value.getUTCFullYear() === date.year && value.getUTCMonth() === date.month - 1 && value.getUTCDate() === date.day;
  }
  function makeTemporal(text, dateMatch, timeMatch, profile) {
    const date = dateMatch ? resolveDate(dateMatch, profile) : null;
    let hour = timeMatch ? Number(timeMatch[1]) : 0;
    const minute = timeMatch ? Number(timeMatch[2]) : 0;
    const second = timeMatch?.[3] ? Number(timeMatch[3]) : 0;
    const ampm = timeMatch?.[4]?.toUpperCase();
    const validTime = !timeMatch || hour >= (ampm ? 1 : 0) && hour <= (ampm ? 12 : 23) && minute <= 59 && second <= 59;
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const timezone = timeMatch ? parseTimezone(timeMatch[5], timeMatch[6], timeMatch[7] ?? "0", timeMatch[8] ?? "0") : null;
    const zoneStart = timeMatch?.[5] ? timeMatch.index + timeMatch[0].search(/GMT|UTC|MSK|МСК/iu) : null;
    const zoneRaw = zoneStart == null ? null : text.slice(zoneStart, timeMatch.index + timeMatch[0].length);
    const validTimezone = !timeMatch?.[5] || Boolean(timezone);
    const index = Math.min(dateMatch?.index ?? Infinity, timeMatch?.index ?? Infinity);
    const end = Math.max(dateMatch ? dateMatch.index + dateMatch[0].length : 0, timeMatch ? timeMatch.index + timeMatch[0].length : 0);
    const base = date ?? { year: 1970, month: 1, day: 1 };
    const utc = /* @__PURE__ */ new Date(0);
    utc.setUTCFullYear(base.year, base.month - 1, base.day);
    utc.setUTCHours(hour, minute, second, 0);
    return {
      raw: text.slice(index, end),
      index,
      date,
      dateLocation: dateMatch ? location(dateMatch.index, dateMatch.index + dateMatch[0].length) : null,
      validDate: validDate(date),
      validTime,
      validTimezone,
      hasTime: Boolean(timeMatch),
      hour,
      minute,
      second,
      timezone,
      zoneRaw,
      timezoneLocation: zoneStart == null ? null : location(zoneStart, zoneStart + zoneRaw.length),
      utcMillis: validDate(date) && validTime && validTimezone ? utc.getTime() - (timezone?.offsetMinutes ?? 0) * 6e4 : null,
      localKey: `${base.year}-${String(base.month).padStart(2, "0")}-${String(base.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
    };
  }
  function nearbyDate(text, time, dates, used, times) {
    let best = -1;
    let shortest = Infinity;
    for (const [index, date] of dates.entries()) {
      if (used.has(index)) continue;
      const gapStart = Math.min(time.index + time[0].length, date.index + date[0].length);
      const gapEnd = Math.max(time.index, date.index);
      const length = Math.max(0, gapEnd - gapStart);
      if (length > 32 || length >= shortest) continue;
      if (!/^[\s\u00a0,]*(?:(?:on|at|the|del|de|las?|el|a|às?|em)\s*)*$/iu.test(text.slice(gapStart, gapEnd))) continue;
      if (times.some((other) => other !== time && other.index >= gapStart && other.index < gapEnd)) continue;
      best = index;
      shortest = length;
    }
    return best;
  }
  function parseTemporals(text, profile = {}) {
    const dates = [...text.matchAll(DATE_RE)];
    const times = [...text.matchAll(TIME_RE)];
    const used = /* @__PURE__ */ new Set();
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
  function issueFor(source, target, error_type, explanation, targetLocation = null, timezone = null) {
    return createIssue({
      error_type,
      pool: "Dates & Time",
      severity: ["TIMEZONE_EXTRA", "TIMEZONE_FORMAT"].includes(error_type) ? "Minor" : "Major",
      location_in_source: source ? location(source.index, source.index + source.raw.length) : location(0, 0),
      location_in_target: targetLocation ?? (target ? location(target.index, target.index + target.raw.length) : location(0, 0)),
      explanation,
      timezone
    });
  }
  function checkDatesAndTime(source, target, { sourceProfile, targetProfile, targetTimezoneRule = null }) {
    const sourceItems = parseTemporals(source, sourceProfile);
    const targetItems = parseTemporals(target, targetProfile);
    const invalid = [...sourceItems, ...targetItems].filter((item) => !item.validDate || !item.validTime || !item.validTimezone);
    if (invalid.length) return invalid.map((item) => issueFor(sourceItems.includes(item) ? item : null, targetItems.includes(item) ? item : null, "INVALID_DATE", "A calendar date, clock time, or GMT offset is invalid in the source or target."));
    const pairs = sourceItems.map((sourceItem, index) => [sourceItem, targetItems[index]]);
    return pairs.flatMap(([sourceItem, targetItem]) => {
      if (!targetItem) return issueFor(sourceItem, null, "DATETIME_MISMATCH", "A source date or time is missing from the target.");
      if (sourceItem.timezone && !targetItem.timezone) return issueFor(sourceItem, targetItem, "TIMEZONE_MISSING", "Timezone is present in the source but missing in the target.");
      if (!sourceItem.timezone && targetItem.timezone) return issueFor(sourceItem, targetItem, "TIMEZONE_EXTRA", "Target adds a timezone that is not present in the source.");
      const expected = targetTimezoneRule ? expectedTimezone(targetTimezoneRule, sourceItem.timezone) : null;
      const canonicalTarget = targetItem.timezone ? formatTimezone(targetItem.timezone.name, targetItem.timezone.offsetMinutes) : null;
      const formatIssue = targetItem.timezone && targetItem.zoneRaw !== canonicalTarget ? issueFor(sourceItem, targetItem, "TIMEZONE_FORMAT", `Timezone marker must not contain spaces or non-standard characters: use ${canonicalTarget}.`, targetItem.timezoneLocation, { expected: canonicalTarget, actual: targetItem.zoneRaw }) : null;
      const expectedMarker = expected ? formatTimezone(expected.label, expected.offsetMinutes) : null;
      if (expected && targetItem.timezone && targetItem.timezone.offsetMinutes !== expected.offsetMinutes)
        return [issueFor(sourceItem, targetItem, "TIMEZONE_OFFSET_MISMATCH", `Expected ${expectedMarker} for the selected target profile; found ${targetItem.zoneRaw}.`, targetItem.timezoneLocation, { expected: expectedMarker, actual: targetItem.zoneRaw }), ...formatIssue ? [formatIssue] : []];
      if (expected && targetItem.timezone && targetItem.timezone.name !== expected.label)
        return [issueFor(sourceItem, targetItem, "TIMEZONE_LABEL_MISMATCH", `Expected timezone marker ${expectedMarker}; found ${targetItem.zoneRaw}.`, targetItem.timezoneLocation, { expected: expectedMarker, actual: targetItem.zoneRaw }), ...formatIssue ? [formatIssue] : []];
      if (targetItem && sameMoment(sourceItem, targetItem)) {
        const preferredOffset = targetProfile.preferredTimezoneOffsetMinutes;
        if (!targetTimezoneRule && preferredOffset != null && sourceItem.timezone && targetItem.timezone && sourceItem.timezone.offsetMinutes !== preferredOffset && targetItem.timezone.offsetMinutes !== preferredOffset) {
          return issueFor(sourceItem, targetItem, "TIMEZONE_MISMATCH", "Target time is equivalent, but does not use the selected locale's GMT offset.");
        }
        return formatIssue ? [formatIssue] : [];
      }
      if (sourceItem.timezone && targetItem.timezone && sourceItem.localKey === targetItem.localKey && sourceItem.timezone.offsetMinutes !== targetItem.timezone.offsetMinutes) return issueFor(sourceItem, targetItem, "TIMEZONE_MISMATCH", "The local date/time matches, but the timezone offset differs.");
      if (sourceItem.date && targetItem.date && !sourceItem.hasTime && !targetItem.hasTime) return issueFor(sourceItem, targetItem, "DATE_MISMATCH", "Source and target contain different calendar dates.");
      if (sourceItem.date && targetItem.date && sourceItem.hasTime && targetItem.hasTime && sourceItem.localKey.slice(0, 10) === targetItem.localKey.slice(0, 10) && sourceItem.localKey.slice(11) !== targetItem.localKey.slice(11)) return [issueFor(sourceItem, targetItem, "TIME_MISMATCH", "Source and target contain different clock times."), ...formatIssue ? [formatIssue] : []];
      return [issueFor(sourceItem, targetItem, "DATETIME_MISMATCH", "Source and target resolve to different moments in time after timezone normalization."), ...formatIssue ? [formatIssue] : []];
    }).flat();
  }

  // src/glossary-data.js
  var GLOSSARY_DEFAULTS = [{ "id": 2, "terms": { "en-GB": "2-way", "az": "2 ax\u0131r", "da": "2-vejs", "mn": "2 \u0445\u0443\u0432\u0438\u043B\u0431\u0430\u0440", "pt-BR": "2 resultados", "ru": "2 \u0438\u0441\u0445\u043E\u0434\u0430", "es": "dos desenlaces", "es-AR": "dos desenlaces", "uk": "2 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438", "uz": "2 xil", "uzb": "2 \u0445\u0438\u043B" } }, { "id": 3, "terms": { "en-GB": "3-way", "az": "3 ax\u0131r", "da": "3-vejs", "mn": "3 \u0445\u0443\u0432\u0438\u043B\u0431\u0430\u0440", "pt-BR": "3 resultados", "ru": "3 \u0438\u0441\u0445\u043E\u0434\u0430", "es": "tres desenlaces", "es-AR": "tres desenlaces", "uk": "3 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438", "uz": "3 xil", "uzb": "3 \u0445\u0438\u043B" } }, { "id": 4, "terms": { "en-GB": "3D Secure", "az": "3D Secure", "da": "3D Secure", "mn": "3D Secure", "pt-BR": "3D Secure", "ru": "3D Secure", "es": "3D Secure", "es-AR": "3D Secure", "uk": "3D Secure", "uz": "3D Secure", "uzb": "3D Secure" } }, { "id": 5, "terms": { "en-GB": "About Us", "da": "Om os", "mn": "\u0411\u0438\u0434\u043D\u0438\u0439 \u0442\u0443\u0445\u0430\u0439", "pt-BR": "Sobre n\xF3s", "ru": "\u041E \u043D\u0430\u0441", "es": "Acerca de nosotros", "es-AR": "Acerca de nosotros", "uk": "\u041F\u0440\u043E \u043D\u0430\u0441", "uz": "Biz haqimizda", "uzb": "\u0411\u0438\u0437 \u04B3\u0430\u049B\u0438\u043C\u0438\u0437\u0434\u0430" }, "notes": { "en-GB": "Capitalised when referring to section", "da": "Capitalised when referring to section, but just the first word.", "pt-BR": "Only the first word is being capitalized", "ru": '"O" is capitalised only if the phrase is used as a section name or at the beginning of a sentence', "uk": '"O" is capitalised only if the phrase is used as a section name or at the beginning of a sentence' } }, { "id": 6, "terms": { "en-GB": "Acca Insurance", "az": "Ekspres M\u0259rc S\u0131\u011Fortas\u0131", "da": "Acca-forsikring", "mn": "\u0425\u0443\u0440\u0438\u043C\u0442\u043B\u0443\u0443\u043B\u0430\u0433\u0447 \u0434\u0430\u0430\u0442\u0433\u0430\u043B", "pt-BR": "Seguro acca", "ru": "\u0421\u0442\u0440\u0430\u0445\u043E\u0432\u043A\u0430 \u043D\u0430 \u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441", "es": "Seguro de combinada", "es-AR": "Seguro de combinada", "uk": "\u0421\u0442\u0440\u0430\u0445\u0443\u0432\u0430\u043D\u043D\u044F \u043D\u0430 \u0435\u043A\u0441\u043F\u0440\u0435\u0441", "uz": "\xABEkspress\xBB kafolat", "uzb": "\xAB\u042D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\xBB \u043A\u0430\u0444\u043E\u043B\u0430\u0442" }, "notes": { "en-GB": "Capitalised when referring to promo name", "pt-BR": "Only the first word is being capitalized", "ru": '"\u0421\u0442\u0440\u0430\u0445\u043E\u0432\u043A\u0430" is capitalised if the phrase is used as a promo/section name or at the beginning of a sentence', "uk": '"\u0421\u0442\u0440\u0430\u0445\u0443\u0432\u0430\u043D\u043D\u044F" is capitalised if the phrase is used as a promo/section name or at the beginning of a sentence' } }, { "id": 7, "terms": { "en-GB": "account", "az": "hesab", "da": "konto", "mn": "\u0431\u04AF\u0440\u0442\u0433\u044D\u043B\u0438\u0439\u043D \u0434\u0430\u043D\u0441", "pt-BR": "conta", "ru": "\u0443\u0447\u0435\u0442\u043D\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C", "es": "cuenta", "es-AR": "cuenta", "uk": "\u043E\u0431\u043B\u0456\u043A\u043E\u0432\u0438\u0439 \u0437\u0430\u043F\u0438\u0441", "uz": "hisob", "uzb": "\u04B3\u0438\u0441\u043E\u0431" }, "notes": { "mn": "for payment method accounts", "uk": "possible option if we have '\u0443\u0447\u0435\u0442\u043D\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C' in Russian" } }, { "id": 8, "terms": { "en-GB": "account balance", "az": "hesab balans\u0131", "da": "saldo", "mn": "\u0442\u043E\u0433\u043B\u043E\u043B\u0442\u044B\u043D \u0434\u0430\u043D\u0441\u043D\u044B \u04AF\u043B\u0434\u044D\u0433\u0434\u044D\u043B", "pt-BR": "saldo da conta", "ru": "\u0431\u0430\u043B\u0430\u043D\u0441 \u0438\u0433\u0440\u043E\u0432\u043E\u0433\u043E \u0441\u0447\u0451\u0442\u0430", "es": "saldo de la cuenta", "es-AR": "saldo de la cuenta", "uk": "\u0431\u0430\u043B\u0430\u043D\u0441 \u0440\u0430\u0445\u0443\u043D\u043A\u0443", "uz": "hisob balansi", "uzb": "\u04B3\u0438\u0441\u043E\u0431 \u0431\u0430\u043B\u0430\u043D\u0441\u0438" }, "notes": { "uk": "to be used when the term is repeated in the text or in mobile version to avoid the text being too long or to hard for perception" } }, { "id": 9, "terms": { "en-GB": "account details", "az": "hesab m\u0259lumat\u0131", "da": "kontooplysninger", "mn": "\u0434\u0430\u043D\u0441\u043D\u044B \u0434\u044D\u043B\u0433\u044D\u0440\u044D\u043D\u0433\u04AF\u0439", "pt-BR": "dados da conta", "ru": "\u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u0433\u0440\u043E\u0432\u043E\u0433\u043E \u0441\u0447\u0451\u0442\u0430", "es": "detalles de la cuenta", "es-AR": "detalles de la cuenta", "uk": "\u0434\u0430\u043D\u0456 \u0440\u0430\u0445\u0443\u043D\u043A\u0443", "uz": "hisob ma'lumotlari", "uzb": "\u04B3\u0438\u0441\u043E\u0431 \u043C\u0430\u044A\u043B\u0443\u043C\u043E\u0442\u043B\u0430\u0440\u0438" }, "notes": { "uk": "to be used when the term is repeated in the text or in mobile version to avoid the text being too long or to hard for perception" } }, { "id": 10, "terms": { "en-GB": "Account History", "az": "Hesab tarix\xE7\u0259si", "da": "Kontohistorik", "mn": "\u0425\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u0434\u0430\u043D\u0441\u043D\u044B \u0442\u04AF\u04AF\u0445", "pt-BR": "Hist\xF3rico da conta", "ru": "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u0447\u0451\u0442\u0430", "es": "Historial de transacciones", "es-AR": "Historial de transacciones", "uk": "\u0406\u0441\u0442\u043E\u0440\u0456\u044F \u0440\u0430\u0445\u0443\u043D\u043A\u0443", "uz": "Hisob tarixi", "uzb": "\u04B2\u0438\u0441\u043E\u0431 \u0442\u0430\u0440\u0438\u0445\u0438" }, "notes": { "en-GB": "Capitalised when referring to section", "ru": '"\u0418\u0441\u0442\u043E\u0440\u0438\u044F" is capitalised only if the phrase is used as a section name or at the beginning of a sentence', "uk": '"\u0406\u0441\u0442\u043E\u0440\u0456\u044F" is capitalised only if the phrase is used as a section name or at the beginning of a sentence' } }, { "id": 11, "terms": { "en-GB": "account name", "az": "hesab\u0131n ad\u0131", "mn": "\u0434\u0430\u043D\u0441\u043D\u044B \u043D\u044D\u0440", "pt-BR": "t\xEDtular da conta", "ru": "\u043D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0447\u0451\u0442\u0430", "es": "nombre de la cuenta", "es-AR": "nombre de la cuenta", "uk": "\u043D\u0430\u0439\u043C\u0435\u043D\u0443\u0432\u0430\u043D\u043D\u044F \u0440\u0430\u0445\u0443\u043D\u043A\u0443", "uz": "hisob nomi", "uzb": "\u04B3\u0438\u0441\u043E\u0431 \u043D\u043E\u043C\u0438" }, "notes": { "az": "in the meaning of 'bank account name'", "pt-BR": "meaning 'aacount holder'" } }, { "id": 12, "terms": { "en-GB": "account number", "az": "hesab n\xF6mr\u0259si", "da": "Marathonbet-kontonummer", "mn": "\u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u0434\u0430\u043D\u0441\u043D\u044B \u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "n\xFAmero da conta", "ru": "\u043D\u043E\u043C\u0435\u0440 \u0441\u0447\u0451\u0442\u0430", "es": "n\xFAmero de cuenta", "es-AR": "n\xFAmero de cuenta", "uk": "\u043D\u043E\u043C\u0435\u0440 \u0440\u0430\u0445\u0443\u043D\u043A\u0443", "uz": "hisob raqami", "uzb": "\u04B3\u0438\u0441\u043E\u0431 \u0440\u0430\u049B\u0430\u043C\u0438" } }, { "id": 13, "terms": { "en-GB": "accumulative bet", "az": "ekspres m\u0259rc", "da": "akkumulerende v\xE6ddem\xE5l", "mn": "\u0445\u0443\u0440\u0438\u043C\u0442\u043B\u0443\u0443\u043B\u0430\u0433\u0447 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta cumulativa", "ru": "\xAB\u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\xBB", "es": "apuesta combinada", "es-AR": "apuesta combinada", "uk": "\u0435\u043A\u0441\u043F\u0440\u0435\u0441", "uz": '"ekspress" stavka', "uzb": "\xAB\u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\xBB \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 14, "terms": { "en-GB": "combined bet", "da": "kombineret v\xE6ddem\xE5l", "mn": "\u0445\u043E\u0441\u043E\u043B\u0441\u043E\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta combinada", "ru": "\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430", "es": "apuesta combinada", "es-AR": "apuesta combinada", "uk": "\u043A\u043E\u043C\u0431\u0456\u043D\u043E\u0432\u0430\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "kombinatsiyalangan stavka", "uzb": "\u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F\u043B\u0430\u043D\u0433\u0430\u043D \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 15, "terms": { "en-GB": "accumulator", "az": "ekspres", "da": "akkumulator", "mn": "\u0445\u0443\u0440\u0438\u043C\u0442\u043B\u0443\u0443\u043B\u0430\u0433\u0447", "pt-BR": "acumulada", "ru": "\xAB\u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\xBB", "es": "combinada", "es-AR": "combinada", "uk": "\u0435\u043A\u0441\u043F\u0440\u0435\u0441", "uz": "\u201Cekspress\u201D stavka", "uzb": "\xAB\u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\xBB \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 16, "terms": { "en-GB": "Accumulators", "da": "Akkumulatorer", "mn": "\u0425\u0443\u0440\u0438\u043C\u0442\u043B\u0443\u0443\u043B\u0430\u0433\u0447\u0438\u0434", "pt-BR": "Acumuladas", "ru": "\xAB\u042D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\u044B\xBB", "es": "Combinadas", "es-AR": "Combinadas", "uk": "\u0415\u043A\u0441\u043F\u0440\u0435\u0441\u0438", "uz": "Ekspresslar", "uzb": "\u042D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\u043B\u0430\u0440" } }, { "id": 17, "terms": { "en-GB": "ace", "da": "serve-es", "pt-BR": "ace", "ru": "\u044D\u0439\u0441", "es": "ace", "es-AR": "ace", "uk": "\u0435\u0439\u0441" } }, { "id": 18, "terms": { "en-GB": "additional time", "az": "art\u0131r\u0131lm\u0131\u015F vaxt", "da": "till\xE6gstid", "mn": "\u043D\u044D\u043C\u044D\u043B\u0442 \u0446\u0430\u0433", "pt-BR": "tempo adicional", "ru": "\u043A\u043E\u043C\u043F\u0435\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0430\u0440\u0431\u0438\u0442\u0440\u043E\u043C \u0432\u0440\u0435\u043C\u044F", "es": "tiempo de descuento", "es-AR": "tiempo de descuento", "uk": "\u043A\u043E\u043C\u043F\u0435\u043D\u0441\u043E\u0432\u0430\u043D\u0438\u0439 \u0447\u0430\u0441", "uz": "qo'shimcha vaqt", "uzb": "\u049B\u045E\u0448\u0438\u043C\u0447\u0430 \u0432\u0430\u049B\u0442" }, "notes": { "da": 'Not to be confussed with "forl\xE6nget spilletid".', "pt-BR": "In football, the extra time the referee gives in each half for  time lost through substitutions, injured players requiring attention, or other stoppages." } }, { "id": 19, "terms": { "en-GB": "address", "az": "\xFCnvan", "da": "adresse", "mn": "\u0445\u0430\u044F\u0433", "pt-BR": "endere\xE7o", "ru": "\u0430\u0434\u0440\u0435\u0441", "es": "direcci\xF3n", "es-AR": "direcci\xF3n", "uk": "\u0430\u0434\u0440\u0435\u0441\u0430", "uz": "manzil", "uzb": "\u043C\u0430\u043D\u0437\u0438\u043B" } }, { "id": 20, "terms": { "en-GB": "advancebet", "az": "avansl\u0131 m\u0259rc", "da": "Advancebet", "mn": "\u0443\u0440\u044C\u0434\u0447\u0438\u043B\u0433\u0430\u0430 \u0431\u043E\u043E\u0446\u043E\u043E", "ru": "\u0430\u0432\u0430\u043D\u0441\u043E\u0432\u043E\u0435 \u043F\u0430\u0440\u0438", "es": "Advancebet", "es-AR": "Advancebet", "uk": "\u0430\u0432\u0430\u043D\u0441\u043E\u0432\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "avansli stavkalar", "uzb": "\u0430\u0432\u0430\u043D\u0441\u043B\u0438 \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" }, "notes": { "ru": "for .RU" } }, { "id": 21, "terms": { "en-GB": "affiliate", "da": "Affiliate", "mn": "\u0445\u0430\u043C\u0442\u0440\u0430\u0433\u0447", "pt-BR": "afiliado", "ru": "\u043F\u0430\u0440\u0442\u043D\u0435\u0440", "es": "afiliado", "es-AR": "afiliado", "uk": "\u043F\u0430\u0440\u0442\u043D\u0435\u0440", "uz": "hamkorlik", "uzb": "\u04B3\u0430\u043C\u043A\u043E\u0440\u043B\u0438\u043A" }, "notes": { "es": 'But "programa de afiliados" when referring to the "Affiliates" in the footer as here we mean the program itself', "es-AR": 'But "programa de afiliados" when referring to the "Affiliates" in the footer as here we mean the program itself', "uk": "Affiliates = \u041F\u0430\u0440\u0442\u043D\u0435\u0440\u0441\u043A\u0430\u044F \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 = \u041F\u0430\u0440\u0442\u043D\u0435\u0440\u0441\u044C\u043A\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0430" } }, { "id": 22, "terms": { "en-GB": "Age Verification Policy", "es": "Pol\xEDtica de verificaci\xF3n de edad", "es-AR": "Pol\xEDtica de verificaci\xF3n de edad" } }, { "id": 23, "terms": { "en-GB": "American football", "da": "amerikansk fodbold", "mn": "A\u043C\u0435\u0440\u0438\u043A \u0445\u04E9\u043B \u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "futebol americano", "ru": "\u0430\u043C\u0435\u0440\u0438\u043A\u0430\u043D\u0441\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "es": "f\xFAtbol americano", "es-AR": "f\xFAtbol americano", "uk": "\u0430\u043C\u0435\u0440\u0438\u043A\u0430\u043D\u0441\u044C\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "uz": "Amerikacha futbol", "uzb": "\u0410\u043C\u0435\u0440\u0438\u043A\u0430\u0447\u0430 \u0444\u0443\u0442\u0431\u043E\u043B" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 24, "terms": { "en-GB": "ante post", "az": "antipost", "da": "antepost", "mn": "\u0443\u0440\u044C\u0434\u0447\u0438\u043B\u0441\u0430\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta antecipada", "ru": "\u0437\u0430\u0431\u043B\u0430\u0433\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0435 \u043F\u0430\u0440\u0438", "es": "anticipada", "es-AR": "anticipada", "uk": "\u0437\u0430\u0432\u0447\u0430\u0441\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "oldindan qilingan stavka", "uzb": "\u043E\u043B\u0434\u0438\u043D\u0434\u0430\u043D \u049B\u0438\u043B\u0438\u043D\u0433\u0430\u043D \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "pt-BR": 'to be followed by "(ante-post)", when used for the first time in the text', "ru": "for .RU" } }, { "id": 25, "terms": { "en-GB": "ante-post", "az": "antipost", "da": "antepost", "pt-BR": "aposta antecipada", "ru": "\u0437\u0430\u0431\u043B\u0430\u0433\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0435 \u043F\u0430\u0440\u0438", "es": "anticipada", "es-AR": "anticipada", "uk": "\u0437\u0430\u0432\u0447\u0430\u0441\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "oldindan qilingan stavka", "uzb": "\u043E\u043B\u0434\u0438\u043D\u0434\u0430\u043D \u049B\u0438\u043B\u0438\u043D\u0433\u0430\u043D \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "pt-BR": 'to be followed by "(ante-post)", when used for the first time in the text', "ru": "for .RU" } }, { "id": 26, "terms": { "en-GB": "cuota de apuestas anticipadas", "es": "ante-post price", "es-AR": "ante-post price" } }, { "id": 27, "terms": { "en-GB": "Any-To-Come", "az": "\u015F\u0259rtli m\u0259rc", "da": "betingede v\xE6ddem\xE5l", "pt-BR": "Any to Come", "ru": "\u0443\u0441\u043B\u043E\u0432\u043D\u0430\u044F", "es": "reinversi\xF3n en apuesta posterior", "es-AR": "reinversi\xF3n en apuesta posterior", "uk": "\u0443\u043C\u043E\u0432\u043D\u0430", "uz": "shartli bittalik stavka", "uzb": "\u0448\u0430\u0440\u0442\u043B\u0438 \u0431\u0438\u0442\u0442\u0430\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 28, "terms": { "en-GB": "Any To Come", "az": "\u015F\u0259rtli m\u0259rc", "da": "betingede v\xE6ddem\xE5l", "mn": "ATC", "pt-BR": "Any to Come", "ru": "ATC", "es": "reinversi\xF3n en apuesta posterior", "es-AR": "reinversi\xF3n en apuesta posterior", "uk": "\u0443\u043C\u043E\u0432\u043D\u0430", "uz": "shartli bittalik stavka", "uzb": "\u0448\u0430\u0440\u0442\u043B\u0438 \u0431\u0438\u0442\u0442\u0430\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "mn": "when we need the short version due to length limit", "ru": "when we need the short version due to length limit", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 29, "terms": { "en-GB": "anytime goal", "az": "ist\u0259nil\u0259n vaxt qol", "da": "m\xE5l n\xE5r som helst", "pt-BR": "gol a qualquer momento", "ru": "\u043B\u044E\u0431\u043E\u0439 \u0433\u043E\u043B", "es": "gol en cualquier momento", "es-AR": "gol en cualquier momento", "uz": "har qanday gol", "uzb": "\u04B3\u0430\u0440 \u049B\u0430\u043D\u0434\u0430\u0439 \u0433\u043E\u043B" } }, { "id": 30, "terms": { "en-GB": "anytime goalscorer", "az": "ist\u0259nil\u0259n vaxt qol vuran", "da": "m\xE5lscorer n\xE5r som helst", "pt-BR": "marcador a qualquer momento", "ru": "\u043B\u044E\u0431\u043E\u0439 \u0433\u043E\u043B", "es": "goleador en cualquier momento", "es-AR": "goleador en cualquier momento", "uz": "har qanday gol muallifi", "uzb": "\u04B3\u0430\u0440 \u049B\u0430\u043D\u0434\u0430\u0439 \u0433\u043E\u043B \u043C\u0443\u0430\u043B\u043B\u0438\u0444\u0438" } }, { "id": 31, "terms": { "en-GB": "app", "az": "t\u0259tbiq", "da": "app", "mn": "\u0430\u043F\u043F", "pt-BR": "app", "ru": "\u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435", "es": "aplicaci\xF3n", "es-AR": "aplicaci\xF3n", "uk": "\u0437\u0430\u0441\u0442\u043E\u0441\u0443\u043D\u043E\u043A", "uz": "ilova", "uzb": "\u0438\u043B\u043E\u0432\u0430" }, "notes": { "pt-BR": "In case of limited space", "es": "borrowing in Spanish for texts with a more informal and friendly ToV (in italics)", "es-AR": "borrowing in Spanish for texts with a more informal and friendly ToV (in italics)" } }, { "id": 32, "terms": { "en-GB": "Asian handicap", "az": "Asiya handikap\u0131", "da": "Asiatisk handicap", "mn": "\u0410\u0437\u0438 \u0434\u0430\u0432\u0443\u0443 \u0431\u0430\u0439\u0434\u0430\u043B", "pt-BR": "handicap asi\xE1tico", "ru": "\u0430\u0437\u0438\u0430\u0442\u0441\u043A\u0430\u044F \u0444\u043E\u0440\u0430", "es": "h\xE1ndicap asi\xE1tico", "es-AR": "h\xE1ndicap asi\xE1tico", "uk": "\u0430\u0437\u0456\u0430\u0442\u0441\u044C\u043A\u0430 \u0444\u043E\u0440\u0430", "uz": "Osiyocha fora", "uzb": "\u041E\u0441\u0438\u0451\u0447\u0430 \u0444\u043E\u0440\u0430" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 33, "terms": { "en-GB": "Asian total", "az": "Asiya toplam", "da": "Asiatisk I Alt", "mn": "\u0410\u0437\u0438 \u043D\u0438\u0439\u0442", "pt-BR": "total asi\xE1tico", "ru": "\u0430\u0437\u0438\u0430\u0442\u0441\u043A\u0438\u0439 \u0442\u043E\u0442\u0430\u043B", "es": "total asi\xE1tico", "es-AR": "total asi\xE1tico", "uk": "\u0430\u0437\u0456\u0430\u0442\u0441\u044C\u043A\u0438\u0439 \u0442\u043E\u0442\u0430\u043B", "uz": "Osiyocha total", "uzb": "\u041E\u0441\u0438\u0451\u0447\u0430 \u0442\u043E\u0442\u0430\u043B" } }, { "id": 34, "terms": { "en-GB": "athlete", "az": "idman\xE7\u0131", "da": "ud\xF8ver", "mn": "\u0442\u0430\u043C\u0438\u0440\u0447\u0438\u043D", "pt-BR": "atleta", "ru": "\u0441\u043F\u043E\u0440\u0442\u0441\u043C\u0435\u043D", "es": "atleta", "es-AR": "atleta", "uk": "\u0441\u043F\u043E\u0440\u0442\u0441\u043C\u0435\u043D", "uz": "sportchi", "uzb": "\u0441\u043F\u043E\u0440\u0442\u0447\u0438" } }, { "id": 35, "terms": { "en-GB": "athletics", "da": "atletik", "mn": "\u0445\u04E9\u043D\u0433\u04E9\u043D \u0430\u0442\u043B\u0435\u0442\u0438\u043A", "pt-BR": "atletismo", "ru": "\u043B\u0435\u0433\u043A\u0430\u044F \u0430\u0442\u043B\u0435\u0442\u0438\u043A\u0430", "es": "atletismo", "es-AR": "atletismo", "uk": "\u043B\u0435\u0433\u043A\u0430 \u0430\u0442\u043B\u0435\u0442\u0438\u043A\u0430", "uz": "atletika", "uzb": "\u0430\u0442\u043B\u0435\u0442\u0438\u043A\u0430" } }, { "id": 36, "terms": { "en-GB": "ATC", "az": "ATC", "da": "betingede v\xE6ddem\xE5l", "mn": "ATC", "pt-BR": "ATC", "ru": "ATC", "es": "ATC", "es-AR": "ATC", "uk": "ATC" }, "notes": { "az": "short for 'Any to Come'", "da": "in Danish there is no abbreviation for these bet types", "mn": "when we need the short version due to length limit", "ru": "only in help section tables showing bet calculation", "uk": "only in help section tables showing bet calculation" } }, { "id": 37, "terms": { "en-GB": "Aussie rules", "pt-BR": "futebol australiano", "ru": "\u0430\u0432\u0441\u0442\u0440\u0430\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "es": "f\xFAtbol australiano", "es-AR": "f\xFAtbol australiano", "uz": "Avstraliyacha futbol", "uzb": "\u0410\u0432\u0441\u0442\u0440\u0430\u043B\u0438\u044F\u0447\u0430 \u0444\u0443\u0442\u0431\u043E\u043B" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 38, "terms": { "en-GB": "authentication", "az": "t\u0259sdiq", "da": "godkendelse", "mn": "\u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B\u0430\u0445", "pt-BR": "autentica\xE7\xE3o", "ru": "\u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F", "es": "autentificaci\xF3n", "es-AR": "autentificaci\xF3n", "uk": "\u0430\u0432\u0442\u0435\u043D\u0442\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u044F", "uz": "autentifikatsiya", "uzb": "\u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F" } }, { "id": 39, "terms": { "en-GB": "authentication process", "da": "godkendelsesprocess", "mn": "\u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B\u0430\u0445 \u043F\u0440\u043E\u0446\u0435\u0441\u0441", "pt-BR": "processo de autentica\xE7\xE3o", "ru": "\u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438", "es": "autenticaci\xF3n", "es-AR": "autenticaci\xF3n", "uk": "\u043F\u0440\u043E\u0446\u0435\u0441 \u0430\u0432\u0442\u0435\u043D\u0442\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457", "uz": "autentifikatsiya jarayoni", "uzb": "\u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u0436\u0430\u0440\u0430\u0451\u043D\u0438" } }, { "id": 40, "terms": { "en-GB": "authorisation method", "az": "avtorizasiya metodu", "da": "autorisationsmetode", "mn": "\u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B\u0430\u0445 \u0445\u044D\u043B\u0431\u044D\u0440", "pt-BR": "m\xE9todo de autoriza\xE7\xE3o", "ru": "\u0441\u043F\u043E\u0441\u043E\u0431 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438", "es": "m\xE9todo de autorizaci\xF3n", "es-AR": "m\xE9todo de autorizaci\xF3n", "uk": "\u0441\u043F\u043E\u0441\u0456\u0431 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0456\u0457", "uz": "avtorizatsiya usuli", "uzb": "\u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u0443\u0441\u0443\u043B\u0438" } }, { "id": 41, "terms": { "en-GB": "Auto Cash Out", "az": "avtomatik Cash Out", "da": "Auto Cash Out", "mn": "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0430\u0430\u0440 \u041C\u04E9\u043D\u0433\u04E9 \u0413\u0430\u0440\u0433\u0430\u0445", "pt-BR": "Cash Out autom\xE1tico", "ru": "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430", "es": "Cash Out autom\xE1tico", "es-AR": "Cash Out autom\xE1tico", "uk": "\u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0430 \u0432\u0438\u043F\u043B\u0430\u0442\u0430", "uz": "avto kesh-aut", "uzb": "\u0430\u0432\u0442\u043E \u043A\u044D\u0448-\u0430\u0443\u0442" }, "notes": { "ru": '"\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F" is capitalised only if the phrase is used as a section/button name or at the beginning of a sentence', "uk": "Capitalised if used as a section/button name or at the beginning of a sentence", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 42, "terms": { "en-GB": "auto confirm", "az": "avtomatik t\u0259sdiqi", "da": "autobekr\xE6ft", "mn": "\u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0430\u0430\u0440 \u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B", "pt-BR": "confirmar automaticamente", "ru": "\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438", "es": "autoconfirmar", "es-AR": "autoconfirmar", "uk": "\u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0438 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E", "uz": "avto tasdiqlash", "uzb": "\u0430\u0432\u0442\u043E \u0442\u0430\u0441\u0434\u0438\u049B\u043B\u0430\u0448" }, "notes": { "ru": '"\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C" is capitalised only if the phrase is used as a section/button name or at the beginning of a sentence', "uk": "Capitalised if used as a section/button name or at the beginning of a sentence", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 43, "terms": { "en-GB": "auto-confirmation", "az": "avtomatik t\u0259sdiqi", "da": "autobekr\xE6ftelse", "mn": "\u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0430\u0430\u0440 \u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B\u0430\u0445", "pt-BR": "confirma\xE7\xE3o autom\xE1tica", "ru": "\u0430\u0432\u0442\u043E\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435", "es": "autoconfirmaci\xF3n", "es-AR": "autoconfirmaci\xF3n", "uk": "\u0430\u0432\u0442\u043E\u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F", "uz": "avto-tasdiqlash", "uzb": "\u0430\u0432\u0442\u043E-\u0442\u0430\u0441\u0434\u0438\u049B\u043B\u0430\u0448" }, "notes": { "ru": "Capitalised if used as a section/button name or at the beginning of a sentence", "uk": "Capitalised if used as a section/button name or at the beginning of a sentence", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 44, "terms": { "en-GB": "autosport", "da": "bilsport", "pt-BR": "automobilismo", "ru": "\u0430\u0432\u0442\u043E\u0441\u043F\u043E\u0440\u0442", "es": "automovilismo", "es-AR": "automovilismo", "uk": "\u0430\u0432\u0442\u043E\u0441\u043F\u043E\u0440\u0442", "uz": "avtosport", "uzb": "\u0430\u0432\u0442\u043E\u0441\u043F\u043E\u0440\u0442" } }, { "id": 45, "terms": { "en-GB": "available balance", "az": "m\xF6vcud balans", "da": "disponibel saldo", "mn": "\u0431\u043E\u043B\u043E\u043C\u0436\u0438\u0442 \u04AF\u043B\u0434\u044D\u0433\u0434\u044D\u043B", "pt-BR": "saldo dispon\xEDvel", "ru": "\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441", "es": "saldo disponible", "es-AR": "saldo disponible", "uk": "\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441", "uz": "mavjud balans", "uzb": "\u043C\u0430\u0432\u0436\u0443\u0434 \u0431\u0430\u043B\u0430\u043D\u0441" } }, { "id": 46, "terms": { "en-GB": "available bet type", "da": "tilg\xE6ngelig v\xE6ddem\xE5lstype", "pt-BR": "tipo de aposta dispon\xEDvel", "ru": "\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0442\u0438\u043F \u043F\u0430\u0440\u0438", "es": "tipo de apuesta disponible", "es-AR": "tipo de apuesta disponible", "uz": "mavjud stavka turi", "uzb": "\u043C\u0430\u0432\u0436\u0443\u0434 \u0441\u0442\u0430\u0432\u043A\u0430 \u0442\u0443\u0440\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 47, "terms": { "en-GB": "available Bonus", "da": "tilg\xE6ngelig Bonus", "ru": "\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0431\u043E\u043D\u0443\u0441", "es": "bono disponible", "es-AR": "bono disponible" } }, { "id": 48, "terms": { "en-GB": "away", "da": "ude", "mn": "\u0437\u043E\u0447\u0438\u043D \u0442\u0430\u043B\u0431\u0430\u0439", "pt-BR": "de ida", "ru": "\u0433\u043E\u0441\u0442\u0438", "es": "fuera de casa", "es-AR": "fuera de casa", "uk": "\u0433\u043E\u0441\u0442\u0456", "uz": "mehmonda", "uzb": "\u043C\u0435\u04B3\u043C\u043E\u043D\u0434\u0430" }, "notes": { "da": "Joined with word that follows: udebane, udehold, etc", "pt-BR": "when in 'away leg'" } }, { "id": 49, "terms": { "en-GB": "badminton", "da": "badminton", "mn": "\u0431\u0430\u0434\u043C\u0438\u043D\u0442\u043E\u043D", "pt-BR": "badminton", "ru": "\u0431\u0430\u0434\u043C\u0438\u043D\u0442\u043E\u043D", "es": "b\xE1dminton", "es-AR": "b\xE1dminton", "uk": "\u0431\u0430\u0434\u043C\u0456\u043D\u0442\u043E\u043D", "uz": "badminton", "uzb": "\u0431\u0430\u0434\u043C\u0438\u043D\u0442\u043E\u043D" } }, { "id": 50, "terms": { "en-GB": "balance", "az": "balans", "da": "saldo", "mn": "\u04AF\u043B\u0434\u044D\u0433\u0434\u044D\u043B", "pt-BR": "saldo", "ru": "\u0431\u0430\u043B\u0430\u043D\u0441", "es": "saldo", "es-AR": "saldo", "uk": "\u0431\u0430\u043B\u0430\u043D\u0441", "uz": "balans", "uzb": "\u0431\u0430\u043B\u0430\u043D\u0441" } }, { "id": 51, "terms": { "en-GB": "ball", "az": "top", "da": "kugle", "mn": "\u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "bola", "ru": "\u043D\u043E\u043C\u0435\u0440", "es": "bola", "es-AR": "pelota", "uk": "\u043D\u043E\u043C\u0435\u0440", "uz": "shar", "uzb": "\u0448\u0430\u0440" }, "notes": { "ru": "especially when referring to an additional or bonus ball in the lottery draw", "uk": "especially when referring to an additional or bonus ball in the lottery draw", "uz": "in lottery", "uzb": "in lottery" } }, { "id": 52, "terms": { "en-GB": "bandy", "da": "bandy", "mn": "\u043E\u0440\u043E\u0441 \u0445\u043E\u043A\u043A\u0435\u0439", "pt-BR": "bandy", "ru": "\u0445\u043E\u043A\u043A\u0435\u0439 \u0441 \u043C\u044F\u0447\u043E\u043C", "es": "bandy", "es-AR": "bandy", "uk": "\u0445\u043E\u043A\u0435\u0439 \u0437 \u043C'\u044F\u0447\u0435\u043C", "uz": "to'pli xokkey", "uzb": "\u0442\u045E\u043F\u043B\u0438 \u0445\u043E\u043A\u043A\u0435\u0439" } }, { "id": 53, "terms": { "en-GB": "bank account", "az": "bank hesab\u0131", "da": "bankkonto", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u0434\u0430\u043D\u0441", "pt-BR": "conta banc\xE1ria", "ru": "\u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u0441\u0447\u0435\u0442", "es": "cuenta bancaria", "es-AR": "cuenta bancaria", "uk": "\u0431\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u0438\u0439 \u0440\u0430\u0445\u0443\u043D\u043E\u043A", "uz": "bank hisobi", "uzb": "\u0431\u0430\u043D\u043A \u04B3\u0438\u0441\u043E\u0431\u0438" } }, { "id": 54, "terms": { "en-GB": "bank account number", "az": "bank hesab n\xF6mr\u0259si", "da": "kontonummer", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u0434\u0430\u043D\u0441\u043D\u044B \u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "n\xFAmero da conta banc\xE1ria", "ru": "\u043D\u043E\u043C\u0435\u0440 \u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u043E\u0433\u043E \u0441\u0447\u0451\u0442\u0430", "es": "n\xFAmero de cuenta bancaria", "es-AR": "n\xFAmero de cuenta bancaria", "uk": "\u043D\u043E\u043C\u0435\u0440 \u0431\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u043E\u0433\u043E \u0440\u0430\u0445\u0443\u043D\u043A\u0443", "uz": "bank hisob raqami", "uzb": "\u0431\u0430\u043D\u043A \u04B3\u0438\u0441\u043E\u0431 \u0440\u0430\u049B\u0430\u043C\u0438" } }, { "id": 55, "terms": { "en-GB": "bank address", "az": "bank \xFCnvan\u0131", "da": "bankens adresse", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u0445\u0430\u044F\u0433", "pt-BR": "endere\xE7o do banco", "ru": "\u0430\u0434\u0440\u0435\u0441 \u0431\u0430\u043D\u043A\u0430", "es": "direcci\xF3n del banco", "es-AR": "direcci\xF3n del banco", "uk": "\u0430\u0434\u0440\u0435\u0441\u0430 \u0431\u0430\u043D\u043A\u0443", "uz": "bank manzili", "uzb": "\u0431\u0430\u043D\u043A \u043C\u0430\u043D\u0437\u0438\u043B\u0438" } }, { "id": 56, "terms": { "en-GB": "bank card", "az": "bank kart\u0131", "da": "kort", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u043A\u0430\u0440\u0442", "pt-BR": "cart\xE3o banc\xE1rio", "ru": "\u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0430\u044F \u043A\u0430\u0440\u0442\u0430", "es": "tarjeta bancaria", "es-AR": "tarjeta bancaria", "uk": "\u0431\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u0430 \u043A\u0430\u0440\u0442\u043A\u0430", "uz": "bank kartasi", "uzb": "\u0431\u0430\u043D\u043A \u043A\u0430\u0440\u0442\u0430\u0441\u0438" }, "notes": { "da": "In sentences where it's clear from the context" } }, { "id": 57, "terms": { "en-GB": "bank name", "az": "bank\u0131n ad\u0131", "da": "bankens navn", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u043D\u044D\u0440", "pt-BR": "nome do banco", "ru": "\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0431\u0430\u043D\u043A\u0430", "es": "nombre del banco", "es-AR": "nombre del banco", "uk": "\u043D\u0430\u0437\u0432\u0430 \u0431\u0430\u043D\u043A\u0443", "uz": "bank nomi", "uzb": "\u0431\u0430\u043D\u043A \u043D\u043E\u043C\u0438" } }, { "id": 58, "terms": { "en-GB": "bank transfer", "az": "bank k\xF6\xE7\xFCrm\u0259si", "da": "bankoverf\xF8rsel", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u0448\u0438\u043B\u0436\u04AF\u04AF\u043B\u044D\u0433", "pt-BR": "transfer\xEAncia banc\xE1ria", "ru": "\u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434", "es": "transferencia bancaria", "es-AR": "transferencia bancaria", "uk": "\u0431\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u043A\u0430\u0437", "uz": "bank pul o'tkazmasi", "uzb": "\u0431\u0430\u043D\u043A \u043F\u0443\u043B \u045E\u0442\u043A\u0430\u0437\u043C\u0430\u0441\u0438" } }, { "id": 59, "terms": { "en-GB": "Banker", "az": "Bankir", "da": "Banker", "mn": "\u0411\u0430\u043D\u043A\u0438\u0440", "pt-BR": "banker", "ru": "\u0411\u0430\u043D\u043A\u0451\u0440", "es": "banker", "es-AR": "banker", "uk": "\u0411\u0430\u043D\u043A\u0435\u0440", "uz": "\xABbankyor\xBB", "uzb": "\xAB\u0431\u0430\u043D\u043A\u0451\u0440\xBB" } }, { "id": 60, "terms": { "en-GB": "baseball", "da": "baseball", "mn": "\u0431\u0435\u0439\u0441\u0431\u043E\u043B", "pt-BR": "beisebol", "ru": "\u0431\u0435\u0439\u0441\u0431\u043E\u043B", "es": "b\xE9isbol", "es-AR": "b\xE9isbol", "uk": "\u0431\u0435\u0439\u0441\u0431\u043E\u043B", "uz": "beysbol", "uzb": "\u0431\u0435\u0439\u0441\u0431\u043E\u043B" } }, { "id": 61, "terms": { "en-GB": "basketball", "az": "basketbol", "da": "basketball", "mn": "\u0441\u0430\u0433\u0441\u0430\u043D \u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "basquete", "ru": "\u0431\u0430\u0441\u043A\u0435\u0442\u0431\u043E\u043B", "es": "baloncesto", "es-AR": "b\xE1squet", "uk": "\u0431\u0430\u0441\u043A\u0435\u0442\u0431\u043E\u043B", "uz": "basketbol", "uzb": "\u0431\u0430\u0441\u043A\u0435\u0442\u0431\u043E\u043B" } }, { "id": 62, "terms": { "en-GB": "batch bet", "az": "paket m\u0259rci", "mn": "\u0431\u0430\u0433\u0446", "pt-BR": "cupom combinado", "ru": "\u043F\u0430\u043A\u0435\u0442", "es": "cup\xF3n combinado", "es-AR": "cup\xF3n combinado", "uk": "\u043F\u0430\u043A\u0435\u0442", "uz": "to'plam", "uzb": "\u0442\u045E\u043F\u043B\u0430\u043C" }, "notes": { "ru": "context-dependent" } }, { "id": 63, "terms": { "en-GB": "batsman", "az": "betsmen", "da": "g\xE6rdespiller", "mn": "\u0446\u043E\u0445\u0438\u0433\u0447", "pt-BR": "batedor", "ru": "\u0431\u044D\u0442\u0441\u043C\u0435\u043D", "es": "bateador", "es-AR": "bateador", "uk": "\u0431\u0435\u0442\u0441\u043C\u0435\u043D", "uz": "betsmen", "uzb": "\u0431\u044D\u0442\u0441\u043C\u0435\u043D" } }, { "id": 64, "terms": { "en-GB": "beach handball", "da": "strandh\xE5ndbold", "mn": "\u044D\u043B\u0441\u043D\u0438\u0439 \u0433\u0430\u043D\u0434\u0431\u043E\u043B", "pt-BR": "handebol de praia", "ru": "\u043F\u043B\u044F\u0436\u043D\u044B\u0439 \u0433\u0430\u043D\u0434\u0431\u043E\u043B", "es": "balonmano playa", "es-AR": "balonmano playa", "uk": "\u043F\u043B\u044F\u0436\u043D\u0438\u0439 \u0433\u0430\u043D\u0434\u0431\u043E\u043B", "uz": "plyaj gandboli", "uzb": "\u043F\u043B\u044F\u0436 \u0433\u0430\u043D\u0434\u0431\u043E\u043B\u0438" } }, { "id": 65, "terms": { "en-GB": "beach soccer", "da": "strandfodbold", "mn": "\u0434\u0430\u043B\u0430\u0439\u043D \u044D\u0440\u0433\u0438\u0439\u043D \u0445\u04E9\u043B\u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "futebol de areia", "ru": "\u043F\u043B\u044F\u0436\u043D\u044B\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "es": "f\xFAtbol playa", "es-AR": "f\xFAtbol playa", "uk": "\u043F\u043B\u044F\u0436\u043D\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "uz": "plyaj futboli", "uzb": "\u043F\u043B\u044F\u0436 \u0444\u0443\u0442\u0431\u043E\u043B\u0438" } }, { "id": 66, "terms": { "en-GB": "beach volleyball", "da": "beachvolley", "mn": "\u044D\u043B\u0441\u043D\u0438\u0439 \u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B", "pt-BR": "v\xF4lei de praia", "ru": "\u043F\u043B\u044F\u0436\u043D\u044B\u0439 \u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B", "es": "v\xF3ley playa", "es-AR": "v\xF3ley playa", "uk": "\u043F\u043B\u044F\u0436\u043D\u0438\u0439 \u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B", "uz": "plyaj voleyboli", "uzb": "\u043F\u043B\u044F\u0436 \u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B\u0438" } }, { "id": 67, "terms": { "en-GB": "bet", "az": "m\u0259rc", "da": "spille", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta", "ru": "\u043F\u0430\u0440\u0438", "es": "apuesta", "es-AR": "apuesta", "uk": "\u0440\u043E\u0431\u0438\u0442\u0438 \u0441\u0442\u0430\u0432\u043A\u0443", "uz": "stavka qo'ying", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u049B\u045E\u0439\u0438\u043D\u0433" }, "notes": { "da": `Generally a mild euphemism for "v\xE6ddem\xE5l", so it's the preferred to use it in marketing texts`, "ru": "for .RU", "uz": "verb", "uzb": "verb" } }, { "id": 68, "terms": { "en-GB": "bet amount", "az": "m\u0259rc m\u0259bl\u0259\u011Fi", "da": "v\xE6ddem\xE5lsbel\xF8b", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0434\u04AF\u043D", "pt-BR": "valor da aposta", "ru": "\u0441\u0443\u043C\u043C\u0430 \u043F\u0430\u0440\u0438", "es": "importe de la apuesta", "es-AR": "importe de la apuesta", "uk": "\u0441\u0443\u043C\u0430 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka miqdori", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043C\u0438\u049B\u0434\u043E\u0440\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 69, "terms": { "en-GB": "Bet Constructor", "az": "M\u0259rc Qurucusu", "da": "V\xE6ddem\xE5lskonstrukt\xF8r", "mn": "\u0411\u043E\u043E\u0446\u043E\u043E \u0431\u04AF\u0442\u044D\u044D\u0433\u0447", "pt-BR": "Construtor de apostas", "ru": "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u0441\u0442\u0430\u0432\u043E\u043A", "es": "Constructor de apuestas", "es-AR": "Constructor de apuestas", "uk": "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u0441\u0442\u0430\u0432\u043E\u043A", "uz": "stavka konstruktori", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440\u0438" }, "notes": { "ru": '"\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440" is capitalised if the phrase is used as a section/button name or at the beginning of a sentence', "uk": "Capitalised if used as a section/button name or at the beginning of a sentence" } }, { "id": 70, "terms": { "en-GB": "bet description", "da": "v\xE6ddem\xE5lsbeskrivelse", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0442\u0430\u0439\u043B\u0431\u0430\u0440", "pt-BR": "descri\xE7\xE3o da aposta", "ru": "\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043F\u0430\u0440\u0438", "es": "descripci\xF3n de la apuesta", "es-AR": "descripci\xF3n de la apuesta", "uk": "\u043E\u043F\u0438\u0441 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka tavsifi", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u0442\u0430\u0432\u0441\u0438\u0444\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 71, "terms": { "en-GB": "bet details", "az": "m\u0259rc t\u0259f\u0259rr\xFCatlar\u0131", "da": "v\xE6ddem\xE5lsdetaljer", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0434\u044D\u043B\u0433\u044D\u0440\u044D\u043D\u0433\u04AF\u0439", "pt-BR": "detalhes da aposta", "ru": "\u0434\u0435\u0442\u0430\u043B\u0438 \u043F\u0430\u0440\u0438", "es": "detalles de la apuesta", "es-AR": "detalles de la apuesta", "uk": "\u0434\u0435\u0442\u0430\u043B\u0456 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka tafsilotlari", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u0442\u0430\u0444\u0441\u0438\u043B\u043E\u0442\u043B\u0430\u0440\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 72, "terms": { "en-GB": "Bet Glossary", "az": "M\u0259rc l\xFC\u011F\u0259ti", "da": "V\xE6ddem\xE5lsordbog", "mn": "\u0411\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0442\u0430\u0439\u043B\u0431\u0430\u0440 \u0442\u043E\u043B\u044C", "pt-BR": "Gloss\xE1rio de apostas", "ru": "\u0421\u043B\u043E\u0432\u0430\u0440\u044C: \u0442\u0438\u043F\u044B \u043F\u0430\u0440\u0438", "es": "Glosario de apuestas", "es-AR": "Glosario de apuestas", "uk": "\u0421\u043B\u043E\u0432\u043D\u0438\u043A: \u0442\u0438\u043F\u0438 \u0441\u0442\u0430\u0432\u043E\u043A", "uz": "Stavkalar glossariysi", "uzb": "\u0421\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440 \u0433\u043B\u043E\u0441\u0441\u0430\u0440\u0438\u0439\u0441\u0438" }, "notes": { "en-GB": "Capitalised when section name", "ru": "for .RU", "uk": `"\u0421\u043B\u043E\u0432\u043D\u0438\u043A" is capitalised because it's a section name` } }, { "id": 73, "terms": { "en-GB": "Bet History", "az": "M\u0259rc tarix\xE7\u0259si", "da": "Spilhistorik", "mn": "\u0411\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0442\u04AF\u04AF\u0445", "pt-BR": "Hist\xF3rico de apostas", "ru": "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0430\u0440\u0438", "es": "Historial de apuestas", "es-AR": "Historial de apuestas", "uk": "\u0406\u0441\u0442\u043E\u0440\u0456\u044F \u0441\u0442\u0430\u0432\u043E\u043A", "uz": "Stavkalar tarixi", "uzb": "\u0421\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440 \u0442\u0430\u0440\u0438\u0445\u0438" }, "notes": { "en-GB": "Capitalised when section name", "ru": "for .RU", "uk": '"\u0406\u0441\u0442\u043E\u0440\u0456\u044F" is capitalised because the phrase is used as a section name' } }, { "id": 74, "terms": { "en-GB": "bet number", "az": "m\u0259rc n\xF6mr\u0259si", "da": "v\xE6ddem\xE5lsnummer", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "quantidade de apostas", "ru": "\u043D\u043E\u043C\u0435\u0440 \u0441\u0442\u0430\u0432\u043A\u0438", "es": "n\xFAmero de la apuesta", "es-AR": "n\xFAmero de la apuesta", "uk": "\u043D\u043E\u043C\u0435\u0440 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka raqami", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u0440\u0430\u049B\u0430\u043C\u0438" }, "notes": { "pt-BR": "Quantity of bets." } }, { "id": 75, "terms": { "en-GB": "bet slip", "az": "m\u0259rc kuponu", "da": "spillekupon", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0442\u0430\u0441\u0430\u043B\u0431\u0430\u0440", "pt-BR": "boletim de apostas", "ru": "\u043A\u0443\u043F\u043E\u043D", "es": "cup\xF3n de apuestas", "es-AR": "cup\xF3n de apuestas", "uk": "\u043A\u0443\u043F\u043E\u043D", "uz": "stavka kuponi", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043A\u0443\u043F\u043E\u043D\u0438" }, "notes": { "da": "The use depends on the context" } }, { "id": 76, "terms": { "en-GB": "Bet Slip Settings", "da": "Kuponindstillinger", "mn": "\u0411\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0442\u0430\u0441\u0430\u043B\u0431\u0430\u0440\u044B\u043D \u0442\u043E\u0445\u0438\u0440\u0433\u043E\u043E", "pt-BR": "Configura\xE7\xF5es do boletim de apostas", "ru": "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043A\u0443\u043F\u043E\u043D\u0430", "es": "Configuraci\xF3n del cup\xF3n de apuestas", "es-AR": "Configuraci\xF3n del cup\xF3n de apuestas", "uk": "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u043A\u0443\u043F\u043E\u043D\u0430", "uz": "Stavka kuponi sozlamalari", "uzb": "\u0421\u0442\u0430\u0432\u043A\u0430 \u043A\u0443\u043F\u043E\u043D\u0438 \u0441\u043E\u0437\u043B\u0430\u043C\u0430\u043B\u0430\u0440\u0438" }, "notes": { "ru": '"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" is capitalised because the phrase is a section name', "uk": '"\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" is capitalised because the phrase is a section name', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 77, "terms": { "en-GB": "bet stake", "da": "indsats", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u04AF\u043D\u0438\u0439\u043D \u0434\u04AF\u043D", "pt-BR": "valor da aposta", "ru": "\u0441\u0443\u043C\u043C\u0430 \u043F\u0430\u0440\u0438", "es": "importe de la apuesta", "es-AR": "importe de la apuesta", "uk": "\u0441\u0443\u043C\u0430 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka miqdori", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043C\u0438\u049B\u0434\u043E\u0440\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 78, "terms": { "en-GB": "bet type", "az": "m\u0259rc n\xF6v\xFC", "da": "spiltype", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u0442\u04E9\u0440\u04E9\u043B", "pt-BR": "tipo de aposta", "ru": "\u0442\u0438\u043F \u043F\u0430\u0440\u0438", "es": "tipo de apuesta", "es-AR": "tipo de apuesta", "uk": "\u0442\u0438\u043F \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka turi", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u0442\u0443\u0440\u0438" }, "notes": { "da": "Generally the more marketing friendly term", "ru": "for .RU" } }, { "id": 79, "terms": { "en-GB": "biathlon", "da": "skiskydning", "mn": "\u0431\u0438\u0430\u0442\u043B\u043E\u043D", "pt-BR": "biatlo", "ru": "\u0431\u0438\u0430\u0442\u043B\u043E\u043D", "es": "biatl\xF3n", "es-AR": "biatl\xF3n", "uk": "\u0431\u0456\u0430\u0442\u043B\u043E\u043D", "uz": "biatlon", "uzb": "\u0431\u0438\u0430\u0442\u043B\u043E\u043D" } }, { "id": 80, "terms": { "en-GB": "billing address", "az": "hesabla\u015Fma \xFCnvan\u0131", "da": "betalingsadresse", "pt-BR": "endere\xE7o de cobran\xE7a", "ru": "\u0430\u0434\u0440\u0435\u0441 \u0432\u044B\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0447\u0451\u0442\u0430", "es": "direcci\xF3n de facturaci\xF3n", "es-AR": "direcci\xF3n de facturaci\xF3n", "uz": "to'lov manzili", "uzb": "\u0442\u045E\u043B\u043E\u0432 \u043C\u0430\u043D\u0437\u0438\u043B\u0438" } }, { "id": 81, "terms": { "en-GB": "billing details", "da": "betalingsoplysninger", "pt-BR": "informa\xE7\xF5es da cobran\xE7a", "ru": "\u043F\u043B\u0430\u0442\u0435\u0436\u043D\u044B\u0435 \u0440\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u044B", "es": "detalles de la facturaci\xF3n", "es-AR": "detalles de la facturaci\xF3n", "uz": "to'lov rekvizitlari", "uzb": "\u0442\u045E\u043B\u043E\u0432 \u0440\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u043B\u0430\u0440\u0438" } }, { "id": 82, "terms": { "en-GB": "Bitcoin", "mn": "Bitcoin", "pt-BR": "Bitcoin", "ru": "Bitcoin", "es": "Bitcoin", "es-AR": "Bitcoin", "uk": "Bitcoin", "uz": "Bitcoin", "uzb": "Bitcoin" }, "notes": { "es": "Only when referring to the registered trademark, when referring to the currency, it shouldn't be capitalised", "es-AR": "Only when referring to the registered trademark, when referring to the currency, it shouldn't be capitalised" } }, { "id": 83, "terms": { "en-GB": "Bitcoin Cash", "mn": "Bitcoin Cash", "pt-BR": "Bitcoin Cash", "ru": "Bitcoin Cash", "es": "Bitcoin Cash", "es-AR": "Bitcoin Cash", "uk": "Bitcoin Cash", "uz": "Bitcoin Cash", "uzb": "Bitcoin Cash" } }, { "id": 84, "terms": { "en-GB": "blockchain", "az": "blok\xE7eyn", "mn": "\u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D", "pt-BR": "blockchain", "ru": "\u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D", "es": "Block Chain", "es-AR": "Block Chain", "uk": "\u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D", "uz": "blokcheyn", "uzb": "\u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D" } }, { "id": 85, "terms": { "en-GB": "board price", "az": "ke\xE7id \u0259msal\u0131", "da": "tavleodds", "mn": "\u0441\u0430\u043C\u0431\u0430\u0440\u044B\u043D \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "pre\xE7o de tabela", "ru": "\u0431\u043E\u0440\u0434 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "tabla de cuotas", "es-AR": "tabla de cuotas", "uk": "\u0431\u043E\u0440\u0434 \u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "bord koeffitsiyent", "uzb": "\u0431\u043E\u0440\u0434 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442" } }, { "id": 86, "terms": { "en-GB": "Bonus", "az": "bonus", "da": "Bonus", "mn": "\u0411\u043E\u043D\u0443\u0441", "pt-BR": "b\xF4nus", "ru": "\u0431\u043E\u043D\u0443\u0441", "es": "bono", "es-AR": "bono", "uk": "\u0431\u043E\u043D\u0443\u0441", "uz": "bonus", "uzb": "\u0431\u043E\u043D\u0443\u0441" } }, { "id": 87, "terms": { "en-GB": "Bonus Balance", "az": "bonus balans\u0131", "da": "Bonussaldo", "mn": "\u0411\u043E\u043D\u0443\u0441\u044B\u043D \u04AF\u043B\u0434\u044D\u0433\u0434\u044D\u043B", "pt-BR": "Saldo de B\xF4nus", "ru": "\u0431\u043E\u043D\u0443\u0441\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441", "es": "saldo de bono", "es-AR": "saldo de bono", "uk": "\u0431\u043E\u043D\u0443\u0441\u043D\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441", "uz": "Bonus balansi", "uzb": "\u0411\u043E\u043D\u0443\u0441 \u0431\u0430\u043B\u0430\u043D\u0441\u0438" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 88, "terms": { "en-GB": "Bonus bet", "da": "Bonusbet", "mn": "\u0411\u043E\u043D\u0443\u0441 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta b\xF4nus", "ru": "\u0431\u043E\u043D\u0443\u0441\u043D\u043E\u0435 \u043F\u0430\u0440\u0438", "es": "apuesta para el bono", "es-AR": "apuesta para el bono", "uk": "\u0431\u043E\u043D\u0443\u0441\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "bonusli stavka", "uzb": "\u0431\u043E\u043D\u0443\u0441\u043B\u0438 \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 89, "terms": { "en-GB": "bonus catalogue", "mn": "\u0431\u043E\u043D\u0443\u0441\u044B\u043D \u043A\u0430\u0442\u0430\u043B\u043E\u0433", "pt-BR": "cat\xE1logo de b\xF4nus", "ru": "\u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u0431\u043E\u043D\u0443\u0441\u043E\u0432", "es": "cat\xE1logo de bonos", "es-AR": "cat\xE1logo de bonos", "uk": "\u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u0431\u043E\u043D\u0443\u0441\u0456\u0432", "uz": "bonus katalogi", "uzb": "\u0431\u043E\u043D\u0443\u0441 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0438" } }, { "id": 90, "terms": { "en-GB": "Bonuses", "es": "bonos", "es-AR": "bonos", "uz": "bonuslar", "uzb": "\u0431\u043E\u043D\u0443\u0441\u043B\u0430\u0440" }, "notes": { "es": "General capitalisation rules apply", "es-AR": "General capitalisation rules apply", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 91, "terms": { "en-GB": "bookmaker", "az": "bukmeker", "da": "bookmaker", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u0442 \u0442\u0430\u0430\u0432\u0430\u0440 \u0437\u043E\u0445\u0438\u043E\u043D \u0431\u0430\u0439\u0433\u0443\u0443\u043B\u0430\u0433\u0447", "pt-BR": "casa de apostas", "ru": "\u0431\u0443\u043A\u043C\u0435\u043A\u0435\u0440", "es": "casa de apuestas", "es-AR": "casa de apuestas", "uk": "\u0431\u0443\u043A\u043C\u0435\u043A\u0435\u0440", "uz": "bukmeker", "uzb": "\u0431\u0443\u043A\u043C\u0435\u043A\u0435\u0440" } }, { "id": 92, "terms": { "en-GB": "bowls", "az": "boulinq", "da": "bowls", "mn": "\u0431\u043E\u0443\u043B\u0437", "pt-BR": "bowls", "ru": "\u0448\u0430\u0440\u044B", "es": "bowls", "es-AR": "bowls", "uk": "\u0433\u0440\u0430 \u0432 \u043A\u0443\u043B\u0456", "uz": "sharlar o'yini", "uzb": "\u0448\u0430\u0440\u043B\u0430\u0440 \u045E\u0439\u0438\u043D\u0438" } }, { "id": 93, "terms": { "en-GB": "boxing", "da": "boksning", "mn": "\u0431\u043E\u043A\u0441", "pt-BR": "boxe", "ru": "\u0431\u043E\u043A\u0441", "es": "boxeo", "es-AR": "boxeo", "uk": "\u0431\u043E\u043A\u0441", "uz": "boks", "uzb": "\u0431\u043E\u043A\u0441" } }, { "id": 94, "terms": { "en-GB": "Boxing Day", "es": "Boxing Day", "es-AR": "Boxing Day" } }, { "id": 95, "terms": { "en-GB": "break", "da": "break", "mn": "\u0431\u0440\u0435\u0439\u043A", "pt-BR": "break", "ru": "\u0431\u0440\u0435\u0439\u043A", "es": "break", "es-AR": "break", "uk": "\u0431\u0440\u0435\u0439\u043A", "uz": "breyk", "uzb": "\u0431\u0440\u0435\u0439\u043A" } }, { "id": 96, "terms": { "en-GB": "browser", "da": "browser", "mn": "\u0432\u0435\u0431 \u0445\u04E9\u0442\u04E9\u0447", "pt-BR": "navegador", "ru": "\u0431\u0440\u0430\u0443\u0437\u0435\u0440", "es": "navegador", "es-AR": "navegador", "uk": "\u0431\u0440\u0430\u0443\u0437\u0435\u0440", "uz": "brauzer", "uzb": "\u0431\u0440\u0430\u0443\u0437\u0435\u0440" } }, { "id": 97, "terms": { "en-GB": "card issuer", "da": "kortudsteder", "mn": "\u043A\u0430\u0440\u0442 \u0433\u0430\u0440\u0433\u0430\u0433\u0447 \u0431\u0430\u043D\u043A", "pt-BR": "emissor do seu cart\xE3o", "ru": "\u0431\u0430\u043D\u043A-\u044D\u043C\u0438\u0442\u0435\u043D\u0442 \u043A\u0430\u0440\u0442\u044B", "es": "emisor de la tarjeta", "es-AR": "emisor de la tarjeta", "uk": "\u0435\u043C\u0456\u0442\u0435\u043D\u0442 \u043A\u0430\u0440\u0442\u043A\u0438", "uz": "bank kartasining emitenti", "uzb": "\u0431\u0430\u043D\u043A \u043A\u0430\u0440\u0442\u0430\u0441\u0438\u043D\u0438\u043D\u0433 \u044D\u043C\u0438\u0442\u0435\u043D\u0442\u0438" } }, { "id": 98, "terms": { "en-GB": "card number", "az": "kart n\xF6mr\u0259si", "da": "kortnummer", "mn": "\u043A\u0430\u0440\u0442\u044B\u043D \u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "n\xFAmero do cart\xE3o", "ru": "\u043D\u043E\u043C\u0435\u0440 \u043A\u0430\u0440\u0442\u044B", "es": "n\xFAmero de tarjeta", "es-AR": "n\xFAmero de tarjeta", "uk": "\u043D\u043E\u043C\u0435\u0440 \u043A\u0430\u0440\u0442\u043A\u0438", "uz": "karta raqami", "uzb": "\u043A\u0430\u0440\u0442\u0430 \u0440\u0430\u049B\u0430\u043C\u0438" } }, { "id": 99, "terms": { "en-GB": "Cash Out", "az": "Na\u011Fd \xE7\u0131xar\u0131\u015F", "da": "Cash Out", "mn": "M\u04E9\u043D\u0433\u04E9 \u0413\u0430\u0440\u0433\u0430\u0445", "pt-BR": "Cash Out", "ru": "\u0414\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430", "es": "Cash Out", "es-AR": "Cash Out", "uk": "\u0414\u043E\u0441\u0442\u0440\u043E\u043A\u043E\u0432\u0430 \u0432\u0438\u043F\u043B\u0430\u0442\u0430", "uz": "kesh-aut", "uzb": "\u043A\u044D\u0448-\u0430\u0443\u0442" }, "notes": { "ru": '"\u0414\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F" is capitalised if the phrase is used as a section/button name or at the beginning of a sentence', "uk": '"\u0414\u043E\u0441\u0442\u0440\u043E\u043A\u043E\u0432\u0430" is capitalised if the phrase is used as a section/button name or at the beginning of a sentence', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 100, "terms": { "en-GB": "Cashback", "az": "Ke\u015Fbek", "mn": "Cashback", "pt-BR": "cashback", "ru": "\u043A\u0435\u0448\u0431\u044D\u043A", "es": "Devoluci\xF3n", "es-AR": "Devoluci\xF3n", "uk": "\u043A\u0435\u0448\u0431\u0435\u043A", "uz": "keshbek", "uzb": "\u043A\u044D\u0448\u0431\u044D\u043A" } }, { "id": 101, "terms": { "en-GB": "Cashback Bonus", "mn": "Cashback \u0411\u043E\u043D\u0443\u0441", "pt-BR": "B\xF4nus de Cashback", "ru": "\u043A\u0435\u0448\u0431\u044D\u043A-\u0431\u043E\u043D\u0443\u0441", "es": "Bono de Devoluci\xF3n", "es-AR": "Bono de Devoluci\xF3n", "uk": "\u043A\u0435\u0448\u0431\u0435\u043A-\u0431\u043E\u043D\u0443\u0441", "uz": "keshbek bonusi", "uzb": "\u043A\u044D\u0448\u0431\u044D\u043A \u0431\u043E\u043D\u0443\u0441\u0438" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 102, "terms": { "en-GB": "Cashback on sport", "es": "Cashback de deportes", "es-AR": "Cashback de deportes" } }, { "id": 103, "terms": { "en-GB": "Cashed Out", "az": "Na\u011Fdla\u015Fd\u0131r\u0131lm\u0131\u015F", "mn": "M\u04E9\u043D\u0433\u04E9 \u0413\u0430\u0440\u0433\u0430\u0441\u0430\u043D", "pt-BR": "resgatadas antecipadamente (cashed out)", "ru": "\u0441 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u043E\u043F\u0446\u0438\u0438 \xAB\u0414\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430\xBB", "es": "cerradas con Cash Out", "es-AR": "cerradas con Cash Out", "uk": "\u0437 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F\u043C \u0444\u0443\u043D\u043A\u0446\u0456\u0457 \xAB\u0414\u043E\u0441\u0442\u0440\u043E\u043A\u043E\u0432\u0430 \u0432\u0438\u043F\u043B\u0430\u0442\u0430\xBB", "uz": "Kesh-aut qo'llanilgan", "uzb": "\xAB\u041A\u044D\u0448-\u0430\u0443\u0442\xBB \u049B\u045E\u043B\u043B\u0430\u043D\u0438\u043B\u0433\u0430\u043D" }, "notes": { "pt-BR": "Add (cashed out) the first time the term is used in the text: resgatadas antecipadamente (cashed out)." } }, { "id": 104, "terms": { "en-GB": "Casino", "az": "Kazino", "da": "Casino", "mn": "\u041A\u0430\u0437\u0438\u043D\u043E", "pt-BR": "Cassino", "ru": "\u041A\u0430\u0437\u0438\u043D\u043E", "es": "Casino", "es-AR": "Casino", "uk": "\u041A\u0430\u0437\u0438\u043D\u043E", "uz": "Kazino", "uzb": "\u041A\u0430\u0437\u0438\u043D\u043E" }, "notes": { "uk": "Capitalised because it's a product/section name", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 105, "terms": { "en-GB": "Casino Bonus", "pt-BR": "B\xF4nus no Cassino", "es": "Bono de Casino", "es-AR": "Bono de Casino" } }, { "id": 106, "terms": { "en-GB": "category", "az": "kateqoriya", "da": "kategori", "mn": "\u0430\u043D\u0433\u0438\u043B\u0430\u043B", "pt-BR": "categoria", "ru": "\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", "es": "categor\xEDa", "es-AR": "categor\xEDa", "uk": "\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F", "uz": "kategoriya", "uzb": "\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" } }, { "id": 107, "terms": { "en-GB": "championship", "da": "Championship", "pt-BR": "campeonato", "ru": "\u0447\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0442", "es": "campeonato", "es-AR": "campeonato", "uz": "chempionat", "uzb": "\u0447\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0442" }, "notes": { "da": "The second-highest league in the English football league system" } }, { "id": 108, "terms": { "en-GB": "chat", "az": "\xE7at", "da": "live chat", "mn": "\u0447\u0430\u0442", "pt-BR": "chat", "ru": "\u0447\u0430\u0442", "es": "chat", "es-AR": "chat", "uk": "\u0447\u0430\u0442", "uz": "chat", "uzb": "\u0447\u0430\u0442" } }, { "id": 109, "terms": { "en-GB": "chess", "da": "skak", "mn": "\u0448\u0430\u0442\u0430\u0440", "pt-BR": "xadrez", "ru": "\u0448\u0430\u0445\u043C\u0430\u0442\u044B", "es": "ajedrez", "es-AR": "ajedrez", "uk": "\u0448\u0430\u0445\u0438", "uz": "shaxmat", "uzb": "\u0448\u0430\u0445\u043C\u0430\u0442" } }, { "id": 110, "terms": { "en-GB": "click", "az": "klikl\u0259", "da": "klik", "mn": "\u0442\u043E\u0432\u0448\u0438\u0445", "pt-BR": "clicar", "ru": "\u043D\u0430\u0436\u0430\u0442\u044C", "es": "clicar", "es-AR": "hacer clic", "uk": "\u043D\u0430\u0442\u0438\u0441\u043D\u0443\u0442\u0438", "uz": "bosish", "uzb": "\u0431\u043E\u0441\u0438\u0448" } }, { "id": 111, "terms": { "en-GB": "coaching staff", "da": "tr\xE6nerstab", "pt-BR": "comiss\xE3o t\xE9cnica", "ru": "\u0442\u0440\u0435\u043D\u0435\u0440\u0441\u043A\u0438\u0439 \u0441\u043E\u0441\u0442\u0430\u0432", "es": "equipo t\xE9cnico", "es-AR": "equipo t\xE9cnico", "uz": "murabbiylar shtabi", "uzb": "\u043C\u0443\u0440\u0430\u0431\u0431\u0438\u0439\u043B\u0430\u0440 \u0448\u0442\u0430\u0431\u0438" } }, { "id": 112, "terms": { "en-GB": "combination forecast", "mn": "\u0445\u043E\u0441\u043E\u043B\u0441\u043E\u043D \u0443\u0440\u044C\u0434\u0447\u0438\u043B\u0441\u0430\u043D \u0442\u0430\u0430\u043C\u0430\u0433", "ru": "\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437", "es": "pron\xF3stico combinado", "es-AR": "pron\xF3stico combinado", "uk": "\u043A\u043E\u043C\u0431\u0456\u043D\u043E\u0432\u0430\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437", "uz": "kombinatsiyali prognoz", "uzb": "\u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F\u043B\u0438 \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 113, "terms": { "en-GB": "combination tricast", "mn": "\u0445\u043E\u0441\u043E\u043B\u0441\u043E\u043D \u0442\u0440\u0438\u043A\u0430\u0441\u0442", "ru": "\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \xAB\u0442\u0440\u043E\u0439\u043D\u0438\u043A\xBB", "es": "pron\xF3stico triple combinado", "es-AR": "pron\xF3stico triple combinado", "uk": "\u043A\u043E\u043C\u0431\u0456\u043D\u043E\u0432\u0430\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u0442\u0440\u0456\u0439\u043A\u0443", "uz": "kombinatsiyali uchtalik prognoz", "uzb": "\u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F\u043B\u0438 \u0443\u0447\u0442\u0430\u043B\u0438\u043A \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 114, "terms": { "en-GB": "combined price", "az": "kombinasiyal\u0131 \u0259msal", "da": "kombinerede odds", "mn": "\u0445\u043E\u0441\u043E\u043B\u0441\u043E\u043D \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "pre\xE7o combinado", "ru": "\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "precio combinado", "es-AR": "precio combinado", "uk": "\u043A\u043E\u043C\u0431\u0456\u043D\u043E\u0432\u0430\u043D\u0438\u0439 \u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "birlashtirilgan koeffitsiyent", "uzb": "\u0431\u0438\u0440\u043B\u0430\u0448\u0442\u0438\u0440\u0438\u043B\u0433\u0430\u043D \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442" } }, { "id": 115, "terms": { "en-GB": "commission", "az": "komissiya", "da": "provision", "mn": "\u0448\u0438\u043C\u0442\u0433\u044D\u043B", "pt-BR": "comiss\xE3o", "ru": "\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F", "es": "comisi\xF3n", "es-AR": "comisi\xF3n", "uk": "\u043A\u043E\u043C\u0456\u0441\u0456\u044F", "uz": "vositachilik haqi", "uzb": "\u0432\u043E\u0441\u0438\u0442\u0430\u0447\u0438\u043B\u0438\u043A \u04B3\u0430\u049B\u0438" } }, { "id": 116, "terms": { "en-GB": "Company Details", "da": "Virksomhedsoplysninger", "mn": "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u0439\u043D \u0442\u0443\u0445\u0430\u0439", "pt-BR": "Informa\xE7\xF5es sobre a empresa", "ru": "\u041E \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", "es": "Informaci\xF3n de la compa\xF1\xEDa", "es-AR": "Informaci\xF3n de la compa\xF1\xEDa", "uk": "\u041F\u0440\u043E \u043A\u043E\u043C\u043F\u0430\u043D\u0456\u044E", "uz": "kompaniyaga oid ma'lumotlar", "uzb": "\u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044F\u0433\u0430 \u043E\u0438\u0434 \u043C\u0430\u044A\u043B\u0443\u043C\u043E\u0442\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised when section name", "ru": `"O" is capitalised because it's a section name`, "uk": `"\u041F\u0440\u043E" is capitalised because it's a section name` } }, { "id": 117, "terms": { "en-GB": "competition", "az": "m\xFCsabiq\u0259", "da": "turnering", "mn": "\u0442\u044D\u043C\u0446\u044D\u044D\u043D", "pt-BR": "competi\xE7\xE3o", "ru": "\u0441\u043E\u0440\u0435\u0432\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "es": "competici\xF3n", "es-AR": "competici\xF3n", "uk": "\u0437\u043C\u0430\u0433\u0430\u043D\u043D\u044F", "uz": "musobaqa", "uzb": "\u043C\u0443\u0441\u043E\u0431\u0430\u049B\u0430" }, "notes": { "da": "General sport term" } }, { "id": 118, "terms": { "en-GB": "competition rules", "da": "turneringsregler", "pt-BR": "regras da competi\xE7\xE3o", "ru": "\u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0441\u043E\u0440\u0435\u0432\u043D\u043E\u0432\u0430\u043D\u0438\u044F", "es": "reglas de la competici\xF3n", "es-AR": "reglas de la competici\xF3n", "uz": "musobaqa qoidalari", "uzb": "\u043C\u0443\u0441\u043E\u0431\u0430\u049B\u0430 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440\u0438" }, "notes": { "da": "General sport term" } }, { "id": 119, "terms": { "en-GB": "competitor", "az": "m\xFCsabiq\u0259 i\u015Ftirak\xE7\u0131s\u0131", "da": "deltager", "mn": "\u043E\u0440\u043E\u043B\u0446\u043E\u0433\u0447", "pt-BR": "competidor", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A", "es": "competidor", "es-AR": "competidor", "uk": "\u0443\u0447\u0430\u0441\u043D\u0438\u043A", "uz": "musobaqa qatnashchisi", "uzb": "\u043C\u0443\u0441\u043E\u0431\u0430\u049B\u0430 \u049B\u0430\u0442\u043D\u0430\u0448\u0447\u0438\u0441\u0438" } }, { "id": 120, "terms": { "en-GB": "concession", "da": "koncession", "pt-BR": "concess\xE3o", "ru": "\u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435", "es": "concesi\xF3n", "es-AR": "concesi\xF3n", "uk": "\u0434\u043E\u0437\u0432\u0456\u043B", "uz": "ruxsatnoma", "uzb": "\u0440\u0443\u0445\u0441\u0430\u0442\u043D\u043E\u043C\u0430" } }, { "id": 121, "terms": { "en-GB": "confidential information", "pt-BR": "informa\xE7\xF5es confidenciais", "ru": "\u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F", "es": "informaci\xF3n confidencial", "es-AR": "informaci\xF3n confidencial", "uz": "maxfiy ma'lumot", "uzb": "\u043C\u0430\u0445\u0444\u0438\u0439 \u043C\u0430\u044A\u043B\u0443\u043C\u043E\u0442" } }, { "id": 122, "terms": { "en-GB": "confirmation email", "da": "bekr\xE6ftelsesmail", "mn": "\u0438\u043C\u044D\u0439\u043B \u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B\u0430\u043B\u0442", "pt-BR": "e-mail de confirma\xE7\xE3o", "ru": "\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u043E \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u0435", "es": "correo electr\xF3nico de confirmaci\xF3n", "es-AR": "correo electr\xF3nico de confirmaci\xF3n", "uk": "\u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F \u043D\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0443 \u0430\u0434\u0440\u0435\u0441\u0443", "uz": "tasdiqlovchi elektron xat", "uzb": "\u0442\u0430\u0441\u0434\u0438\u049B\u043B\u043E\u0432\u0447\u0438 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D \u0445\u0430\u0442" } }, { "id": 123, "terms": { "en-GB": "Constructor", "az": "Qurucu", "mn": "\u0411\u04AF\u0442\u044D\u044D\u0433\u0447", "pt-BR": "Construtor", "ru": "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440", "es": "Constructor", "es-AR": "Constructor", "uk": "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u0441\u0442\u0430\u0432\u043E\u043A", "uz": "Konstruktor", "uzb": "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440" }, "notes": { "en-GB": "Capitalised when section name", "ru": "Capitalised as a section/button name", "uk": "Capitalised as a section/button name", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 124, "terms": { "en-GB": "Contact Us", "az": "Biziml\u0259 \u0259laq\u0259", "da": "Kontakt os", "mn": "\u0411\u0438\u0434\u044D\u043D\u0442\u044D\u0439 \u0445\u043E\u043B\u0431\u043E\u0433\u0434\u043E\u0445", "pt-BR": "Fale conosco", "ru": "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B", "es": "Contacto", "es-AR": "Contacto", "uk": "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438", "uz": "Kontaktlar", "uzb": "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised when section name", "ru": "Capitalised is used as a section name or at the beginning of a sentence", "uk": "Capitalised is used as a section name or at the beginning of a sentence" } }, { "id": 125, "terms": { "en-GB": "cookie", "da": "cookie", "mn": "\u043A\u0443\u043A\u0438", "pt-BR": "cookie", "ru": "cookie", "es": "cookie", "es-AR": "cookie", "uk": "cookie-\u0444\u0430\u0439\u043B", "uz": "cookie-fayl", "uzb": "cookie-\u0444\u0430\u0439\u043B" } }, { "id": 126, "terms": { "en-GB": "Cookie Policy", "da": "Cookiepolitik", "mn": "\u041A\u0443\u043A\u0438 \u0431\u043E\u0434\u043B\u043E\u0433\u043E", "pt-BR": "Pol\xEDtica de cookies", "ru": "\u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 cookies", "es": "Pol\xEDtica de cookies", "es-AR": "Pol\xEDtica de cookies", "uk": "\u041F\u043E\u043B\u0456\u0442\u0438\u043A\u0430 \u0449\u043E\u0434\u043E cookie-\u0444\u0430\u0439\u043B\u0456\u0432" }, "notes": { "en-GB": "Capitalised when section name", "uk": "\u0441apitalised as shown when referring to specific document/section name and beginning of the sentence" } }, { "id": 127, "terms": { "en-GB": "corner", "az": "k\xFCnc z\u0259rb\u0259si", "da": "hj\xF8rnespark", "mn": "\u0431\u0443\u043B\u0430\u043D", "pt-BR": "escanteio", "ru": "\u0443\u0433\u043B\u043E\u0432\u043E\u0439", "es": "c\xF3rner", "es-AR": "c\xF3rner", "uk": "\u043A\u0443\u0442\u043E\u0432\u0438\u0439 \u0443\u0434\u0430\u0440", "uz": "burchak", "uzb": "\u0431\u0443\u0440\u0447\u0430\u043A" }, "notes": { "pt-BR": "Used in football, futsal." } }, { "id": 128, "terms": { "en-GB": "Correct Score", "az": "D\u0259qiq hesab", "da": "Korrekt Resultat", "mn": "\u0437\u04E9\u0432 \u043E\u043D\u043E\u043E", "pt-BR": "placar correto", "ru": "\u0422\u043E\u0447\u043D\u044B\u0439 \u0441\u0447\u0435\u0442", "es": "Marcador final", "es-AR": "Marcador final", "uk": "\u0422\u043E\u0447\u043D\u0438\u0439 \u0440\u0430\u0445\u0443\u043D\u043E\u043A", "uz": "To'g'ri hisob", "uzb": "\u0422\u045E\u0493\u0440\u0438 \u04B3\u0438\u0441\u043E\u0431" }, "notes": { "en-GB": "Capitalised when market name or Toto type", "ru": "Capitalised if used as a market name/bet type or at the beginning of a sentence", "uk": "Capitalised if used as a market name/bet type or at the beginning of a sentence" } }, { "id": 129, "terms": { "en-GB": "coupon", "az": "kupon", "da": "kupon", "mn": "\u043A\u0443\u043F\u043E\u043D", "pt-BR": "cupom", "ru": "\u043A\u0443\u043F\u043E\u043D", "es": "cup\xF3n", "es-AR": "cup\xF3n", "uk": "\u043A\u0443\u043F\u043E\u043D", "uz": "kupon", "uzb": "\u043A\u0443\u043F\u043E\u043D" }, "notes": { "mn": "for Toto/lucky draw contest related context", "ru": "Is used for general promotions", "uk": "list of lines in Toto batch betting which are placed simultaneously, with each line showing the bet content in the set format" } }, { "id": 130, "terms": { "en-GB": "credit", "az": "kredit", "da": "kredit", "pt-BR": "cr\xE9dito", "ru": "\u0430\u0432\u0430\u043D\u0441", "es": "cr\xE9dito", "es-AR": "cr\xE9dito", "uz": "kredit", "uzb": "\u043A\u0440\u0435\u0434\u0438\u0442" } }, { "id": 131, "terms": { "en-GB": "credit card", "az": "kredit kart\u0131", "da": "kreditkort", "mn": "\u0437\u044D\u044D\u043B\u0438\u0439\u043D \u043A\u0430\u0440\u0442", "pt-BR": "cart\xE3o de cr\xE9dito", "ru": "\u043A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430", "es": "tarjeta de cr\xE9dito", "es-AR": "tarjeta de cr\xE9dito", "uk": "\u043A\u0440\u0435\u0434\u0438\u0442\u043D\u0430 \u043A\u0430\u0440\u0442\u043A\u0430", "uz": "kredit kartasi", "uzb": "\u043A\u0440\u0435\u0434\u0438\u0442 \u043A\u0430\u0440\u0442\u0430\u0441\u0438" } }, { "id": 132, "terms": { "en-GB": "cricket", "da": "cricket", "mn": "\u043A\u0440\u0438\u043A\u0435\u0442", "pt-BR": "cr\xEDquete", "ru": "\u043A\u0440\u0438\u043A\u0435\u0442", "es": "cr\xEDquet", "es-AR": "cr\xEDquet", "uk": "\u043A\u0440\u0438\u043A\u0435\u0442", "uz": "kriket", "uzb": "\u043A\u0440\u0438\u043A\u0435\u0442" } }, { "id": 133, "terms": { "en-GB": "cross-country skiing", "da": "langrend", "pt-BR": "esqui cross-country", "ru": "\u043B\u044B\u0436\u043D\u044B\u0435 \u0433\u043E\u043D\u043A\u0438", "es": "esqu\xED de fondo", "es-AR": "esqu\xED de fondo", "uk": "\u043B\u0438\u0436\u043D\u0456 \u043F\u0435\u0440\u0435\u0433\u043E\u043D\u0438", "uz": "chang'i poygasi", "uzb": "\u0447\u0430\u043D\u0493\u0438 \u043F\u043E\u0439\u0433\u0430\u0441\u0438" } }, { "id": 134, "terms": { "en-GB": "curling", "da": "curling", "mn": "\u043A\u0451\u0440\u043B\u0438\u043D\u0433", "pt-BR": "curling", "ru": "\u043A\u0435\u0440\u043B\u0438\u043D\u0433", "es": "curling", "es-AR": "curling", "uk": "\u043A\u0435\u0440\u043B\u0456\u043D\u0433", "uz": "kyorling", "uzb": "\u043A\u0451\u0440\u043B\u0438\u043D\u0433" } }, { "id": 135, "terms": { "en-GB": "currency", "az": "valyuta", "da": "valuta", "mn": "\u0432\u0430\u043B\u044E\u0442", "pt-BR": "moeda", "ru": "\u0432\u0430\u043B\u044E\u0442\u0430", "es": "moneda", "es-AR": "moneda", "uk": "\u0432\u0430\u043B\u044E\u0442\u0430", "uz": "valyuta", "uzb": "\u0432\u0430\u043B\u044E\u0442\u0430" } }, { "id": 136, "terms": { "en-GB": "or currency equivalent", "az": "v\u0259 ya valyuta ekvivalenti", "mn": "\u044D\u0441\u0432\u044D\u043B \u0442\u04AF\u04AF\u043D\u0442\u044D\u0439 \u0442\u044D\u043D\u0446\u044D\u0445 \u0432\u0430\u043B\u044E\u0442", "pt-BR": "ou equivalente em outra moeda", "ru": "\u0438\u043B\u0438 \u044D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442 \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u0430\u043B\u044E\u0442\u0435", "es": "o moneda equivalente", "es-AR": "o moneda equivalente", "uk": "\u0430\u0431\u043E \u0435\u043A\u0432\u0456\u0432\u0430\u043B\u0435\u043D\u0442 \u0432 \u0456\u043D\u0448\u0456\u0439 \u0432\u0430\u043B\u044E\u0442\u0456", "uz": "yoki valyuta ekvivalenti", "uzb": "\u0451\u043A\u0438 \u0432\u0430\u043B\u044E\u0442\u0430 \u044D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442\u0438" } }, { "id": 137, "terms": { "en-GB": "current balance", "pt-BR": "saldo atual", "es": "saldo actual", "es-AR": "saldo actual" } }, { "id": 138, "terms": { "en-GB": "customer", "az": "m\xFC\u015Ft\u0259ri", "da": "kunde", "mn": "\u04AF\u0439\u043B\u0447\u043B\u04AF\u04AF\u043B\u044D\u0433\u0447", "pt-BR": "cliente", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A \u043F\u0430\u0440\u0438", "es": "cliente", "es-AR": "cliente", "uk": "\u0443\u0447\u0430\u0441\u043D\u0438\u043A \u043F\u0430\u0440\u0456", "uz": "mijoz", "uzb": "\u043C\u0438\u0436\u043E\u0437" }, "notes": { "es": "Especially used in CRM T&Cs", "es-AR": "Especially used in CRM T&Cs" } }, { "id": 139, "terms": { "en-GB": "Customer Support secret question", "da": "fortolige sp\xF8rgsm\xE5l til Kundesupport", "mn": "\u04AE\u0439\u043B\u0447\u043B\u04AF\u04AF\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u0414\u044D\u043C\u0436\u043B\u044D\u0433\u0438\u0439\u043D \u043D\u0443\u0443\u0446 \u0430\u0441\u0443\u0443\u043B\u0442", "pt-BR": "Pergunta secreta do Atendimento ao Cliente", "ru": "\u0421\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u0421\u043B\u0443\u0436\u0431\u044B \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438", "es": "pregunta secreta del servicio de Atenci\xF3n al Cliente", "es-AR": "pregunta secreta del servicio de Atenci\xF3n al Cliente", "uk": "\u0421\u0435\u043A\u0440\u0435\u0442\u043D\u0435 \u0437\u0430\u043F\u0438\u0442\u0430\u043D\u043D\u044F \u0421\u043B\u0443\u0436\u0431\u0438 \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0438", "uz": "Mijozlarga xizmat ko'rsatish markazining maxfiy savoli", "uzb": "\u041C\u0438\u0436\u043E\u0437\u043B\u0430\u0440\u0433\u0430 \u0445\u0438\u0437\u043C\u0430\u0442 \u043A\u045E\u0440\u0441\u0430\u0442\u0438\u0448 \u043C\u0430\u0440\u043A\u0430\u0437\u0438\u043D\u0438\u043D\u0433 \u043C\u0430\u0445\u0444\u0438\u0439 \u0441\u0430\u0432\u043E\u043B\u0438" }, "notes": { "ru": '"\u0421\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u0439" is capitalised only if used at the beginning of a sentence. "\u0421\u043B\u0443\u0436\u0431\u0430" in the phrase "\u0421\u043B\u0443\u0436\u0431\u0430 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438" is always capitalised as a unit name', "uk": '"\u0421\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u0439" is capitalised only if used at the beginning of a sentence. "\u0421\u043B\u0443\u0436\u0431\u0430" in the phrase "\u0421\u043B\u0443\u0436\u0431\u0430 \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0438" is always capitalised as a unit name', "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 140, "terms": { "en-GB": "Customer Support", "az": "M\xFC\u015Ft\u0259ri Xidm\u0259ti", "da": "Kundesupport", "mn": "\u04AE\u0439\u043B\u0447\u043B\u04AF\u04AF\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u0414\u044D\u043C\u0436\u043B\u044D\u0433", "pt-BR": "Atendimento ao Cliente", "ru": "\u0421\u043B\u0443\u0436\u0431\u0430 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438", "es": "servicio de Atenci\xF3n al Cliente", "es-AR": "servicio de Atenci\xF3n al Cliente", "uk": "\u0421\u043B\u0443\u0436\u0431\u0430 \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0438", "uz": "Mijozlarga xizmat ko'rsatish markazi", "uzb": "\u041C\u0438\u0436\u043E\u0437\u043B\u0430\u0440\u0433\u0430 \u0445\u0438\u0437\u043C\u0430\u0442 \u043A\u045E\u0440\u0441\u0430\u0442\u0438\u0448 \u043C\u0430\u0440\u043A\u0430\u0437\u0438" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 141, "terms": { "en-GB": "cycling", "da": "cykling", "mn": "\u0443\u043D\u0430\u0434\u0430\u0433 \u0434\u0443\u0433\u0443\u0439", "pt-BR": "ciclismo", "ru": "\u0432\u0435\u043B\u043E\u0441\u043F\u043E\u0440\u0442", "es": "ciclismo", "es-AR": "ciclismo", "uk": "\u0432\u0435\u043B\u043E\u0441\u043F\u043E\u0440\u0442", "uz": "velosport", "uzb": "\u0432\u0435\u043B\u043E\u0441\u043F\u043E\u0440\u0442" } }, { "id": 142, "terms": { "en-GB": "Daily Deposit", "da": "daglig indbetaling", "es": "dep\xF3sito diario", "es-AR": "dep\xF3sito diario" } }, { "id": 143, "terms": { "en-GB": "Daily Deposit Limit", "az": "g\xFCnd\u0259lik depozit limiti", "da": "daglig indbetalingsgr\xE6nse", "mn": "\u043C\u04E9\u043D\u0433\u04E9 \u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0430\u043B\u0442\u044B\u043D \u04E9\u0434\u0440\u0438\u0439\u043D \u0445\u044F\u0437\u0433\u0430\u0430\u0440", "pt-BR": "limite de dep\xF3sito di\xE1rio", "ru": "\u0434\u043D\u0435\u0432\u043D\u043E\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "es": "l\xEDmite de dep\xF3sito diario", "es-AR": "l\xEDmite de dep\xF3sito diario", "uk": "\u0434\u0435\u043D\u043D\u0435 \u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "uz": "kunlik depozit limiti", "uzb": "\u043A\u0443\u043D\u043B\u0438\u043A \u0434\u0435\u043F\u043E\u0437\u0438\u0442 \u043B\u0438\u043C\u0438\u0442\u0438" } }, { "id": 144, "terms": { "en-GB": "Daily Limit", "da": "daglig gr\xE6nse", "es": "l\xEDmite diario", "es-AR": "l\xEDmite diario" } }, { "id": 145, "terms": { "en-GB": "darts", "da": "dart", "mn": "\u0434\u0430\u0440\u0442\u0441", "pt-BR": "dardos", "ru": "\u0434\u0430\u0440\u0442\u0441", "es": "dardos", "es-AR": "dardos", "uk": "\u0434\u0430\u0440\u0442\u0441", "uz": "darts", "uzb": "\u0434\u0430\u0440\u0442\u0441" } }, { "id": 146, "terms": { "en-GB": "dead heat", "az": "he\xE7-he\xE7\u0259", "da": "d\xF8dt l\xF8b", "mn": "\u0442\u044D\u043D\u0446\u044D\u044D \u0448\u0438\u0439\u0434\u044D\u0445", "pt-BR": "dead heat", "ru": "\u043F\u0440\u0430\u0432\u0438\u043B\u043E \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0433\u043E \u0444\u0438\u043D\u0438\u0448\u0430", "es": "empate", "es-AR": "empate", "uk": "\u043F\u0440\u0430\u0432\u0438\u043B\u043E \u043E\u0434\u043D\u043E\u0447\u0430\u0441\u043D\u043E\u0433\u043E \u0444\u0456\u043D\u0456\u0448\u0443", "uz": "durang", "uzb": "\u0434\u0443\u0440\u0430\u043D\u0433" } }, { "id": 147, "terms": { "en-GB": "Dear", "da": "K\xE6re", "mn": "\u044D\u0440\u0445\u044D\u043C", "pt-BR": "Prezado(a)", "ru": "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435,", "es": "Estimado/a", "es-AR": "Estimado/a", "uk": "\u0428\u0430\u043D\u043E\u0432\u043D\u0430(\u0438\u0439)", "uz": "Hurmatli", "uzb": "\u04B2\u0443\u0440\u043C\u0430\u0442\u043B\u0438" }, "notes": { "ru": "Capitalised because it's the beginning of a sentence", "uk": "Capitalised when starting a letter/message", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 148, "terms": { "en-GB": "Dear Customer,", "da": "K\xE6re Kunde", "mn": "\u042D\u0440\u0445\u044D\u043C \u04AF\u0439\u043B\u0447\u043B\u04AF\u04AF\u043B\u044D\u0433\u0447", "pt-BR": "Prezado(a) cliente,", "ru": "\u0423\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442,", "es": "Estimado cliente,", "es-AR": "Estimado cliente,", "uk": "\u0428\u0430\u043D\u043E\u0432\u043D\u0438\u0439 \u043A\u043B\u0456\u0454\u043D\u0442\u0435!", "uz": "Hurmatli mijoz,", "uzb": "\u04B2\u0443\u0440\u043C\u0430\u0442\u043B\u0438 \u043C\u0438\u0436\u043E\u0437," }, "notes": { "da": '"Kunde" should be capitalised to emphase friendly customer service.', "ru": `"\u0423\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0439" is capitalised because it's the beginning of a sentence`, "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 149, "terms": { "en-GB": "debit", "az": "debit", "da": "debit", "mn": "\u0434\u0435\u0431\u0435\u0442", "pt-BR": "d\xE9bito", "ru": "\u0434\u0435\u0431\u0435\u0442\u043E\u0432\u044B\u0439", "es": "d\xE9bito", "es-AR": "d\xE9bito", "uk": "\u0434\u0435\u0431\u0435\u0442\u043E\u0432\u0430", "uz": "debit", "uzb": "\u0434\u0435\u0431\u0438\u0442" } }, { "id": 150, "terms": { "en-GB": "debit card", "az": "debet kart\u0131", "da": "debitkort", "mn": "\u0434\u0435\u0431\u0435\u0442 \u043A\u0430\u0440\u0442", "pt-BR": "cart\xE3o de d\xE9bito", "ru": "\u0434\u0435\u0431\u0435\u0442\u043E\u0432\u0430\u044F \u043A\u0430\u0440\u0442\u0430", "es": "tarjeta de d\xE9bito", "es-AR": "tarjeta de d\xE9bito", "uk": "\u0434\u0435\u0431\u0435\u0442\u043E\u0432\u0430 \u043A\u0430\u0440\u0442\u043A\u0430", "uz": "debit kartasi", "uzb": "\u0434\u0435\u0431\u0438\u0442 \u043A\u0430\u0440\u0442\u0430\u0441\u0438" } }, { "id": 151, "terms": { "en-GB": "deposit", "az": "depozit", "pt-BR": "depositar", "es": "dep\xF3sito", "es-AR": "dep\xF3sito" }, "notes": { "pt-BR": "verb" } }, { "id": 152, "terms": { "en-GB": "Deposit Bonus", "pt-BR": "B\xF4nus de Dep\xF3sito", "es": "Bono de Dep\xF3sito", "es-AR": "Bono de Dep\xF3sito" } }, { "id": 153, "terms": { "en-GB": "Deposit Limit", "az": "depozit limiti", "da": "indbetalingsgr\xE6nse", "mn": "\u043C\u04E9\u043D\u0433\u04E9 \u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0430\u043B\u0442\u044B\u043D \u0445\u044F\u0437\u0433\u0430\u0430\u0440", "pt-BR": "limite de dep\xF3sito", "ru": "\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "es": "l\xEDmite de dep\xF3sito", "es-AR": "l\xEDmite de dep\xF3sito", "uk": "\u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "uz": "depozit limiti", "uzb": "\u0434\u0435\u043F\u043E\u0437\u0438\u0442 \u043B\u0438\u043C\u0438\u0442\u0438" } }, { "id": 154, "terms": { "en-GB": "deposit request", "da": "indbetalingsanmodning", "mn": "\u043C\u04E9\u043D\u0433\u04E9 \u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0430\u0445 \u0445\u04AF\u0441\u044D\u043B\u0442", "pt-BR": "solicita\xE7\xE3o de dep\xF3sito", "ru": "\u0437\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432", "es": "solicitud de dep\xF3sito", "es-AR": "solicitud de dep\xF3sito", "uk": "\u0437\u0430\u043F\u0438\u0442 \u043D\u0430 \u0432\u043D\u0435\u0441\u0435\u043D\u043D\u044F \u043A\u043E\u0448\u0442\u0456\u0432", "uz": "depozit kiritish uchun so'rov", "uzb": "\u0434\u0435\u043F\u043E\u0437\u0438\u0442 \u043A\u0438\u0440\u0438\u0442\u0438\u0448 \u0443\u0447\u0443\u043D \u0441\u045E\u0440\u043E\u0432" } }, { "id": 155, "terms": { "en-GB": "desktop", "az": "desktop", "da": "desktop", "mn": "\u0432\u0435\u0431\u0441\u0430\u0439\u0442\u044B\u043D", "pt-BR": "computador", "ru": "\u0434\u0435\u0441\u043A\u0442\u043E\u043F\u043D\u044B\u0439", "es": "escritorio", "es-AR": "escritorio", "uk": "\u043F\u043E\u0432\u043D\u0430 \u0432\u0435\u0440\u0441\u0456\u044F", "uz": "kompyuter", "uzb": "\u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440" }, "notes": { "da": "Including the part of compounds: desktopversion, desktopsiden etc.", "pt-BR": "as in desktop version - vers\xE3o do site para computador", "uk": "when referring to a 'desktop (web)site' \u2014 '\u043F\u043E\u0432\u043D\u0430 \u0432\u0435\u0440\u0441\u0456\u044F \u0441\u0430\u0439\u0442\u0443'" } }, { "id": 156, "terms": { "en-GB": "Directorate General for the Regulation of Gambling", "es": "DGOJ", "es-AR": "DGOJ" } }, { "id": 157, "terms": { "en-GB": "DGOJ", "es": "DGOJ", "es-AR": "DGOJ" } }, { "id": 158, "terms": { "en-GB": "disqualification", "az": "diskvalifikasiya", "da": "diskvalifikation", "mn": "\u044D\u0440\u0445\u044D\u044D \u0445\u0430\u0441\u0443\u0443\u043B\u0430\u0445", "pt-BR": "desqualifica\xE7\xE3o", "ru": "\u0434\u0438\u0441\u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F", "es": "descalificaci\xF3n", "es-AR": "descalificaci\xF3n", "uk": "\u0434\u0438\u0441\u043A\u0432\u0430\u043B\u0456\u0444\u0456\u043A\u0430\u0446\u0456\u044F", "uz": "diskvalifikatsiya", "uzb": "\u0434\u0438\u0441\u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F" } }, { "id": 159, "terms": { "en-GB": "distance", "az": "m\u0259saf\u0259", "da": "afstand", "mn": "\u0437\u0430\u0439", "pt-BR": "dist\xE2ncia", "ru": "\u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u044F", "es": "distancia", "es-AR": "distancia", "uk": "\u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0456\u044F", "uz": "masofa", "uzb": "\u043C\u0430\u0441\u043E\u0444\u0430" } }, { "id": 160, "terms": { "en-GB": "dormant", "az": "qeyri-aktiv", "da": "i bero", "mn": "\u0438\u0434\u044D\u0432\u0445\u0433\u04AF\u0439", "pt-BR": "inativa", "ru": "\u0431\u0435\u0437\u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439", "es": "inactiva", "es-AR": "inactiva", "uk": "\u0431\u0435\u0437\u0434\u0456\u044F\u043B\u044C\u043D\u0438\u0439", "uz": "faol bo'lmagan", "uzb": "\u0444\u0430\u043E\u043B \u0431\u045E\u043B\u043C\u0430\u0433\u0430\u043D" } }, { "id": 161, "terms": { "en-GB": "double", "az": "dabl", "da": "double", "mn": "\u0434\u0430\u0432\u0445\u0430\u0440", "pt-BR": "dupla", "ru": "\xAB\u0434\u0432\u043E\u0439\u043D\u0438\u043A\xBB", "es": "doble", "es-AR": "doble", "uk": "\xAB\u0434\u0432\u0456\u0439\u043D\u0438\u043A\xBB", "uz": "ikkitalik", "uzb": "\u0438\u043A\u043A\u0438\u0442\u0430\u043B\u0438\u043A" } }, { "id": 162, "terms": { "en-GB": "double chance", "es": "Doble oportunidad", "es-AR": "Doble oportunidad" }, "notes": { "en-GB": "Capitalised when market name" } }, { "id": 163, "terms": { "en-GB": "double result (first past the post)", "es": "Resultado doble (First Past the Post: el vencedor se lo lleva todo)", "es-AR": "Resultado doble (First Past the Post: el vencedor se lo lleva todo)" }, "notes": { "en-GB": "Capitalised when section name" } }, { "id": 164, "terms": { "en-GB": "double-double", "da": "double-double", "mn": "\u0434\u0430\u0431\u043B\u044C-\u0434\u0430\u0431\u043B\u044C", "pt-BR": "duplo-duplo", "ru": "\u0434\u0430\u0431\u043B-\u0434\u0430\u0431\u043B", "es": "doble-doble", "es-AR": "doble-doble", "uk": "\u0434\u0430\u0431\u043B-\u0434\u0430\u0431\u043B", "uz": "dabl-dabl", "uzb": "\u0434\u0430\u0431\u043B-\u0434\u0430\u0431\u043B" } }, { "id": 165, "terms": { "en-GB": "draw", "az": "tiraj", "da": "remis", "mn": "c\u0443\u0433\u0430\u043B\u0430\u0445", "pt-BR": "sorteio", "ru": "\u0440\u043E\u0437\u044B\u0433\u0440\u044B\u0448", "es": "sorteo", "es-AR": "sorteo", "uk": "\u0436\u0435\u0440\u0435\u0431\u043A\u0443\u0432\u0430\u043D\u043D\u044F", "uz": "tanlov", "uzb": "\u0442\u0430\u043D\u043B\u043E\u0432" }, "notes": { "az": "lottery game", "da": "chess", "mn": "verb, to select (a ticket or name) randomly to decide winners in a lottery, opponents in a sporting contest, etc.", "pt-BR": "lottery, Toto", "ru": "in Superprize, prize draws or giveaways", "es": "As in lottery, raffles, promotions", "es-AR": "As in lottery, raffles, promotions", "uk": "for random selections", "uz": "referring to Superprize, product prize draws or prize giveaways", "uzb": "referring to Superprize, product prize draws or prize giveaways" } }, { "id": 166, "terms": { "en-GB": "draw no bet", "mn": "\u0422\u044D\u043D\u0446\u044D\u0445 \u0431\u043E\u043E\u0446\u043E\u043E \u0442\u0430\u0432\u0438\u0445\u0433\u04AF\u0439", "ru": "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0430\u044F \u043D\u0438\u0447\u044C\u044E", "es": "apuesta sin empate", "es-AR": "apuesta sin empate", "uk": "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u0435\u0437 \u0443\u0440\u0430\u0445\u0443\u0432\u0430\u043D\u043D\u044F \u043D\u0456\u0447\u0438\u0454\u0457", "uz": "fora bilan g'alaba qozonadi", "uzb": "\u0444\u043E\u0440\u0430 \u0431\u0438\u043B\u0430\u043D \u0493\u0430\u043B\u0430\u0431\u0430 \u049B\u043E\u0437\u043E\u043D\u0430\u0434\u0438" } }, { "id": 167, "terms": { "en-GB": "each way", "az": "Udu\u015F/Yer m\u0259rci", "da": "begge veje", "mn": "\u0445\u043E\u0436\u0438\u043B/\u0448\u0430\u0433\u043D\u0430\u043B\u0442 \u0431\u0430\u0439\u0440\u043D\u044B \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "each way", "ru": "\u043F\u0430\u0440\u0438 \u043D\u0430 \u043F\u043E\u0431\u0435\u0434\u0443/\u043C\u0435\u0441\u0442\u043E", "es": "each-way", "es-AR": "each-way", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u043F\u0435\u0440\u0435\u043C\u043E\u0433\u0443/\u043C\u0456\u0441\u0446\u0435", "uz": "G'alabaga/o'ringa bo'lgan stavka", "uzb": "\u0492\u0430\u043B\u0430\u0431\u0430\u0433\u0430/\u045E\u0440\u0438\u043D\u0433\u0430 \u0431\u045E\u043B\u0433\u0430\u043D \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 168, "terms": { "en-GB": "each-way", "da": "begge veje", "mn": "\u0445\u043E\u0436\u0438\u043B/\u0448\u0430\u0433\u043D\u0430\u043B\u0442 \u0431\u0430\u0439\u0440\u043D\u044B \u0431\u043E\u043E\u0446\u043E\u043E", "ru": "\u043F\u0430\u0440\u0438 \u043D\u0430 \u043F\u043E\u0431\u0435\u0434\u0443/\u043C\u0435\u0441\u0442\u043E", "es": "each-way", "es-AR": "each-way", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u043F\u0435\u0440\u0435\u043C\u043E\u0433\u0443/\u043C\u0456\u0441\u0446\u0435", "uz": "G'alabaga/o'ringa bo'lgan stavka", "uzb": "\u0492\u0430\u043B\u0430\u0431\u0430\u0433\u0430/\u045E\u0440\u0438\u043D\u0433\u0430 \u0431\u045E\u043B\u0433\u0430\u043D \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 169, "terms": { "en-GB": "early price", "az": "erk\u0259n qiym\u0259t", "da": "tidlige odds", "mn": "\u044D\u0445\u044D\u043D \u04AF\u0435\u0438\u0439\u043D \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "pre\xE7o antecipado", "ru": "\u0440\u0430\u043D\u043D\u0438\u0439 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "cuota inicial", "es-AR": "cuota inicial", "uk": "\u0440\u0430\u043D\u043D\u0456\u0439 \u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "dastlabki koeffitsiyent", "uzb": "\u0434\u0430\u0441\u0442\u043B\u0430\u0431\u043A\u0438 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442" } }, { "id": 170, "terms": { "en-GB": "Edit Bet", "az": "M\u0259rci redakt\u0259 et", "da": "Redig\xE9r v\xE6ddem\xE5l", "mn": "\u0411\u043E\u043E\u0446\u043E\u043E \u0437\u0430\u0441\u0430\u0445", "pt-BR": "Editar aposta", "ru": "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0430\u0440\u0438", "es": "Editar apuesta", "es-AR": "Editar apuesta", "uk": "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u0441\u0442\u0430\u0432\u043A\u0443", "uz": "Stavkani tahrirlash", "uzb": "\u0421\u0442\u0430\u0432\u043A\u0430\u043D\u0438 \u0442\u0430\u04B3\u0440\u0438\u0440\u043B\u0430\u0448" }, "notes": { "ru": "for .RU" } }, { "id": 171, "terms": { "en-GB": "email", "az": "e-po\xE7t", "da": "e-mail", "mn": "\u0438\u043C\u044D\u0439\u043B", "pt-BR": "e-mail", "ru": "\u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0435 \u043F\u0438\u0441\u044C\u043C\u043E", "es": "correo", "es-AR": "correo", "uk": "\u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0438\u0439 \u043B\u0438\u0441\u0442" }, "notes": { "da": "Hyphenated in Danish.", "es": "can be used, when we are limited on space", "es-AR": "can be used, when we are limited on space", "uk": "electronic letter" } }, { "id": 172, "terms": { "en-GB": "end", "az": "end", "da": "ende", "mn": "\u0442\u04E9\u0433\u0441\u0433\u04E9\u043B", "pt-BR": "end", "ru": "\u044D\u043D\u0434", "es": "final", "es-AR": "final", "uk": "\u0435\u043D\u0434", "uz": "end", "uzb": "\u044D\u043D\u0434" }, "notes": { "pt-BR": "Used in curling and bowls.", "uz": "Used in curling and bowls.", "uzb": "Used in curling and bowls." } }, { "id": 173, "terms": { "en-GB": "error", "es": "error", "es-AR": "error" } }, { "id": 174, "terms": { "en-GB": "esports", "az": "kiberidman", "da": "e-sport", "mn": "\u0446\u0430\u0445\u0438\u043C \u0441\u043F\u043E\u0440\u0442", "pt-BR": "E-Sports", "ru": "\u043A\u0438\u0431\u0435\u0440\u0441\u043F\u043E\u0440\u0442", "es": "esports", "es-AR": "esports", "uk": "\u043A\u0456\u0431\u0435\u0440\u0441\u043F\u043E\u0440\u0442", "uz": "kibersport", "uzb": "\u043A\u0438\u0431\u0435\u0440\u0441\u043F\u043E\u0440\u0442" }, "notes": { "da": "Hyphenated in Danish." } }, { "id": 175, "terms": { "en-GB": "Ethereum", "da": "Ethereum", "mn": "Ethereum", "pt-BR": "Ethereum", "ru": "Ethereum", "es": "Ethereum", "es-AR": "Ethereum", "uk": "Ethereum", "uz": "Ethereum", "uzb": "Ethereum" } }, { "id": 176, "terms": { "en-GB": "even", "az": "c\xFCt", "da": "lige", "mn": "\u0442\u044D\u0433\u0448", "pt-BR": "par", "ru": "\u0447\u0435\u0442", "es": "par", "es-AR": "par", "uk": "\u043F\u0430\u0440\u043D\u0438\u0439", "uz": "juft", "uzb": "\u0436\u0443\u0444\u0442" } }, { "id": 177, "terms": { "en-GB": "event", "az": "t\u0259dbir", "da": "sportsevent", "mn": "\u04AF\u0439\u043B \u044F\u0432\u0434\u0430\u043B", "pt-BR": "evento", "ru": "\u0441\u043E\u0431\u044B\u0442\u0438\u0435", "es": "evento", "es-AR": "evento", "uk": "\u043F\u043E\u0434\u0456\u044F", "uz": "voqea", "uzb": "\u0432\u043E\u049B\u0435\u0430" }, "notes": { "da": "Possible translation" } }, { "id": 178, "terms": { "en-GB": "EW", "az": "Udu\u015F/Yer", "da": "BV", "mn": "\u0445\u043E\u0436\u0438\u043B/\u0448\u0430\u0433\u043D\u0430\u043B\u0442 \u0431\u0430\u0439\u0440\u043D\u044B \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "EW", "ru": "Each-Way", "es": "EW", "es-AR": "EW", "uk": "EW", "uz": "EW", "uzb": "EW" }, "notes": { "en-GB": "short for 'each way'", "da": "Short for 'begge veje'." } }, { "id": 179, "terms": { "en-GB": "extra time", "az": "\u0259lav\u0259 vaxt", "da": "forl\xE6nget spilletid", "mn": "\u043D\u044D\u043C\u044D\u043B\u0442 \u0446\u0430\u0433", "pt-BR": "prorroga\xE7\xE3o", "ru": "\u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434", "es": "pr\xF3rroga", "es-AR": "pr\xF3rroga", "uk": "\u0434\u043E\u0434\u0430\u0442\u043A\u043E\u0432\u0438\u0439 \u043F\u0435\u0440\u0456\u043E\u0434", "uz": "qo'shimcha taym", "uzb": "\u049B\u045E\u0448\u0438\u043C\u0447\u0430 \u0442\u0430\u0439\u043C" }, "notes": { "da": 'Not be confused with "till\xE6gstid".', "pt-BR": "Same as overtime.", "ru": "\u043F\u043B\u044F\u0436\u043D\u044B\u0439 \u0444\u0443\u0442\u0431\u043E\u043B, \u0432\u043E\u0434\u043D\u043E\u0435 \u043F\u043E\u043B\u043E", "uk": "\u043F\u043B\u044F\u0436\u043D\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B, \u0432\u043E\u0434\u043D\u0435 \u043F\u043E\u043B\u043E" } }, { "id": 180, "terms": { "en-GB": "Face ID", "az": "Face ID", "da": "Face ID", "mn": "Face ID", "pt-BR": "Face ID", "ru": "Face ID", "es": "Face ID", "es-AR": "Face ID", "uk": "Face ID", "uz": "Face ID", "uzb": "Face ID" } }, { "id": 181, "terms": { "en-GB": "FAQs", "az": "MVS", "da": "OSS", "mn": "\u0422\u04AF\u0433\u044D\u044D\u043C\u044D\u043B \u0430\u0441\u0443\u0443\u043B\u0442, \u0445\u0430\u0440\u0438\u0443\u043B\u0442", "pt-BR": "Perguntas frequentes", "ru": "\u0427\u0430\u0441\u0442\u043E \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B", "es": "preguntas frecuentes", "es-AR": "preguntas frecuentes", "uk": "\u0417\u0430\u043F\u0438\u0442\u0430\u043D\u043D\u044F \u0442\u0430 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456", "uz": "Savol-javob", "uzb": "\u0421\u0430\u0432\u043E\u043B-\u0436\u0430\u0432\u043E\u0431" }, "notes": { "da": 'Short for "ofte Stillede sp\xF8rgsm\xE5l".', "ru": `"\u0427\u0430\u0441\u0442\u043E" is capitalised because it's a section name`, "uk": `"\u0417\u0430\u043F\u0438\u0442\u0430\u043D\u043D\u044F" is capitalised because it's a section name`, "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 182, "terms": { "en-GB": "favourite", "da": "favorit", "mn": "\u0434\u0430\u0432\u0443\u0443 \u0442\u0430\u043B\u0442\u0430\u0439", "pt-BR": "favorito", "ru": "\u0444\u0430\u0432\u043E\u0440\u0438\u0442", "es": "favorito", "es-AR": "favorito", "uk": "\u0444\u0430\u0432\u043E\u0440\u0438\u0442", "uz": "favorit", "uzb": "\u0444\u0430\u0432\u043E\u0440\u0438\u0442" } }, { "id": 183, "terms": { "en-GB": "favourites", "az": "favoritl\u0259r", "mn": "\u0434\u0443\u0440\u0442\u0430\u0439 \u0436\u0430\u0433\u0441\u0430\u0430\u043B\u0442", "pt-BR": "favoritos", "ru": "\u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", "es": "favoritos", "es-AR": "favoritos", "uz": "sevimlilar", "uzb": "\u0441\u0435\u0432\u0438\u043C\u043B\u0438\u043B\u0430\u0440" }, "notes": { "az": "horse racing" } }, { "id": 184, "terms": { "en-GB": "fee", "az": "komissiya", "da": "gebyr", "mn": "\u0448\u0438\u043C\u0442\u0433\u044D\u043B", "pt-BR": "taxa", "ru": "\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F", "es": "tarifa", "es-AR": "tarifa", "uk": "\u043A\u043E\u043C\u0456\u0441\u0456\u044F", "uz": "yig'im", "uzb": "\u0439\u0438\u0493\u0438\u043C" }, "notes": { "mn": "meaning financial charges/fee" } }, { "id": 185, "terms": { "en-GB": "feedback", "da": "feedback", "mn": "\u0441\u0430\u043D\u0430\u043B \u0445\u04AF\u0441\u044D\u043B\u0442", "pt-BR": "feedback", "ru": "\u043E\u0442\u0437\u044B\u0432", "es": "valoraci\xF3n", "es-AR": "valoraci\xF3n", "uk": "\u0432\u0456\u0434\u0433\u0443\u043A", "uz": "fidbek", "uzb": "\u0444\u0438\u0434\u0431\u044D\u043A" } }, { "id": 186, "terms": { "en-GB": "field hockey", "da": "hockey (landhockey)", "mn": "\u0442\u0430\u043B\u0431\u0430\u0439\u043D \u0445\u043E\u043A\u043A\u0435\u0439", "pt-BR": "h\xF3quei sobre grama", "ru": "\u0445\u043E\u043A\u043A\u0435\u0439 \u043D\u0430 \u0442\u0440\u0430\u0432\u0435", "es": "hockey hierba", "es-AR": "hockey hierba", "uk": "\u0445\u043E\u043A\u0435\u0439 \u043D\u0430 \u0442\u0440\u0430\u0432\u0456", "uz": "chim ustida xokkey", "uzb": "\u0447\u0438\u043C \u0443\u0441\u0442\u0438\u0434\u0430 \u0445\u043E\u043A\u043A\u0435\u0439" }, "notes": { "da": "Should be used to distinguish it from other types of hockey such as 'ice hockey', as the help section header" } }, { "id": 187, "terms": { "en-GB": "fight", "az": "d\xF6y\xFC\u015F", "da": "kamp", "mn": "\u0442\u0443\u043B\u0430\u0430\u043D", "pt-BR": "luta", "ru": "\u0431\u043E\u0439", "es": "combate", "es-AR": "combate", "uk": "\u0431\u0456\u0439", "uz": "jang", "uzb": "\u0436\u0430\u043D\u0433" } }, { "id": 188, "terms": { "en-GB": "final", "da": "finale", "mn": "\u0444\u0438\u043D\u0430\u043B", "pt-BR": "final", "ru": "\u0444\u0438\u043D\u0430\u043B", "es": "final", "es-AR": "final", "uk": "\u0444\u0456\u043D\u0430\u043B", "uz": "final", "uzb": "\u0444\u0438\u043D\u0430\u043B" } }, { "id": 189, "terms": { "en-GB": "fingerprint recognition", "az": "barmaq izinin tan\u0131nmas\u0131", "da": "fingeraftryksgenkendelse", "mn": "\u0425\u0443\u0440\u0443\u0443\u043D\u044B \u0445\u044D\u044D ID", "pt-BR": "reconhecimento de impress\xE3o digital", "ru": "\u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u043E\u0442\u043F\u0435\u0447\u0430\u0442\u043A\u0443 \u043F\u0430\u043B\u044C\u0446\u0430", "es": "reconocimiento de huella dactilar", "es-AR": "reconocimiento de huella dactilar", "uk": "\u0420\u043E\u0437\u0431\u043B\u043E\u043A\u0443\u0432\u0430\u043D\u043D\u044F \u0437\u0430 \u0432\u0456\u0434\u0431\u0438\u0442\u043A\u043E\u043C \u043F\u0430\u043B\u044C\u0446\u044F", "uz": "barmoq izini aniqlash", "uzb": "\u0431\u0430\u0440\u043C\u043E\u049B \u0438\u0437\u0438\u043D\u0438 \u0430\u043D\u0438\u049B\u043B\u0430\u0448" }, "notes": { "ru": "referring to an UI option", "uk": "referring to an UI option" } }, { "id": 190, "terms": { "en-GB": "finish", "pt-BR": "terminar", "ru": "\u0444\u0438\u043D\u0438\u0448", "es": "finalizar", "es-AR": "finalizar", "uk": "\u0444\u0456\u043D\u0456\u0448", "uz": "finish", "uzb": "\u0444\u0438\u043D\u0438\u0448" } }, { "id": 191, "terms": { "en-GB": "First Blood", "az": "Birinci qan", "da": "First Blood", "mn": "\u042D\u0445\u043D\u0438\u0439 \u0446\u0443\u0441", "pt-BR": "Primeiro sangue", "ru": "\u041F\u0435\u0440\u0432\u0430\u044F \u043A\u0440\u043E\u0432\u044C", "es": "Primera sangre", "es-AR": "Primera sangre", "uk": "\u041F\u0435\u0440\u0448\u0430 \u043A\u0440\u043E\u0432", "uz": "Birinchi qon", "uzb": "\u0411\u0438\u0440\u0438\u043D\u0447\u0438 \u049B\u043E\u043D" }, "notes": { "en-GB": "Capitalised when market name", "uz": "Capitalised as market name", "uzb": "Capitalised as market name" } }, { "id": 192, "terms": { "en-GB": "fixed odds", "az": "d\u0259qiql\u0259\u015Fdirilmi\u015F \u0259msal", "da": "faste odds", "mn": "\u0442\u043E\u0433\u0442\u043C\u043E\u043B \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "odds fixas", "ru": "\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "cuotas fijas", "es-AR": "cuotas fijas", "uk": "\u0444\u0456\u043A\u0441\u043E\u0432\u0430\u043D\u0438\u0439 \u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "o'zgarmas koeffitsiyent", "uzb": "\u045E\u0437\u0433\u0430\u0440\u043C\u0430\u0441 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442" } }, { "id": 193, "terms": { "en-GB": "flag", "az": "bayraq", "da": "Flag", "pt-BR": "flag", "ru": "\u0444\u043B\u0430\u0433", "es": "bandera", "es-AR": "bandera", "uz": "bayroq", "uzb": "\u0431\u0430\u0439\u0440\u043E\u049B" }, "notes": { "pt-BR": "Bet type." } }, { "id": 194, "terms": { "en-GB": "floorball", "da": "floorball", "mn": "\u0448\u0430\u043B\u043D\u044B \u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "floorball", "ru": "\u0444\u043B\u043E\u0440\u0431\u043E\u043B", "es": "floorball", "es-AR": "floorball", "uk": "\u0444\u043B\u043E\u0440\u0431\u043E\u043B", "uz": "florbol", "uzb": "\u0444\u043B\u043E\u0440\u0431\u043E\u043B" } }, { "id": 195, "terms": { "en-GB": "Folds", "es": "Folds", "es-AR": "Folds" } }, { "id": 196, "terms": { "en-GB": "football", "az": "futbol", "da": "fodbold", "mn": "\u0445\u04E9\u043B \u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "futebol", "ru": "\u0444\u0443\u0442\u0431\u043E\u043B", "es": "f\xFAtbol", "es-AR": "f\xFAtbol", "uk": "\u0444\u0443\u0442\u0431\u043E\u043B", "uz": "futbol", "uzb": "\u0444\u0443\u0442\u0431\u043E\u043B" } }, { "id": 197, "terms": { "en-GB": "forecast", "az": "proqnoz", "da": "prognosespil", "mn": "\u0443\u0440\u044C\u0434\u0447\u0438\u043B\u0441\u0430\u043D \u0442\u0430\u0430\u043C\u0430\u0433", "pt-BR": "previs\xE3o", "ru": "\u043F\u0440\u043E\u0433\u043D\u043E\u0437", "es": "pron\xF3stico", "es-AR": "pron\xF3stico", "uk": "\u043F\u0440\u043E\u0433\u043D\u043E\u0437", "uz": "prognoz", "uzb": "\u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 198, "terms": { "en-GB": "foul", "az": "fol", "da": "frikast", "mn": "\u0430\u043B\u0434\u0430\u0430", "pt-BR": "falta", "ru": "\u0444\u043E\u043B", "es": "falta", "es-AR": "falta", "uk": "\u043F\u043E\u0440\u0443\u0448\u0435\u043D\u043D\u044F", "uz": "qoidabuzarlik", "uzb": "\u049B\u043E\u0438\u0434\u0430\u0431\u0443\u0437\u0430\u0440\u043B\u0438\u043A" }, "notes": { "da": "May be used depending on the context" } }, { "id": 199, "terms": { "en-GB": "Free Bet", "az": "FB", "da": "FB", "mn": "\u04AE\u0411", "pt-BR": "AG", "ru": "\u0424\u0411", "es": "AG", "es-AR": "AG", "uk": "\u0424\u0411", "uz": "FB", "uzb": "\u0424\u0411" } }, { "id": 200, "terms": { "en-GB": "Free Spin", "az": "FS", "da": "FS", "mn": "\u04AE\u042D", "pt-BR": "GG", "ru": "FS", "es": "GG", "es-AR": "GG", "uk": "\u0424\u0421", "uz": "FS", "uzb": "FS" } }, { "id": 201, "terms": { "en-GB": "free throw", "az": "s\u0259rb\u0259st at\u0131\u015F", "da": "frikast", "mn": "\u0447\u04E9\u043B\u04E9\u04E9\u0442 \u0448\u0438\u0434\u044D\u043B\u0442", "pt-BR": "tiro livre", "ru": "\u0448\u0442\u0440\u0430\u0444\u043D\u043E\u0439 \u0431\u0440\u043E\u0441\u043E\u043A", "es": "tiro libre", "es-AR": "tiro libre", "uk": "\u0432\u0456\u043B\u044C\u043D\u0438\u0439 \u043A\u0438\u0434\u043E\u043A", "uz": "jarima to'pini otish", "uzb": "\u0436\u0430\u0440\u0438\u043C\u0430 \u0442\u045E\u043F\u0438\u043D\u0438 \u043E\u0442\u0438\u0448" }, "notes": { "pt-BR": "Handball" } }, { "id": 202, "terms": { "en-GB": "full distance", "da": "Kampen G\xE5r Tiden Ud", "mn": "\u0431\u04AF\u0442\u044D\u043D \u0446\u0430\u0433", "pt-BR": "luta completa", "ru": "\u043F\u043E\u043B\u043D\u044B\u0439 \u0431\u043E\u0439", "es": "distancia completa", "es-AR": "distancia completa", "uk": "\u043F\u043E\u0432\u043D\u0438\u0439 \u0431\u0456\u0439", "uz": "to'liq jang", "uzb": "\u0442\u045E\u043B\u0438\u049B \u0436\u0430\u043D\u0433" } }, { "id": 203, "terms": { "en-GB": "full time", "az": "tam vaxt", "da": "ordin\xE6r spilletid", "mn": "\u04AF\u043D\u0434\u0441\u044D\u043D \u0446\u0430\u0433", "pt-BR": "tempo integral", "ru": "\u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043C\u0430\u0442\u0447\u0430", "es": "tiempo completo", "es-AR": "tiempo completo", "uk": "\u043E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u0447\u0430\u0441 \u043C\u0430\u0442\u0447\u0443", "uz": "asosiy vaqt", "uzb": "\u0430\u0441\u043E\u0441\u0438\u0439 \u0432\u0430\u049B\u0442" }, "notes": { "uz": "in rules", "uzb": "in rules" } }, { "id": 204, "terms": { "en-GB": "funds", "da": "midler", "mn": "\u043C\u04E9\u043D\u0433\u04E9", "pt-BR": "fundos", "ru": "\u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430", "es": "saldo", "es-AR": "saldo", "uk": "\u0433\u0440\u043E\u0448\u043E\u0432\u0456 \u043A\u043E\u0448\u0442\u0438", "uz": "mablag'", "uzb": "\u043C\u0430\u0431\u043B\u0430\u0493" } }, { "id": 205, "terms": { "en-GB": "futsal", "da": "futsal", "mn": "\u0444\u0443\u0442\u0437\u0430\u043B", "pt-BR": "futsal", "ru": "\u0444\u0443\u0442\u0437\u0430\u043B", "es": "f\xFAtbol sala", "es-AR": "f\xFAtbol sala", "uk": "\u0444\u0443\u0442\u0437\u0430\u043B", "uz": "futzal", "uzb": "\u0444\u0443\u0442\u0437\u0430\u043B" } }, { "id": 206, "terms": { "en-GB": "Gaelic football", "da": "g\xE6lisk fodbold", "mn": "\u0413\u0430\u044D\u043B\u0438\u0439\u043D \u0445\u04E9\u043B \u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "Futebol ga\xE9lico", "ru": "\u0433\u044D\u043B\u044C\u0441\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "es": "f\xFAtbol ga\xE9lico", "es-AR": "f\xFAtbol ga\xE9lico", "uk": "\u0433\u0435\u043B\u044C\u0441\u044C\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "uz": "gelcha futbol", "uzb": "\u0433\u044D\u043B\u044C\u0447\u0430 \u0444\u0443\u0442\u0431\u043E\u043B" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 207, "terms": { "en-GB": "gamble", "az": "oyna", "da": "gamble", "mn": "\u043C\u04E9\u0440\u0438\u0439\u0442\u044D\u0439 \u0442\u043E\u0433\u043B\u043E\u0445", "pt-BR": "aposta", "ru": "\u0438\u0433\u0440\u0430\u0442\u044C", "es": "apostar", "es-AR": "apostar", "uk": "\u0440\u043E\u0431\u0438\u0442\u0438 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "qimor o'ynamoq", "uzb": "\u049B\u0438\u043C\u043E\u0440 \u045E\u0439\u043D\u0430\u043C\u043E\u049B" }, "notes": { "da": "Best to use in legal and technical contexts" } }, { "id": 208, "terms": { "en-GB": "gambler", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A \u0430\u0437\u0430\u0440\u0442\u043D\u043E\u0439 \u0438\u0433\u0440\u044B", "es": "jugador", "es-AR": "jugador" } }, { "id": 209, "terms": { "en-GB": "gambling", "az": "qumar", "da": "spil", "mn": "\u043C\u04E9\u0440\u0438\u0439\u0442\u044D\u0439 \u0442\u043E\u0433\u043B\u043E\u043E\u043C", "pt-BR": "apostar", "ru": "\u0430\u0437\u0430\u0440\u0442\u043D\u0430\u044F \u0438\u0433\u0440\u0430", "es": "apuestas", "es-AR": "apuestas", "uk": "\u0430\u0437\u0430\u0440\u0442\u043D\u0430 \u0433\u0440\u0430", "uz": "qimor o'ynash", "uzb": "\u049B\u0438\u043C\u043E\u0440 \u045E\u0439\u043D\u0430\u0448" }, "notes": { "az": "direct translation of 'gambling'", "da": "Best to use in marketing texts" } }, { "id": 210, "terms": { "en-GB": "game", "az": "oyun", "da": "s\xE6t", "mn": "\u04E9\u0440\u04E9\u0433", "pt-BR": "jogo", "ru": "\u0433\u0435\u0439\u043C", "es": "partida", "es-AR": "partida", "uk": "\u0442\u0438\u0440\u0430\u0436", "uz": "tiraj", "uzb": "\u0442\u0438\u0440\u0430\u0436" }, "notes": { "az": "Casino, Toto, all sports", "mn": "in the context of a chess game", "ru": "as a part of a squash or sepak takrau match", "es": "refers to chess", "es-AR": "refers to chess", "uk": "in Toto", "uz": "Toto", "uzb": "Toto" } }, { "id": 211, "terms": { "en-GB": "game provider", "az": "oyun provayderi", "mn": "\u0442\u043E\u0433\u043B\u043E\u043E\u043C\u044B\u043D \u04AF\u0439\u043B\u0447\u0438\u043B\u0433\u044D\u044D \u04AF\u0437\u04AF\u04AF\u043B\u044D\u0433\u0447", "pt-BR": "provedora de jogos", "ru": "\u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440 \u0438\u0433\u0440", "es": "proveedor del juego", "es-AR": "proveedor del juego", "uk": "\u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u043E\u043C \u0433\u0440\u0438", "uz": "o'yin provayderi", "uzb": "\u045E\u0439\u0438\u043D \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0438" }, "notes": { "uk": "Every provider has more than one game, but in some cases the term contextually applies to a situation concerning a single game." } }, { "id": 212, "terms": { "en-GB": "gaming account", "az": "oyun hesab\u0131", "da": "spilkonto", "mn": "\u0442\u043E\u0433\u043B\u043E\u043B\u0442\u044B\u043D \u0434\u0430\u043D\u0441", "pt-BR": "conta de jogo", "ru": "\u0438\u0433\u0440\u043E\u0432\u043E\u0439 \u0441\u0447\u0435\u0442", "es": "cuenta de juego", "es-AR": "cuenta de juego", "uk": "\u0456\u0433\u0440\u043E\u0432\u0438\u0439 \u0440\u0430\u0445\u0443\u043D\u043E\u043A", "uz": "o'yin hisobi", "uzb": "\u045E\u0439\u0438\u043D \u04B3\u0438\u0441\u043E\u0431\u0438" } }, { "id": 213, "terms": { "en-GB": "Gaming Contract", "es": "Contrato de Juego", "es-AR": "Contrato de Juego" }, "notes": { "en-GB": "Capitalised when section/doc name" } }, { "id": 214, "terms": { "en-GB": "General Register of Gaming Access Bans", "es": "Registro General de Interdicciones de Acceso al Juego", "es-AR": "Registro General de Interdicciones de Acceso al Juego" }, "notes": { "en-GB": "Capitalised when section/doc name" } }, { "id": 215, "terms": { "en-GB": "general regulations", "es": "reglamento general", "es-AR": "reglamento general" }, "notes": { "en-GB": "Capitalised when section/doc name", "es": "general term", "es-AR": "general term" } }, { "id": 216, "terms": { "en-GB": "General Rules", "da": "Generelle regler", "mn": "\u0415\u0440\u04E9\u043D\u0445\u0438\u0439 \u0414\u04AF\u0440\u044D\u043C", "pt-BR": "regras gerais", "ru": "\u041E\u0431\u0449\u0438\u0435 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u044F", "es": "reglas generales", "es-AR": "reglas generales", "uk": "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0456 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F", "uz": "Umumiy qoidalar", "uzb": "\u0423\u043C\u0443\u043C\u0438\u0439 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440" }, "notes": { "ru": "as a .BY help section title", "uk": `"\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0456" is capitalised because it's a document name` } }, { "id": 217, "terms": { "en-GB": "General Terms and Conditions", "da": "Generelle vilk\xE5r og betingelser", "mn": "\u0415\u0440\u04E9\u043D\u0445\u0438\u0439 \u041D\u04E9\u0445\u0446\u04E9\u043B \u0431\u0430 \u0411\u043E\u043B\u0437\u043E\u043B", "ru": "\u041E\u0431\u0449\u0438\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0438 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u044F", "es": "T\xE9rminos y Condiciones generales", "es-AR": "T\xE9rminos y Condiciones generales", "uk": "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0456 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u0442\u0430 \u0443\u043C\u043E\u0432\u0438", "uz": "Umumiy shartlar va qoidalar", "uzb": "\u0423\u043C\u0443\u043C\u0438\u0439 \u0448\u0430\u0440\u0442\u043B\u0430\u0440 \u0432\u0430 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440" }, "notes": { "da": "The first word is capitalised when referring to a section.", "uz": "always capitalised first letter", "uzb": "always capitalised first letter" } }, { "id": 218, "terms": { "en-GB": "goal", "az": "qol", "da": "m\xE5l", "mn": "\u0433\u043E\u043E\u043B", "pt-BR": "gol", "ru": "\u0433\u043E\u043B", "es": "gol", "es-AR": "gol", "uk": "\u0433\u043E\u043B", "uz": "gol", "uzb": "\u0433\u043E\u043B" } }, { "id": 219, "terms": { "en-GB": "Goalless Bonus", "az": "Qolsuz Bonus", "da": "Bonus uden m\xE5l", "mn": "\u0413\u043E\u043E\u043B\u0433\u04AF\u0439 \u0431\u043E\u043D\u0443\u0441", "pt-BR": "B\xF4nus de Empate 0 a 0", "ru": "\u0411\u0435\u0437\u0433\u043E\u043B\u0435\u0432\u043E\u0439 \u0431\u043E\u043D\u0443\u0441", "es": "Bono de empate a cero", "es-AR": "Bono de empate a cero", "uk": "\u0411\u0435\u0437\u0433\u043E\u043B\u044C\u043E\u0432\u0438\u0439 \u0431\u043E\u043D\u0443\u0441", "uz": "Golsiz bonus", "uzb": "\u0413\u043E\u043B\u0441\u0438\u0437 \u0431\u043E\u043D\u0443\u0441" }, "notes": { "ru": '"\u0411\u0435\u0437\u0433\u043E\u043B\u0435\u0432\u043E\u0439" is capitalised if the phrase is used as a bonus name', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 220, "terms": { "en-GB": "goalscorer", "az": "qol vuran", "da": "m\xE5lscorer", "pt-BR": "marcador", "ru": "\u0430\u0432\u0442\u043E\u0440 \u0433\u043E\u043B\u0430", "es": "goleador", "es-AR": "goleador", "uz": "gol muallifi", "uzb": "\u0433\u043E\u043B \u043C\u0443\u0430\u043B\u043B\u0438\u0444\u0438" } }, { "id": 221, "terms": { "en-GB": "golf", "da": "golf", "mn": "\u0433\u043E\u043B\u044C\u0444", "pt-BR": "golfe", "ru": "\u0433\u043E\u043B\u044C\u0444", "es": "golf", "es-AR": "golf", "uk": "\u0433\u043E\u043B\u044C\u0444", "uz": "golf", "uzb": "\u0433\u043E\u043B\u044C\u0444" } }, { "id": 222, "terms": { "en-GB": "Goliath", "az": "Goliaf", "da": "Goliath", "mn": "\u0413\u043E\u043B\u0438\u0430\u0444", "pt-BR": "Goliath", "ru": "\u0413\u043E\u043B\u0438\u0430\u0444", "es": "Goliat", "es-AR": "Goliat", "uk": "\u0413\u043E\u043B\u0456\u0430\u0444", "uz": "goliaf", "uzb": "\u0433\u043E\u043B\u0438\u0430\u0444" }, "notes": { "uz": "Standard capitalization rules apply", "uzb": "Standard capitalization rules apply" } }, { "id": 223, "terms": { "en-GB": "greyhound", "az": "it", "da": "greyhound", "mn": "\u0430\u043D\u0447 \u043D\u043E\u0445\u043E\u0439", "pt-BR": "galgo", "ru": "\u0431\u043E\u0440\u0437\u0430\u044F", "es": "galgo", "es-AR": "galgo", "uk": "\u0445\u043E\u0440\u0442", "uz": "it", "uzb": "\u0438\u0442" }, "notes": { "da": "The Danish name for the breed, which we can also use for variation or for more specific word choice" } }, { "id": 224, "terms": { "en-GB": "greyhounds", "es": "carreras de galgos", "es-AR": "carreras de galgos", "uz": "it poygalari", "uzb": "\u0438\u0442 \u043F\u043E\u0439\u0433\u0430\u043B\u0430\u0440\u0438" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 225, "terms": { "en-GB": "greyhound racing", "az": "it yar\u0131\u015Flar\u0131", "da": "hundev\xE6ddel\xF8b", "mn": "\u043D\u043E\u0445\u043E\u0439\u043D \u0443\u0440\u0430\u043B\u0434\u0430\u0430\u043D", "pt-BR": "corridas de galgos", "ru": "\u0441\u043E\u0431\u0430\u0447\u044C\u0438 \u0431\u0435\u0433\u0430", "es": "carreras de galgos", "es-AR": "carreras de galgos", "uk": "\u0441\u043E\u0431\u0430\u0447\u0456 \u043F\u0435\u0440\u0435\u0433\u043E\u043D\u0438", "uz": "it poygalari", "uzb": "\u0438\u0442 \u043F\u043E\u0439\u0433\u0430\u043B\u0430\u0440\u0438" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 226, "terms": { "en-GB": "half", "az": "hiss\u0259", "da": "periode", "mn": "\u0445\u0430\u0433\u0430\u0441", "pt-BR": "metade", "ru": "\u0442\u0430\u0439\u043C", "es": "mitad", "es-AR": "mitad", "uk": "\u043F\u043E\u043B\u043E\u0432\u0438\u043D\u0430", "uz": "taym", "uzb": "\u0442\u0430\u0439\u043C" }, "notes": { "da": "Generally for sports divided into four parts  (there are exceptions)", "mn": "in the context of American football, Australian football, basketball, field hockey, water polo", "pt-BR": "American football, basketball", "es": "in the context of basketball, field hockey, water polo, American football", "es-AR": "in the context of basketball, field hockey, water polo, American football", "uz": "bandy, beach handball, football, futsal, handball, rugby", "uzb": "bandy, beach handball, football, futsal, handball, rugby" } }, { "id": 227, "terms": { "en-GB": "handball", "da": "h\xE5ndbold", "mn": "\u0433\u0430\u043D\u0434\u0431\u043E\u043B", "pt-BR": "handebol", "ru": "\u0433\u0430\u043D\u0434\u0431\u043E\u043B", "es": "balonmano", "es-AR": "balonmano", "uk": "\u0433\u0430\u043D\u0434\u0431\u043E\u043B", "uz": "gandbol", "uzb": "\u0433\u0430\u043D\u0434\u0431\u043E\u043B" } }, { "id": 228, "terms": { "en-GB": "handicap", "az": "handikap", "da": "handicap", "mn": "\u0434\u0430\u0432\u0443\u0443 \u0431\u0430\u0439\u0434\u0430\u043B", "pt-BR": "handicap", "ru": "\u0444\u043E\u0440\u0430", "es": "h\xE1ndicap", "es-AR": "h\xE1ndicap", "uk": "\u0444\u043E\u0440\u0430", "uz": "fora", "uzb": "\u0444\u043E\u0440\u0430" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 229, "terms": { "en-GB": "header", "da": "hovedst\xF8d", "mn": "\u0442\u043E\u043B\u0433\u043E\u0439\u0433\u043E\u043E\u0440 \u0446\u043E\u0445\u0438\u0436 \u043E\u0440\u0443\u0443\u043B\u0441\u0430\u043D \u0433\u043E\u043E\u043B", "pt-BR": "de cabe\xE7a", "ru": "\u0433\u043E\u043B\u043E\u0432\u043E\u0439", "es": "gol de cabeza", "es-AR": "gol de cabeza", "uk": "\u0433\u043E\u043B \u0433\u043E\u043B\u043E\u0432\u043E\u044E", "uz": "sarlavha", "uzb": "\u0441\u0430\u0440\u043B\u0430\u0432\u04B3\u0430" }, "notes": { "ru": "as the selection name", "uz": "Standard capitalization rules apply", "uzb": "Standard capitalization rules apply" } }, { "id": 230, "terms": { "en-GB": "Heinz", "az": "Heinz", "da": "Heinz", "mn": "\u0425\u0430\u0439\u043D\u0446", "pt-BR": "Heinz", "ru": "\u0425\u0430\u0439\u043D\u0446", "es": "Heinz", "es-AR": "Heinz", "uk": "\u0425\u0430\u0439\u043D\u0446", "uz": "Xaynts", "uzb": "\u0425\u0430\u0439\u043D\u0446" }, "notes": { "uz": "Standard capitalization rules apply", "uzb": "Standard capitalization rules apply" } }, { "id": 231, "terms": { "en-GB": "Help", "az": "K\xF6m\u0259k", "da": "Hj\xE6lp", "mn": "\u0422\u0443\u0441\u043B\u0430\u043C\u0436", "pt-BR": "Ajuda", "ru": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430", "es": "Ayuda", "es-AR": "Ayuda", "uk": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430", "uz": "Yordam", "uzb": "\u0401\u0440\u0434\u0430\u043C" }, "notes": { "en-GB": "Capitalised when section name", "ru": "Capitalised because it's a section name", "uk": "Capitalised because it's a section name" } }, { "id": 232, "terms": { "en-GB": "home", "az": "ev sahibi olan komanda", "da": "hjemme", "mn": "\u043D\u04AF\u04AF\u0440", "pt-BR": "da casa", "ru": "\u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E", "es": "local", "es-AR": "local", "uk": "\u0433\u043E\u0441\u043F\u043E\u0434\u0430\u0440\u0456", "uz": "bosh", "uzb": "\u0431\u043E\u0448" }, "notes": { "az": "home team", "da": "as an adverb", "mn": 'Meaning "home page"', "pt-BR": "refers to team", "ru": `"\u041D\u0430" is capitalised because it's a button name`, "es": "home in terms of match ground: either as home match (played on team's home stadium) or home team (team who plays on their own stadium)", "es-AR": "home in terms of match ground: either as home match (played on team's home stadium) or home team (team who plays on their own stadium)", "uz": "in 'home page'", "uzb": "in 'home page'" } }, { "id": 233, "terms": { "en-GB": "horse", "az": "at", "da": "hest", "mn": "\u043C\u043E\u0440\u044C", "pt-BR": "cavalo", "ru": "\u043B\u043E\u0448\u0430\u0434\u044C", "es": "caballo", "es-AR": "caballo", "uk": "\u043A\u0456\u043D\u044C", "uz": "ot", "uzb": "\u043E\u0442" } }, { "id": 234, "terms": { "en-GB": "horse racing", "az": "at yar\u0131\u015Flar\u0131", "da": "hestev\xE6ddel\xF8b", "mn": "\u043C\u043E\u0440\u0438\u043D \u0443\u0440\u0430\u043B\u0434\u0430\u0430\u043D", "pt-BR": "corrida de cavalos", "ru": "\u043B\u043E\u0448\u0430\u0434\u0438\u043D\u044B\u0435 \u0441\u043A\u0430\u0447\u043A\u0438", "es": "carreras de caballos", "es-AR": "carreras de caballos", "uk": "\u043A\u0456\u043D\u043D\u0456 \u043F\u0435\u0440\u0435\u0433\u043E\u043D\u0438", "uz": "ot poygalari", "uzb": "\u043E\u0442 \u043F\u043E\u0439\u0433\u0430\u043B\u0430\u0440\u0438" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 235, "terms": { "en-GB": "How to bet", "da": "Hvordan spiller man", "mn": "\u0425\u044D\u0440\u0445\u044D\u043D \u0431\u043E\u043E\u0446\u043E\u043E \u0442\u0430\u0432\u0438\u0445 \u0432\u044D", "pt-BR": "Como apostar", "ru": "\u041A\u0430\u043A \u0437\u0430\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0430\u0440\u0438", "es": "C\xF3mo apostar", "es-AR": "C\xF3mo apostar", "uk": "\u042F\u043A \u0437\u0440\u043E\u0431\u0438\u0442\u0438 \u0441\u0442\u0430\u0432\u043A\u0443?", "uz": "Stavka qo'yish", "uzb": "\u0421\u0442\u0430\u0432\u043A\u0430 \u049B\u045E\u0439\u0438\u0448" }, "notes": { "ru": "for .RU", "uk": "Capitalised as shown when used as section name.", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 236, "terms": { "en-GB": "hurling", "da": "hurling", "mn": "\u0445\u0443\u0440\u043B\u0438\u043D\u0433", "pt-BR": "hurling", "ru": "\u0445\u0435\u0440\u043B\u0438\u043D\u0433", "es": "hurling", "es-AR": "hurling", "uk": "\u0433\u0435\u0440\u043B\u0456\u043D\u0433", "uz": "xyorling", "uzb": "\u0445\u0451\u0440\u043B\u0438\u043D\u0433" } }, { "id": 237, "terms": { "en-GB": "IBAN", "az": "IBAN", "da": "IBAN", "mn": "IBAN", "pt-BR": "IBAN", "ru": "IBAN", "es": "IBAN", "es-AR": "IBAN", "uk": "IBAN", "uz": "IBAN", "uzb": "IBAN" } }, { "id": 238, "terms": { "en-GB": "ice hockey", "az": "buz\xFCst\xFC hokkey", "da": "ishockey", "mn": "\u043C\u04E9\u0441\u043D\u0438\u0439 \u0445\u043E\u043A\u043A\u0435\u0439", "pt-BR": "h\xF3quei no gelo", "ru": "\u0445\u043E\u043A\u043A\u0435\u0439", "es": "hockey hielo", "es-AR": "hockey hielo", "uk": "\u0445\u043E\u043A\u0435\u0439 \u0456\u0437 \u0448\u0430\u0439\u0431\u043E\u044E", "uz": "muz ustida xokkey", "uzb": "\u043C\u0443\u0437 \u0443\u0441\u0442\u0438\u0434\u0430 \u0445\u043E\u043A\u043A\u0435\u0439" }, "notes": { "ru": "preferred translation" } }, { "id": 239, "terms": { "en-GB": "ID", "da": "ID", "mn": "\u0431\u0438\u0435\u0438\u0439\u043D \u0431\u0430\u0439\u0446\u0430\u0430\u043B\u0442", "pt-BR": "identifica\xE7\xE3o", "ru": "\u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442, \u0443\u0434\u043E\u0441\u0442\u043E\u0432\u0435\u0440\u044F\u044E\u0449\u0438\u0439 \u043B\u0438\u0447\u043D\u043E\u0441\u0442\u044C", "es": "ID", "es-AR": "ID", "uk": "ID", "uz": "shaxsni aniqlovchi xujjat", "uzb": "\u0448\u0430\u0445\u0441\u043D\u0438 \u0430\u043D\u0438\u049B\u043B\u043E\u0432\u0447\u0438 \u0445\u0443\u0436\u0436\u0430\u0442" }, "notes": { "da": "Alternative translations are allowed depending on the context" } }, { "id": 240, "terms": { "en-GB": "identification", "az": "eynil\u0259\u015Fdirm\u0259", "da": "identifikation", "pt-BR": "identifica\xE7\xE3o", "ru": "\u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F", "es": "identificaci\xF3n", "es-AR": "identificaci\xF3n", "uk": "\u043F\u0440\u043E\u0446\u0435\u0441 \u0456\u0434\u0435\u043D\u0442\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u0457", "uz": "shaxsni aniqlash", "uzb": "\u0448\u0430\u0445\u0441\u043D\u0438 \u0430\u043D\u0438\u049B\u043B\u0430\u0448" } }, { "id": 241, "terms": { "en-GB": "important operations", "az": "vacib \u0259m\u0259liyyatlar", "da": "vigtige handlinger", "mn": "\u0445\u0430\u0440\u0438\u0443\u0446\u043B\u0430\u0433\u0430\u0442\u0430\u0439 \u04AF\u0439\u043B\u0434\u044D\u043B", "ru": "\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438", "es": "operaciones importantes", "es-AR": "operaciones importantes", "uk": "\u0432\u0430\u0436\u043B\u0438\u0432\u0456 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0457", "uz": "muhim operatsiyalar", "uzb": "\u043C\u0443\u04B3\u0438\u043C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F\u043B\u0430\u0440" } }, { "id": 242, "terms": { "en-GB": "inactivity timeout", "da": "timeout pga. inaktivitet", "es": "desconexi\xF3n por inactividad", "es-AR": "desconexi\xF3n por inactividad", "uz": "harakatsizlik taym-auti", "uzb": "\u04B3\u0430\u0440\u0430\u043A\u0430\u0442\u0441\u0438\u0437\u043B\u0438\u043A \u0442\u0430\u0439\u043C-\u0430\u0443\u0442\u0438" } }, { "id": 243, "terms": { "en-GB": "inbox", "pt-BR": "caixa de entrada", "es": "bandeja de entrada", "es-AR": "bandeja de entrada" }, "notes": { "en-GB": "Refers to email inbox" } }, { "id": 244, "terms": { "en-GB": "indoor court", "es": "cancha cubierta", "es-AR": "cancha cubierta" } }, { "id": 245, "terms": { "en-GB": "indoor football", "es": "f\xFAtbol indoor", "es-AR": "f\xFAtbol indoor" } }, { "id": 246, "terms": { "en-GB": "info service", "da": "informationsservice", "mn": "\u043C\u044D\u0434\u044D\u044D\u043B\u043B\u0438\u0439\u043D \u04AF\u0439\u043B\u0447\u0438\u043B\u0433\u044D\u044D", "pt-BR": "servi\xE7o de informa\xE7\xF5es", "ru": "\u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441", "es": "servicio informativo", "es-AR": "servicio informativo", "uk": "\u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0439\u043D\u0438\u0439 \u0441\u0435\u0440\u0432\u0456\u0441", "uz": "ma'lumotlar xizmati", "uzb": "\u043C\u0430\u044A\u043B\u0443\u043C\u043E\u0442\u043B\u0430\u0440 \u0445\u0438\u0437\u043C\u0430\u0442\u0438" } }, { "id": 247, "terms": { "en-GB": "information service", "az": "m\u0259lumat xidm\u0259ti", "da": "informationsservice", "mn": "\u043C\u044D\u0434\u044D\u044D\u043B\u043B\u0438\u0439\u043D \u04AF\u0439\u043B\u0447\u0438\u043B\u0433\u044D\u044D", "pt-BR": "servi\xE7o de informa\xE7\xF5es", "ru": "\u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441", "es": "servicio informativo", "es-AR": "servicio informativo", "uk": "\u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0439\u043D\u0438\u0439 \u0441\u0435\u0440\u0432\u0456\u0441", "uz": "ma'lumotlar xizmati", "uzb": "\u043C\u0430\u044A\u043B\u0443\u043C\u043E\u0442\u043B\u0430\u0440 \u0445\u0438\u0437\u043C\u0430\u0442\u0438" } }, { "id": 248, "terms": { "en-GB": "inning", "az": "inninq", "da": "inning", "mn": "\u0438\u043D\u043D\u0438\u043D\u0433", "pt-BR": "entrada", "ru": "\u0438\u043D\u043D\u0438\u043D\u0433", "es": "entrada", "es-AR": "entrada", "uk": "\u0456\u043D\u0456\u043D\u0433", "uz": "inning", "uzb": "\u0438\u043D\u043D\u0438\u043D\u0433" }, "notes": { "pt-BR": "Baseball" } }, { "id": 249, "terms": { "en-GB": "innings", "az": "inninqs", "da": "inning", "mn": "\u0438\u043D\u043D\u0438\u043D\u0433\u0441", "pt-BR": "entradas", "ru": "\u0438\u043D\u043D\u0438\u043D\u0433\u0441", "es": "entrada", "es-AR": "entrada", "uk": "\u0456\u043D\u0456\u043D\u0433\u0437", "uz": "innings", "uzb": "\u0438\u043D\u043D\u0438\u043D\u0433\u0441" }, "notes": { "en-GB": 'Used both for baseball and cricket. \nPlease note that, even if English always uses the plural form "innings", Spanish can be used in singular or plural according to the context.', "da": `While innings in cricket is a "plural-only noun" in English, it's not the case in Danish. In Danish the noun is inflected into both singular (inning) and plural (innings).`, "pt-BR": "Entradas - plural for baseball inning; innings - cricket term" } }, { "id": 250, "terms": { "en-GB": "internet gambling", "es": "apuestas por internet", "es-AR": "apuestas por internet" } }, { "id": 251, "terms": { "en-GB": "internet transaction", "es": "transacci\xF3n por internet", "es-AR": "transacci\xF3n por internet" } }, { "id": 252, "terms": { "en-GB": "item", "az": "element", "da": "vare", "mn": "\u043D\u044D\u0440 \u0442\u04E9\u0440\u04E9\u043B", "pt-BR": "item", "ru": "\u043F\u043E\u0437\u0438\u0446\u0438\u044F", "es": "art\xEDculo", "es-AR": "art\xEDculo", "uk": "\u043F\u043E\u0437\u0438\u0446\u0456\u044F", "uz": "bonus", "uzb": "\u0431\u043E\u043D\u0443\u0441" } }, { "id": 253, "terms": { "en-GB": "jackpot", "az": "cekpot", "da": "jackpot", "mn": "\u0436\u044D\u043A\u043F\u043E\u0442", "pt-BR": "jackpot", "ru": "\u0434\u0436\u0435\u043A-\u043F\u043E\u0442", "es": "jackpot", "es-AR": "jackpot", "uk": "\u0434\u0436\u0435\u043A-\u043F\u043E\u0442", "uz": "jekpot", "uzb": "\u0436\u0435\u043A\u043F\u043E\u0442" }, "notes": { "en-GB": "The term is generally used without capitalisation, and should be spelt with the first letter capitalized only when a specific jackpot is meant." } }, { "id": 254, "terms": { "en-GB": "Join Now", "az": "Qeydiyyat", "da": "Tilmeld dig nu", "mn": "\u0411\u04AF\u0440\u0442\u0433\u044D\u0445", "pt-BR": "Participe", "ru": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F", "es": "Reg\xEDstrate", "es-AR": "Reg\xEDstrate", "uk": "\u0420\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u044F", "uz": "Ro'yxatdan o'ting", "uzb": "\u0420\u045E\u0439\u04B3\u0430\u0442\u0434\u0430\u043D \u045E\u0442\u0438\u043D\u0433" }, "notes": { "en-GB": "Capitalised as button text", "da": "First letter is capitalised when used as a button text.", "pt-BR": "Meaning participating in promotions.", "ru": "Capitalised because it's a button name", "uk": "Capitalised because it's a button name" } }, { "id": 255, "terms": { "en-GB": "kabaddi", "da": "kabaddi", "pt-BR": "kabaddi", "ru": "\u043A\u0430\u0431\u0430\u0434\u0434\u0438", "es": "kabaddi", "es-AR": "kabaddi", "uk": "\u043A\u0430\u0431\u0430\u0434\u0434\u0456", "uz": "kabaddi", "uzb": "\u043A\u0430\u0431\u0430\u0434\u0434\u0438" }, "notes": { "pt-BR": "Indian sport." } }, { "id": 256, "terms": { "en-GB": "knockout", "az": "nokaut", "mn": "\u043D\u043E\u043A\u0430\u0443\u0442", "pt-BR": "nocaute", "ru": "\u043D\u043E\u043A\u0430\u0443\u0442", "es": "nocaut", "es-AR": "nocaut", "uk": "\u043D\u043E\u043A\u0430\u0443\u0442", "uz": "nokaut", "uzb": "\u043D\u043E\u043A\u0430\u0443\u0442" } }, { "id": 257, "terms": { "en-GB": "Leaderboard", "mn": "\u0422\u044D\u0440\u0433\u04AF\u04AF\u043B\u044D\u0433\u0447\u0434\u0438\u0439\u043D \u0441\u0430\u043C\u0431\u0430\u0440", "pt-BR": "Tabela de classifica\xE7\xE3o", "ru": "\u0421\u043F\u0438\u0441\u043E\u043A \u043B\u0438\u0434\u0435\u0440\u043E\u0432", "es": "clasificaci\xF3n", "es-AR": "clasificaci\xF3n", "uk": "\u0421\u043F\u0438\u0441\u043E\u043A \u043B\u0456\u0434\u0435\u0440\u0456\u0432", "uz": "peshqadamlik reytingi", "uzb": "\u043F\u0435\u0448\u049B\u0430\u0434\u0430\u043C\u043B\u0438\u043A \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0438" }, "notes": { "ru": '"\u0421\u043F\u0438\u0441\u043E\u043A" in this phrase is always capitalised', "uk": '"\u0421\u043F\u0438\u0441\u043E\u043A" in this phrase is always capitalised', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 258, "terms": { "en-GB": "league", "es": "liga", "es-AR": "liga" } }, { "id": 259, "terms": { "en-GB": "leg", "az": "leq", "da": "runde", "mn": "\u0442\u043E\u0433\u043B\u043E\u043B\u0442\u044B\u043D \u0448\u0430\u0442", "pt-BR": "etapa", "ru": "\u0440\u0430\u0443\u043D\u0434", "es": "leg", "es-AR": "leg", "uk": "\u043B\u0435\u0433", "uz": "leg", "uzb": "\u043B\u0435\u0433" }, "notes": { "en-GB": "Used in darts" } }, { "id": 260, "terms": { "en-GB": "Limit", "az": "limit", "da": "gr\xE6nse", "mn": "\u0445\u044F\u0437\u0433\u0430\u0430\u0440", "ru": "\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435", "es": "l\xEDmite", "es-AR": "l\xEDmite", "uk": "\u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F", "uz": "limit", "uzb": "\u043B\u0438\u043C\u0438\u0442" }, "notes": { "ru": "in the context of responsible gambling", "uk": "in the context of responsible gambling" } }, { "id": 261, "terms": { "en-GB": "live", "da": "Live", "mn": "\u0448\u0443\u0443\u0434", "pt-BR": "Ao vivo", "ru": "live", "es": "en vivo", "es-AR": "en vivo", "uk": "live", "uz": "jonli", "uzb": "\u0436\u043E\u043D\u043B\u0438" } }, { "id": 262, "terms": { "en-GB": "live bet", "az": "canl\u0131 m\u0259rc", "da": "live-v\xE6ddem\xE5l", "mn": "\u0448\u0443\u0443\u0434 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta ao vivo", "ru": "live-\u043F\u0430\u0440\u0438", "es": "apuesta en vivo", "es-AR": "apuesta en vivo", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 live-\u043F\u043E\u0434\u0456\u044E", "uz": "jonli stavka", "uzb": "\u0436\u043E\u043D\u043B\u0438 \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 263, "terms": { "en-GB": "live betting", "az": "canl\u0131 m\u0259rc etm\u0259k", "da": "live betting", "mn": "\u0448\u0443\u0443\u0434 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "apostas ao vivo", "ru": "\u043F\u0430\u0440\u0438 live", "es": "apostar en vivo", "es-AR": "apostar en vivo", "uk": "\u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 live-\u043F\u043E\u0434\u0456\u0457", "uz": "jonli stavka qo'yish", "uzb": "\u0436\u043E\u043D\u043B\u0438 \u0441\u0442\u0430\u0432\u043A\u0430 \u049B\u045E\u0439\u0438\u0448" }, "notes": { "ru": "for .RU" } }, { "id": 264, "terms": { "en-GB": "Live Casino", "az": "Canl\u0131 Kazino", "da": "Live Casino", "mn": "\u0428\u0443\u0443\u0434 \u041A\u0430\u0437\u0438\u043D\u043E", "pt-BR": "Cassino ao Vivo", "ru": "Live \u041A\u0430\u0437\u0438\u043D\u043E", "es": "Casino en Vivo", "es-AR": "Casino en Vivo", "uk": "Live \u041A\u0430\u0437\u0438\u043D\u043E", "uz": "Jonli Kazino", "uzb": "\u0416\u043E\u043D\u043B\u0438 \u041A\u0430\u0437\u0438\u043D\u043E" }, "notes": { "ru": "Capitalised because it's a product name", "uk": "Capitalised because it's a product name", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 265, "terms": { "en-GB": "Live Casino Bonus", "pt-BR": "B\xF4nus no Cassino ao Vivo", "es": "Bono de Casino en Vivo", "es-AR": "Bono de Casino en Vivo" } }, { "id": 266, "terms": { "en-GB": "live event", "da": "live-begivenhed", "mn": "\u0448\u0443\u0443\u0434 \u04AF\u0439\u043B \u044F\u0432\u0434\u0430\u043B", "pt-BR": "evento ao vivo", "ru": "live-\u0441\u043E\u0431\u044B\u0442\u0438\u0435", "es": "evento en vivo", "es-AR": "evento en vivo", "uk": "live-\u043F\u043E\u0434\u0456\u044F", "uz": "jonli voqea", "uzb": "\u0436\u043E\u043D\u043B\u0438 \u0432\u043E\u049B\u0435\u0430" } }, { "id": 267, "terms": { "en-GB": "Live Scores", "da": "Livescores", "mn": "\u0428\u0443\u0443\u0434 \u04AF\u0440 \u0434\u04AF\u043D", "pt-BR": "Placares ao Vivo", "ru": "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B Live", "es": "Resultados en vivo", "es-AR": "Resultados en vivo", "uk": "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438 Live", "uz": "Jonli hisoblar", "uzb": "\u0416\u043E\u043D\u043B\u0438 \u04B3\u0438\u0441\u043E\u0431\u043B\u0430\u0440" }, "notes": { "ru": "Capitalised because it's a section name", "uk": "Capitalised because it's a section name", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 268, "terms": { "en-GB": "livestream", "az": "canl\u0131 yay\u0131m", "da": "livestream", "mn": "\u0448\u0443\u0443\u0434 \u0434\u0430\u043C\u0436\u0443\u0443\u043B\u0430\u043B\u0442", "pt-BR": "transmiss\xE3o ao vivo", "ru": "\u0441\u0442\u0440\u0438\u043C", "es": "retransmisi\xF3n en vivo", "es-AR": "retransmisi\xF3n en vivo", "uk": "\u0441\u0442\u0440\u0456\u043C", "uz": "strim", "uzb": "\u0441\u0442\u0440\u0438\u043C" }, "notes": { "ru": "For winner selections in the Loyalty Prize Draw lead by streamers.", "uk": "For winner selections in the Loyalty Prize Draw lead by streamers.", "uz": "For winner selections in the Loyalty Prize Draw lead by streamers.", "uzb": "For winner selections in the Loyalty Prize Draw lead by streamers." } }, { "id": 269, "terms": { "en-GB": "location", "da": "sted", "pt-BR": "localiza\xE7\xE3o", "ru": "\u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435", "es": "ubicaci\xF3n", "es-AR": "ubicaci\xF3n", "uz": "joylashuv", "uzb": "\u0436\u043E\u0439\u043B\u0430\u0448\u0443\u0432" }, "notes": { "pt-BR": "Location that changes/current location." } }, { "id": 270, "terms": { "en-GB": "log in", "da": "logge p\xE5", "mn": "\u043D\u044D\u0432\u0442\u0440\u044D\u0445", "ru": "\u0432\u043E\u0439\u0442\u0438", "es": "entrar", "es-AR": "entrar", "uk": "\u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0432\u0430\u0442\u0438\u0441\u044F" }, "notes": { "ru": "Capitalised when UI button" } }, { "id": 271, "terms": { "en-GB": "login", "az": "giri\u015F", "da": "login", "mn": "\u043D\u044D\u0432\u0442\u0440\u044D\u0445 \u043D\u044D\u0440", "pt-BR": "entrar", "ru": "\u043B\u043E\u0433\u0438\u043D", "es": "datos de acceso", "es-AR": "datos de acceso", "uk": "\u043B\u043E\u0433\u0456\u043D", "uz": "kirish", "uzb": "\u043A\u0438\u0440\u0438\u0448" }, "notes": { "az": "authentication in the system", "pt-BR": "Process of entering the account.", "uz": "single instance of passing authorisation", "uzb": "single instance of passing authorisation" } }, { "id": 272, "terms": { "en-GB": "Login History", "az": "Giri\u015F tarix\xE7\u0259si", "da": "Kontoaktivitet", "mn": "\u041D\u044D\u0432\u0442\u0440\u044D\u043B\u0442\u0438\u0439\u043D \u0442\u04AF\u04AF\u0445", "pt-BR": "Hist\xF3rico de login", "ru": "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u0435\u0430\u043D\u0441\u043E\u0432", "es": "Historial de conexi\xF3n", "es-AR": "Historial de conexi\xF3n", "uk": "\u0406\u0441\u0442\u043E\u0440\u0456\u044F \u0441\u0435\u0430\u043D\u0441\u0456\u0432", "uz": "Kirish tarixi", "uzb": "\u041A\u0438\u0440\u0438\u0448 \u0442\u0430\u0440\u0438\u0445\u0438" }, "notes": { "en-GB": "Capitalised as section name", "ru": `"\u0418\u0441\u0442\u043E\u0440\u0438\u044F" is capitalised because it's a section name`, "uk": "Capitalised because it's a section name" } }, { "id": 273, "terms": { "en-GB": "log out", "es": "cerrar sesi\xF3n", "es-AR": "cerrar sesi\xF3n" }, "notes": { "en-GB": "Capitalised as button name" } }, { "id": 274, "terms": { "en-GB": "Lose-to-Win accumulator", "az": "Antiekspres m\u0259rci", "da": "Taber-til-vinder akkumulator", "mn": "\u044D\u0441\u0440\u044D\u0433 \u0445\u0443\u0440\u0438\u043C\u0442\u043B\u0443\u0443\u043B\u0430\u0433\u0447", "pt-BR": "acumulada perder para vencer", "ru": "\xAB\u0430\u043D\u0442\u0438\u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\xBB", "es": "Combinada perder-para-ganar", "es-AR": "Combinada perder-para-ganar", "uk": "\u0410\u043D\u0442\u0438\u0435\u043A\u0441\u043F\u0440\u0435\u0441", "uz": "Antiekspress", "uzb": "\u0410\u043D\u0442\u0438\u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 275, "terms": { "en-GB": "Forgot your password?", "az": "Parolu unutmusunuz?", "da": "Mistet kodeord?", "mn": "\u041D\u0443\u0443\u0446 \u04AF\u0433\u044D\u044D \u043C\u0430\u0440\u0442\u0441\u0430\u043D \u0443\u0443?", "pt-BR": "Esqueceu a senha?", "ru": "\u0417\u0430\u0431\u044B\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C?", "es": "\xBFOlvid\xF3 su contrase\xF1a?", "es-AR": "\xBFOlvid\xF3 su contrase\xF1a?", "uk": "\u0417\u0430\u0431\u0443\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C?", "uz": "Parolni unutdingizmi?", "uzb": "\u041F\u0430\u0440\u043E\u043B\u043D\u0438 \u0443\u043D\u0443\u0442\u0434\u0438\u043D\u0433\u0438\u0437\u043C\u0438?" }, "notes": { "ru": `"\u0417\u0430\u0431\u044B\u043B\u0438" is capitalised because it's a button name`, "uk": `"\u0417\u0430\u0431\u0443\u043B\u0438" is capitalised because it's a button name`, "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 276, "terms": { "en-GB": "lottery", "da": "lotto", "mn": "\u0441\u0443\u0433\u0430\u043B\u0430\u0430", "pt-BR": "loteria", "ru": "\u043B\u043E\u0442\u0435\u0440\u0435\u044F", "es": "loter\xEDa", "es-AR": "loter\xEDa", "uk": "\u043B\u043E\u0442\u0435\u0440\u0435\u044F", "uz": "lotereya", "uzb": "\u043B\u043E\u0442\u0435\u0440\u0435\u044F" } }, { "id": 277, "terms": { "en-GB": "Loyalty", "da": "Loyalitetsprogram", "mn": "\u041B\u043E\u044F\u043B\u0442\u0438", "pt-BR": "Fidelidade", "ru": "\u041B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u044C", "es": "Fidelizaci\xF3n", "es-AR": "Fidelizaci\xF3n", "uk": "\u041B\u043E\u044F\u043B\u044C\u043D\u0456\u0441\u0442\u044C", "uz": "Sodiqlik", "uzb": "\u0421\u043E\u0434\u0438\u049B\u043B\u0438\u043A" }, "notes": { "en-GB": "as a section name", "ru": "Capitalised because it's a section name", "uk": "Capitalised because it's a section name", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 278, "terms": { "en-GB": "loyalty point", "az": "loyall\u0131q xal", "da": "loyalitetspoint", "mn": "\u043B\u043E\u044F\u043B\u0442\u0438 \u043E\u043D\u043E\u043E", "pt-BR": "pontos de fidelidade", "ru": "\u043E\u0447\u043A\u043E \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0438", "es": "punto de fidelizaci\xF3n", "es-AR": "punto de fidelizaci\xF3n", "uk": "\u0431\u0430\u043B \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0456", "uz": "sodiqlik ochko", "uzb": "\u0441\u043E\u0434\u0438\u049B\u043B\u0438\u043A \u043E\u0447\u043A\u043E" } }, { "id": 279, "terms": { "en-GB": "Loyalty Program", "az": "Loyall\u0131q proqram\u0131", "da": "Loyalitetsprogram", "mn": "\u043B\u043E\u044F\u043B\u0442\u0438 \u0445\u04E9\u0442\u04E9\u043B\u0431\u04E9\u0440", "pt-BR": "Programa de Fidelidade", "ru": "\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0438", "es": "Programa de fidelizaci\xF3n", "es-AR": "Programa de fidelizaci\xF3n", "uk": "\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0456", "uz": "Sodiqlik dasturi", "uzb": "\u0421\u043E\u0434\u0438\u049B\u043B\u0438\u043A \u0434\u0430\u0441\u0442\u0443\u0440\u0438" }, "notes": { "es": "capitalized when in headers", "es-AR": "capitalized when in headers", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 280, "terms": { "en-GB": "Lucky", "az": "U\u011Furlu", "da": "Lucky", "mn": "\u0410\u0437\u044B\u043D", "pt-BR": "Lucky", "ru": "\u041B\u0430\u043A\u0438", "es": "Lucky", "es-AR": "Lucky", "uk": "\u041B\u0430\u043A\u0456", "uz": "Laki", "uzb": "\u041B\u0430\u043A\u0438" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 281, "terms": { "en-GB": "Lucky 15", "az": "U\u011Furlu 15", "da": "Lucky 15", "mn": "\u0410\u0437\u044B\u043D 15", "pt-BR": "Lucky 15", "ru": "\u041B\u0430\u043A\u0438 15", "es": "Lucky 15", "es-AR": "Lucky 15", "uk": "\u041B\u0430\u043A\u0456 15", "uz": "Laki 15", "uzb": "\u041B\u0430\u043A\u0438 15" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 282, "terms": { "en-GB": "Lucky 31", "az": "U\u011Furlu 31", "da": "Lucky 31", "mn": "\u0410\u0437\u044B\u043D 31", "pt-BR": "Lucky 31", "ru": "\u041B\u0430\u043A\u0438 31", "es": "Lucky 31", "es-AR": "Lucky 31", "uk": "\u041B\u0430\u043A\u0456 31", "uz": "Laki 31", "uzb": "\u041B\u0430\u043A\u0438 31" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 283, "terms": { "en-GB": "Lucky 63", "az": "U\u011Furlu 63", "da": "Lucky 63", "mn": "\u0410\u0437\u044B\u043D 63", "pt-BR": "Lucky 63", "ru": "\u041B\u0430\u043A\u0438 63", "es": "Lucky 63", "es-AR": "Lucky 63", "uk": "\u041B\u0430\u043A\u0456 63", "uz": "Laki 63", "uzb": "\u041B\u0430\u043A\u0438 63" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 284, "terms": { "en-GB": "map", "az": "x\u0259rit\u0259", "da": "kort", "mn": "\u0433\u0430\u0437\u0440\u044B\u043D \u0437\u0443\u0440\u0430\u0433", "pt-BR": "mapa", "ru": "\u043A\u0430\u0440\u0442\u0430", "es": "mapa", "es-AR": "mapa", "uk": "\u043A\u0430\u0440\u0442\u0430", "uz": "xarita", "uzb": "\u0445\u0430\u0440\u0438\u0442\u0430" } }, { "id": 285, "terms": { "en-GB": "Marathon", "az": "Marathon", "ru": "\u041C\u0430\u0440\u0430\u0444\u043E\u043D", "es": "Marathon", "es-AR": "Marathon" }, "notes": { "ru": "Full name of our .BY legal entity is '\u041E\u0431\u0449\u0435\u0441\u0442\u0432\u043E \u0441 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u043E\u0439 \u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u044C\u044E \xAB\u0411\u0443\u043A\u043C\u0435\u043A\u0435\u0440\u0441\u043A\u0430\u044F \u043A\u043E\u043D\u0442\u043E\u0440\u0430 \u041C\u0430\u0440\u0430\u0444\u043E\u043D\xBB'" } }, { "id": 286, "terms": { "en-GB": "Marathonbet", "az": "Marathonbet", "da": "Marathonbet", "mn": "Marathonbet", "pt-BR": "Marathonbet", "ru": "\u0411\u041A \xAB\u041C\u0430\u0440\u0430\u0444\u043E\u043D\xBB", "es": "Marathonbet", "es-AR": "Marathonbet", "uk": "Marathonbet", "uz": "Marathonbet", "uzb": "Marathonbet" }, "notes": { "ru": "for jurisdictions BELARUS and RUSSIA" } }, { "id": 287, "terms": { "en-GB": "Marathonbet account", "pt-BR": "conta Marathonbet", "es": "cuenta de Marathonbet", "es-AR": "cuenta de Marathonbet" } }, { "id": 288, "terms": { "en-GB": "Marathonbet Loyalty Program", "mn": "Marathonbet \u043B\u043E\u044F\u043B\u0442\u0438 \u0445\u04E9\u0442\u04E9\u043B\u0431\u04E9\u0440", "pt-BR": "Programa de Fidelidade da Marathonbet", "ru": "\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0438 Marathonbet", "es": "programa de fidelizaci\xF3n de Marathonbet", "es-AR": "programa de fidelizaci\xF3n de Marathonbet", "uk": "\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0456 Marathonbet", "uz": "Marathonbet Sodiqlik dasturi", "uzb": "Marathonbet \u0421\u043E\u0434\u0438\u049B\u043B\u0438\u043A \u0434\u0430\u0441\u0442\u0443\u0440\u0438" }, "notes": { "uk": '"\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u0430" is capitalised if used as a button/section name or at the beginning of a sentence' } }, { "id": 289, "terms": { "en-GB": "Marathonbet mobile app", "da": "Marathonbet-appen", "mn": "Marathonbet \u0430\u043F\u043F", "pt-BR": "aplicativo para celular da Marathonbet", "ru": "\u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 Marathonbet", "es": "aplicaci\xF3n m\xF3vil de Marathonbet", "es-AR": "aplicaci\xF3n m\xF3vil de Marathonbet", "uk": "\u043C\u043E\u0431\u0456\u043B\u044C\u043D\u0438\u0439 \u0437\u0430\u0441\u0442\u043E\u0441\u0443\u043D\u043E\u043A Marathonbet", "uz": "Marathonbet mobil ilovasi", "uzb": "Marathonbet \u043C\u043E\u0431\u0438\u043B \u0438\u043B\u043E\u0432\u0430\u0441\u0438" } }, { "id": 290, "terms": { "en-GB": "margin", "az": "marja", "da": "margin", "mn": "\u0448\u0438\u043C\u0442\u0433\u044D\u043B", "pt-BR": "margem", "ru": "\u043C\u0430\u0440\u0436\u0430", "es": "margen", "es-AR": "margen", "uk": "\u043C\u0430\u0440\u0436\u0430", "uz": "farq", "uzb": "\u0444\u0430\u0440\u049B" }, "notes": { "uz": "difference (as in 'winning margin')", "uzb": "difference (as in 'winning margin')" } }, { "id": 291, "terms": { "en-GB": "market", "az": "market", "da": "marked", "mn": "\u0437\u0430\u0445 \u0437\u044D\u044D\u043B", "pt-BR": "mercado", "ru": "\u0438\u0441\u0445\u043E\u0434", "es": "mercado", "es-AR": "mercado", "uk": "\u043C\u0430\u0440\u043A\u0435\u0442", "uz": "bozor", "uzb": "\u0431\u043E\u0437\u043E\u0440" }, "notes": { "ru": "for .BY. The term '\u0441\u043E\u0431\u044B\u0442\u0438\u0435' can be used to avoid repetition of '\u0438\u0441\u0445\u043E\u0434'" } }, { "id": 292, "terms": { "en-GB": "Mastercard", "da": "Mastercard", "mn": "Mastercard", "pt-BR": "Mastercard", "ru": "Mastercard", "es": "Mastercard", "es-AR": "Mastercard", "uk": "Mastercard", "uz": "Mastercard", "uzb": "Mastercard" } }, { "id": 293, "terms": { "en-GB": "match", "az": "mat\xE7", "da": "kamp", "mn": "\u0442\u043E\u0433\u043B\u043E\u043B\u0442", "pt-BR": "luta", "ru": "\u043C\u0430\u0442\u0447", "es": "manga", "es-AR": "manga", "uk": "\u043C\u0430\u0442\u0447", "uz": "match", "uzb": "\u043C\u0430\u0442\u0447" }, "notes": { "pt-BR": "Boxing", "es": "refers to chess", "es-AR": "refers to chess" } }, { "id": 294, "terms": { "en-GB": "match rigging", "es": "partidos ama\xF1ados", "es-AR": "partidos ama\xF1ados" } }, { "id": 295, "terms": { "en-GB": "match-up", "az": "qar\u015F\u0131la\u015Fma", "da": "match-up", "mn": "\u0445\u0430\u0440\u044C\u0446\u0443\u0443\u043B\u0430\u043B\u0442", "pt-BR": "confronto", "ru": "\u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435", "es": "enfrentamiento", "es-AR": "enfrentamiento", "uk": "\u043F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F", "uz": "taqqoslash", "uzb": "\u0442\u0430\u049B\u049B\u043E\u0441\u043B\u0430\u0448" } }, { "id": 296, "terms": { "en-GB": "match-up betting", "az": "m\xFCqayis\u0259 m\u0259rcl\u0259ri", "da": "match-up v\xE6ddem\xE5l", "mn": "\u0445\u0430\u0440\u044C\u0446\u0443\u0443\u043B\u0441\u0430\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta de confronto", "ru": "\u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435", "es": "apuestas de enfrentamientos", "es-AR": "apuestas de enfrentamientos", "uk": "\u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u043F\u043E\u0440\u0456\u0432\u043D\u044F\u043D\u043D\u044F \u0443\u0447\u0430\u0441\u043D\u0438\u043A\u0456\u0432", "uz": "taqqoslash uchun stavkalar", "uzb": "\u0442\u0430\u049B\u049B\u043E\u0441\u043B\u0430\u0448 \u0443\u0447\u0443\u043D \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" } }, { "id": 297, "terms": { "en-GB": "Max stake", "da": "Max. indsats", "mn": "\u0414\u044D\u044D\u0434 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta m\xE1xima", "ru": "\u041C\u0430\u043A\u0441. \u0441\u0443\u043C\u043C\u0430", "es": "Apue. m\xE1x.", "es-AR": "Apue. m\xE1x.", "uk": "\u041C\u0430\u043A\u0441. \u0441\u0443\u043C\u0430" } }, { "id": 298, "terms": { "en-GB": "meeting", "da": "l\xF8bsprogram", "pt-BR": "cumprir", "ru": "\u0441\u0435\u0440\u0438\u044F \u0437\u0430\u0431\u0435\u0433\u043E\u0432", "es": "encuentro", "es-AR": "encuentro", "uz": "uchrashuv", "uzb": "\u0443\u0447\u0440\u0430\u0448\u0443\u0432" }, "notes": { "pt-BR": "In the meaning 'to comply with'.", "ru": "\u0441\u0435\u0440\u0438\u044F \u0437\u0430\u0435\u0437\u0434\u043E\u0432" } }, { "id": 299, "terms": { "en-GB": "membership", "es": "condici\xF3n de miembro", "es-AR": "condici\xF3n de miembro" }, "notes": { "en-GB": "as VIP-related term" } }, { "id": 300, "terms": { "en-GB": "Min stake", "da": "Min. indsats", "mn": "\u0414\u043E\u043E\u0434 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta m\xEDnima", "ru": "\u041C\u0438\u043D. \u0441\u0443\u043C\u043C\u0430", "es": "Apue. m\xEDn.", "es-AR": "Apue. m\xEDn.", "uk": "\u041C\u0456\u043D. \u0441\u0443\u043C\u0430", "uz": "Min. stavka", "uzb": "\u041C\u0438\u043D. \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 301, "terms": { "en-GB": "miner fee", "az": "mayner komissiyas\u0131", "mn": "\u043E\u043B\u0431\u043E\u0440\u043B\u043E\u043B\u0442\u044B\u043D \u0448\u0438\u043C\u0442\u0433\u044D\u043B", "pt-BR": "taxa do minerador", "ru": "\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043C\u0430\u0439\u043D\u0435\u0440\u0430", "es": "tarifa de miner\xEDa", "es-AR": "tarifa de miner\xEDa", "uk": "\u043A\u043E\u043C\u0456\u0441\u0456\u044F \u043C\u0430\u0439\u043D\u0435\u0440\u0430", "uz": "mayner to'lovi", "uzb": "\u043C\u0430\u0439\u043D\u0435\u0440 \u0442\u045E\u043B\u043E\u0432\u0438" } }, { "id": 302, "terms": { "en-GB": "mixed martial arts", "es": "artes marciales mixtas", "es-AR": "artes marciales mixtas", "uz": "aralash jang san'ati", "uzb": "\u0430\u0440\u0430\u043B\u0430\u0448 \u0436\u0430\u043D\u0433 \u0441\u0430\u043D\u044A\u0430\u0442\u0438" } }, { "id": 303, "terms": { "en-GB": "MMA", "da": "MMA", "mn": "\u041C\u041C\u0410", "pt-BR": "MMA", "ru": "\u041C\u041C\u0410", "es": "MMA", "es-AR": "MMA", "uk": "MMA", "uz": "MMA", "uzb": "MMA" } }, { "id": 304, "terms": { "en-GB": "mobile", "az": "mobil", "da": "mobil", "mn": "\u0433\u0430\u0440 \u0443\u0442\u0430\u0441\u043D\u044B", "pt-BR": "dispositivo m\xF3vel", "ru": "\u043C\u043E\u0431\u0438\u043B\u044C\u043D\u044B\u0439", "es": "m\xF3vil", "es-AR": "m\xF3vil", "uk": "\u043C\u043E\u0431\u0456\u043B\u044C\u043D\u0438\u0439", "uz": "mobil", "uzb": "\u043C\u043E\u0431\u0438\u043B" }, "notes": { "pt-BR": "The term choice depends on the context.\nmobile payment - pagamento por dispositivos m\xF3veis\nmobile version - vers\xE3o para dispositivos m\xF3veis\nmobile device - dispositivo m\xF3vel\nmobile site - site para dispositivos m\xF3veis\n+\nmobile connection - conex\xE3o com a internet\nmobile browser - navegador" } }, { "id": 305, "terms": { "en-GB": "Monthly Deposit Limit", "az": "ayl\u0131q depozit limiti", "da": "m\xE5nedlig indbetalingsgr\xE6nse", "mn": "\u043C\u04E9\u043D\u0433\u04E9 \u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0430\u043B\u0442\u044B\u043D \u0441\u0430\u0440\u044B\u043D \u0445\u044F\u0437\u0433\u0430\u0430\u0440", "pt-BR": "limite de dep\xF3sito mensal", "ru": "\u043C\u0435\u0441\u044F\u0447\u043D\u043E\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "es": "l\xEDmite de dep\xF3sito mensual", "es-AR": "l\xEDmite de dep\xF3sito mensual", "uk": "\u043C\u0456\u0441\u044F\u0447\u043D\u0435 \u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "uz": "oylik depozit limiti", "uzb": "\u043E\u0439\u043B\u0438\u043A \u0434\u0435\u043F\u043E\u0437\u0438\u0442 \u043B\u0438\u043C\u0438\u0442\u0438" } }, { "id": 306, "terms": { "en-GB": "Monthly Limit", "da": "m\xE5nedlig gr\xE6nse", "es": "l\xEDmite mensual", "es-AR": "l\xEDmite mensual" } }, { "id": 307, "terms": { "en-GB": "motor racing", "da": "motorsport", "mn": "\u0430\u0432\u0442\u043E \u0443\u0440\u0430\u043B\u0434\u0430\u0430\u043D", "pt-BR": "corrida", "ru": "\u0430\u0432\u0442\u043E\u043C\u043E\u0442\u043E\u0441\u043F\u043E\u0440\u0442", "es": "deportes de motor", "es-AR": "deportes de motor", "uk": "\u0430\u0432\u0442\u043E\u043C\u043E\u0442\u043E\u0441\u043F\u043E\u0440\u0442", "uz": "avto-motosport", "uzb": "\u0430\u0432\u0442\u043E-\u043C\u043E\u0442\u043E\u0441\u043F\u043E\u0440\u0442" }, "notes": { "pt-BR": "Contextual translation to avoid repetitions." } }, { "id": 308, "terms": { "en-GB": "motosport", "da": "motorcykell\xF8b", "pt-BR": "motociclismo", "ru": "\u043C\u043E\u0442\u043E\u0441\u043F\u043E\u0440\u0442", "es": "motociclismo", "es-AR": "motociclismo", "uk": "\u043C\u043E\u0442\u043E\u0441\u043F\u043E\u0440\u0442", "uz": "motosport", "uzb": "\u043C\u043E\u0442\u043E\u0441\u043F\u043E\u0440\u0442" } }, { "id": 309, "terms": { "en-GB": "multiple accounts", "mn": "\u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u0434\u0430\u0432\u0445\u0430\u0440 \u0434\u0430\u043D\u0441", "pt-BR": "v\xE1rias contas", "ru": "\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0438\u0433\u0440\u043E\u0432\u044B\u0445 \u0441\u0447\u0435\u0442\u043E\u0432", "es": "cuentas m\xFAltiples", "es-AR": "cuentas m\xFAltiples", "uk": "\u0434\u0435\u043A\u0456\u043B\u044C\u043A\u0430 \u0456\u0433\u0440\u043E\u0432\u0438\u0445 \u0440\u0430\u0445\u0443\u043D\u043A\u0456\u0432", "uz": "bir nechta hisoblar", "uzb": "\u0431\u0438\u0440 \u043D\u0435\u0447\u0442\u0430 \u04B3\u0438\u0441\u043E\u0431\u043B\u0430\u0440" }, "notes": { "pt-BR": "Used to explain the rule about 'm\xFAltiplas contas'." } }, { "id": 310, "terms": { "en-GB": "multiple bet", "da": "multispil", "mn": "\u043E\u043B\u043E\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta m\xFAltipla", "ru": "\u0441\u043B\u043E\u0436\u043D\u043E\u0435 \u043F\u0430\u0440\u0438", "es": "apuesta m\xFAltiple", "es-AR": "apuesta m\xFAltiple", "uk": "\u0441\u043A\u043B\u0430\u0434\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "multistavka", "uzb": "\u043C\u0443\u043B\u044C\u0442\u0438\u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 311, "terms": { "en-GB": "Multiples", "da": "Multispil", "mn": "\u041E\u043B\u043E\u043D \u0431\u043E\u043E\u0446\u043E\u043E\u043D\u0443\u0443\u0434", "pt-BR": "M\xFAltiplas", "ru": "\u041C\u0443\u043B\u044C\u0442\u0438\u043F\u0430\u0440\u0438", "es": "M\xFAltiples", "es-AR": "M\xFAltiples", "uk": "\u041C\u0443\u043B\u044C\u0442\u0438\u0441\u0442\u0430\u0432\u043A\u0438", "uz": "Multistavkalar", "uzb": "\u041C\u0443\u043B\u044C\u0442\u0438\u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" }, "notes": { "ru": "same for .RU", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 312, "terms": { "en-GB": "My Account", "az": "M\u0259nim hesab\u0131m", "da": "Min konto", "mn": "\u041C\u0438\u043D\u0438\u0439 \u0434\u0430\u043D\u0441", "pt-BR": "Minha conta", "ru": "\u041C\u043E\u0439 \u0441\u0447\u0435\u0442", "es": "Mi cuenta", "es-AR": "Mi cuenta", "uk": "\u041C\u0456\u0439 \u0440\u0430\u0445\u0443\u043D\u043E\u043A", "uz": "Mening hisobim", "uzb": "\u041C\u0435\u043D\u0438\u043D\u0433 \u04B3\u0438\u0441\u043E\u0431\u0438\u043C" }, "notes": { "en-GB": "Capitalised when section name", "da": "First word capitalised when used as a section name.", "ru": `"\u041C\u043E\u0439" is capitalised because it's a section name`, "uk": `"\u041C\u043E\u0439" is capitalised because it's a section name` } }, { "id": 313, "terms": { "en-GB": "Next Team to Score", "da": "N\xE6ste Hold Som Scorer", "mn": "\u041E\u043D\u043E\u043E \u0430\u0432\u0430\u0445 \u0434\u0430\u0440\u0430\u0430\u0433\u0438\u0439\u043D \u0431\u0430\u0433", "pt-BR": "Pr\xF3ximo time a marcar", "ru": "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0433\u043E\u043B (\u043A\u043E\u043C\u0430\u043D\u0434\u0430)", "es": "Siguiente equipo en marcar", "es-AR": "Siguiente equipo en marcar", "uk": "\u041D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u0433\u043E\u043B (\u043A\u043E\u043C\u0430\u043D\u0434\u0430)", "uz": "Keyingi gol muallifi (jamoa)", "uzb": "\u041A\u0435\u0439\u0438\u043D\u0433\u0438 \u0433\u043E\u043B \u043C\u0443\u0430\u043B\u043B\u0438\u0444\u0438 (\u0436\u0430\u043C\u043E\u0430)" }, "notes": { "en-GB": "Capitalised as market name", "da": "All words capitalised, when it's a market name." } }, { "id": 314, "terms": { "en-GB": "non-runner", "az": "qa\xE7mayan", "da": "non-runner", "mn": "\u0443\u0440\u0430\u043B\u0434\u0434\u0430\u0433\u0433\u04AF\u0439 \u0431\u043E\u043B", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043D\u0435 \u0444\u0438\u043D\u0438\u0448\u0438\u0440\u043E\u0432\u0430\u043B", "es": "selecci\xF3n que se retira", "es-AR": "selecci\xF3n que se retira", "uk": "\u0443\u0447\u0430\u0441\u043D\u0438\u043A, \u0449\u043E \u043D\u0435 \u0444\u0456\u043D\u0456\u0448\u0443\u0432\u0430\u0432", "uz": "ishtirok etmaydigan", "uzb": "\u0438\u0448\u0442\u0438\u0440\u043E\u043A \u044D\u0442\u043C\u0430\u0439\u0434\u0438\u0433\u0430\u043D" } }, { "id": 315, "terms": { "en-GB": "normal time", "az": "adi vaxt", "da": "ordin\xE6r spilletid", "mn": "\u04AF\u043D\u0434\u0441\u044D\u043D \u0446\u0430\u0433", "pt-BR": "tempo regulamentar", "ru": "\u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F", "es": "tiempo reglamentario", "es-AR": "tiempo reglamentario", "uk": "\u043E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u0447\u0430\u0441", "uz": "asosiy vaqt", "uzb": "\u0430\u0441\u043E\u0441\u0438\u0439 \u0432\u0430\u049B\u0442" }, "notes": { "mn": "in all markets" } }, { "id": 316, "terms": { "en-GB": "Not to Be Placed", "es": "no posicionado", "es-AR": "no posicionado" }, "notes": { "en-GB": "Capitalised when market name" } }, { "id": 317, "terms": { "en-GB": "No.", "az": "\u2116", "da": "Nr.", "mn": "\u2116", "pt-BR": "n.\xB0", "ru": "\u2116", "es": "n\xFAmero", "es-AR": "n\xFAmero", "uk": "\u2116", "uz": "\u2116", "uzb": "\u2116" }, "notes": { "en-GB": "Short variant of 'number'", "az": "a short variant of 'number'" } }, { "id": 318, "terms": { "en-GB": "number", "az": "say\u0131", "da": "m\xE6ngde", "mn": "\u0442\u043E\u043E", "pt-BR": "quantidade", "ru": "\u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E", "es": "n\xFAmero", "es-AR": "n\xFAmero", "uk": "\u0447\u0438\u0441\u043B\u043E", "uz": "son", "uzb": "\u0441\u043E\u043D" }, "notes": { "az": "amount", "da": "amount of smth", "pt-BR": "amount", "uz": "as quantity ('number of \u2026')", "uzb": "as quantity ('number of \u2026')" } }, { "id": 319, "terms": { "en-GB": "odd", "az": "t\u0259k", "da": "ulige", "mn": "\u0441\u043E\u043D\u0434\u0433\u043E\u0439", "pt-BR": "\xEDmpar", "ru": "\u043D\u0435\u0447\u0435\u0442", "es": "impar", "es-AR": "impar", "uk": "\u043D\u0435\u043F\u0430\u0440.", "uz": "toq", "uzb": "\u0442\u043E\u049B" } }, { "id": 320, "terms": { "en-GB": "odds", "az": "\u0259msal", "da": "odds", "mn": "\u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "odds", "ru": "\u043A\u044D\u0444", "es": "cuota", "es-AR": "cuota", "uk": "\u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "koeffitsiyent", "uzb": "\u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442" }, "notes": { "ru": "declension applies" } }, { "id": 321, "terms": { "en-GB": "ODDS Compiler", "es": "ODDS Compiler", "es-AR": "ODDS Compiler" } }, { "id": 322, "terms": { "en-GB": "offside", "az": "ofsayd", "da": "offside", "mn": "\u043E\u0444\u0444\u0441\u0430\u0439\u0434", "pt-BR": "impedimento", "ru": "\u043E\u0444\u0441\u0430\u0439\u0434", "es": "fuera de juego", "es-AR": "fuera de juego", "uk": "\u043E\u0444\u0441\u0430\u0439\u0434", "uz": "o'yindan tashqari holat", "uzb": "\u045E\u0439\u0438\u043D\u0434\u0430\u043D \u0442\u0430\u0448\u049B\u0430\u0440\u0438 \u04B3\u043E\u043B\u0430\u0442" } }, { "id": 323, "terms": { "en-GB": "Olympic games", "az": "Olimpiya oyunlar\u0131", "da": "olympiske lege", "mn": "\u041E\u043B\u0438\u043C\u043F\u044B\u043D \u043D\u0430\u0430\u0434\u0430\u043C", "pt-BR": "Jogos Ol\xEDmpicos", "ru": "\u041E\u043B\u0438\u043C\u043F\u0438\u0439\u0441\u043A\u0438\u0435 \u0438\u0433\u0440\u044B", "es": "Olimpiadas", "es-AR": "Olimpiadas", "uk": "\u041E\u043B\u0456\u043C\u043F\u0456\u0439\u0441\u044C\u043A\u0456 \u0456\u0433\u0440\u0438", "uz": "Olimpiya o'yinlari", "uzb": "\u041E\u043B\u0438\u043C\u043F\u0438\u044F \u045E\u0439\u0438\u043D\u043B\u0430\u0440\u0438" }, "notes": { "es": "Also refers to the 4-years period in between the games", "es-AR": "Also refers to the 4-years period in between the games", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 324, "terms": { "en-GB": "Olympics", "az": "Olimpiya", "da": "OL", "mn": "\u041E\u043B\u0438\u043C\u043F\u044B\u043D \u043D\u0430\u0430\u0434\u0430\u043C", "pt-BR": "Jogos Ol\xEDmpicos", "ru": "\u041E\u043B\u0438\u043C\u043F\u0438\u0439\u0441\u043A\u0438\u0435 \u0438\u0433\u0440\u044B", "es": "Olimpiadas", "es-AR": "Olimpiadas", "uk": "\u041E\u043B\u0456\u043C\u043F\u0456\u0439\u0441\u044C\u043A\u0456 \u0456\u0433\u0440\u0438", "uz": "Olimpiada", "uzb": "\u041E\u043B\u0438\u043C\u043F\u0438\u0430\u0434\u0430" }, "notes": { "es": "Also refers to the 4-years period in between the games", "es-AR": "Also refers to the 4-years period in between the games", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 325, "terms": { "en-GB": "One-Click Bets", "az": "Bir Klikl\u0259 M\u0259rcl\u0259r", "da": "Spil med \xE9t klik", "mn": "\u041D\u044D\u0433 \u0442\u043E\u0432\u0448\u0438\u043B\u0442\u044B\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "Apostas com um clique", "ru": "\u041F\u0430\u0440\u0438 \u0432 \u043E\u0434\u0438\u043D \u043A\u043B\u0438\u043A", "es": "Apuestas en un clic", "es-AR": "Apuestas en un clic", "uk": "\u043E\u043F\u0446\u0456\u044F \xAB\u0421\u0442\u0430\u0432\u043A\u0438 \u0432 \u043E\u0434\u0438\u043D \u043A\u043B\u0456\u043A\xBB", "uz": "Tezkor stavkalar", "uzb": "\u0422\u0435\u0437\u043A\u043E\u0440 \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" }, "notes": { "ru": "same, but for .RU", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 326, "terms": { "en-GB": "One-time Code", "az": "bird\u0259f\u0259lik kod", "da": "Engangskode", "mn": "\u041D\u044D\u0433 \u0443\u0434\u0430\u0430\u0433\u0438\u0439\u043D \u043A\u043E\u0434", "pt-BR": "c\xF3digo de uso \xFAnico", "ru": "\u043E\u0434\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u044B\u0439 \u043A\u043E\u0434", "es": "c\xF3digo de un solo uso", "es-AR": "c\xF3digo de un solo uso", "uk": "\u043E\u0434\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u0438\u0439 \u043A\u043E\u0434", "uz": "bir martalik kod", "uzb": "\u0431\u0438\u0440 \u043C\u0430\u0440\u0442\u0430\u043B\u0438\u043A \u043A\u043E\u0434" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 327, "terms": { "en-GB": "Online Casino", "da": "Online Casino", "mn": "\u041E\u043D\u043B\u0430\u0439\u043D \u043A\u0430\u0437\u0438\u043D\u043E", "pt-BR": "Cassino Online", "ru": "\u041E\u043D\u043B\u0430\u0439\u043D \u041A\u0430\u0437\u0438\u043D\u043E", "es": "casino en l\xEDnea", "es-AR": "casino en l\xEDnea", "uk": "\u041E\u043D\u043B\u0430\u0439\u043D \u041A\u0430\u0437\u0438\u043D\u043E", "uz": "Onlayn Kazino", "uzb": "\u041E\u043D\u043B\u0430\u0439\u043D \u041A\u0430\u0437\u0438\u043D\u043E" } }, { "id": 328, "terms": { "en-GB": "open", "az": "a\xE7\u0131q", "da": "\xE5ben", "mn": "\u043D\u044D\u044D\u043B\u0442\u0442\u044D\u0439", "pt-BR": "abertas", "ru": "\u043E\u0442\u043A\u0440\u044B\u0442\u0430\u044F", "es": "abierta", "es-AR": "abierta", "uk": "\u0432\u0456\u0434\u043A\u0440\u0438\u0442\u0430", "uz": "ochiq", "uzb": "\u043E\u0447\u0438\u049B" } }, { "id": 329, "terms": { "en-GB": "Open Bets", "da": "\xC5bne v\xE6ddem\xE5l", "mn": "\u041D\u044D\u044D\u043B\u0442\u0442\u044D\u0439 \u0431\u043E\u043E\u0446\u043E\u043E\u043D\u0443\u0443\u0434", "pt-BR": "Apostas abertas", "ru": "\u041E\u0442\u043A\u0440\u044B\u0442\u044B\u0435 \u043F\u0430\u0440\u0438", "es": "Apuestas abiertas", "es-AR": "Apuestas abiertas", "uk": "\u0412\u0456\u0434\u043A\u0440\u0438\u0442\u0456 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "Ochiq stavkalar", "uzb": "\u041E\u0447\u0438\u049B \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised when section name", "da": "First letter is capitalised when it's a section name.", "ru": "same for .RU" } }, { "id": 330, "terms": { "en-GB": "Other Settings", "az": "Ba\u015Fqa parametrl\u0259r", "da": "Andre indstillinger", "mn": "\u0411\u0443\u0441\u0430\u0434 \u0442\u043E\u0445\u0438\u0440\u0433\u043E\u043E", "pt-BR": "Outras configura\xE7\xF5es", "ru": "\u0414\u0440\u0443\u0433\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", "es": "Otras configuraciones", "es-AR": "Otras configuraciones", "uk": "\u0406\u043D\u0448\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", "uz": "Boshqa sozlamalar", "uzb": "\u0411\u043E\u0448\u049B\u0430 \u0441\u043E\u0437\u043B\u0430\u043C\u0430\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised when section name", "pt-BR": "As UI element, mind the capitalisation" } }, { "id": 331, "terms": { "en-GB": "Our Partners", "es": "Patrocinios oficiales", "es-AR": "Patrocinios oficiales" }, "notes": { "en-GB": "Capitalised when section name" } }, { "id": 332, "terms": { "en-GB": "outcome", "az": "n\u0259tic\u0259", "da": "udfald", "mn": "\u04AF\u0440 \u0434\u04AF\u043D", "pt-BR": "resultado", "ru": "\u0438\u0441\u0445\u043E\u0434", "es": "resultado", "es-AR": "resultado", "uk": "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "uz": "natija", "uzb": "\u043D\u0430\u0442\u0438\u0436\u0430" } }, { "id": 333, "terms": { "en-GB": "outright", "da": "vinderspil", "mn": "\u0448\u0443\u0443\u0434 \u0445\u043E\u0436\u0438\u0445", "pt-BR": "resultado final", "ru": "\u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044C", "es": "resultado final", "es-AR": "resultado final", "uk": "\u043F\u0435\u0440\u0435\u043C\u043E\u0436\u0435\u0446\u044C", "uz": "g'olib", "uzb": "\u0493\u043E\u043B\u0438\u0431" }, "notes": { "pt-BR": "Cricket specific market", "uz": "as stand-alone market name", "uzb": "as stand-alone market name" } }, { "id": 334, "terms": { "en-GB": "over", "az": "over", "da": "over", "mn": "\u043E\u0432\u0435\u0440", "pt-BR": "mais de", "ru": "\u043E\u0432\u0435\u0440", "es": "over", "es-AR": "over", "uk": "\u043E\u0432\u0435\u0440", "uz": "over", "uzb": "\u043E\u0432\u0435\u0440" }, "notes": { "az": "as cricket term", "da": "In both meanings:  (1) opposite to 'under' in total markets; (2) part of a cricket match.", "mn": "part of a cricket match", "pt-BR": "in the context of markets, such as 'Total Over {0}', 'Total sets: Over {0}'", "ru": "part of a cricket match.", "es": "part of a cricket match", "es-AR": "part of a cricket match", "uk": "part of a cricket match.", "uz": "part of a cricket match", "uzb": "part of a cricket match" } }, { "id": 335, "terms": { "en-GB": "overtime", "az": "\u0259lav\u0259 vaxt", "da": "forl\xE6nget spilletid", "mn": "\u043D\u044D\u043C\u044D\u043B\u0442 \u0446\u0430\u0433", "pt-BR": "prorroga\xE7\xE3o", "ru": "\u043E\u0432\u0435\u0440\u0442\u0430\u0439\u043C", "es": "PR", "es-AR": "PR", "uk": "\u0434\u043E\u0434\u0430\u0442\u043A\u043E\u0432\u0438\u0439 \u0447\u0430\u0441", "uz": "overtaym", "uzb": "\u043E\u0432\u0435\u0440\u0442\u0430\u0439\u043C" }, "notes": { "da": '"Forl\xE6nget spilletid" is the conventional translation. However, other expressions such as "overbid" may also be used in some sports.', "uk": "for field hockey and handball" } }, { "id": 336, "terms": { "en-GB": "OT", "da": "FS", "mn": "\u041D\u0426", "pt-BR": "prorroga\xE7\xE3o", "ru": "\u041E\u0422", "es": "PR", "es-AR": "PR", "uk": "\u041E\u0422", "uz": "overtaym", "uzb": "\u043E\u0432\u0435\u0440\u0442\u0430\u0439\u043C" }, "notes": { "da": 'Short for "forl\xE6nget spilletid".' } }, { "id": 337, "terms": { "en-GB": "Partial Cash Out", "az": "qism\u0259n Cash Out", "da": "Delvis Cash Out", "mn": "\u0425\u044D\u0441\u044D\u0433\u0447\u043B\u044D\u043D \u041C\u04E9\u043D\u0433\u04E9 \u0413\u0430\u0440\u0433\u0430\u0445", "pt-BR": "Cash Out parcial", "ru": "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430", "es": "Cash Out parcial", "es-AR": "Cash Out parcial", "uk": "\u0447\u0430\u0441\u0442\u0438\u043D\u0430 \u0434\u043E\u0441\u0442\u0440\u043E\u043A\u043E\u0432\u043E\u0457 \u0432\u0438\u043F\u043B\u0430\u0442\u0438", "uz": "Qisman Kesh-aut", "uzb": "\u049A\u0438\u0441\u043C\u0430\u043D \u041A\u044D\u0448-\u0430\u0443\u0442" }, "notes": { "ru": `"\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u0430\u044F" is capitalised because it's a feature name` } }, { "id": 338, "terms": { "en-GB": "participant", "da": "deltager", "mn": "\u043E\u0440\u043E\u043B\u0446\u043E\u0433\u0447", "pt-BR": "participante", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A", "es": "participante", "es-AR": "participante", "uk": "\u0443\u0447\u0430\u0441\u043D\u0438\u043A", "uz": "ishtirokchi", "uzb": "\u0438\u0448\u0442\u0438\u0440\u043E\u043A\u0447\u0438" }, "notes": { "en-GB": "Especially used in acquisition campaigns/promotions' T&Cs" } }, { "id": 339, "terms": { "en-GB": "passcode", "az": "ke\xE7id kodu", "da": "kode", "mn": "\u043D\u044D\u0432\u0442\u0440\u044D\u0445 \u043A\u043E\u0434", "pt-BR": "c\xF3digo de acesso", "ru": "\u043A\u043E\u0434-\u043F\u0430\u0440\u043E\u043B\u044C", "es": "c\xF3digo", "es-AR": "c\xF3digo", "uk": "\u043A\u043E\u0434 \u0434\u043E\u043F\u0443\u0441\u043A\u0443", "uz": "kirish kodi", "uzb": "\u043A\u0438\u0440\u0438\u0448 \u043A\u043E\u0434\u0438" } }, { "id": 340, "terms": { "en-GB": "password", "az": "\u015Fifr\u0259", "da": "adgangskode", "mn": "\u043D\u0443\u0443\u0446 \u04AF\u0433", "pt-BR": "senha", "ru": "\u043F\u0430\u0440\u043E\u043B\u044C", "es": "contrase\xF1a", "es-AR": "contrase\xF1a", "uk": "\u043F\u0430\u0440\u043E\u043B\u044C", "uz": "parol", "uzb": "\u043F\u0430\u0440\u043E\u043B" } }, { "id": 341, "terms": { "en-GB": "Patent", "az": "Patent", "da": "Patent", "mn": "\u041F\u0430\u0442\u0435\u043D\u0442", "pt-BR": "Patent", "ru": "\u041F\u0430\u0442\u0435\u043D\u0442", "es": "patent", "es-AR": "patent", "uk": "\u041F\u0430\u0442\u0435\u043D\u0442", "uz": "patent", "uzb": "\u043F\u0430\u0442\u0435\u043D\u0442" }, "notes": { "uz": "Standard capitalization rules apply", "uzb": "Standard capitalization rules apply" } }, { "id": 342, "terms": { "en-GB": "payment", "az": "\xF6d\u0259ni\u015F", "da": "betaling", "mn": "\u0442\u04E9\u043B\u0431\u04E9\u0440", "pt-BR": "pagamento", "ru": "\u043F\u043B\u0430\u0442\u0435\u0436", "es": "pago", "es-AR": "pago", "uk": "\u0432\u0438\u043F\u043B\u0430\u0442\u0430", "uz": "to'lov", "uzb": "\u0442\u045E\u043B\u043E\u0432" } }, { "id": 343, "terms": { "en-GB": "payment method", "az": "\xF6d\u0259ni\u015F metodu", "da": "betalingsmetode", "mn": "\u0442\u04E9\u043B\u0431\u04E9\u0440\u0438\u0439\u043D \u0445\u044D\u0440\u044D\u0433\u0441\u044D\u043B", "pt-BR": "forma de pagamento", "ru": "\u0441\u043F\u043E\u0441\u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u044B", "es": "m\xE9todo de pago", "es-AR": "m\xE9todo de pago", "uk": "\u0441\u043F\u043E\u0441\u0456\u0431 \u043E\u043F\u043B\u0430\u0442\u0438", "uz": "to'lov usuli", "uzb": "\u0442\u045E\u043B\u043E\u0432 \u0443\u0441\u0443\u043B\u0438" } }, { "id": 344, "terms": { "en-GB": "payment terminal", "az": "\xF6d\u0259ni\u015F terminal", "da": "betalingsterminal", "mn": "\u0442\u04E9\u043B\u0431\u04E9\u0440\u0438\u0439\u043D \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B", "pt-BR": "terminal de pagamento", "ru": "\u043F\u043B\u0430\u0442\u0435\u0436\u043D\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B", "es": "terminal de pago", "es-AR": "terminal de pago", "uk": "\u043F\u043B\u0430\u0442\u0456\u0436\u043D\u0438\u0439 \u0442\u0435\u0440\u043C\u0456\u043D\u0430\u043B", "uz": "to'lov terminali", "uzb": "\u0442\u045E\u043B\u043E\u0432 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0438" } }, { "id": 345, "terms": { "en-GB": "Payments", "da": "Betalinger", "mn": "\u0422\u04E9\u043B\u0431\u04E9\u0440", "pt-BR": "Pagamentos", "ru": "\u041E\u043F\u043B\u0430\u0442\u0430", "es": "Pagos", "es-AR": "Pagos", "uk": "\u041E\u043F\u043B\u0430\u0442\u0430", "uz": "To'lovlar", "uzb": "\u0422\u045E\u043B\u043E\u0432\u043B\u0430\u0440" }, "notes": { "ru": "Capitalised if used as a section name or at the beginning of a sentence", "uz": "Capitalised when section name", "uzb": "Capitalised when section name" } }, { "id": 346, "terms": { "en-GB": "Payments Table", "az": "\xD6d\u0259ni\u015Fl\u0259r C\u0259dv\u0259li", "da": "Betalingsskemaet", "mn": "\u0422\u04E9\u043B\u0431\u04E9\u0440\u0438\u0439\u043D \u0445\u04AF\u0441\u043D\u044D\u0433\u0442", "pt-BR": "Tabela de pagamentos", "ru": "\u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043E\u043F\u043B\u0430\u0442", "es": "tabla \u201CPagos\u201D", "es-AR": "tabla \u201CPagos\u201D", "uk": "\u0442\u0430\u0431\u043B\u0438\u0446\u044F \xAB\u041E\u043F\u043B\u0430\u0442\u0430\xBB", "uz": "to'lovlar jadvali", "uzb": "\u0442\u045E\u043B\u043E\u0432\u043B\u0430\u0440 \u0436\u0430\u0434\u0432\u0430\u043B\u0438" }, "notes": { "ru": '"\u0422\u0430\u0431\u043B\u0438\u0446\u0430" is capitalised if used as a section/button name or at the beginning of a sentence', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 347, "terms": { "en-GB": "payout", "da": "udbetaling", "mn": "\u0442\u04E9\u043B\u0431\u04E9\u0440", "pt-BR": "premia\xE7\xE3o", "ru": "\u0432\u044B\u043F\u043B\u0430\u0442\u0430", "es": "pago", "es-AR": "pago", "uk": "\u0432\u0438\u043F\u043B\u0430\u0442\u0430", "uz": "to'lov", "uzb": "\u0442\u045E\u043B\u043E\u0432" } }, { "id": 348, "terms": { "en-GB": "returns", "es": "pago", "es-AR": "pago" } }, { "id": 349, "terms": { "en-GB": "penalty", "az": "penalti", "da": "straffe", "mn": "\u0442\u043E\u0440\u0433\u0443\u0443\u043B\u0438\u0439\u043D \u0446\u043E\u0445\u0438\u043B\u0442", "pt-BR": "p\xEAnalti", "ru": "\u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438", "es": "penalti", "es-AR": "penal", "uk": "\u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0456", "uz": "penalti", "uzb": "\u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438" }, "notes": { "da": "penalty kick" } }, { "id": 350, "terms": { "en-GB": "penalty kick", "az": "penalti at\u0131\u015F\u0131", "da": "straffespark", "mn": "\u0442\u043E\u0440\u0433\u0443\u0443\u043B\u0438\u0439\u043D \u0446\u043E\u0445\u0438\u043B\u0442", "pt-BR": "cobran\xE7a de p\xEAnalti", "ru": "\u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438", "es": "tiro penal", "es-AR": "penal", "uk": "\u0448\u0442\u0440\u0430\u0444\u043D\u0438\u0439 \u0443\u0434\u0430\u0440", "uz": "jarima zarbasi", "uzb": "\u0436\u0430\u0440\u0438\u043C\u0430 \u0437\u0430\u0440\u0431\u0430\u0441\u0438" }, "notes": { "uk": "rugby", "uz": "in rugby", "uzb": "in rugby" } }, { "id": 351, "terms": { "en-GB": "penalty shootout", "es": "tanda de penaltis", "es-AR": "tanda de penaltis" } }, { "id": 352, "terms": { "en-GB": "pending", "da": "afventer", "mn": "\u0445\u04AF\u043B\u044D\u044D\u0433\u0434\u044D\u0436 \u0431\u0443\u0439", "pt-BR": "pendente", "ru": "\u043D\u0430 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u0438", "es": "pendiente", "es-AR": "pendiente", "uk": "\u043E\u0431\u0440\u043E\u0431\u043B\u044F\u0454\u0442\u044C\u0441\u044F", "uz": "kutilmoqda", "uzb": "\u043A\u0443\u0442\u0438\u043B\u043C\u043E\u049B\u0434\u0430" } }, { "id": 353, "terms": { "en-GB": "period", "az": "period", "da": "periode", "mn": "\u04AF\u0435", "pt-BR": "per\xEDodo", "ru": "\u043F\u0435\u0440\u0438\u043E\u0434", "es": "periodo", "es-AR": "periodo", "uk": "\u043F\u0435\u0440\u0456\u043E\u0434", "uz": "davr", "uzb": "\u0442\u0430\u0439\u043C" }, "notes": { "az": "in hockey", "uz": "ball hockey, beach soccer, floorball, ice hockey" } }, { "id": 354, "terms": { "en-GB": "Personal Details", "az": "\u015E\u0259xsi m\u0259lumatlar", "da": "Personlige oplysninger", "mn": "\u0425\u0443\u0432\u0438\u0439\u043D \u043C\u044D\u0434\u044D\u044D\u043B\u044D\u043B", "pt-BR": "Informa\xE7\xF5es pessoais", "ru": "\u041B\u0438\u0447\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435", "es": "Datos personales", "es-AR": "Datos personales", "uk": "\u041E\u0441\u043E\u0431\u0438\u0441\u0442\u0456 \u0434\u0430\u043D\u0456", "uz": "Shaxsiy ma'lumotlar", "uzb": "\u0428\u0430\u0445\u0441\u0438\u0439 \u043C\u0430\u044A\u043B\u0443\u043C\u043E\u0442\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised when section name", "pt-BR": "Section name.", "ru": '"\u041B\u0438\u0447\u043D\u044B\u0435" is capitalised if used as a section name or at the beginning of a sentence' } }, { "id": 355, "terms": { "en-GB": "PIN code", "az": "PIN kod", "da": "pinkode", "mn": "PIN \u043A\u043E\u0434", "pt-BR": "c\xF3digo PIN", "ru": "PIN-\u043A\u043E\u0434", "es": "codigo pin", "es-AR": "codigo pin", "uk": "PIN-\u043A\u043E\u0434", "uz": "PIN-kod", "uzb": "\u041F\u0418\u041D-\u043A\u043E\u0434" } }, { "id": 356, "terms": { "en-GB": "place", "az": "yer", "da": "placering", "mn": "\u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0441\u0430\u043D", "pt-BR": "colocado", "ru": "\u043C\u0435\u0441\u0442\u043E", "es": "posici\xF3n", "es-AR": "posici\xF3n", "uk": "\u043C\u0456\u0441\u0446\u0435", "uz": "o'ringa", "uzb": "\u045E\u0440\u0438\u043D\u0433\u0430" } }, { "id": 357, "terms": { "en-GB": "Place Bet", "az": "m\u0259rc yerl\u0259\u015Fdirm\u0259k", "da": "Spil nu", "mn": "\u0411\u043E\u043E\u0446\u043E\u043E \u0442\u0430\u0432\u0438\u0445", "pt-BR": "Fazer aposta", "ru": "\u0417\u0430\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0430\u0440\u0438", "es": "Apostar", "es-AR": "Apostar", "uk": "\u0440\u043E\u0437\u043C\u0456\u0449\u0443\u0432\u0430\u0442\u0438 \u0441\u0442\u0430\u0432\u043A\u0443", "uz": "Stavka qo'yish", "uzb": "\u0421\u0442\u0430\u0432\u043A\u0430 \u049B\u045E\u0439\u0438\u0448" }, "notes": { "en-GB": "Capitalised as button text", "ru": "same for .RU", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 358, "terms": { "en-GB": "Play Here", "es": "Jugar", "es-AR": "Jugar" }, "notes": { "en-GB": "Capitalised as button text" } }, { "id": 359, "terms": { "en-GB": "Play Now", "mn": "\u041E\u0434\u043E\u043E \u0442\u043E\u0433\u043B\u043E\u0445", "ru": "\u0418\u0433\u0440\u0430\u0442\u044C", "es": "Jugar", "es-AR": "Jugar", "uk": "\u0413\u0440\u0430\u0442\u0438 \u0437\u0430\u0440\u0430\u0437", "uz": "Hozir o'ynang", "uzb": "\u04B2\u043E\u0437\u0438\u0440 \u045E\u0439\u043D\u0430\u043D\u0433" }, "notes": { "en-GB": "Capitalised as button text", "ru": "Capitalised if used as a CTA", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 360, "terms": { "en-GB": "player", "da": "spiller", "mn": "\u0442\u043E\u0433\u043B\u043E\u0433\u0447", "pt-BR": "jogador", "ru": "\u0438\u0433\u0440\u043E\u043A", "es": "jugador", "es-AR": "jugador", "uk": "\u0433\u0440\u0430\u0432\u0435\u0446\u044C", "uz": "o'yinchi", "uzb": "\u045E\u0439\u0438\u043D\u0447\u0438" }, "notes": { "es": "Especially in Casino T&Cs", "es-AR": "Especially in Casino T&Cs" } }, { "id": 361, "terms": { "en-GB": "Player Protection", "az": "Oyun\xE7unun m\xFChafiz\u0259si", "da": "Spillerbeskyttelse", "mn": "\u0422\u043E\u0433\u043B\u043E\u0433\u0447\u0438\u0439\u043D \u0445\u0430\u043C\u0433\u0430\u0430\u043B\u0430\u043B\u0442", "pt-BR": "Prote\xE7\xE3o do jogador", "ru": "\u0417\u0430\u0449\u0438\u0442\u0430 \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0430 \u043F\u0430\u0440\u0438", "es": "Protecci\xF3n del jugador", "es-AR": "Protecci\xF3n del jugador", "uk": "\u0417\u0430\u0445\u0438\u0441\u0442 \u0433\u0440\u0430\u0432\u0446\u044F", "uz": "O'yinchini himoya qilish", "uzb": "\u040E\u0439\u0438\u043D\u0447\u0438\u043D\u0438 \u04B3\u0438\u043C\u043E\u044F \u049B\u0438\u043B\u0438\u0448" }, "notes": { "en-GB": "Capitalised when section name" } }, { "id": 362, "terms": { "en-GB": "player protection measures", "es": "medidas de protecci\xF3n al jugador", "es-AR": "medidas de protecci\xF3n al jugador" } }, { "id": 363, "terms": { "en-GB": "play-off", "az": "pleyof", "da": "nedrykningsspil", "mn": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444", "pt-BR": "play-off", "ru": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444", "es": "eliminatoria", "es-AR": "eliminatoria", "uk": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444", "uz": "pley-off", "uzb": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444" } }, { "id": 364, "terms": { "en-GB": "playoff", "az": "pleyof", "da": "nedrykningsspil", "mn": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444", "pt-BR": "play-off", "ru": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444", "es": "eliminatoria", "es-AR": "eliminatoria", "uk": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444", "uz": "pley-off", "uzb": "\u043F\u043B\u0435\u0439-\u043E\u0444\u0444" } }, { "id": 365, "terms": { "en-GB": "point", "az": "xal", "da": "point", "mn": "\u043E\u043D\u043E\u043E", "pt-BR": "ponto", "ru": "\u043E\u0447\u043A\u043E", "es": "punto", "es-AR": "punto", "uk": "\u0431\u0430\u043B", "uz": "ochko", "uzb": "\u043E\u0447\u043A\u043E" }, "notes": { "ru": "as in 'loyalty point'", "uk": "as in 'loyalty point'" } }, { "id": 366, "terms": { "en-GB": "pool", "az": "amerika bilyard\u0131", "mn": "\u0441\u0430\u043D", "pt-BR": "bol\xE3o", "ru": "\u043F\u0443\u043B", "es": "bote", "es-AR": "bote", "uk": "\u043F\u0443\u043B", "uz": "pul", "uzb": "\u043F\u0443\u043B" }, "notes": { "pt-BR": "Toto" } }, { "id": 367, "terms": { "en-GB": "Popular", "da": "Popul\xE6re", "mn": "\u0410\u043B\u0434\u0430\u0440\u0442\u0430\u0439 \u04AF\u0439\u043B \u044F\u0432\u0434\u043B\u0443\u0443\u0434", "pt-BR": "Populares", "ru": "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F", "es": "Populares", "es-AR": "Populares", "uk": "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u0456 \u043F\u043E\u0434\u0456\u0457", "uz": "Ommabop", "uzb": "\u041E\u043C\u043C\u0430\u0431\u043E\u043F" }, "notes": { "ru": '"\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435" is capitalised if the phrase is used as a section name or at the beginning of a sentence', "uk": '"\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u0456" is capitalised if the phrase is used as a section name or at the beginning of a sentence' } }, { "id": 368, "terms": { "en-GB": "position", "pt-BR": "posi\xE7\xE3o", "ru": "\u043F\u043E\u0437\u0438\u0446\u0438\u044F", "es": "posici\xF3n", "es-AR": "posici\xF3n", "uz": "o'rin", "uzb": "\u045E\u0440\u0438\u043D" } }, { "id": 369, "terms": { "en-GB": "potential returns", "az": "potensial qazanc", "es": "ganancias potenciales", "es-AR": "ganancias potenciales" } }, { "id": 370, "terms": { "en-GB": "preferences", "es": "preferencias", "es-AR": "preferencias" } }, { "id": 371, "terms": { "en-GB": "pre-match", "az": "premat\xE7", "da": "prematch", "mn": "\u0442\u043E\u0433\u043B\u043E\u043B\u0442\u044B\u043D \u04E9\u043C\u043D\u04E9\u0445", "pt-BR": "pr\xE9-jogo", "ru": "\u0434\u043E \u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043E\u0431\u044B\u0442\u0438\u044F", "es": "prepartido", "es-AR": "prepartido", "uk": "\u0434\u043E \u043F\u043E\u0447\u0430\u0442\u043A\u0443 \u043F\u043E\u0434\u0456\u0457", "uz": "match oldi", "uzb": "\u043C\u0430\u0442\u0447 \u043E\u043B\u0434\u0438" }, "notes": { "pt-BR": "for banners only", "ru": "if we are not talking about a match, but, for example, about a boxing, MMA", "uk": "if we are not talking about a match, but, for example, about a boxing, MMA" } }, { "id": 372, "terms": { "en-GB": "prepaid card", "da": "forudbetalt kort", "mn": "\u0443\u0440\u044C\u0434\u0447\u0438\u043B\u0441\u0430\u043D \u0442\u04E9\u043B\u0431\u04E9\u0440\u0442 \u043A\u0430\u0440\u0442", "pt-BR": "cart\xE3o pr\xE9-pago", "ru": "\u043A\u0430\u0440\u0442\u0430 \u043F\u0440\u0435\u0434\u043E\u043F\u043B\u0430\u0442\u044B", "es": "tarjeta de prepago", "es-AR": "tarjeta de prepago", "uk": "\u043F\u0435\u0440\u0435\u0434\u043F\u043B\u0430\u0447\u0435\u043D\u0430 \u043A\u0430\u0440\u0442\u043A\u0430", "uz": "oldindan to'lov kartasi", "uzb": "\u043E\u043B\u0434\u0438\u043D\u0434\u0430\u043D \u0442\u045E\u043B\u043E\u0432 \u043A\u0430\u0440\u0442\u0430\u0441\u0438" } }, { "id": 373, "terms": { "en-GB": "price", "az": "qiym\u0259t", "da": "pris", "mn": "\u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "ru": "\u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "cuota", "es-AR": "cuota", "uk": "\u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "narx", "uzb": "\u043D\u0430\u0440\u0445" }, "notes": { "az": "money", "da": "may be used in some contexts", "uz": "amount of money to be paid for something", "uzb": "amount of money to be paid for something" } }, { "id": 374, "terms": { "en-GB": "Privacy Policy", "az": "M\u0259xfilik Siyas\u0259ti", "da": "Privatlivspolitik", "mn": "\u041D\u0443\u0443\u0446\u043B\u0430\u043B\u044B\u043D \u0431\u043E\u0434\u043B\u043E\u0433\u043E", "pt-BR": "Pol\xEDtica de privacidade", "ru": "\u041A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C", "es": "Pol\xEDtica de privacidad", "es-AR": "Pol\xEDtica de privacidad", "uk": "\u041A\u043E\u043D\u0444\u0456\u0434\u0435\u043D\u0446\u0456\u0439\u043D\u0456\u0441\u0442\u044C", "uz": "Maxfiylik siyosati", "uzb": "\u041C\u0430\u0445\u0444\u0438\u0439\u043B\u0438\u043A \u0441\u0438\u0451\u0441\u0430\u0442\u0438" }, "notes": { "en-GB": "Capitalised when section name", "ru": "Short variant of '\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438'. Should be used when number of characters is limited.", "uk": "Short variant of '\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438'. Should be used when number of characters is limited.", "uz": "First letter in Capital (section name)", "uzb": "First letter in Capital (section name)" } }, { "id": 375, "terms": { "en-GB": "privileges", "es": "ventajas", "es-AR": "ventajas" } }, { "id": 376, "terms": { "en-GB": "prize pool", "az": "m\xFCkafat fondu", "da": "pr\xE6miepulje", "mn": "\u0448\u0430\u0433\u043D\u0430\u043B\u044B\u043D \u0441\u0430\u043D", "pt-BR": "bol\xE3o de pr\xEAmios", "ru": "\u043F\u0440\u0438\u0437\u043E\u0432\u043E\u0439 \u0444\u043E\u043D\u0434", "es": "bote de premios", "es-AR": "bote de premios", "uk": "\u043F\u0440\u0438\u0437\u043E\u0432\u0438\u0439 \u0444\u043E\u043D\u0434" } }, { "id": 377, "terms": { "en-GB": "promo code", "az": "promokod", "mn": "\u0443\u0440\u0430\u043C\u0448\u0443\u0443\u043B\u043B\u044B\u043D \u043A\u043E\u0434", "pt-BR": "c\xF3digo promocional", "ru": "\u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434", "es": "c\xF3digo promocional", "es-AR": "c\xF3digo promocional", "uk": "\u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434", "uz": "promokod", "uzb": "\u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434" } }, { "id": 378, "terms": { "en-GB": "promotion", "az": "kampaniya", "da": "kampagnen", "mn": "\u0443\u0440\u0430\u043C\u0448\u0443\u0443\u043B\u0430\u043B", "pt-BR": "promo\xE7\xE3o", "ru": "\u0430\u043A\u0446\u0438\u044F", "es": "promoci\xF3n", "es-AR": "promoci\xF3n", "uk": "\u0430\u043A\u0446\u0456\u044F", "uz": "aksiya", "uzb": "\u0430\u043A\u0446\u0438\u044F" } }, { "id": 379, "terms": { "en-GB": "provider", "az": "provayder", "da": "udbyder", "mn": "\u04AF\u0439\u043B\u0447\u0438\u043B\u0433\u044D\u044D \u04AF\u0437\u04AF\u04AF\u043B\u044D\u0433\u0447", "pt-BR": "provedora", "ru": "\u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A", "es": "proveedor", "es-AR": "proveedor", "uk": "\u043F\u043E\u0441\u0442\u0430\u0447\u0430\u043B\u044C\u043D\u0438\u043A", "uz": "provayder", "uzb": "\u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440" }, "notes": { "da": "Tends to be more service-like arrangements", "ru": "for other types of providers" } }, { "id": 380, "terms": { "en-GB": "QR code", "az": "QR Kod", "mn": "QR \u043A\u043E\u0434", "pt-BR": "c\xF3digo QR", "ru": "QR-\u043A\u043E\u0434", "es": "c\xF3digo QR", "es-AR": "c\xF3digo QR", "uk": "QR-\u043A\u043E\u0434", "uz": "QR-kod", "uzb": "QR-\u043A\u043E\u0434" } }, { "id": 381, "terms": { "en-GB": "qualify", "pt-BR": "ser eleg\xEDvel", "es": "clasificaci\xF3n", "es-AR": "clasificaci\xF3n" } }, { "id": 382, "terms": { "en-GB": "qualifying", "pt-BR": "classificat\xF3ria", "es": "clasificaci\xF3n", "es-AR": "clasificaci\xF3n" }, "notes": { "en-GB": "meaning such as 'qualifying round', refers to markets" } }, { "id": 383, "terms": { "en-GB": "qualifying bet", "az": "se\xE7im m\u0259rci", "da": "kvalificerende v\xE6ddem\xE5l", "mn": "\u0448\u0430\u0430\u0440\u0434\u043B\u0430\u0433\u0430 \u0445\u0430\u043D\u0433\u0430\u0441\u0430\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta eleg\xEDvel", "ru": "\u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430", "es": "apuesta v\xE1lida", "es-AR": "apuesta v\xE1lida", "uk": "\u043A\u0432\u0430\u043B\u0456\u0444\u0456\u043A\u0443\u044E\u0447\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "kvalifikatsiyalovchi stavka", "uzb": "\u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F\u043B\u043E\u0432\u0447\u0438 \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 384, "terms": { "en-GB": "qualifying round", "az": "se\xE7m\u0259 raundu", "da": "kvalifikationsrunde", "mn": "\u0448\u0430\u043B\u0433\u0430\u0440\u0443\u0443\u043B\u0430\u043B\u0442\u044B\u043D \u0442\u043E\u0439\u0440\u043E\u0433", "pt-BR": "rodada classificat\xF3ria", "ru": "\u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434", "es": "ronda de clasificaci\xF3n", "es-AR": "ronda de clasificaci\xF3n", "uk": "\u043A\u0432\u0430\u043B\u0456\u0444\u0456\u043A\u0430\u0446\u0456\u0439\u043D\u0438\u0439 \u0440\u0430\u0443\u043D\u0434", "uz": "saralash bosqichi", "uzb": "\u0441\u0430\u0440\u0430\u043B\u0430\u0448 \u0431\u043E\u0441\u049B\u0438\u0447\u0438" } }, { "id": 385, "terms": { "en-GB": "quarter", "az": "r\xFCb", "da": "periode", "mn": "\u04AF\u0435", "pt-BR": "quarto", "ru": "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u044C", "es": "cuarto", "es-AR": "cuarto", "uk": "\u0447\u0432\u0435\u0440\u0442\u044C", "uz": "chorak", "uzb": "\u0447\u043E\u0440\u0430\u043A" }, "notes": { "az": "for American Football" } }, { "id": 386, "terms": { "en-GB": "race", "az": "yar\u0131\u015F", "da": "l\xF8b", "mn": "\u0443\u0440\u0430\u043B\u0434\u0430\u0430\u043D", "pt-BR": "corrida", "ru": "\u0433\u043E\u043D\u043A\u0430", "es": "carrera", "es-AR": "carrera", "uk": "\u0437\u0430\u0431\u0456\u0433", "uz": "poyga", "uzb": "\u043F\u043E\u0439\u0433\u0430" } }, { "id": 387, "terms": { "en-GB": "random number generator", "az": "t\u0259sad\xFCfi n\xF6mr\u0259 yarad\u0131c\u0131", "da": "generator af tilf\xE6ldige tal", "mn": "\u0441\u0430\u043D\u0430\u043C\u0441\u0430\u0440\u0433\u04AF\u0439 \u0442\u043E\u043E \u04AF\u04AF\u0441\u0433\u044D\u0433\u0447", "pt-BR": "gerador de n\xFAmeros aleat\xF3rios", "ru": "\u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440 \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0445 \u0447\u0438\u0441\u0435\u043B", "es": "generador de n\xFAmeros aleatorios", "es-AR": "generador de n\xFAmeros aleatorios", "uk": "\u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440 \u0432\u0438\u043F\u0430\u0434\u043A\u043E\u0432\u0438\u0445 \u0447\u0438\u0441\u0435\u043B", "uz": "tasodifiy sonlar generatori", "uzb": "\u0442\u0430\u0441\u043E\u0434\u0438\u0444\u0438\u0439 \u0441\u043E\u043D\u043B\u0430\u0440 \u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440\u0438" } }, { "id": 388, "terms": { "en-GB": "refresh", "es": "actualizar", "es-AR": "actualizar" }, "notes": { "en-GB": "Capitalised when button name" } }, { "id": 389, "terms": { "en-GB": "registered payment method", "az": "qeydiyyatdan ke\xE7irilmi\u015F \xF6d\u0259ni\u015F metodu", "da": "registreret betalingsmetode", "mn": "\u0431\u04AF\u0440\u0442\u0433\u04AF\u04AF\u043B\u0441\u044D\u043D \u0442\u04E9\u043B\u0431\u04E9\u0440\u0438\u0439\u043D \u0445\u044D\u0440\u044D\u0433\u0441\u044D\u043B", "pt-BR": "forma de pagamento cadastrada", "ru": "\u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0441\u043F\u043E\u0441\u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u044B", "es": "m\xE9todo de pago registrado", "es-AR": "m\xE9todo de pago registrado", "uk": "\u0437\u0430\u0440\u0435\u0454\u0441\u0442\u0440\u043E\u0432\u0430\u043D\u0438\u0439 \u0441\u043F\u043E\u0441\u0456\u0431 \u043E\u043F\u043B\u0430\u0442\u0438", "uz": "ro'yxatga olingan to'lov usuli", "uzb": "\u0440\u045E\u0439\u0445\u0430\u0442\u0433\u0430 \u043E\u043B\u0438\u043D\u0433\u0430\u043D \u0442\u045E\u043B\u043E\u0432 \u0443\u0441\u0443\u043B\u0438" } }, { "id": 390, "terms": { "en-GB": "registration", "az": "qeydiyyat", "da": "oprettelse", "mn": "\u0431\u04AF\u0440\u0442\u0433\u044D\u043B", "pt-BR": "inscri\xE7\xE3o", "ru": "\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F", "es": "registro", "es-AR": "registro", "uk": "\u0440\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u044F", "uz": "ro'yxatdan o'tish", "uzb": "\u0440\u045E\u0439\u0445\u0430\u0442\u0434\u0430\u043D \u045E\u0442\u0438\u0448" } }, { "id": 391, "terms": { "en-GB": "remove all", "es": "quitar todo", "es-AR": "quitar todo" }, "notes": { "en-GB": "Capitalised when button name" } }, { "id": 392, "terms": { "en-GB": "reserve", "az": "ehtiyat", "da": "reserve", "pt-BR": "reserva", "ru": "\u0438\u0433\u0440\u043E\u043A \u0432 \u0437\u0430\u043F\u0430\u0441\u0435", "es": "reserva", "es-AR": "reserva", "uz": "bronlamoq", "uzb": "\u0431\u0440\u043E\u043D\u043B\u0430\u043C\u043E\u049B" } }, { "id": 393, "terms": { "en-GB": "Responsible Gambling", "az": "M\u0259suliyy\u0259tli M\u0259rc", "da": "Ansvarligt spil", "mn": "\u0425\u0430\u0440\u0438\u0443\u0446\u043B\u0430\u0433\u0430\u0442\u0430\u0439 \u043C\u04E9\u0440\u0438\u0439\u0442\u044D\u0439 \u0442\u043E\u0433\u043B\u043E\u043E\u043C", "pt-BR": "jogo respons\xE1vel", "ru": "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0438\u0433\u0440\u0430", "es": "Juego responsable", "es-AR": "Juego responsable", "uk": "\u0412\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u043B\u044C\u043D\u0430 \u0433\u0440\u0430", "uz": "Mas'uliyatli o'yin", "uzb": "\u041C\u0430\u0441\u044A\u0443\u043B\u0438\u044F\u0442\u043B\u0438 \u045E\u0439\u0438\u043D" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 394, "terms": { "en-GB": "Responsible Gambling Policy", "es": "Pol\xEDtica de juego responsable", "es-AR": "Pol\xEDtica de juego responsable" } }, { "id": 395, "terms": { "en-GB": "return", "az": "qazanc", "da": "gevinst", "mn": "\u0442\u04E9\u043B\u04E9\u043B\u0442", "pt-BR": "ganho", "ru": "\u0432\u044B\u043F\u043B\u0430\u0442\u0430", "es": "ganancias", "es-AR": "ganancias", "uk": "\u0432\u0438\u043F\u043B\u0430\u0442\u0430", "uz": "yutuq", "uzb": "\u044E\u0442\u0443\u049B" } }, { "id": 396, "terms": { "en-GB": "Return to Player", "da": "Tilbagebetalingsprocenten", "ru": "\u041F\u0440\u043E\u0446\u0435\u043D\u0442 \u0432\u044B\u043F\u043B\u0430\u0442 \u0438\u0433\u0440\u043E\u043A\u0443", "es": "retorno te\xF3rico al jugador", "es-AR": "retorno te\xF3rico al jugador" } }, { "id": 397, "terms": { "en-GB": "reverse forecast", "az": "\u0259ks proqnoz", "mn": "\u0443\u0440\u0432\u0443\u0443 \u0442\u0430\u0430\u043C\u0430\u0433\u043B\u0430\u043B", "ru": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0432 \u043B\u044E\u0431\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435", "es": "pron\xF3stico inverso", "es-AR": "pron\xF3stico inverso", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0443 \u0431\u0443\u0434\u044C-\u044F\u043A\u043E\u043C\u0443 \u043F\u043E\u0440\u044F\u0434\u043A\u0443", "uz": "ixtiyoriy tartibdagi prognoz", "uzb": "\u0438\u0445\u0442\u0438\u0451\u0440\u0438\u0439 \u0442\u0430\u0440\u0442\u0438\u0431\u0434\u0430\u0433\u0438 \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 398, "terms": { "en-GB": "reverse tricast", "az": "\xFC\xE7l\xFC \u0259ks proqnoz", "mn": "\u0443\u0440\u0432\u0443\u0443 \u0442\u0440\u0438\u043A\u0430\u0441\u0442", "ru": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \xAB\u0442\u0440\u043E\u0439\u043D\u0438\u043A\xBB \u0432\xA0\u043B\u044E\u0431\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435", "es": "pron\xF3stico triple inverso", "es-AR": "pron\xF3stico triple inverso", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u0442\u0440\u0456\u0439\u043A\u0443 \u0432 \u0431\u0443\u0434\u044C-\u044F\u043A\u043E\u043C\u0443 \u043F\u043E\u0440\u044F\u0434\u043A\u0443", "uz": "ixtiyoriy tartibdagi uchtalik prognoz", "uzb": "\u0438\u0445\u0442\u0438\u0451\u0440\u0438\u0439 \u0442\u0430\u0440\u0442\u0438\u0431\u0434\u0430\u0433\u0438 \u0443\u0447\u0442\u0430\u043B\u0438\u043A \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 399, "terms": { "en-GB": "round robin", "es": "todos contra todos", "es-AR": "todos contra todos" } }, { "id": 400, "terms": { "en-GB": "RTP", "da": "TBP", "es": "RTP", "es-AR": "RTP" }, "notes": { "da": 'Short for "Tilbagebetalingsprocenten".' } }, { "id": 401, "terms": { "en-GB": "rugby", "da": "rugby", "mn": "\u0440\u0435\u0433\u0431\u0438", "pt-BR": "rugby", "ru": "\u0440\u0435\u0433\u0431\u0438", "es": "rugby", "es-AR": "rugby", "uk": "\u0440\u0435\u0433\u0431\u0456", "uz": "regbi", "uzb": "\u0440\u0435\u0433\u0431\u0438" } }, { "id": 402, "terms": { "en-GB": "rugby league", "da": "rugby league", "mn": "\u0440\u0435\u0433\u0431\u0438\u0433\u0438\u0439\u043D \u043B\u0438\u0433", "pt-BR": "rugby league", "ru": "\u0440\u0435\u0433\u0431\u0438-\u043B\u0438\u0433\u0430", "es": "rugby league", "es-AR": "rugby league", "uk": "\u0440\u0435\u0433\u0431\u0456-\u043B\u0456\u0433\u0430", "uz": "regbi ligasi", "uzb": "\u0440\u0435\u0433\u0431\u0438 \u043B\u0438\u0433\u0430\u0441\u0438" } }, { "id": 403, "terms": { "en-GB": "rugby sevens", "da": "rugby sevens", "pt-BR": "rugby sevens", "ru": "\u0440\u0435\u0433\u0431\u0438-7", "es": "rugby 7", "es-AR": "rugby 7", "uk": "\u0440\u0435\u0433\u0431\u0456-7", "uz": "regbi-7", "uzb": "\u0440\u0435\u0433\u0431\u0438-7" } }, { "id": 404, "terms": { "en-GB": "rugby union", "da": "rugby union", "mn": "\u0440\u0435\u0433\u0431\u0438\u0433\u0438\u0439\u043D \u0445\u043E\u043B\u0431\u043E\u043E", "pt-BR": "rugby union", "ru": "\u0440\u0435\u0433\u0431\u0438-\u0441\u043E\u044E\u0437", "es": "rugby union", "es-AR": "rugby union", "uk": "\u0440\u0435\u0433\u0431\u0456-\u0441\u043E\u044E\u0437", "uz": "regbi yunion", "uzb": "\u0440\u0435\u0433\u0431\u0438 \u044E\u043D\u0438\u043E\u043D" } }, { "id": 405, "terms": { "en-GB": "Rules", "az": "qayda", "da": "Regler", "mn": "\u0414\u04AF\u0440\u044D\u043C", "pt-BR": "regras", "ru": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430", "es": "reglas", "es-AR": "reglas", "uk": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430", "uz": "qoidalar", "uzb": "\u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440" }, "notes": { "az": "Should be capitalized in Privacy Policy, official documents, Service Terms", "uz": "Refer to Help section. Standard capitalisation rules apply", "uzb": "Refer to Help section. Standard capitalisation rules apply" } }, { "id": 406, "terms": { "en-GB": "run", "az": "ran", "da": "run", "mn": "\u0440\u0430\u043D", "pt-BR": "corrida", "ru": "\u0440\u0430\u043D", "es": "carrera", "es-AR": "carrera", "uk": "\u0440\u0430\u043D", "uz": "ran", "uzb": "\u0440\u0430\u043D" }, "notes": { "pt-BR": "Used in cricket and baseball.", "uz": "cricket", "uzb": "cricket" } }, { "id": 407, "terms": { "en-GB": "run out", "es": "run out", "es-AR": "run out" } }, { "id": 408, "terms": { "en-GB": "runner", "az": "qa\xE7\u0131c\u0131", "da": "deltager", "mn": "\u043E\u0440\u043E\u043B\u0446\u043E\u0433\u0447", "pt-BR": "participante", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A", "es": "corredor", "es-AR": "corredor", "uk": "\u0443\u0447\u0430\u0441\u043D\u0438\u043A", "uz": "ishtirok", "uzb": "\u0438\u0448\u0442\u0438\u0440\u043E\u043A" }, "notes": { "pt-BR": "A participant of the event." } }, { "id": 409, "terms": { "en-GB": "Scatter symbol", "es": "s\xEDmbolo de dispersi\xF3n", "es-AR": "s\xEDmbolo de dispersi\xF3n" } }, { "id": 410, "terms": { "en-GB": "score", "az": "hesab", "da": "score", "mn": "\u043E\u043D\u043E\u043E \u0430\u0432\u0430\u0445", "pt-BR": "converter", "ru": "\u0437\u0430\u0431\u0438\u0432\u0430\u0442\u044C", "es": "anotar", "es-AR": "anotar", "uk": "\u0437\u0430\u0431\u0438\u0442\u0438", "uz": "gol urmoq", "uzb": "\u0433\u043E\u043B \u0443\u0440\u043C\u043E\u049B" }, "notes": { "da": "verb", "pt-BR": "Verb, to be used when referring to a penalty shot.", "es": "for AFL, basketball, cricket, curling, American football, gaelic football, netball, rugby, table tennis, volleyball, beach volleyball,darts", "es-AR": "for AFL, basketball, cricket, curling, American football, gaelic football, netball, rugby, table tennis, volleyball, beach volleyball,darts" } }, { "id": 411, "terms": { "en-GB": "scorecast", "az": "skorkast", "da": "scorecast", "mn": "\u043E\u043D\u043E\u043E\u043D\u044B \u043C\u044D\u0434\u044D\u044D", "pt-BR": "Scorecast", "ru": "\u0441\u043A\u043E\u0440\u043A\u0430\u0441\u0442", "es": "primer goleador y marcador final", "es-AR": "primer goleador y marcador final", "uk": "\u0441\u043A\u043E\u0440\u043A\u0430\u0441\u0442", "uz": "skorkast", "uzb": "\u0441\u043A\u043E\u0440\u043A\u0430\u0441\u0442" } }, { "id": 412, "terms": { "en-GB": "scorer", "az": "xal y\u0131\u011Fan", "da": "m\xE5lscorer", "pt-BR": "marcador", "ru": "\u0430\u0432\u0442\u043E\u0440 \u0433\u043E\u043B\u0430", "es": "goleador", "es-AR": "goleador", "uz": "gol muallifi", "uzb": "\u0433\u043E\u043B \u043C\u0443\u0430\u043B\u043B\u0438\u0444\u0438" } }, { "id": 413, "terms": { "en-GB": "season", "da": "s\xE6son", "pt-BR": "temporada", "ru": "\u0441\u0435\u0437\u043E\u043D", "es": "temporada", "es-AR": "temporada", "uz": "mavsum", "uzb": "\u043C\u0430\u0432\u0441\u0443\u043C" } }, { "id": 414, "terms": { "en-GB": "secret question", "az": "gizli sual", "da": "fortroligt sp\xF8rgsm\xE5l", "mn": "\u043D\u0443\u0443\u0446 \u0430\u0441\u0443\u0443\u043B\u0442", "pt-BR": "pergunta secreta", "ru": "\u0441\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u0439 \u0432\u043E\u043F\u0440\u043E\u0441", "es": "pregunta secreta", "es-AR": "pregunta secreta", "uk": "\u0441\u0435\u043A\u0440\u0435\u0442\u043D\u0435 \u0437\u0430\u043F\u0438\u0442\u0430\u043D\u043D\u044F", "uz": "maxfiy savol", "uzb": "\u043C\u0430\u0445\u0444\u0438\u0439 \u0441\u0430\u0432\u043E\u043B" } }, { "id": 415, "terms": { "en-GB": "secret question answer", "az": "gizli sual\u0131n cavab\u0131", "da": "svar p\xE5 fortroligt sp\xF8rgsm\xE5l", "mn": "\u043D\u0443\u0443\u0446 \u0430\u0441\u0443\u0443\u043B\u0442\u044B\u043D \u0445\u0430\u0440\u0438\u0443\u043B\u0442", "pt-BR": "resposta \xE0 pergunta secreta", "ru": "\u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0441\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u0439 \u0432\u043E\u043F\u0440\u043E\u0441", "es": "respuesta a la pregunta secreta", "es-AR": "respuesta a la pregunta secreta", "uk": "\u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u044C \u043D\u0430 \u0441\u0435\u043A\u0440\u0435\u0442\u043D\u0435 \u0437\u0430\u043F\u0438\u0442\u0430\u043D\u043D\u044F", "uz": "maxfiy savolga javob", "uzb": "\u043C\u0430\u0445\u0444\u0438\u0439 \u0441\u0430\u0432\u043E\u043B\u0433\u0430 \u0436\u0430\u0432\u043E\u0431" } }, { "id": 416, "terms": { "en-GB": "section", "az": "b\xF6lm\u0259", "da": "sektion", "mn": "\u0445\u044D\u0441\u044D\u0433", "pt-BR": "se\xE7\xE3o", "ru": "\u0440\u0430\u0437\u0434\u0435\u043B", "es": "secci\xF3n", "es-AR": "secci\xF3n", "uk": "\u0440\u043E\u0437\u0434\u0456\u043B", "uz": "bo'lim", "uzb": "\u0431\u045E\u043B\u0438\u043C" } }, { "id": 417, "terms": { "en-GB": "security code", "da": "sikkerhedskode", "mn": "\u0430\u044E\u0443\u043B\u0433\u04AF\u0439 \u0431\u0430\u0439\u0434\u043B\u044B\u043D \u043A\u043E\u0434", "pt-BR": "c\xF3digo de seguran\xE7a", "ru": "\u043A\u043E\u0434 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438", "es": "c\xF3digo de seguridad", "es-AR": "c\xF3digo de seguridad", "uk": "\u043A\u043E\u0434 \u0431\u0435\u0437\u043F\u0435\u043A\u0438", "uz": "xavfsizlik kodi", "uzb": "\u0445\u0430\u0432\u0444\u0441\u0438\u0437\u043B\u0438\u043A \u043A\u043E\u0434\u0438" } }, { "id": 418, "terms": { "en-GB": "selection", "az": "se\xE7im", "da": "valg", "mn": "\u0441\u043E\u043D\u0433\u043E\u043B\u0442", "pt-BR": "sele\xE7\xE3o", "ru": "\u0438\u0441\u0445\u043E\u0434", "es": "selecci\xF3n", "es-AR": "selecci\xF3n", "uk": "\u0432\u0438\u0431\u0456\u0440", "uz": "tanlash", "uzb": "\u0442\u0430\u043D\u043B\u0430\u0448" } }, { "id": 419, "terms": { "en-GB": "Self-Exclusion", "az": "\xD6z\xFC \u0130stisna", "da": "selveksklusion", "mn": "\u04E8\u04E9\u0440\u0438\u0439\u0433\u04E9\u04E9 \u0445\u0430\u0441\u0430\u0445", "pt-BR": "exclus\xE3o pelo usu\xE1rio", "ru": "\u0441\u0430\u043C\u043E\u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435", "es": "autoexclusi\xF3n", "es-AR": "autoexclusi\xF3n", "uk": "\u0441\u0430\u043C\u043E\u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F", "uz": "o'z-o'zini chetlatish", "uzb": "\u045E\u0437-\u045E\u0437\u0438\u043D\u0438 \u0447\u0435\u0442\u043B\u0430\u0442\u0438\u0448" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 420, "terms": { "en-GB": "Self-Exclusion period", "az": "\xD6z\xFCn\xFC \u0130stisna m\xFCdd\u0259ti", "da": "selveksklusionsperiode", "mn": "\u04E8\u04E9\u0440\u0438\u0439\u0433\u04E9\u04E9 \u0445\u0430\u0441\u0430\u0445 \u0445\u0443\u0433\u0430\u0446\u0430\u0430", "pt-BR": "per\xEDodo de exclus\xE3o pelo usu\xE1rio", "ru": "\u043F\u0435\u0440\u0438\u043E\u0434 \u0441\u0430\u043C\u043E\u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F", "es": "per\xEDodo de autoexclusi\xF3n", "es-AR": "per\xEDodo de autoexclusi\xF3n", "uk": "\u043F\u0435\u0440\u0456\u043E\u0434 \u0441\u0430\u043C\u043E\u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F", "uz": "o'z-o'zini chetlatish davri", "uzb": "\u045E\u0437-\u045E\u0437\u0438\u043D\u0438 \u0447\u0435\u0442\u043B\u0430\u0442\u0438\u0448 \u0434\u0430\u0432\u0440\u0438" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 421, "terms": { "en-GB": "Self-Exclusion request", "az": "\xD6z\xFCn\xFC \u0130stisna sor\u011Fusu", "da": "selveksklusionsanmodning", "mn": "\u04E8\u04E9\u0440\u0438\u0439\u0433\u04E9\u04E9 \u0445\u0430\u0441\u0430\u0445 \u0445\u04AF\u0441\u044D\u043B\u0442", "pt-BR": "pedido de exclus\xE3o pelo usu\xE1rio", "ru": "\u0437\u0430\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043D\u0430 \u0441\u0430\u043C\u043E\u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435", "es": "solicitud de autoexclusi\xF3n", "es-AR": "solicitud de autoexclusi\xF3n", "uk": "\u0437\u0430\u043F\u0438\u0442 \u043D\u0430 \u0441\u0430\u043C\u043E\u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F", "uz": "o'z-o'zini chetlatish talabi", "uzb": "\u045E\u0437-\u045E\u0437\u0438\u043D\u0438 \u0447\u0435\u0442\u043B\u0430\u0442\u0438\u0448 \u0442\u0430\u043B\u0430\u0431\u0438" } }, { "id": 422, "terms": { "en-GB": "session", "az": "sessiya", "da": "session", "mn": "\u0445\u043E\u043B\u0431\u043E\u043B\u0442", "pt-BR": "sess\xE3o", "ru": "\u0441\u0435\u0441\u0441\u0438\u044F", "es": "sesi\xF3n", "es-AR": "sesi\xF3n", "uk": "\u0441\u0435\u0441\u0456\u044F", "uz": "seans", "uzb": "\u0441\u0435\u0430\u043D\u0441" }, "notes": { "da": "Translation is applicable to both meanings: part of sport event (e.g. practice session in racing) and period of activity between user logging in and logging out of the account.", "ru": "period of activity between user logging in and logging out of the account", "uk": "period of activity between user logging in and logging out of the account", "uz": "period between user logging in and logging out of the account", "uzb": "period between user logging in and logging out of the account" } }, { "id": 423, "terms": { "en-GB": "set", "az": "set", "da": "s\xE6t", "mn": "\u0441\u0435\u0442", "pt-BR": "set", "ru": "\u043F\u0430\u0440\u0442\u0438\u044F", "es": "juego", "es-AR": "juego", "uk": "\u043F\u0430\u0440\u0442\u0456\u044F", "uz": "partiya", "uzb": "\u043F\u0430\u0440\u0442\u0438\u044F" }, "notes": { "pt-BR": "Sports term.", "ru": "used for table tennis, volleyball and beach volleyball", "es": "in the context of table tennis", "es-AR": "in the context of table tennis", "uk": "used for table tennis, volleyball and beach volleyball", "uz": "used for table tennis, volleyball and beach volleyball", "uzb": "used for table tennis, volleyball and beach volleyball" } }, { "id": 424, "terms": { "en-GB": "Settings", "da": "Indstillinger", "mn": "\u0422\u043E\u0445\u0438\u0440\u0433\u043E\u043E", "pt-BR": "configura\xE7\xF5es", "ru": "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", "es": "Configuraci\xF3n", "es-AR": "Configuraci\xF3n", "uk": "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", "uz": "Sozlamalar", "uzb": "\u0421\u043E\u0437\u043B\u0430\u043C\u0430\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised when section name" } }, { "id": 425, "terms": { "en-GB": "settled", "az": "hesablanm\u0131\u015F", "da": "afgjort", "mn": "\u0448\u0438\u0439\u0434\u044D\u0433\u0434\u0441\u044D\u043D", "pt-BR": "liquidado", "ru": "\u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u043D\u0430\u044F", "es": "liquidada", "es-AR": "liquidada", "uk": "\u0440\u043E\u0437\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u0430", "uz": "hisoblangan", "uzb": "\u04B3\u0438\u0441\u043E\u0431\u043B\u0430\u043D\u0433\u0430\u043D" } }, { "id": 426, "terms": { "en-GB": "shooting", "da": "skydning", "mn": "\u0431\u0443\u0443\u0434\u043B\u0430\u0433\u0430", "pt-BR": "tiro", "ru": "\u0441\u0442\u0440\u0435\u043B\u044C\u0431\u0430", "es": "tiro", "es-AR": "tiro", "uk": "\u0441\u0442\u0440\u0456\u043B\u044C\u0431\u0430" } }, { "id": 427, "terms": { "en-GB": "shootout", "da": "straffeslagskonkurrence", "pt-BR": "decis\xE3o por p\xEAnaltis", "es": "tanda", "es-AR": "tanda", "uz": "bullitlar", "uzb": "\u0431\u0443\u043B\u043B\u0438\u0442\u043B\u0430\u0440" }, "notes": { "uz": "ice hockey", "uzb": "ice hockey" } }, { "id": 428, "terms": { "en-GB": "shoot-out", "az": "penalti seriyas\u0131", "pt-BR": "decis\xE3o por p\xEAnaltis", "es": "tanda", "es-AR": "tanda", "uz": "bullitlar", "uzb": "\u0431\u0443\u043B\u043B\u0438\u0442\u043B\u0430\u0440" }, "notes": { "uz": "ice hockey", "uzb": "ice hockey" } }, { "id": 429, "terms": { "en-GB": "single", "az": "t\u0259k", "da": "single", "mn": "\u0433\u0430\u043D\u0446\u0430\u0430\u0440\u0447\u0438\u043B\u0441\u0430\u043D", "pt-BR": "simples", "ru": "\u043E\u0434\u0438\u043D\u043E\u0447\u043D\u0430\u044F", "es": "simple", "es-AR": "simple", "uk": "\u043E\u0434\u0438\u043D\u0430\u0440\u043D\u0430", "uz": "bittalik stavka", "uzb": "\u0431\u0438\u0442\u0442\u0430\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 430, "terms": { "en-GB": "Singles", "da": "Singler", "mn": "\u0413\u0430\u043D\u0446\u0430\u0430\u0440\u0447\u0438\u043B\u0441\u0430\u043D", "pt-BR": "simples", "ru": "\u041E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0435", "es": "Simples", "es-AR": "Simples", "uk": "\u041E\u0434\u0438\u043D\u0430\u0440\u043D\u0456", "uz": "Bittalik stavkalar", "uzb": "\u0411\u0438\u0442\u0442\u0430\u043B\u0438\u043A \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" } }, { "id": 431, "terms": { "en-GB": "slot", "da": "spillemaskine", "mn": "\u0441\u043B\u043E\u0442", "pt-BR": "ca\xE7a-n\xEDqueis", "ru": "\u0441\u043B\u043E\u0442", "es": "slot", "es-AR": "slot", "uk": "\u0441\u043B\u043E\u0442", "uz": "slot", "uzb": "\u0441\u043B\u043E\u0442" } }, { "id": 432, "terms": { "en-GB": "slots", "es": "slots", "es-AR": "slots" } }, { "id": 433, "terms": { "en-GB": "SMS", "da": "SMS", "mn": "SMS", "pt-BR": "SMS", "ru": "\u0421\u041C\u0421", "es": "SMS", "es-AR": "SMS", "uk": "SMS", "uz": "SMS", "uzb": "SMS" } }, { "id": 434, "terms": { "en-GB": "snooker", "da": "snooker", "mn": "\u0441\u043D\u0443\u043A\u0435\u0440", "pt-BR": "sinuca", "ru": "\u0441\u043D\u0443\u043A\u0435\u0440", "es": "snooker", "es-AR": "snooker", "uk": "\u0441\u043D\u0443\u043A\u0435\u0440", "uz": "snuker", "uzb": "\u0441\u043D\u0443\u043A\u0435\u0440" } }, { "id": 435, "terms": { "en-GB": "softball", "da": "softball", "mn": "\u0441\u043E\u0444\u0442\u0431\u043E\u043B", "pt-BR": "softbol", "ru": "\u0441\u043E\u0444\u0442\u0431\u043E\u043B", "es": "s\xF3ftbol", "es-AR": "s\xF3ftbol", "uk": "\u0441\u043E\u0444\u0442\u0431\u043E\u043B", "uz": "softbol", "uzb": "\u0441\u043E\u0444\u0442\u0431\u043E\u043B" } }, { "id": 436, "terms": { "en-GB": "SP", "da": "SP", "mn": "SP", "pt-BR": "pre\xE7o inicial", "ru": "SP", "es": "cuota de salida", "es-AR": "cuota de salida", "uk": "SP", "uz": "BK", "uzb": "\u0411\u041A" }, "notes": { "en-GB": "short for starting price", "da": "Abbreviation for startpris" } }, { "id": 437, "terms": { "en-GB": "starting price", "az": "ba\u015Flan\u011F\u0131c \u0259msal", "da": "startodds", "mn": "\u0433\u0430\u0440\u0430\u0430\u043D\u044B \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "pre\xE7o inicial", "ru": "\u0441\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "cuota de salida", "es-AR": "cuota de salida", "uk": "\u0441\u0442\u0430\u0440\u0442\u043E\u0432\u0438\u0439 \u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "BK", "uzb": "\u0411\u041A" } }, { "id": 438, "terms": { "en-GB": "specials", "da": "specialv\xE6ddem\xE5l", "mn": "\u043E\u043D\u0446\u0433\u043E\u0439 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "apostas especiais", "ru": "\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u0438", "es": "apuestas especiales", "es-AR": "apuestas especiales", "uk": "\u0441\u043F\u0435\u0446\u0456\u0430\u043B\u044C\u043D\u0456 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "maxsus stavkalar", "uzb": "\u043C\u0430\u0445\u0441\u0443\u0441 \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" }, "notes": { "da": "May be used in more legal and descriptive contexts", "ru": "for .RU" } }, { "id": 439, "terms": { "en-GB": "special betting", "da": "specialv\xE6ddem\xE5l", "mn": "\u043E\u043D\u0446\u0433\u043E\u0439 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "apostas especiais", "ru": "\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u0438", "es": "apuestas especiales", "es-AR": "apuestas especiales", "uk": "\u0441\u043F\u0435\u0446\u0456\u0430\u043B\u044C\u043D\u0456 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "maxsus stavkalar", "uzb": "\u043C\u0430\u0445\u0441\u0443\u0441 \u0441\u0442\u0430\u0432\u043A\u0430\u043B\u0430\u0440" }, "notes": { "da": "May be used in more legal and descriptive contexts", "ru": "for .RU" } }, { "id": 440, "terms": { "en-GB": "speedway", "da": "speedway", "mn": "\u0445\u0443\u0440\u0434\u043D\u044B \u0437\u0430\u043C\u044B\u043D \u0443\u0440\u0430\u043B\u0434\u0430\u0430\u043D", "pt-BR": "speedway", "ru": "\u0441\u043F\u0438\u0434\u0432\u0435\u0439", "es": "speedway", "es-AR": "speedway", "uk": "\u0441\u043F\u0456\u0434\u0432\u0435\u0439", "uz": "spidvey", "uzb": "\u0441\u043F\u0438\u0434\u0432\u0435\u0439" } }, { "id": 441, "terms": { "en-GB": "spin", "da": "spin", "mn": "\u044D\u0440\u0433\u044D\u043B\u0442", "pt-BR": "girar", "ru": "\u0441\u043F\u0438\u043D", "es": "girar", "es-AR": "girar", "uk": "\u0441\u043F\u0456\u043D", "uz": "spin", "uzb": "\u0441\u043F\u0438\u043D" }, "notes": { "pt-BR": "verb" } }, { "id": 442, "terms": { "en-GB": "Sport", "az": "\u0130dman", "da": "Sport", "mn": "\u0421\u043F\u043E\u0440\u0442", "pt-BR": "Esportes", "ru": "\u0421\u043F\u043E\u0440\u0442", "es": "Deporte", "es-AR": "Deporte", "uk": "\u0421\u043F\u043E\u0440\u0442", "uz": "Sport", "uzb": "\u0421\u043F\u043E\u0440\u0442" }, "notes": { "en-GB": "Capitalised when section name" } }, { "id": 443, "terms": { "en-GB": "sport rules", "az": "idman qaydalar\u0131", "da": "sportsregler", "mn": "\u0441\u043F\u043E\u0440\u0442\u044B\u043D \u0434\u04AF\u0440\u044D\u043C", "ru": "\u0441\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430", "es": "reglas de los deportes", "es-AR": "reglas de los deportes", "uk": "\u0441\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u0456 \u043F\u0440\u0430\u0432\u0438\u043B\u0430", "uz": "sport qoidalari", "uzb": "\u0441\u043F\u043E\u0440\u0442 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440\u0438" } }, { "id": 444, "terms": { "en-GB": "sportsbook", "az": "kitab\xE7as\u0131", "da": "sportsbook", "mn": "\u0441\u043F\u043E\u0440\u0442\u044B\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "apostas em esportes", "ru": "\u0431\u0443\u043A\u043C\u0435\u043A\u0435\u0440\u0441\u043A\u0430\u044F \u043A\u043E\u043D\u0442\u043E\u0440\u0430", "es": "casa de apuestas", "es-AR": "casa de apuestas", "uk": "\u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u0441\u043F\u043E\u0440\u0442", "uz": "sport", "uzb": "\u0441\u043F\u043E\u0440\u0442" } }, { "id": 445, "terms": { "en-GB": "stake", "az": "m\u0259rc", "da": "indsats", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "valor da aposta", "ru": "\u043F\u0430\u0440\u0438", "es": "importe de apuesta", "es-AR": "importe de apuesta", "uk": "\u0441\u0443\u043C\u0430 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "stavka summasi", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u0441\u0443\u043C\u043C\u0430\u0441\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 446, "terms": { "en-GB": "statistics", "da": "statistikker", "mn": "\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A", "pt-BR": "estat\xEDsticas", "ru": "\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430", "es": "estad\xEDsticas", "es-AR": "estad\xEDsticas", "uk": "\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430", "uz": "statistika", "uzb": "\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430" } }, { "id": 447, "terms": { "en-GB": "straight forecast", "az": "birba\u015Fa proqnoz", "mn": "\u0448\u0443\u0443\u0434 \u0442\u0430\u0430\u043C\u0430\u0433\u043B\u0430\u043B", "ru": "\u043F\u0440\u044F\u043C\u043E\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437", "es": "pron\xF3stico para ganador y segundo", "es-AR": "pron\xF3stico para ganador y segundo", "uk": "\u043F\u0440\u044F\u043C\u0438\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437", "uz": "aniq tartibdagi prognoz", "uzb": "\u0430\u043D\u0438\u049B \u0442\u0430\u0440\u0442\u0438\u0431\u0434\u0430\u0433\u0438 \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 448, "terms": { "en-GB": "straight tricast", "az": "birba\u015Fa \xFC\xE7l\xFC proqnoz", "mn": "\u0448\u0443\u0443\u0434 \u0442\u0440\u0438\u043A\u0430\u0441\u0442", "ru": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \xAB\u0442\u0440\u043E\u0439\u043D\u0438\u043A\xBB \u0432 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435", "es": "pron\xF3stico para ganador, segundo y tercero", "es-AR": "pron\xF3stico para ganador, segundo y tercero", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u0442\u0440\u0456\u0439\u043A\u0443 \u0432 \u0443\u043A\u0430\u0437\u0430\u043D\u043E\u043C\u0443 \u043F\u043E\u0440\u044F\u0434\u043A\u0443", "uz": "aniq tartibdagi uchtalik prognoz", "uzb": "\u0430\u043D\u0438\u049B \u0442\u0430\u0440\u0442\u0438\u0431\u0434\u0430\u0433\u0438 \u0443\u0447\u0442\u0430\u043B\u0438\u043A \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 449, "terms": { "en-GB": "Super Heinz", "az": "Super Heinz", "da": "Super Heinz", "mn": "\u0421\u0443\u043F\u0435\u0440 \u0425\u0430\u0439\u043D\u0446", "pt-BR": "Super Heinz", "ru": "\u0421\u0443\u043F\u0435\u0440 \u0425\u0430\u0439\u043D\u0446", "es": "Super Heinz", "es-AR": "Super Heinz", "uk": "\u0421\u0443\u043F\u0435\u0440 \u0425\u0430\u0439\u043D\u0446", "uz": "super Heinz", "uzb": "\u0441\u0443\u043F\u0435\u0440 \u0425\u0430\u0439\u043D\u0446" } }, { "id": 450, "terms": { "en-GB": "Super Yankee", "az": "Super Yanki", "da": "Super Yankee", "mn": "\u0421\u0443\u043F\u0435\u0440 \u042F\u043D\u043A\u0438", "pt-BR": "Super Yankee", "ru": "\u0421\u0443\u043F\u0435\u0440 \u042F\u043D\u043A\u0438", "es": "Super Yankee", "es-AR": "Super Yankee", "uk": "\u0421\u0443\u043F\u0435\u0440 \u042F\u043D\u043A\u0456", "uz": "super Yanki", "uzb": "\u0441\u0443\u043F\u0435\u0440 \u042F\u043D\u043A\u0438" } }, { "id": 451, "terms": { "en-GB": "Superprize", "az": "Super priz", "mn": "\u0421\u0443\u043F\u0435\u0440 \u0448\u0430\u0433\u043D\u0430\u043B", "pt-BR": "Superpr\xEAmio", "ru": "\u0421\u0443\u043F\u0435\u0440\u043F\u0440\u0438\u0437", "es": "S\xFAper Premio", "es-AR": "S\xFAper Premio", "uk": "\u0421\u0443\u043F\u0435\u0440\u043F\u0440\u0438\u0437", "uz": "Superpriz", "uzb": "\u0421\u0443\u043F\u0435\u0440\u043F\u0440\u0438\u0437" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 452, "terms": { "en-GB": "last name(s)", "az": "soyad", "da": "efternavn", "mn": "\u043E\u0432\u043E\u0433 \u043D\u044D\u0440", "pt-BR": "sobrenome", "ru": "\u0444\u0430\u043C\u0438\u043B\u0438\u044F", "es": "apellido", "es-AR": "apellido", "uk": "\u043F\u0440\u0456\u0437\u0432\u0438\u0449\u0435", "uz": "familiya", "uzb": "\u0444\u0430\u043C\u0438\u043B\u0438\u044F" } }, { "id": 453, "terms": { "en-GB": "SWIFT", "az": "SWIFT", "da": "SWIFT", "mn": "SWIFT", "pt-BR": "SWIFT", "ru": "SWIFT", "es": "SWIFT", "es-AR": "SWIFT", "uk": "SWIFT", "uz": "SWIFT", "uzb": "SWIFT" } }, { "id": 454, "terms": { "en-GB": "table tennis", "da": "bordtennis", "mn": "\u0448\u0438\u0440\u044D\u044D\u043D\u0438\u0439 \u0442\u0435\u043D\u043D\u0438\u0441", "pt-BR": "t\xEAnis de mesa", "ru": "\u043D\u0430\u0441\u0442\u043E\u043B\u044C\u043D\u044B\u0439 \u0442\u0435\u043D\u043D\u0438\u0441", "es": "tenis de mesa", "es-AR": "tenis de mesa", "uk": "\u043D\u0430\u0441\u0442\u0456\u043B\u044C\u043D\u0438\u0439 \u0442\u0435\u043D\u0456\u0441", "uz": "stol tennisi", "uzb": "\u0441\u0442\u043E\u043B \u0442\u0435\u043D\u043D\u0438\u0441\u0438" } }, { "id": 455, "terms": { "en-GB": "tap", "az": "vurun", "da": "tryk", "mn": "\u0442\u043E\u0432\u0448\u0438\u0445", "pt-BR": "toque", "ru": "\u043D\u0430\u0436\u0430\u0442\u044C", "es": "pulsar", "es-AR": "pulsar", "uk": "\u043D\u0430\u0442\u0438\u0441\u043D\u0443\u0442\u0438", "uz": "bosish", "uzb": "\u0431\u043E\u0441\u0438\u0448" } }, { "id": 456, "terms": { "en-GB": "Tattersalls Rule 4", "da": "Tattersalls regel 4", "mn": "\u0422\u0430\u0442\u0442\u0435\u0440\u0441\u0430\u043B\u0441\u044B\u043D 4-\u0440 \u0434\u04AF\u0440\u044D\u043C", "pt-BR": "regra Tattersalls 4", "ru": "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u2116 4 \u043A\u043E\u043C\u0438\u0442\u0435\u0442\u0430 Tattersalls", "es": "regla 4 de Tattersalls", "es-AR": "regla 4 de Tattersalls", "uk": "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u2116 4 \u043A\u043E\u043C\u0456\u0442\u0435\u0442\u0443 Tattersalls", "uz": "Tattersalls qo'mitasining 4-qoidasi", "uzb": "Tattersalls \u049B\u045E\u043C\u0438\u0442\u0430\u0441\u0438\u043D\u0438\u043D\u0433 4-\u049B\u043E\u0438\u0434\u0430\u0441\u0438" }, "notes": { "ru": "Translations should follow the English structure: Rule 4 - \u041F\u0440\u0430\u0432\u0438\u043B\u043E \u2116 4, Tattersalls Rule 4(c) - \u041F\u0440\u0430\u0432\u0438\u043B\u043E \u2116 4 (c) \u043A\u043E\u043C\u0438\u0442\u0435\u0442\u0430 Tattersalls", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 457, "terms": { "en-GB": "team", "az": "komanda", "da": "hold", "mn": "\u0431\u0430\u0433", "pt-BR": "time", "ru": "\u043A\u043E\u043C\u0430\u043D\u0434\u0430", "es": "equipo", "es-AR": "equipo", "uk": "\u043A\u043E\u043C\u0430\u043D\u0434\u0430", "uz": "jamoa", "uzb": "\u0436\u0430\u043C\u043E\u0430" } }, { "id": 458, "terms": { "en-GB": "technical knockout", "pt-BR": "nocaute t\xE9cnico", "ru": "\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043D\u043E\u043A\u0430\u0443\u0442", "es": "TKO", "es-AR": "TKO" }, "notes": { "pt-BR": "Boxing term." } }, { "id": 459, "terms": { "en-GB": "tennis", "az": "tennis", "da": "tennis", "mn": "\u0442\u0435\u043D\u043D\u0438\u0441", "pt-BR": "t\xEAnis", "ru": "\u0442\u0435\u043D\u043D\u0438\u0441", "es": "tenis", "es-AR": "tenis", "uk": "\u0442\u0435\u043D\u0456\u0441", "uz": "tennis", "uzb": "\u0442\u0435\u043D\u043D\u0438\u0441" } }, { "id": 460, "terms": { "en-GB": "terminal", "az": "terminal", "mn": "\u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B", "pt-BR": "terminal", "ru": "\u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B", "es": "terminal", "es-AR": "terminal", "uk": "\u0442\u0435\u0440\u043C\u0456\u043D\u0430\u043B", "uz": "terminal", "uzb": "\u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B" } }, { "id": 461, "terms": { "en-GB": "Terms and Conditions", "az": "\u015E\u0259rtl\u0259r v\u0259 Qaydalar", "da": "vilk\xE5r og betingelser", "mn": "\u041D\u04E9\u0445\u0446\u04E9\u043B \u0431\u0430 \u0411\u043E\u043B\u0437\u043E\u043B", "pt-BR": "Termos e Condi\xE7\xF5es", "ru": "\u043F\u0440\u0430\u0432\u0438\u043B\u0430", "es": "T\xE9rminos y Condiciones", "es-AR": "T\xE9rminos y Condiciones", "uk": "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u0442\u0430 \u0443\u043C\u043E\u0432\u0438", "uz": "shartlar va qoidalar", "uzb": "\u0448\u0430\u0440\u0442\u043B\u0430\u0440 \u0432\u0430 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440" }, "notes": { "da": "First letter is capitalised when referring to section.", "ru": "Non-capitalised unless used at the beginning of a sentence or as a section/document name", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 462, "terms": { "en-GB": "T&Cs", "az": "\u015E\u0259rtl\u0259r v\u0259 Qaydalar", "da": "V&B", "mn": "\u041D\u04E9\u0445\u0446\u04E9\u043B \u0431\u0430 \u0411\u043E\u043B\u0437\u043E\u043B", "pt-BR": "Termos e condi\xE7\xF5es", "ru": "\u043F\u0440\u0430\u0432\u0438\u043B\u0430", "es": "T\xE9rminos y Condiciones", "es-AR": "T\xE9rminos y Condiciones", "uk": "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u0442\u0430 \u0443\u043C\u043E\u0432\u0438", "uz": "shartlar va qoidalar", "uzb": "\u0448\u0430\u0440\u0442\u043B\u0430\u0440 \u0432\u0430 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440" }, "notes": { "da": 'Short for "vilk\xE5r og betingelser".', "ru": "Non-capitalised unless used at the beginning of a sentence or as a section/document name", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 463, "terms": { "en-GB": "ticket", "az": "bilet", "da": "kupon", "mn": "\u0442\u0430\u0441\u0430\u043B\u0431\u0430\u0440", "pt-BR": "bilhete", "ru": "\u043A\u0443\u043F\u043E\u043D", "es": "boleto", "es-AR": "boleto", "uk": "\u043A\u0443\u043F\u043E\u043D", "uz": "chipta", "uzb": "\u0447\u0438\u043F\u0442\u0430" }, "notes": { "ru": "used for Big Prize Draw via Loyalty;\xA0other Product-related promotions", "uk": "the term is used for Big Prize Draw campaigns via Loyalty", "uzb": "The term used for Superprize and Big Prize Draw and others." } }, { "id": 464, "terms": { "en-GB": "tie", "az": "b\u0259rab\u0259r hesab", "da": "uafgjort", "mn": "\u0445\u0430\u0439\u043D\u0446\u0430\u0445", "pt-BR": "tie", "ru": "\u0442\u0430\u0439", "es": "partido empatado", "es-AR": "partido empatado", "uk": "\u043D\u0456\u0447\u0438\u044F", "uz": "ochkolar bo'yicha durang", "uzb": "\u043E\u0447\u043A\u043E\u043B\u0430\u0440 \u0431\u045E\u0439\u0438\u0447\u0430 \u0434\u0443\u0440\u0430\u043D\u0433" }, "notes": { "es": "second term can be used in sports, where it's important to differentiate 'draw' from 'tie' (e.g. cricket)", "es-AR": "second term can be used in sports, where it's important to differentiate 'draw' from 'tie' (e.g. cricket)", "uz": "when we need to differentiate the 'tie' outcome from the 'draw' outcome (in sports like cricket)", "uzb": "when we need to differentiate the 'tie' outcome from the 'draw' outcome (in sports like cricket)" } }, { "id": 465, "terms": { "en-GB": "tie break", "da": "tiebreak", "mn": "\u0442\u0430\u0439-\u0431\u0440\u0435\u0439\u043A", "pt-BR": "tie-break", "ru": "\u0442\u0430\u0439-\u0431\u0440\u0435\u0439\u043A", "es": "tie-break", "es-AR": "tie-break", "uk": "\u0442\u0430\u0439-\u0431\u0440\u0435\u0439\u043A", "uz": "taybreyk", "uzb": "\u0442\u0430\u0439\u0431\u0440\u0435\u0439\u043A" } }, { "id": 466, "terms": { "en-GB": "time out", "da": "timeout", "pt-BR": "pausa", "ru": "\u0442\u0430\u0439\u043C-\u0430\u0443\u0442", "es": "periodo de pausa", "es-AR": "periodo de pausa" } }, { "id": 467, "terms": { "en-GB": "to be placed", "mn": "\u0431\u0430\u0439\u0440 \u044D\u0437\u043B\u044D\u0445", "pt-BR": "colocado", "ru": "\u0437\u0430\u0439\u043C\u0435\u0442 \u043C\u0435\u0441\u0442\u043E", "es": "se posiciona", "es-AR": "se posiciona", "uk": "\u043F\u043E\u0441\u044F\u0434\u0435 \u043C\u0456\u0441\u0446\u0435", "uz": "o'ringa bo'lgan", "uzb": "\u045E\u0440\u0438\u043D\u0433\u0430 \u0431\u045E\u043B\u0433\u0430\u043D" }, "notes": { "en-GB": "capitalised when market name" } }, { "id": 468, "terms": { "en-GB": "To Make/Miss the Cut", "da": "Klarer/Misser Cuttet", "mn": "\u0422\u0430\u0441\u0430\u043B\u0431\u0430\u0440 \u0445\u0438\u0439\u0445/\u0430\u043B\u0434\u0430\u0445", "pt-BR": "Passar/n\xE3o passar no corte", "ru": "\u041F\u0440\u043E\u0448\u0435\u043B \u043E\u0442\u0441\u0435\u0432 (cut)/\u041D\u0435 \u043F\u0440\u043E\u0448\u0435\u043B \u043E\u0442\u0441\u0435\u0432 (cut)", "es": "Pasa/No pasa el corte", "es-AR": "Pasa/No pasa el corte", "uk": "\u041F\u0440\u043E\u0439\u0448\u043E\u0432/\u043D\u0435 \u043F\u0440\u043E\u0439\u0448\u043E\u0432 \u0432\u0456\u0434\u0441\u0456\u0432 (cut)" }, "notes": { "en-GB": "capitalised when market name", "da": "All words capitalised when it's market name." } }, { "id": 469, "terms": { "en-GB": "Win from Behind", "mn": "\u041D\u044D\u0445\u044D\u043D \u0445\u043E\u0436\u0438\u0445", "pt-BR": "Ganha de virada", "ru": "\u0412\u043E\u043B\u0435\u0432\u0430\u044F \u043F\u043E\u0431\u0435\u0434\u0430", "es": "Gana despu\xE9s de ir perdiendo", "es-AR": "Gana despu\xE9s de ir perdiendo", "uk": "\u0412\u043E\u043B\u044C\u043E\u0432\u0430 \u043F\u0435\u0440\u0435\u043C\u043E\u0433\u0430", "uz": "irodali g'alaba qozonadi", "uzb": "\u0438\u0440\u043E\u0434\u0430\u043B\u0438 \u0493\u0430\u043B\u0430\u0431\u0430 \u049B\u043E\u0437\u043E\u043D\u0430\u0434\u0438" }, "notes": { "en-GB": "capitalised when market name", "pt-BR": "Meaning a team starts losing but ends up winning the match." } }, { "id": 470, "terms": { "en-GB": "total", "da": "i alt", "mn": "\u043D\u0438\u0439\u0442", "pt-BR": "total", "ru": "\u0442\u043E\u0442\u0430\u043B", "es": "total", "es-AR": "total", "uk": "\u0442\u043E\u0442\u0430\u043B", "uz": "total", "uzb": "\u0442\u043E\u0442\u0430\u043B" }, "notes": { "da": "All words capitalised when it's market name." } }, { "id": 471, "terms": { "en-GB": "total price", "az": "toplam \u0259msal", "da": "samlede odds", "mn": "\u043D\u0438\u0439\u0442 \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "odds totais", "ru": "\u0438\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442", "es": "cuota total", "es-AR": "cuota total", "uk": "\u043F\u0456\u0434\u0441\u0443\u043C\u043A\u043E\u0432\u0438\u0439 \u043A\u043E\u0435\u0444\u0456\u0446\u0456\u0454\u043D\u0442", "uz": "umumiy koeffitsiyent", "uzb": "\u0443\u043C\u0443\u043C\u0438\u0439 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442" } }, { "id": 472, "terms": { "en-GB": "total stake", "az": "toplam m\u0259rc", "da": "samlet indsats", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u043D\u0438\u0439\u0442 \u0434\u04AF\u043D", "pt-BR": "valor total da aposta", "ru": "\u043E\u0431\u0449\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u043F\u0430\u0440\u0438", "es": "importe total", "es-AR": "importe total", "uk": "\u0437\u0430\u0433\u0430\u043B\u044C\u043D\u0430 \u0441\u0443\u043C\u0430 \u0441\u0442\u0430\u0432\u043A\u0438", "uz": "jami stavka summasi", "uzb": "\u0436\u0430\u043C\u0438 \u0441\u0442\u0430\u0432\u043A\u0430 \u0441\u0443\u043C\u043C\u0430\u0441\u0438" }, "notes": { "ru": "for .RU" } }, { "id": 473, "terms": { "en-GB": "Toto", "az": "Toto", "mn": "\u0422\u043E\u0442\u043E", "pt-BR": "Toto", "ru": "\u0422\u043E\u0442\u043E", "es": "Toto", "es-AR": "Toto", "uk": "\u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440", "uz": "Toto", "uzb": "\u0422\u043E\u0442\u043E" }, "notes": { "ru": "Capitalised because it's a product/section name", "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 474, "terms": { "en-GB": "Toto 1X2", "az": "Toto 1X2", "mn": "\u0422\u043E\u0442\u043E 1X2", "pt-BR": "Toto 1X2", "ru": "\u0442\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \xAB1X2\xBB", "es": "Toto 1X2", "es-AR": "Toto 1X2", "uk": "\u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440 \xAB1X2\xBB", "uz": "Toto \xAB1X2\xBB", "uzb": "\u0422\u043E\u0442\u043E \xAB1X2\xBB" } }, { "id": 475, "terms": { "en-GB": "Toto Correct Score", "az": "Toto D\xFCzg\xFCn Xal", "pt-BR": "Placar correto de Toto", "ru": "\u0442\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \xAB\u0422\u043E\u0447\u043D\u044B\u0439 \u0441\u0447\u0435\u0442\xBB", "es": "Marcador final de Toto", "es-AR": "Marcador final de Toto", "uk": "\u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440 \xAB\u0422\u043E\u0447\u043D\u0438\u0439 \u0440\u0430\u0445\u0443\u043D\u043E\u043A\xBB", "uz": "Toto \xABTo'g'ri hisob\xBB", "uzb": "\u0422\u043E\u0442\u043E \xAB\u0422\u045E\u0493\u0440\u0438 \u04B3\u0438\u0441\u043E\u0431\xBB" } }, { "id": 476, "terms": { "en-GB": "Toto game", "az": "Toto oyun", "mn": "\u0422\u043E\u0442\u043E \u0437\u04E9\u0432 \u043E\u043D\u043E\u043E", "pt-BR": "Jogo de Toto", "ru": "\u0442\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \xAB\u0422\u043E\u0447\u043D\u044B\u0439 \u0441\u0447\u0435\u0442\xBB", "es": "juego de Toto", "es-AR": "juego de Toto", "uk": "\u0442\u0438\u0440\u0430\u0436", "uz": "tiraj", "uzb": "\u0442\u0438\u0440\u0430\u0436" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 477, "terms": { "en-GB": "Toto Pool", "mn": "\u0422\u043E\u0442\u043E \u0441\u0430\u043D", "pt-BR": "Bol\xE3o do Toto", "ru": "\u043F\u0443\u043B", "es": "bote de Toto", "es-AR": "bote de Toto", "uk": "\u043F\u0443\u043B", "uz": "Toto pul", "uzb": "\u0422\u043E\u0442\u043E \u043F\u0443\u043B" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 478, "terms": { "en-GB": "Toto Prize Pool", "az": "Toto m\xFCkafat fondu", "mn": "\u0422\u043E\u0442\u043E \u0448\u0430\u0433\u043D\u0430\u043B\u044B\u043D \u0441\u0430\u043D", "pt-BR": "bol\xE3o de pr\xEAmios do Toto", "ru": "\u043F\u0440\u0438\u0437\u043E\u0432\u043E\u0439 \u0444\u043E\u043D\u0434", "es": "bote premio de Toto", "es-AR": "bote premio de Toto", "uk": "\u043F\u0440\u0438\u0437\u043E\u0432\u0438\u0439 \u0444\u043E\u043D\u0434 \u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440\u0430", "uz": "Toto mukofot jamg'armasi", "uzb": "\u0422\u043E\u0442\u043E \u043C\u0443\u043A\u043E\u0444\u043E\u0442 \u0436\u0430\u043C\u0493\u0430\u0440\u043C\u0430\u0441\u0438" }, "notes": { "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 479, "terms": { "en-GB": "Toto Results", "mn": "\u0422\u043E\u0442\u043E \u04AF\u0440 \u0434\u04AF\u043D", "pt-BR": "resultados do Toto", "ru": "\u0418\u0442\u043E\u0433\u0438 \u0442\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440\u0430", "es": "Resultados de Toto", "es-AR": "Resultados de Toto", "uk": "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438 \u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440\u0430", "uz": "Toto natijalari", "uzb": "T\u043E\u0442\u043E \u043D\u0430\u0442\u0438\u0436\u0430\u043B\u0430\u0440\u0438" }, "notes": { "ru": '"\u0418\u0442\u043E\u0433\u0438" is capitalised if the phrase is used as a button/section name or at the beginning of a sentence', "uk": '"\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438" is capitalised if the phrase is used as a button/section name or at the beginning of a sentence', "uz": "First letter in Capital", "uzb": "First letter in Capital" } }, { "id": 480, "terms": { "en-GB": "Toto Rules", "az": "Toto qaydalar\u0131", "mn": "\u0422\u043E\u0442\u043E \u0434\u04AF\u0440\u043C\u0438\u0439\u043D", "pt-BR": "regras do Toto", "ru": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0422\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440\u0430", "es": "reglas de Toto", "es-AR": "reglas de Toto", "uk": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0422\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440\u0430", "uz": "Toto qoidalari", "uzb": "\u0422\u043E\u0442\u043E \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440\u0438" }, "notes": { "mn": "mind the capitalisation", "ru": "mind the capitalisation", "uk": "mind the capitalisation" } }, { "id": 481, "terms": { "en-GB": "Toto Tennis", "az": "Toto Tennis", "mn": "\u0422\u043E\u0442\u043E \u0442\u0435\u043D\u043D\u0438\u0441", "pt-BR": "Toto t\xEAnis", "ru": "\u0442\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \xAB\u0422\u0435\u043D\u043D\u0438\u0441\xBB", "es": "Tenis Toto", "es-AR": "Tenis Toto", "uk": "\u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440 \xAB\u0422\u0435\u043D\u0456\u0441\xBB", "uz": "Toto \xABTennis\xBB", "uzb": "\u0422\u043E\u0442\u043E \xAB\u0422\u0435\u043D\u043D\u0438\u0441\xBB" } }, { "id": 482, "terms": { "en-GB": "Touch ID", "az": "Touch ID", "da": "Touch ID", "mn": "Touch ID", "pt-BR": "Touch ID", "ru": "Touch ID", "es": "Touch ID", "es-AR": "Touch ID", "uk": "Touch ID", "uz": "Touch ID", "uzb": "Touch ID" } }, { "id": 483, "terms": { "en-GB": "touchdown", "az": "ta\xE7daun", "da": "touchdown", "mn": "\u0442\u0430\u0447\u0434\u0430\u0443\u043D", "pt-BR": "touchdown", "ru": "\u0442\u0430\u0447\u0434\u0430\u0443\u043D", "es": "ensayo", "es-AR": "ensayo", "uk": "\u0442\u0430\u0447\u0434\u0430\u0443\u043D", "uz": "tachdaun", "uzb": "\u0442\u0430\u0447\u0434\u0430\u0443\u043D" } }, { "id": 484, "terms": { "en-GB": "tournament", "az": "turnir", "da": "turnering", "pt-BR": "torneio", "ru": "\u0442\u0443\u0440\u043D\u0438\u0440", "es": "torneo", "es-AR": "torneo", "uz": "turnir", "uzb": "\u0442\u0443\u0440\u043D\u0438\u0440" } }, { "id": 485, "terms": { "en-GB": "track", "da": "bane", "pt-BR": "pista", "ru": "\u0442\u0440\u0435\u043A", "es": "pista", "es-AR": "pista", "uz": "iz", "uzb": "\u0438\u0437" } }, { "id": 486, "terms": { "en-GB": "trainer", "da": "tr\xE6ner", "pt-BR": "treinador", "ru": "\u0442\u0440\u0435\u043D\u0435\u0440", "es": "entrenador", "es-AR": "entrenador", "uz": "trener", "uzb": "\u0442\u0440\u0435\u043D\u0435\u0440" } }, { "id": 487, "terms": { "en-GB": "transaction", "az": "\u0259m\u0259liyyat", "da": "transaktion", "mn": "\u0433\u04AF\u0439\u043B\u0433\u044D\u044D", "pt-BR": "transa\xE7\xE3o", "ru": "\u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F", "es": "transacci\xF3n", "es-AR": "transacci\xF3n", "uk": "\u043E\u043F\u0435\u0440\u0430\u0446\u0456\u044F", "uz": "tranzaksiya", "uzb": "\u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F" } }, { "id": 488, "terms": { "en-GB": "transfer", "da": "overf\xF8rsel", "mn": "\u0448\u0438\u043B\u0436\u04AF\u04AF\u043B\u044D\u0433", "pt-BR": "transfer\xEAncia", "ru": "\u043F\u0435\u0440\u0435\u0432\u043E\u0434", "es": "transferencia", "es-AR": "transferencia", "uk": "\u043F\u0435\u0440\u0435\u043A\u0430\u0437", "uz": "o'tkazmoq", "uzb": "\u045E\u0442\u043A\u0430\u0437\u043C\u043E\u049B" }, "notes": { "uk": "(\u043A\u043E\u0448\u0442\u0456\u0432)" } }, { "id": 489, "terms": { "en-GB": "trap", "az": "trap", "da": "startboks", "mn": "\u0442\u043E\u0440", "pt-BR": "trap", "ru": "\u0431\u043E\u043A\u0441", "es": "trampilla", "es-AR": "trampilla", "uk": "\u0431\u043E\u043A\u0441", "uz": "tuzoq", "uzb": "\u0442\u0443\u0437\u043E\u049B" } }, { "id": 490, "terms": { "en-GB": "trap number", "da": "startboks", "mn": "\u0442\u043E\u0440\u043D\u044B \u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "n\xFAmero da trap", "ru": "\u043D\u043E\u043C\u0435\u0440 \u0431\u043E\u043A\u0441\u0430", "es": "n\xFAmero de caj\xF3n", "es-AR": "n\xFAmero de caj\xF3n", "uk": "\u043D\u043E\u043C\u0435\u0440 \u0431\u043E\u043A\u0441\u0443", "uz": "qafas raqami", "uzb": "\u049B\u0430\u0444\u0430\u0441 \u0440\u0430\u049B\u0430\u043C\u0438" } }, { "id": 491, "terms": { "en-GB": "treble", "az": "trebl", "da": "treble", "mn": "\u0433\u0443\u0440\u0432\u0430\u043B", "pt-BR": "tripla", "ru": "\xAB\u0442\u0440\u043E\u0439\u043D\u0438\u043A\xBB", "es": "triple", "es-AR": "triple", "uk": "\xAB\u0442\u0440\u0456\u0439\u043D\u0438\u043A\xBB", "uz": "uchtalik", "uzb": "\u0443\u0447\u0442\u0430\u043B\u0438\u043A" } }, { "id": 492, "terms": { "en-GB": "tricast", "az": "\xFC\xE7l\xFC proqnoz", "mn": "\u0442\u0440\u0438\u043A\u0430\u0441\u0442 \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "Tricast", "ru": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u0442\u0440\u043E\u0439\u043A\u0443", "es": "pron\xF3stico triple", "es-AR": "pron\xF3stico triple", "uk": "\u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430 \u0442\u0440\u0456\u0439\u043A\u0443", "uz": "uchtalik prognoz", "uzb": "\u0443\u0447\u0442\u0430\u043B\u0438\u043A \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 493, "terms": { "en-GB": "triple-double", "da": "triple/double", "mn": "\u0442\u0440\u0438\u043F\u043B\u044C-\u0434\u0430\u0431\u043B\u044C", "pt-BR": "triplo-duplo", "ru": "\u0442\u0440\u0438\u043F\u043B-\u0434\u0430\u0431\u043B", "es": "triple-doble", "es-AR": "triple-doble", "uk": "\u0442\u0440\u0438\u043F\u043B-\u0434\u0430\u0431\u043B", "uz": "tripl-dabl", "uzb": "\u0442\u0440\u0438\u043F\u043B-\u0434\u0430\u0431\u043B" } }, { "id": 494, "terms": { "en-GB": "Trixie", "az": "Triksi", "da": "Trixie", "mn": "\u0442\u0440\u0438\u043A\u0441\u0438", "pt-BR": "Trixie", "ru": "\u0442\u0440\u0438\u043A\u0441\u0438", "es": "Trixie", "es-AR": "Trixie", "uk": "\u0442\u0440\u0456\u043A\u0441\u0456", "uz": "triksi", "uzb": "\u0442\u0440\u0438\u043A\u0441\u0438" } }, { "id": 495, "terms": { "en-GB": "tryscorer", "az": "c\u0259hd", "da": "tryscorer", "mn": "\u043E\u043D\u043E\u043E \u0430\u0432\u0441\u0430\u043D \u0442\u043E\u0433\u043B\u043E\u0433\u0447", "pt-BR": "marcador de try", "ru": "\u0430\u0432\u0442\u043E\u0440 \u043F\u043E\u043F\u044B\u0442\u043A\u0438", "es": "anotador de ensayo", "es-AR": "anotador de ensayo", "uk": "\u0430\u0432\u0442\u043E\u0440 \u043F\u0435\u0440\u0448\u043E\u0457 \u0441\u043F\u0440\u043E\u0431\u0438", "uz": "urinish bombardirlari", "uzb": "\u0443\u0440\u0438\u043D\u0438\u0448 \u0431\u043E\u043C\u0431\u0430\u0440\u0434\u0438\u0440\u043B\u0430\u0440\u0438" } }, { "id": 496, "terms": { "en-GB": "turn over", "az": "m\u0259rc \xFC\xE7\xFCn istifad\u0259 etm\u0259k", "da": "gennemspille", "mn": "\u043D\u04E9\u0445\u04E9\u043D \u0445\u043E\u0436\u0438\u0445", "pt-BR": "utilizar", "ru": "\u043E\u0442\u044B\u0433\u0440\u0430\u0442\u044C \u0441\u0443\u043C\u043C\u0443", "es": "cumplir el requisito", "es-AR": "cumplir el requisito", "uk": "\u0432\u0456\u0434\u0456\u0433\u0440\u0430\u0442\u0438", "uz": "qayta qozoning", "uzb": "\u049B\u0430\u0439\u0442\u0430 \u049B\u043E\u0437\u043E\u043D\u0438\u043D\u0433" }, "notes": { "en-GB": "as verb" } }, { "id": 497, "terms": { "en-GB": "turnover", "az": "d\xF6vriyy\u0259", "da": "gennemspil", "mn": "\u044D\u0440\u0433\u044D\u043B\u0442", "pt-BR": "volume de apostas", "ru": "\u043E\u0442\u044B\u0433\u0440\u044B\u0448", "es": "desbloqueo", "es-AR": "desbloqueo", "uk": "\u043E\u0431\u043E\u0440\u043E\u0442", "uz": "qayta qozonish", "uzb": "\u049B\u0430\u0439\u0442\u0430 \u049B\u043E\u0437\u043E\u043D\u0438\u0448" }, "notes": { "en-GB": "as noun", "pt-BR": "keeping \u2018turnover\u2019 between bracket in the first instance of the word in the document", "uk": "possible option if we have '\u043E\u0431\u043E\u0440\u043E\u0442' in Russian" } }, { "id": 498, "terms": { "en-GB": "turnover requirement", "az": "d\xF6vriyy\u0259 t\u0259l\u0259bi", "es": "requisito de volumen de apuestas", "es-AR": "requisito de volumen de apuestas", "uz": "qayta qozonish shartlari", "uzb": "\u049B\u0430\u0439\u0442\u0430 \u049B\u043E\u0437\u043E\u043D\u0438\u0448 \u0448\u0430\u0440\u0442\u043B\u0430\u0440\u0438" } }, { "id": 499, "terms": { "en-GB": "UFC", "pt-BR": "UFC", "ru": "UFC", "es": "UFC", "es-AR": "UFC", "uz": "UFC", "uzb": "UFC" } }, { "id": 500, "terms": { "en-GB": "under", "az": "alt", "da": "under", "mn": "\u0434\u043E\u043E\u0433\u0443\u0443\u0440", "pt-BR": "menos de", "ru": "\u043C\u0435\u043D\u044C\u0448\u0435", "es": "menos de", "es-AR": "menos de", "uk": "\u043C\u0435\u043D\u0448\u0435", "uz": "kam", "uzb": "\u043A\u0430\u043C" }, "notes": { "az": "main term for markets; depending on the context can be also 'az', 'a\u015Fa\u011F\u0131' in full phrases and sentences.", "uz": "In the context of markets, e.g. Total Under {1} = Total {1} dan kam", "uzb": "In the context of markets, e.g. Total Under {1} = \u0422\u043E\u0442\u0430\u043B {1} \u0434\u0430\u043D \u043A\u0430\u043C" } }, { "id": 501, "terms": { "en-GB": "unsettled", "az": "hesablanmam\u0131\u015F", "da": "ikke afgjort", "mn": "\u0448\u0438\u0439\u0434\u044D\u0433\u0434\u044D\u044D\u0433\u04AF\u0439", "pt-BR": "por liquidar", "ru": "\u043D\u0435\u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u043D\u0430\u044F", "es": "pendiente de liquidar", "es-AR": "pendiente de liquidar", "uk": "\u043D\u0435\u0440\u043E\u0437\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u0456", "uz": "hisoblanmagan", "uzb": "\u04B3\u0438\u0441\u043E\u0431\u043B\u0430\u043D\u043C\u0430\u0433\u0430\u043D" } }, { "id": 502, "terms": { "en-GB": "Upload Documents", "az": "S\u0259n\u0259dl\u0259ri Y\xFCkl\u0259", "da": "Upload dokumenter", "mn": "\u0411\u0430\u0440\u0438\u043C\u0442 \u0431\u0438\u0447\u0438\u0433 \u0438\u043B\u0433\u044D\u044D\u0445", "pt-BR": "Carregar documentos", "ru": "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B", "es": "Cargar documentos", "es-AR": "Cargar documentos", "uk": "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0438", "uz": "hujjatlarni yuklash", "uzb": "\u04B3\u0443\u0436\u0436\u0430\u0442\u043B\u0430\u0440\u043D\u0438 \u044E\u043A\u043B\u0430\u0448" }, "notes": { "en-GB": "Capitalised as button name", "ru": '"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430" is capitalised if the phrase is used as a button/feature name or at the beginning of a sentence~as the name of a web page', "uk": "Capitalised as shown as UI element/button", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 503, "terms": { "en-GB": "user", "az": "istifad\u0259\xE7i", "da": "bruger", "mn": "\u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447", "pt-BR": "usu\xE1rio", "ru": "\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C", "es": "usuario", "es-AR": "usuario", "uk": "\u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447", "uz": "foydalanuvchi", "uzb": "\u0444\u043E\u0439\u0434\u0430\u043B\u0430\u043D\u0443\u0432\u0447\u0438" }, "notes": { "es": "Help section related texts", "es-AR": "Help section related texts" } }, { "id": 504, "terms": { "en-GB": "user account", "es": "registro de usuario", "es-AR": "registro de usuario" } }, { "id": 505, "terms": { "en-GB": "username", "az": "istifad\u0259\xE7i ad\u0131", "da": "brugernavn", "mn": "\u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u043D\u044D\u0440", "pt-BR": "nome de usu\xE1rio", "ru": "\u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F", "es": "nombre de usuario", "es-AR": "nombre de usuario", "uk": "\u0456\u043C'\u044F \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430", "uz": "foydalanuvchi nomi", "uzb": "\u0444\u043E\u0439\u0434\u0430\u043B\u0430\u043D\u0443\u0432\u0447\u0438 \u043D\u043E\u043C\u0438" } }, { "id": 506, "terms": { "en-GB": "value", "az": "d\u0259y\u0259r", "da": "v\xE6rdi", "pt-BR": "valor", "ru": "\u0441\u0443\u043C\u043C\u0430", "es": "valor", "es-AR": "valor", "uk": "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F", "uz": "qiymat", "uzb": "\u049B\u0438\u0439\u043C\u0430\u0442" } }, { "id": 507, "terms": { "en-GB": "verification", "az": "t\u0259sdiq", "da": "bekr\xE6ftelse", "mn": "\u0431\u0430\u0442\u0430\u043B\u0433\u0430\u0430\u0436\u0443\u0443\u043B\u0430\u043B\u0442", "pt-BR": "verifica\xE7\xE3o", "ru": "\u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F", "es": "verificaci\xF3n", "es-AR": "verificaci\xF3n", "uk": "\u043F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0430", "uz": "tasdiqlash", "uzb": "\u0442\u0430\u0441\u0434\u0438\u049B\u043B\u0430\u0448" }, "notes": { "uz": "referring to things like CAPTCHA, confirming an operation, contact details etc.", "uzb": "referring to things like CAPTCHA, confirming an operation, contact details etc." } }, { "id": 508, "terms": { "en-GB": "verification code", "az": "t\u0259sdiq kodu", "da": "bekr\xE6ftelseskode", "mn": "\u043D\u044D\u0432\u0442\u0440\u044D\u0445 \u043A\u043E\u0434", "pt-BR": "c\xF3digo de verifica\xE7\xE3o", "ru": "\u043F\u0440\u043E\u0432\u0435\u0440\u043E\u0447\u043D\u044B\u0439 \u043A\u043E\u0434", "es": "c\xF3digo de verificaci\xF3n", "es-AR": "c\xF3digo de verificaci\xF3n", "uk": "\u043F\u0435\u0440\u0435\u0432\u0456\u0440\u043E\u0447\u043D\u0438\u0439 \u043A\u043E\u0434", "uz": "tasdiqlash kodi", "uzb": "\u0442\u0430\u0441\u0434\u0438\u049B\u043B\u0430\u0448 \u043A\u043E\u0434\u0438" } }, { "id": 509, "terms": { "en-GB": "VIP", "az": "V\u0130P", "da": "VIP", "mn": "VIP", "pt-BR": "VIP", "ru": "VIP", "es": "VIP", "es-AR": "VIP", "uk": "VIP", "uz": "VIP", "uzb": "VIP" } }, { "id": 510, "terms": { "en-GB": "VIP account", "az": "V\u0130P hesab", "mn": "VIP \u0434\u0430\u043D\u0441", "pt-BR": "conta VIP", "ru": "VIP-\u0441\u0447\u0435\u0442", "es": "cuenta VIP", "es-AR": "cuenta VIP", "uk": "VIP-\u0440\u0430\u0445\u0443\u043D\u043E\u043A", "uz": "VIP-hisob", "uzb": "VIP-\u04B3\u0438\u0441\u043E\u0431" } }, { "id": 511, "terms": { "en-GB": "VIP bet", "az": "V\u0130P m\u0259rc", "da": "VIP-v\xE6ddem\xE5l", "mn": "VIP \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta VIP", "ru": "VIP-\u043F\u0430\u0440\u0438", "es": "apuesta VIP", "es-AR": "apuesta VIP", "uk": "VIP-\u0441\u0442\u0430\u0432\u043A\u0430", "uz": "VIP stavka", "uzb": "VIP \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 512, "terms": { "en-GB": "VIP Cashback", "mn": "VIP Cashback", "pt-BR": "Cashback VIP", "ru": "VIP Cashback", "es": "Cashback VIP", "es-AR": "Cashback VIP", "uk": "VIP Cashback", "uz": "VIP Cashback", "uzb": "VIP Cashback" } }, { "id": 513, "terms": { "en-GB": "VIP Club", "az": "V\u0130P klub", "mn": "VIP \u041A\u043B\u0443\u0431", "pt-BR": "Clube VIP", "ru": "VIP \u041A\u043B\u0443\u0431", "es": "Club VIP", "es-AR": "Club VIP", "uk": "VIP \u041A\u043B\u0443\u0431", "uz": "VIP Klub", "uzb": "VIP \u041A\u043B\u0443\u0431" } }, { "id": 514, "terms": { "en-GB": "VIP Club Member", "az": "V\u0130P klub \xFCzvl\u0259ri", "mn": "VIP \u041A\u043B\u0443\u0431\u044B\u043D \u0413\u0438\u0448\u04AF\u04AF\u043D", "pt-BR": "membro do Clube VIP", "ru": "\u0423\u0447\u0430\u0441\u0442\u043D\u0438\u043A VIP \u041A\u043B\u0443\u0431\u0430", "es": "miembro del Club VIP", "es-AR": "miembro del Club VIP", "uk": "\u0423\u0447\u0430\u0441\u043D\u0438\u043A VIP \u041A\u043B\u0443\u0431\u0443", "uz": "VIP Klub a'zosi", "uzb": "VIP \u041A\u043B\u0443\u0431 \u0430\u044A\u0437\u043E\u0441\u0438" } }, { "id": 515, "terms": { "en-GB": "VIP Club Membership", "az": "V\u0130P klub \xFCzvl\xFCy\xFC", "mn": "VIP \u041A\u043B\u0443\u0431\u044B\u043D \u0413\u0438\u0448\u04AF\u04AF\u043D\u0447\u043B\u044D\u043B", "pt-BR": "ades\xE3o ao Clube VIP", "ru": "\u0423\u0447\u0430\u0441\u0442\u0438\u0435 \u0432 VIP \u041A\u043B\u0443\u0431\u0435", "es": "condici\xF3n de miembro del Club VIP", "es-AR": "condici\xF3n de miembro del Club VIP", "uk": "\u0423\u0447\u0430\u0441\u0442\u044C \u0443 VIP \u041A\u043B\u0443\u0431\u0456", "uz": "VIP Klub a'zoligi", "uzb": "VIP \u041A\u043B\u0443\u0431 \u0430\u044A\u0437\u043E\u043B\u0438\u0433\u0438" } }, { "id": 516, "terms": { "en-GB": "VIP status", "az": "V\u0130P status", "mn": "VIP \u0441\u0442\u0430\u0442\u0443\u0441", "pt-BR": "status VIP", "ru": "VIP-\u0441\u0442\u0430\u0442\u0443\u0441", "es": "estado VIP", "es-AR": "estado VIP", "uk": "VIP-\u0441\u0442\u0430\u0442\u0443\u0441", "uz": "VIP-daraja", "uzb": "VIP-\u0434\u0430\u0440\u0430\u0436\u0430" } }, { "id": 517, "terms": { "en-GB": "Visa", "da": "Visa", "mn": "Visa", "pt-BR": "Visa", "ru": "Visa", "es": "Visa", "es-AR": "Visa", "uk": "Visa", "uz": "Visa", "uzb": "Visa" } }, { "id": 518, "terms": { "en-GB": "void", "az": "l\u0259\u011Fv/etibars\u0131z", "da": "annulleret", "mn": "\u0446\u0443\u0446\u043B\u0430\u0433\u0434\u0441\u0430\u043D", "pt-BR": "anulado", "ru": "\u043E\u0442\u043C\u0435\u043D\u0435\u043D\u043D\u0430\u044F", "es": "anulada", "es-AR": "anulada", "uk": "\u0430\u043D\u0443\u043B\u044E\u044E\u0442\u044C\u0441\u044F", "uz": "bekor qilingan", "uzb": "\u0431\u0435\u043A\u043E\u0440 \u049B\u0438\u043B\u0438\u043D\u0433\u0430\u043D" } }, { "id": 519, "terms": { "en-GB": "volleyball", "az": "voleybol", "da": "volleyball", "mn": "\u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B", "pt-BR": "v\xF4lei", "ru": "\u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B", "es": "voleibol", "es-AR": "voleibol", "uk": "\u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B", "uz": "voleybol", "uzb": "\u0432\u043E\u043B\u0435\u0439\u0431\u043E\u043B" } }, { "id": 520, "terms": { "en-GB": "voucher", "az": "vau\xE7er", "da": "voucher", "mn": "\u0432\u0430\u0443\u0447\u0435\u0440", "pt-BR": "cupom", "ru": "\u0432\u0430\u0443\u0447\u0435\u0440", "es": "vale", "es-AR": "vale", "uk": "\u0432\u0430\u0443\u0447\u0435\u0440", "uz": "vaucher", "uzb": "\u0432\u0430\u0443\u0447\u0435\u0440" } }, { "id": 521, "terms": { "en-GB": "wager", "az": "m\u0259rc", "da": "indsats", "mn": "\u0431\u043E\u043E\u0446\u043E\u043E \u0442\u0430\u0432\u0438\u0445", "pt-BR": "valor da aposta", "ru": "\u043E\u0442\u044B\u0433\u0440\u0430\u0442\u044C", "es": "apostar", "es-AR": "apostar", "uk": "\u0432\u0456\u0434\u0456\u0433\u0440\u0430\u0432\u0430\u0442\u0438", "uz": "stavka qo'ying", "uzb": "\u0441\u0442\u0430\u0432\u043A\u0430 \u049B\u045E\u0439\u0438\u043D\u0433" }, "notes": { "ru": "(verb) Choice of translation depends on the structure of the sentence.", "es": "verb", "es-AR": "verb", "uz": "verb", "uzb": "verb" } }, { "id": 522, "terms": { "en-GB": "wallet", "az": "pulqab\u0131", "da": "E-wallet", "mn": "\u0445\u044D\u0442\u044D\u0432\u0447", "pt-BR": "carteira", "ru": "\u043A\u043E\u0448\u0435\u043B\u0435\u043A", "es": "monedero", "es-AR": "billetera", "uk": "\u0433\u0430\u043C\u0430\u043D\u0435\u0446\u044C", "uz": "hamyon", "uzb": "\u04B3\u0430\u043C\u0451\u043D" }, "notes": { "da": "An\xA0electronic device,\xA0online service, or\xA0software program\xA0that allows one party to make\xA0electronic transactions." } }, { "id": 523, "terms": { "en-GB": "wallet number", "da": "E-wallet nummer", "mn": "\u0445\u044D\u0442\u044D\u0432\u0447\u043D\u0438\u0439 \u0434\u0443\u0433\u0430\u0430\u0440", "pt-BR": "n\xFAmero da carteira", "ru": "\u043D\u043E\u043C\u0435\u0440 \u043A\u043E\u0448\u0435\u043B\u044C\u043A\u0430", "es": "n\xFAmero de monedero", "es-AR": "n\xFAmero de billetera", "uk": "\u043D\u043E\u043C\u0435\u0440 \u0433\u0430\u043C\u0430\u043D\u0446\u044F", "uz": "hamyon raqami", "uzb": "\u04B3\u0430\u043C\u0451\u043D \u0440\u0430\u049B\u0430\u043C\u0438" } }, { "id": 524, "terms": { "en-GB": "water polo", "da": "vandpolo", "mn": "\u0443\u0441\u0430\u043D \u043F\u043E\u043B\u043E", "pt-BR": "polo aqu\xE1tico", "ru": "\u0432\u043E\u0434\u043D\u043E\u0435 \u043F\u043E\u043B\u043E", "es": "waterpolo", "es-AR": "waterpolo", "uk": "\u0432\u043E\u0434\u043D\u0435 \u043F\u043E\u043B\u043E", "uz": "suv polosi", "uzb": "\u0441\u0443\u0432 \u043F\u043E\u043B\u043E\u0441\u0438" } }, { "id": 525, "terms": { "en-GB": "website", "az": "veb-sayt", "da": "side", "mn": "\u0441\u0430\u0439\u0442", "pt-BR": "website", "ru": "\u0441\u0430\u0439\u0442", "es": "sitio web", "es-AR": "sitio web", "uk": "\u0441\u0430\u0439\u0442", "uz": "veb-sayt", "uzb": "\u0432\u0435\u0431-\u0441\u0430\u0439\u0442" }, "notes": { "mn": "additional translation", "pt-BR": "option to avoid repetitions" } }, { "id": 526, "terms": { "en-GB": "site", "da": "side", "mn": "\u0441\u0430\u0439\u0442", "pt-BR": "website", "ru": "\u0441\u0430\u0439\u0442", "es": "sitio web", "es-AR": "sitio web", "uk": "\u0441\u0430\u0439\u0442", "uz": "sayt", "uzb": "\u0441\u0430\u0439\u0442" }, "notes": { "mn": "additional translation", "pt-BR": "option to avoid repetitions" } }, { "id": 527, "terms": { "en-GB": "Weekly Deposit Limit", "az": "h\u0259ft\u0259lik depozit limiti", "da": "ugentlig indbetalingsgr\xE6nse", "mn": "\u043C\u04E9\u043D\u0433\u04E9 \u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0430\u043B\u0442\u044B\u043D \u0434\u043E\u043B\u043E\u043E \u0445\u043E\u043D\u043E\u0433\u0438\u0439 \u0445\u044F\u0437\u0433\u0430\u0430\u0440", "pt-BR": "limite de dep\xF3sito semanal", "ru": "\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "es": "l\xEDmite de dep\xF3sito semanal", "es-AR": "l\xEDmite de dep\xF3sito semanal", "uk": "\u0442\u0438\u0436\u043D\u0435\u0432\u0435 \u043E\u0431\u043C\u0435\u0436\u0435\u043D\u043D\u044F \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", "uz": "haftalik depozit limiti", "uzb": "\u04B3\u0430\u0444\u0442\u0430\u043B\u0438\u043A \u0434\u0435\u043F\u043E\u0437\u0438\u0442 \u043B\u0438\u043C\u0438\u0442\u0438" } }, { "id": 528, "terms": { "en-GB": "Welcome Bonus", "az": "Salamlama Bonusu", "da": "Velkomstbonus", "mn": "\u0422\u0430\u0432\u0442\u0430\u0439 \u043C\u043E\u0440\u0438\u043B\u043D\u043E \u0443\u0443 \u0411\u043E\u043D\u0443\u0441", "pt-BR": "B\xF4nus de Boas-Vindas", "ru": "\u043F\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0431\u043E\u043D\u0443\u0441", "es": "Bono de Bienvenida", "es-AR": "Bono de Bienvenida", "uk": "\u0441\u0442\u0430\u0440\u0442\u043E\u0432\u0438\u0439 \u0431\u043E\u043D\u0443\u0441", "uz": '"Xush kelibsiz" bonusi', "uzb": "\xAB\u0425\u0443\u0448 \u043A\u0435\u043B\u0438\u0431\u0441\u0438\u0437\xBB \u0431\u043E\u043D\u0443\u0441\u0438" } }, { "id": 529, "terms": { "en-GB": "wicket", "az": "viket", "da": "g\xE6rde", "mn": "\u0445\u0430\u0430\u043B\u0433\u0430", "pt-BR": "wicket", "ru": "\u043A\u0430\u043B\u0438\u0442\u043A\u0430", "es": "wicket", "es-AR": "wicket", "uk": "\u0432\u043E\u0440\u0456\u0442\u0446\u044F", "uz": "viket", "uzb": "\u0432\u0438\u043A\u0435\u0442" } }, { "id": 530, "terms": { "en-GB": "Win to Nil", "da": "Vinder Med Rent M\xE5l", "mn": "\u0422\u044D\u0433\u044D\u044D\u0440 \u043D\u044C \u0445\u043E\u0436\u0438\u0445", "pt-BR": "Ganha sem sofrer gols", "ru": "\u041F\u043E\u0431\u0435\u0434\u0430 \xAB\u0432\u0441\u0443\u0445\u0443\u044E\xBB", "es": "Gana a cero", "es-AR": "Gana a cero", "uk": "\u041F\u0435\u0440\u0435\u043C\u043E\u0433\u0430 \u0456\u0437 \u0441\u0443\u0445\u0438\u043C \u0440\u0430\u0445\u0443\u043D\u043A\u043E\u043C", "uz": "Quruq hisob bilan g'alaba qozonadi", "uzb": "\u049A\u0443\u0440\u0443\u049B \u04B3\u0438\u0441\u043E\u0431 \u0431\u0438\u043B\u0430\u043D \u0493\u0430\u043B\u0430\u0431\u0430 \u049B\u043E\u0437\u043E\u043D\u0430\u0434\u0438" }, "notes": { "en-GB": "Capitalised when market name", "da": "All words capitalised, when it's market name.", "ru": "As loyalty bonus name" } }, { "id": 531, "terms": { "en-GB": "winner", "az": "qalib", "da": "vinder", "mn": "\u044F\u043B\u0430\u0433\u0447", "pt-BR": "vencedor", "ru": "\u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044C", "es": "ganador", "es-AR": "ganador", "uk": "\u043F\u0435\u0440\u0435\u043C\u043E\u0436\u0435\u0446\u044C", "uz": "g'olib", "uzb": "\u0493\u043E\u043B\u0438\u0431" } }, { "id": 532, "terms": { "en-GB": "winning bet", "az": "udu\u015Flu m\u0259rc", "da": "vindende v\xE6ddem\xE5l", "mn": "\u0445\u043E\u0436\u043B\u044B\u043D \u0431\u043E\u043E\u0446\u043E\u043E", "pt-BR": "aposta vencedora", "ru": "\u0432\u044B\u0438\u0433\u0440\u044B\u0448\u043D\u043E\u0435 \u043F\u0430\u0440\u0438", "es": "apuesta ganadora", "es-AR": "apuesta ganadora", "uk": "\u0432\u0438\u0433\u0440\u0430\u0448\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430", "uz": "yutuqli stavka", "uzb": "\u044E\u0442\u0443\u049B\u043B\u0438 \u0441\u0442\u0430\u0432\u043A\u0430" }, "notes": { "ru": "for .RU" } }, { "id": 533, "terms": { "en-GB": "winning category", "az": "udu\u015F kateqoriyas\u0131", "da": "vindende kategori", "mn": "\u0445\u043E\u0436\u043B\u044B\u043D \u0430\u043D\u0433\u0438\u043B\u0430\u043B", "pt-BR": "categoria vencedora", "ru": "\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F \u0432\u044B\u0438\u0433\u0440\u044B\u0448\u0430", "es": "categor\xEDa ganadora", "es-AR": "categor\xEDa ganadora", "uk": "\u0432\u0438\u0433\u0440\u0430\u0448\u043D\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F", "uz": "yutuq toifasi", "uzb": "\u044E\u0442\u0443\u049B \u0442\u043E\u0438\u0444\u0430\u0441\u0438" } }, { "id": 534, "terms": { "en-GB": "winning margin", "da": "vindermargin", "mn": "\u0445\u043E\u0436\u043B\u044B\u043D \u0437\u04E9\u0440\u04AF\u04AF", "pt-BR": "margem de vit\xF3ria", "ru": "\u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u043E", "es": "margen de victoria", "es-AR": "margen de victoria", "uk": "\u043F\u0435\u0440\u0435\u0432\u0430\u0433\u0430", "uz": "hisobdagi farq", "uzb": "\u04B3\u0438\u0441\u043E\u0431\u0434\u0430\u0433\u0438 \u0444\u0430\u0440\u049B" } }, { "id": 535, "terms": { "en-GB": "winning ticket", "az": "udu\u015Flu bilet", "da": "vinderbilletter", "mn": "\u0445\u043E\u0436\u043B\u044B\u043D \u0442\u0430\u0441\u0430\u043B\u0431\u0430\u0440", "pt-BR": "bilhete vencedor", "ru": "\u0432\u044B\u0438\u0433\u0440\u044B\u0448\u043D\u044B\u0439 \u043A\u0443\u043F\u043E\u043D", "es": "boleto ganador", "es-AR": "boleto ganador", "uk": "\u0432\u0438\u0433\u0440\u0430\u0448\u043D\u0438\u0439 \u043A\u0443\u043F\u043E\u043D", "uz": "yutuqli chipta", "uzb": "\u044E\u0442\u0443\u049B\u043B\u0438 \u0447\u0438\u043F\u0442\u0430" }, "notes": { "ru": "used for Big Prize Draw via Loyalty;\xA0other Product-related promotions", "uk": "used for Big Prize Draw via Loyalty;\xA0other Product-related promotions" } }, { "id": 536, "terms": { "en-GB": "winnings", "az": "udu\u015F", "da": "gevinst", "mn": "\u0445\u043E\u0436\u0438\u043B", "pt-BR": "vencedores", "ru": "\u0432\u044B\u0438\u0433\u0440\u044B\u0448", "es": "ganancias", "es-AR": "ganancias", "uk": "\u0432\u0438\u0433\u0440\u0430\u0448", "uz": "yutuq", "uzb": "\u044E\u0442\u0443\u049B" }, "notes": { "mn": "in promotions 'winnings' sometimes used in the meaning of a payout ('\u0432\u044B\u043F\u043B\u0430\u0442\u0430'), but we shouldn't take this meaning for the rule", "pt-BR": "profit from the bet calculated as the payout minus the stake", "ru": "in promotions 'winnings' sometimes used in the meaning of a payout ('\u0432\u044B\u043F\u043B\u0430\u0442\u0430'), but we shouldn't take this meaning for the rule", "uk": "in promotions 'winnings' sometimes used in the meaning of a payout ('\u0432\u0438\u043F\u043B\u0430\u0442\u0430'), but we shouldn't take this meaning for the rule" } }, { "id": 537, "terms": { "en-GB": "winter sports", "da": "vintersport", "mn": "\u04E9\u0432\u043B\u0438\u0439\u043D \u0441\u043F\u043E\u0440\u0442", "pt-BR": "Esportes de inverno", "ru": "\u0437\u0438\u043C\u043D\u0438\u0435 \u0432\u0438\u0434\u044B \u0441\u043F\u043E\u0440\u0442\u0430", "es": "deportes de invierno", "es-AR": "deportes de invierno", "uk": "\u0437\u0438\u043C\u043E\u0432\u0456 \u0432\u0438\u0434\u0438 \u0441\u043F\u043E\u0440\u0442\u0443", "uz": "qishki sport o'yinlari", "uzb": "\u049B\u0438\u0448\u043A\u0438 \u0441\u043F\u043E\u0440\u0442 \u045E\u0439\u0438\u043D\u043B\u0430\u0440\u0438" } }, { "id": 538, "terms": { "en-GB": "withdraw", "az": "pul \xE7\u0131xarmaq", "da": "at udg\xE5", "mn": "\u043C\u04E9\u043D\u0433\u04E9 \u0442\u0430\u0442\u0430\u043D \u0430\u0432\u0430\u0445", "pt-BR": "retirar", "ru": "\u0432\u044B\u0432\u0435\u0441\u0442\u0438 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430", "es": "retirar", "es-AR": "retirar", "uk": "\u0432\u0438\u0432\u0435\u0441\u0442\u0438 \u043A\u043E\u0448\u0442\u0438", "uz": "pul yechib olish", "uzb": "\u043F\u0443\u043B \u0435\u0447\u0438\u0431 \u043E\u043B\u0438\u0448" }, "notes": { "da": "from competition", "uz": "UI. Standard capitalisation rules apply", "uzb": "UI. Standard capitalisation rules apply" } }, { "id": 539, "terms": { "en-GB": "withdrawal", "az": "pul \xE7\u0259kimi", "da": "udg\xE5", "mn": "\u0442\u0430\u0442\u0430\u043D \u0430\u0432\u0430\u043B\u0442", "pt-BR": "retirada", "ru": "\u0432\u044B\u0432\u043E\u0434 \u0441\u0440\u0435\u0434\u0441\u0442\u0432", "es": "retirada de fondos", "es-AR": "retirada de fondos", "uk": "\u0432\u0438\u0432\u0435\u0434\u0435\u043D\u043D\u044F \u043A\u043E\u0448\u0442\u0456\u0432", "uz": "pulni yechib olish", "uzb": "\u043F\u0443\u043B\u043D\u0438 \u0435\u0447\u0438\u0431 \u043E\u043B\u0438\u0448" }, "notes": { "da": "from competition" } }, { "id": 540, "terms": { "en-GB": "Yankee", "az": "Yanki", "da": "Yankee", "mn": "\u042F\u043D\u043A\u0438", "pt-BR": "Yankee", "ru": "\u042F\u043D\u043A\u0438", "es": "Yankee", "es-AR": "Yankee", "uk": "\u042F\u043D\u043A\u0456", "uz": "Yanki", "uzb": "\u042F\u043D\u043A\u0438" } }, { "id": 541, "terms": { "en-GB": "yellow card", "az": "sar\u0131 v\u0259r\u0259q\u0259", "da": "gult kort", "mn": "\u0448\u0430\u0440 \u0445\u0443\u0443\u0434\u0430\u0441", "pt-BR": "cart\xE3o amarelo", "ru": "\u0436\u0435\u043B\u0442\u0430\u044F \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430", "es": "tarjeta amarilla", "es-AR": "tarjeta amarilla", "uk": "\u0436\u043E\u0432\u0442\u0430 \u043A\u0430\u0440\u0442\u043A\u0430", "uz": "sariq kartochka", "uzb": "\u0441\u0430\u0440\u0438\u049B \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430" } }, { "id": 542, "terms": { "en-GB": "zero balance", "da": "tom konto", "pt-BR": "saldo zero", "ru": "\u043D\u0443\u043B\u0435\u0432\u043E\u0439 \u0431\u0430\u043B\u0430\u043D\u0441", "es": "saldo a cero", "es-AR": "saldo a cero", "uz": "nol balans", "uzb": "\u043D\u043E\u043B\u044C \u0431\u0430\u043B\u0430\u043D\u0441" } }, { "id": 543, "terms": { "en-GB": "account management", "da": "kontoadministration", "mn": "\u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u0434\u0430\u043D\u0441\u043D\u044B \u0442\u043E\u0445\u0438\u0440\u0433\u043E\u043E", "pt-BR": "gerenciamento da conta", "ru": "\u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u0447\u0435\u0442\u043E\u043C", "es": "gesti\xF3n de la cuenta", "es-AR": "gesti\xF3n de la cuenta", "uk": "\u043A\u0435\u0440\u0443\u0432\u0430\u043D\u043D\u044F \u0440\u0430\u0445\u0443\u043D\u043A\u043E\u043C", "uz": "hisobni boshqarish", "uzb": "\u04B3\u0438\u0441\u043E\u0431\u043D\u0438 \u0431\u043E\u0448\u049B\u0430\u0440\u0438\u0448" } }, { "id": 544, "terms": { "en-GB": "processing fees", "es": "cargos de procesamiento", "es-AR": "cargos de procesamiento" } }, { "id": 545, "terms": { "en-GB": "CDU", "es": "CdU", "es-AR": "CdU" }, "notes": { "es": "Concepci\xF3n del Uruguay", "es-AR": "Concepci\xF3n del Uruguay" } }, { "id": 546, "terms": { "en-GB": "Pin", "es": "Anclar", "es-AR": "Anclar" } }, { "id": 547, "terms": { "en-GB": "Cura\xE7ao", "az": "K\xFCrasao", "mn": "\u041A\u044E\u0440\u0430\u0441\u0430\u043E", "pt-BR": "Cura\xE7ao", "ru": "\u041A\u044E\u0440\u0430\u0441\u0430\u043E", "es": "Curazao", "es-AR": "Curazao", "uk": "\u041A\u044E\u0440\u0430\u0441\u0430\u043E", "uz": "Kyurasao", "uzb": "\u041A\u044E\u0440\u0430\u0441\u0430\u043E" } }, { "id": 548, "terms": { "en-GB": "Panbet Curacao N.V.", "az": "Panbet Curacao N.V.", "mn": "Panbet Curacao N.V.", "pt-BR": "Panbet Curacao N.V.", "ru": "Panbet Curacao N.V.", "es": "Panbet Curacao N.V.", "es-AR": "Panbet Curacao N.V.", "uk": "Panbet Curacao N.V.", "uz": "Panbet Curacao N.V.", "uzb": "Panbet Curacao N.V." } }, { "id": 549, "terms": { "en-GB": "Certificate of Operation", "az": "\u018Fm\u0259liyyat Sertifikat\u0131", "mn": "\u0422\u0443\u0441\u0433\u0430\u0439 \u0437\u04E9\u0432\u0448\u04E9\u04E9\u0440\u04E9\u043B", "pt-BR": "certificado de opera\xE7\xE3o", "ru": "\u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u043D\u0430 \u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0434\u0435\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438", "es": "certificado de operaci\xF3n", "es-AR": "certificado de operaci\xF3n", "uk": "\u0441\u0435\u0440\u0442\u0438\u0444\u0456\u043A\u0430\u0442 \u043D\u0430 \u0432\u0435\u0434\u0435\u043D\u043D\u044F \u0434\u0456\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0456", "uz": "faoliyat yuritish sertifikati", "uzb": "\u0444\u0430\u043E\u043B\u0438\u044F\u0442 \u044E\u0440\u0438\u0442\u0438\u0448 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0438" } }, { "id": 550, "terms": { "en-GB": "round", "az": "raund", "mn": "\u04AF\u0435", "ru": "\u0440\u0430\u0443\u043D\u0434", "es": "ronda", "es-AR": "ronda", "uz": "raund", "uzb": "\u0440\u0430\u0443\u043D\u0434" }, "notes": { "mn": "used only in boxing or wrestling", "es": "in the context of esports", "es-AR": "in the context of esports", "uz": "boxing, esports", "uzb": "boxing, esports" } }, { "id": 551, "terms": { "en-GB": "become a participant", "es": "adquirir la condici\xF3n de participante", "es-AR": "adquirir la condici\xF3n de participante" } }, { "id": 552, "terms": { "en-GB": "Cooling-Off", "az": "Fasil\u0259", "da": "Cooling-Off", "mn": "\u0442\u04AF\u0440 \u0445\u04AF\u043B\u044D\u044D\u043B\u0442", "pt-BR": "reflex\xE3o", "ru": "\u043F\u0435\u0440\u0438\u043E\u0434 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u044F", "es": "periodo de reflexi\xF3n", "es-AR": "periodo de reflexi\xF3n", "uk": "\u043F\u0435\u0440\u0456\u043E\u0434 \u043E\u0445\u043E\u043B\u043E\u0434\u0436\u0435\u043D\u043D\u044F", "uz": '"tanaffus"', "uzb": "\xAB\u0442\u0430\u043D\u0430\u0444\u0444\u0443\u0441\xBB" } }, { "id": 553, "terms": { "en-GB": "MB", "az": "MB", "da": "MB", "mn": "MB", "pt-BR": "MB", "ru": "\u041C\u0431", "es": "MB", "es-AR": "MB", "uk": "\u041C\u0411", "uz": "MB", "uzb": "\u041C\u0411" }, "notes": { "en-GB": "meaning 'megabyte', should be spelt without a space after the number", "az": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "da": "meaning 'megabyte', should be spelt with a space after the number", "mn": "meaning 'megabyte', should be spelt without a space after the number", "pt-BR": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "ru": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "es": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "es-AR": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "uk": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "uz": "meaning 'megabyte', should be spelt with a non-breaking space after the number", "uzb": "meaning 'megabyte', should be spelt with a non-breaking space after the number" } }, { "id": 554, "terms": { "en-GB": "Additional Time Goal", "ru": "\u0413\u043E\u043B \u0432 \u043A\u043E\u043C\u043F\u0435\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F" } }, { "id": 555, "terms": { "en-GB": "affiliates", "ru": "\u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0441\u043A\u0430\u044F \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430" } }, { "id": 556, "terms": { "en-GB": "ante-post price", "az": "antipost \u0259msal\u0131", "da": "antepost-odds", "mn": "\u0443\u0440\u044C\u0434\u0447\u0438\u043B\u0441\u0430\u043D \u0431\u043E\u043E\u0446\u043E\u043E\u043D\u044B \u043C\u0430\u0433\u0430\u0434\u043B\u0430\u043B", "pt-BR": "pre\xE7o ante-post", "ru": "\u0437\u0430\u0431\u043B\u0430\u0433\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430", "uk": "\u0437\u0430\u0432\u0447\u0430\u0441\u043D\u0430 \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 557, "terms": { "en-GB": "assist", "ru": "\u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430" }, "notes": { "ru": "\u0434\u043B\u044F \u0431\u0430\u0441\u043A\u0435\u0442\u0431\u043E\u043B\u0430" } }, { "id": 558, "terms": { "en-GB": "bank code", "mn": "\u0431\u0430\u043D\u043A\u043D\u044B \u043A\u043E\u0434", "ru": "\u043A\u043E\u0434 \u0431\u0430\u043D\u043A\u0430", "uk": "\u043A\u043E\u0434 \u0431\u0430\u043D\u043A\u0443" } }, { "id": 559, "terms": { "en-GB": "Bayern Munich", "ru": "\u0411\u0430\u0432\u0430\u0440\u0438\u044F" }, "notes": { "en-GB": "Always capitalised\u2014proper noun." } }, { "id": 560, "terms": { "en-GB": "bet receipt", "ru": "\u0431\u0443\u043A\u043C\u0435\u043A\u0435\u0440\u0441\u043A\u0430\u044F \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430" } }, { "id": 561, "terms": { "en-GB": "Biathlon World Championships", "ru": "\u0447\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0442 \u043C\u0438\u0440\u0430 \u043F\u043E \u0431\u0438\u0430\u0442\u043B\u043E\u043D\u0443" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 562, "terms": { "en-GB": "Bonus offer", "ru": "\u0431\u043E\u043D\u0443\u0441\u043D\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }, "notes": { "en-GB": "used in addition to 'promotion' on BY", "ru": "used in addition to 'promotion' on BY" } }, { "id": 563, "terms": { "en-GB": "bowler", "ru": "\u0431\u043E\u0443\u043B\u0435\u0440" } }, { "id": 564, "terms": { "en-GB": "breakout", "ru": "\u0432\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u0435 \u0448\u0430\u0439\u0431\u044B \u0432 \u0437\u043E\u043D\u0443 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430" } }, { "id": 565, "terms": { "en-GB": "butt-ending", "ru": "\u0442\u044B\u0447\u043E\u043A \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430 \u0440\u0443\u043A\u043E\u044F\u0442\u043A\u043E\u0439 \u043A\u043B\u044E\u0448\u043A\u0438" }, "notes": { "en-GB": "ice hockey: checking the opponent with the shaft of the stick" } }, { "id": 566, "terms": { "en-GB": "by a knockout", "ru": "\u043F\u043E\u0431\u0435\u0434\u0430 \u043D\u043E\u043A\u0430\u0443\u0442\u043E\u043C" } }, { "id": 567, "terms": { "en-GB": "call", "ru": "\u0437\u0430\u043A\u0430\u0437" }, "notes": { "en-GB": "in snooker" } }, { "id": 568, "terms": { "en-GB": "called ball", "ru": "\u0437\u0430\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u0448\u0430\u0440" } }, { "id": 569, "terms": { "en-GB": "called pocket", "ru": "\u0437\u0430\u043A\u0430\u0437\u0430\u043D\u043D\u0430\u044F \u043B\u0443\u0437\u0430" } }, { "id": 570, "terms": { "en-GB": "cash office", "ru": "\u043A\u0430\u0441\u0441\u0430" } }, { "id": 571, "terms": { "en-GB": "Cashback on Sport", "az": "\u0130dmanda ke\u015Fbek", "mn": "\u0421\u043F\u043E\u0440\u0442 \u0434\u0430\u0445\u044C Cashback", "pt-BR": "Cashback no Esporte", "ru": "\u0421\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0439 \u043A\u0435\u0448\u0431\u044D\u043A", "uk": "\u0421\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u0438\u0439 \u043A\u0435\u0448\u0431\u0435\u043A", "uz": "Sport uchun Cashback", "uzb": "\u0421\u043F\u043E\u0440\u0442 \u0443\u0447\u0443\u043D Cashback" }, "notes": { "ru": "a type of new automatic bonus to receive a free bet in the form of a certain percentage of the total amount of qualifying bets for a certain period of time", "uk": "a type of new automatic bonus to receive a free bet in the form of a certain percentage of the total amount of qualifying bets for a certain period of time", "uz": "Promotion name, first letter in Capital", "uzb": "Promotion name, first letter in Capital" } }, { "id": 572, "terms": { "en-GB": "Champions League", "ru": "\u041B\u0438\u0433\u0430 \u0447\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 573, "terms": { "en-GB": "conditions", "mn": "\u043D\u04E9\u0445\u0446\u04E9\u043B", "ru": "\u0443\u0441\u043B\u043E\u0432\u0438\u044F", "uk": "\u0443\u043C\u043E\u0432\u0438", "uz": "shartlar", "uzb": "\u0448\u0430\u0440\u0442\u043B\u0430\u0440" } }, { "id": 574, "terms": { "en-GB": "Copa Am\xE9rica", "ru": "\u041A\u0443\u0431\u043E\u043A \u0410\u043C\u0435\u0440\u0438\u043A\u0438 \u043F\u043E \u0444\u0443\u0442\u0431\u043E\u043B\u0443" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 575, "terms": { "en-GB": "Corner Betting", "ru": "\u0423\u0433\u043B\u043E\u0432\u044B\u0435 \u0443\u0434\u0430\u0440\u044B" }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 576, "terms": { "en-GB": "Crazy Weekend", "ru": "\u0423\u043B\u0435\u0442\u043D\u044B\u0435 \u0432\u044B\u0445\u043E\u0434\u043D\u044B\u0435" }, "notes": { "en-GB": "Capitalised as shown\u2014promotion name", "ru": '"\u0423\u043B\u0435\u0442\u043D\u044B\u0435" is capitalised if the phrase is used as a bonus/promo name' } }, { "id": 577, "terms": { "en-GB": "Daily Loss Limit", "ru": "\u0434\u043D\u0435\u0432\u043D\u043E\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u0440\u043E\u0438\u0433\u0440\u044B\u0448" }, "notes": { "en-GB": "Always capitalised\u2014feature name" } }, { "id": 578, "terms": { "en-GB": "Deposit", "da": "indbetaling", "mn": "\u041C\u04E9\u043D\u0433\u04E9 \u0431\u0430\u0439\u0440\u0448\u0443\u0443\u043B\u0430\u0445", "ru": "\u0412\u043D\u0435\u0441\u0442\u0438 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430", "uk": "\u0434\u0435\u043F\u043E\u0437\u0438\u0442", "uz": "To'ldirish", "uzb": "\u0422\u045E\u043B\u0434\u0438\u0440\u0438\u0448" }, "notes": { "en-GB": "Capitalised for UI use", "da": "noun", "mn": "verb", "ru": "name of the button", "uz": "only for CTA buttons", "uzb": "only for CTA buttons" } }, { "id": 579, "terms": { "en-GB": "Double Chance", "da": "Dobbeltchance", "mn": "\u0414\u0430\u0432\u0445\u0430\u0440 \u0431\u043E\u043B\u043E\u043C\u0436", "pt-BR": "Chance dupla", "ru": "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "uk": "\u041F\u043E\u0434\u0432\u0456\u0439\u043D\u0438\u0439 \u0448\u0430\u043D\u0441", "uz": "Ikkitalik imkoniyat", "uzb": "\u0418\u043A\u043A\u0438\u0442\u0430\u043B\u0438\u043A \u0438\u043C\u043A\u043E\u043D\u0438\u044F\u0442" }, "notes": { "uz": "Standard capitalization rules apply", "uzb": "Standard capitalization rules apply" } }, { "id": 580, "terms": { "en-GB": "Double Result", "da": "Dobbeltresultat", "ru": "\u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442" } }, { "id": 581, "terms": { "en-GB": "Double Result (First Past the Post)", "da": "Dobbeltvinder (F\xF8rst Over M\xE5lstregen)", "mn": "\u0414\u0430\u0432\u0445\u0430\u0440 \u04AF\u0440 \u0434\u04AF\u043D (\u041D\u0438\u0439\u0442\u043B\u044D\u043B\u044D\u044D\u0441 \u044D\u0445\u043B\u044D\u044D\u0434)", "pt-BR": "Resultado duplo (Primeiro a cruzar a linha de chegada)", "ru": "\u0411\u043E\u043D\u0443\u0441 \u043D\u0430 \u0434\u0432\u0443\u0445 \u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u0435\u0439", "uk": "\u0421\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u043F\u043E\u0434\u0432\u0456\u0439\u043D\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "uz": "Ikkita g'olibga bonus", "uzb": "\u0418\u043A\u043A\u0438\u0442\u0430 \u0493\u043E\u043B\u0438\u0431\u0433\u0430 \u0431\u043E\u043D\u0443\u0441" }, "notes": { "uz": "Standard capitalization rules apply", "uzb": "Standard capitalization rules apply" } }, { "id": 582, "terms": { "en-GB": "Download Now", "da": "Download nu", "mn": "\u043E\u0434\u043E\u043E \u0442\u0430\u0442\u0430\u0436 \u0430\u0432\u0430\u0445", "pt-BR": "Baixe agora", "ru": "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441", "uk": "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438", "uz": "Hozir yuklang", "uzb": "\u04B2\u043E\u0437\u0438\u0440 \u044E\u043A\u043B\u0430\u043D\u0433" }, "notes": { "ru": `"\u0421\u043A\u0430\u0447\u0430\u0442\u044C" is capitalised because it's a button/CTA`, "uk": `"\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438" is capitalised because it's a button/CTA`, "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 583, "terms": { "en-GB": "duplicate account", "ru": "\u0434\u0443\u0431\u043B\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0441\u0447\u0435\u0442" }, "notes": { "ru": "depending on a context, \u2018\u0441\u0447\u0435\u0442\u2019 can be replaced by \u2018\u0438\u0433\u0440\u043E\u0432\u043E\u0439 \u0441\u0447\u0435\u0442\u2019 or \u2018\u0443\u0447\u0435\u0442\u043D\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C\u2019" } }, { "id": 584, "terms": { "en-GB": "E/W", "ru": "E/W" } }, { "id": 585, "terms": { "en-GB": "EuroLeague", "ru": "\u0415\u0432\u0440\u043E\u043B\u0438\u0433\u0430" }, "notes": { "en-GB": "Always capitalised as shown\u2014proper noun" } }, { "id": 586, "terms": { "en-GB": "Europa League", "ru": "\u041B\u0438\u0433\u0430 \u0415\u0432\u0440\u043E\u043F\u044B" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 587, "terms": { "en-GB": "even money", "ru": "\u041E\u0434\u0438\u043D \u043A \u043E\u0434\u043D\u043E\u043C\u0443" }, "notes": { "ru": '"\u041E\u0434\u0438\u043D" is capitalised if the phrase is used as a section name or at the beginning of a sentence' } }, { "id": 588, "terms": { "en-GB": "e-wallet", "ru": "\u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u044B\u0439 \u043A\u043E\u0448\u0435\u043B\u0435\u043A" } }, { "id": 589, "terms": { "en-GB": "extra end", "ru": "\u044D\u043A\u0441\u0442\u0440\u0430-\u044D\u043D\u0434" }, "notes": { "ru": "\u043A\u0435\u0440\u043B\u0438\u043D\u0433" } }, { "id": 590, "terms": { "en-GB": "false start", "ru": "\u0444\u0430\u043B\u044C\u0441\u0442\u0430\u0440\u0442" } }, { "id": 591, "terms": { "en-GB": "Favourites", "az": "Sevimlil\u0259r", "da": "Favoritter", "ru": "\u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", "uk": "\u0432\u0438\u0431\u0440\u0430\u043D\u0435" }, "notes": { "az": "bookmark" } }, { "id": 592, "terms": { "en-GB": "Fight Ending - Round", "ru": "\u041E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u0435 \u0431\u043E\u044F. \u0420\u0430\u0443\u043D\u0434" }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 593, "terms": { "en-GB": "fight result", "ru": "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u043E\u044F" } }, { "id": 594, "terms": { "en-GB": "Fight Result - Grouped Rounds", "ru": "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u043E\u044F. \u0413\u0440\u0443\u043F\u043F\u044B \u0440\u0430\u0443\u043D\u0434\u043E\u0432" }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 595, "terms": { "en-GB": "Fight Result - Round", "ru": "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u043E\u044F. \u0420\u0430\u0443\u043D\u0434\u044B" }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 596, "terms": { "en-GB": "first leg matches", "ru": "\u043F\u0435\u0440\u0432\u044B\u0435 \u043C\u0430\u0442\u0447\u0438" } }, { "id": 597, "terms": { "en-GB": "forward", "pt-BR": "atacante", "ru": "\u043D\u0430\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u0439", "uz": "hujumchi", "uzb": "\u04B3\u0443\u0436\u0443\u043C\u0447\u0438" }, "notes": { "pt-BR": "Position of the football player." } }, { "id": 598, "terms": { "en-GB": "frame", "az": "freym", "da": "frame", "mn": "\u0444\u0440\u0435\u0439\u043C", "ru": "\u0444\u0440\u0435\u0439\u043C", "uk": "\u0444\u0440\u0435\u0439\u043C", "uz": "freym", "uzb": "\u0444\u0440\u0435\u0439\u043C" } }, { "id": 599, "terms": { "en-GB": "frame betting", "ru": "\u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u0444\u0440\u0435\u0439\u043C\u044B" } }, { "id": 600, "terms": { "en-GB": "fraud", "ru": "\u041C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F" }, "notes": { "ru": '"\u041C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435" is capitalised if the phrase is used as a section name or at the beginning of a sentence' } }, { "id": 601, "terms": { "en-GB": "fraudulent use of payment methods", "ru": "\u043C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u043F\u043E\u0441\u043E\u0431\u043E\u0432 \u043F\u043B\u0430\u0442\u0435\u0436\u0430" }, "notes": { "ru": "MARATHONBET \u043D\u0435 \u043D\u0435\u0441\u0435\u0442 \u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0437\u0430 \u043C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u043F\u043E\u0441\u043E\u0431\u043E\u0432 \u043F\u043B\u0430\u0442\u0435\u0436\u0430, \u0442\u0430\u043A\u0438\u0445 \u043A\u0430\u043A \u0443\u043A\u0440\u0430\u0434\u0435\u043D\u043D\u044B\u0435 \u043A\u0440\u0435\u0434\u0438\u0442\u043D\u044B\u0435 \u0438\u043B\u0438 \u0434\u0435\u0431\u0435\u0442\u043E\u0432\u044B\u0435 \u043A\u0430\u0440\u0442\u044B, \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0442\u043E\u0433\u043E, \u0434\u043E\u043B\u043E\u0436\u0438\u043B \u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446 \u043E \u043A\u0440\u0430\u0436\u0435 \u0438\u043B\u0438 \u043D\u0435\u0442, \u0434\u043E \u0442\u0435\u0445 \u043F\u043E\u0440, \u043F\u043E\u043A\u0430 MARATHONBET \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u0438\u0437\u0432\u0435\u0449\u0435\u043D \u043E \u043A\u0440\u0430\u0436\u0435 \u0432 \u043F\u0438\u0441\u044C\u043C\u0435\u043D\u043D\u043E\u043C \u0432\u0438\u0434\u0435 \u0438 \u043F\u043E \u043F\u0440\u0435\u0434\u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044B\u043C \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430\u043C." } }, { "id": 602, "terms": { "en-GB": "free ball", "ru": "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0448\u0430\u0440" } }, { "id": 603, "terms": { "en-GB": "full distance winner", "ru": "\u043F\u043E\u0431\u0435\u0434\u0430 \u043F\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0443 \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u0431\u043E\u044F" } }, { "id": 604, "terms": { "en-GB": "gambling establishment", "ru": "\u0438\u0433\u043E\u0440\u043D\u043E\u0435 \u0437\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u0435" } }, { "id": 605, "terms": { "en-GB": "gambling rules", "ru": "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F \u0432\u0438\u0440\u0442\u0443\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0438\u0433\u043E\u0440\u043D\u043E\u0433\u043E \u0437\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u044F" }, "notes": { "en-GB": "Capitalised as 'Gambling Rules' if referring to specific document.", "ru": `"\u041F\u0440\u0430\u0432\u0438\u043B\u0430" is capitalised because it's a document name` } }, { "id": 606, "terms": { "en-GB": "game misconduct", "ru": "\u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0434\u043E \u043A\u043E\u043D\u0446\u0430 \u043C\u0430\u0442\u0447\u0430" } }, { "id": 607, "terms": { "en-GB": "Game of the Week", "ru": "\u0418\u0433\u0440\u0430 \u043D\u0435\u0434\u0435\u043B\u0438" }, "notes": { "en-GB": "Always capitalised\u2014promotion name", "ru": '"\u0418\u0433\u0440\u0430" is capitalised if the phrase is used as a promo/section name or at the beginning of a sentence' } }, { "id": 608, "terms": { "en-GB": "goalie", "ru": "\u043A\u0438\u043F\u0435\u0440", "es-AR": "arquero" } }, { "id": 609, "terms": { "en-GB": "goalkeeper", "ru": "\u043A\u0438\u043F\u0435\u0440", "es-AR": "arquero" } }, { "id": 610, "terms": { "en-GB": "goaltender", "ru": "\u043A\u0438\u043F\u0435\u0440" } }, { "id": 611, "terms": { "en-GB": "golden set", "ru": "\xAB\u0437\u043E\u043B\u043E\u0442\u0430\u044F\xBB \u043F\u0430\u0440\u0442\u0438\u044F" } }, { "id": 612, "terms": { "en-GB": "Greyhounds", "da": "hundev\xE6ddel\xF8b", "mn": "\u043D\u043E\u0445\u043E\u0439\u043D \u0443\u0440\u0430\u043B\u0434\u0430\u0430\u043D", "pt-BR": "corridas de galgos", "ru": "\u0441\u043E\u0431\u0430\u0447\u044C\u0438 \u0431\u0435\u0433\u0430", "uk": "\u0441\u043E\u0431\u0430\u0447\u0456 \u043F\u0435\u0440\u0435\u0433\u043E\u043D\u0438" } }, { "id": 613, "terms": { "en-GB": "group stage", "ru": "\u0433\u0440\u0443\u043F\u043F\u043E\u0432\u043E\u0439 \u0442\u0443\u0440\u043D\u0438\u0440" } }, { "id": 614, "terms": { "en-GB": "handicap betting", "ru": "\u0441\u0442\u0430\u0432\u043A\u0438 \u0441 \u0443\u0447\u0435\u0442\u043E\u043C \u0444\u043E\u0440\u044B" } }, { "id": 615, "terms": { "en-GB": "handicap by games", "ru": "\u0444\u043E\u0440\u0430 \u043F\u043E \u0433\u0435\u0439\u043C\u0430\u043C" } }, { "id": 616, "terms": { "en-GB": "handicap by points", "ru": "\u0444\u043E\u0440\u0430 \u043F\u043E \u043E\u0447\u043A\u0430\u043C" } }, { "id": 617, "terms": { "en-GB": "Hit Post or Crossbar", "az": "Dir\u0259y\u0259 v\u0259 ya tir\u0259 d\u0259y\u0259n z\u0259rb\u0259l\u0259r", "da": "Rammer Stolpe Eller Overligger", "mn": "\u0425\u0430\u0430\u043B\u0433\u0430\u043D\u044B \u0448\u043E\u043D \u0445\u04E9\u043D\u0434\u043B\u04E9\u0432\u0447 \u0446\u043E\u0445\u0438\u0445", "pt-BR": "Finaliza\xE7\xF5es na trave ou no travess\xE3o", "ru": "\u0423\u0434\u0430\u0440 \u0432 \u0448\u0442\u0430\u043D\u0433\u0443 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u043A\u043B\u0430\u0434\u0438\u043D\u0443", "es": "Tiros al poste/travesa\xF1o", "es-AR": "Tiros al poste/travesa\xF1o", "uk": "\u0423\u0434\u0430\u0440 \u0443 \u0448\u0442\u0430\u043D\u0433\u0443 \u0430\u0431\u043E \u043F\u043E\u043F\u0435\u0440\u0435\u0447\u0438\u043D\u0443", "uz": "Ustunga yoki to'singa zarb", "uzb": "\u0423\u0441\u0442\u0443\u043D\u0433\u0430 \u0451\u043A\u0438 \u0442\u045E\u0441\u0438\u043D\u0433\u0430 \u0437\u0430\u0440\u0431\u0430" } }, { "id": 618, "terms": { "en-GB": "hooking", "ru": "\u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043A\u043B\u044E\u0448\u043A\u043E\u0439" } }, { "id": 619, "terms": { "en-GB": "Inactivity timeout", "mn": "\u0418\u0434\u044D\u0432\u0445\u0433\u04AF\u0439 \u04AF\u0435\u0434 \u0445\u0430\u0430\u0433\u0434\u0430\u0445", "pt-BR": "Tempo limite de inatividade", "ru": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0441\u0435\u0430\u043D\u0441 \u043F\u0440\u0438 \u0431\u0435\u0437\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0438", "uk": "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0438\u0439 \u0432\u0438\u0445\u0456\u0434 \u0456\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u0438 \u043F\u0440\u0438 \u0431\u0435\u0437\u0434\u0456\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0456" }, "notes": { "ru": `"\u0417\u0430\u043A\u0440\u044B\u0442\u044C" is capitalised because it's a button name/CTA` } }, { "id": 620, "terms": { "en-GB": "indoor soccer", "da": "indefodbold", "mn": "\u0442\u0430\u0441\u0430\u043B\u0433\u0430\u0430\u043D\u044B \u0445\u04E9\u043B \u0431\u04E9\u043C\u0431\u04E9\u0433", "pt-BR": "showbol", "ru": "\u0438\u043D\u0434\u043E\u0440 \u0441\u043E\u043A\u043A\u0435\u0440", "uk": "\u0456\u043D\u0434\u043E\u0440 \u0441\u043E\u043A\u0435\u0440", "uz": "indor sokker", "uzb": "\u0438\u043D\u0434\u043E\u0440 \u0441\u043E\u043A\u043A\u0435\u0440" } }, { "id": 621, "terms": { "en-GB": "injury", "ru": "\u0442\u0440\u0430\u0432\u043C\u0430" } }, { "id": 622, "terms": { "en-GB": "internationals", "ru": "\u0442\u0443\u0440\u043D\u0438\u0440 \u0441\u0431\u043E\u0440\u043D\u044B\u0445" } }, { "id": 623, "terms": { "en-GB": "KHL", "ru": "\u041A\u0425\u041B" }, "notes": { "en-GB": "Always capitalised\u2014proper noun/acronym" } }, { "id": 624, "terms": { "en-GB": "knockdown", "ru": "\u043D\u043E\u043A\u0434\u0430\u0443\u043D" } }, { "id": 625, "terms": { "en-GB": "knockout stages", "ru": "\u043C\u0430\u0442\u0447\u0438 \u043F\u043B\u0435\u0439-\u043E\u0444\u0444" } }, { "id": 626, "terms": { "en-GB": "LaLiga", "ru": "\u041F\u0440\u0438\u043C\u0435\u0440\u0430 \u0434\u0438\u0432\u0438\u0437\u0438\u043E\u043D" }, "notes": { "en-GB": "Can be used in marketing texts (always capitalised)", "ru": "on the website" } }, { "id": 627, "terms": { "en-GB": "Primera Divisi\xF3n", "ru": "\u041F\u0440\u0438\u043C\u0435\u0440\u0430 \u0434\u0438\u0432\u0438\u0437\u0438\u043E\u043D" }, "notes": { "en-GB": "Used on website (always capitalised).", "ru": "on the website" } }, { "id": 628, "terms": { "en-GB": "lap", "da": "omgang", "ru": "\u043A\u0440\u0443\u0433" } }, { "id": 629, "terms": { "en-GB": "leg bye", "ru": "\u043B\u0435\u0433-\u0431\u0430\u0439" } }, { "id": 630, "terms": { "en-GB": "Live Casino Cashback", "ru": "Live \u041A\u0430\u0437\u0438\u043D\u043E \u043A\u0435\u0448\u0431\u044D\u043A", "uz": "Jonli Kazino keshbek", "uzb": "\u0416\u043E\u043D\u043B\u0438 \u041A\u0430\u0437\u0438\u043D\u043E \u043A\u044D\u0448\u0431\u044D\u043A" } }, { "id": 631, "terms": { "en-GB": "Log In", "az": "Daxil ol", "ru": "\u0412\u043E\u0439\u0442\u0438" }, "notes": { "ru": "Capitalised because it's a button name" } }, { "id": 632, "terms": { "en-GB": "Log Out", "ru": "\u0412\u044B\u0439\u0442\u0438" }, "notes": { "en-GB": "Capitalised as shown as UI button", "ru": "Capitalised because it's a button name" } }, { "id": 633, "terms": { "en-GB": "major penalty", "ru": "5-\u043C\u0438\u043D\u0443\u0442\u043D\u043E\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435" } }, { "id": 634, "terms": { "en-GB": "make deposit", "ru": "\u0412\u043D\u0435\u0441\u0442\u0438 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430" }, "notes": { "en-GB": "Capitalised as 'Make Deposit' for UI buttons.", "ru": '"\u0412\u043D\u0435\u0441\u0442\u0438" is capitalised if the phrase is used as a button name/CTA or at the beginning of a sentence' } }, { "id": 635, "terms": { "en-GB": "make withdrawal", "ru": "\u0412\u044B\u0432\u0435\u0441\u0442\u0438 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430" }, "notes": { "en-GB": "Capitalised as 'Make Withdrawal' for UI buttons.", "ru": '"\u0412\u044B\u0432\u0435\u0441\u0442\u0438" is capitalised if the phrase is used as a button name/CTA or at the beginning of a sentence' } }, { "id": 636, "terms": { "en-GB": "manager betting", "ru": "\u0421\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u0442\u0440\u0435\u043D\u0435\u0440\u043E\u0432" }, "notes": { "en-GB": "Only capitalised when used as market name." } }, { "id": 637, "terms": { "en-GB": "martial arts", "da": "kampsport", "pt-BR": "artes marciais", "ru": "\u0431\u043E\u0435\u0432\u044B\u0435 \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0430", "uk": "\u0431\u043E\u0439\u043E\u0432\u0456 \u043C\u0438\u0441\u0442\u0435\u0446\u0442\u0432\u0430", "uz": "jang san'ati", "uzb": "\u0436\u0430\u043D\u0433 \u0441\u0430\u043D\u044A\u0430\u0442\u0438" } }, { "id": 638, "terms": { "en-GB": "Max Payout", "ru": "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430" }, "notes": { "en-GB": "Used and capitalised as shown for UI buttons" } }, { "id": 639, "terms": { "en-GB": "maximum payout", "ru": "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430" }, "notes": { "en-GB": "Used in general text" } }, { "id": 640, "terms": { "en-GB": "maximum stake", "ru": "\u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430" } }, { "id": 641, "terms": { "en-GB": "Membership", "az": "\xDCzvl\xFCk", "mn": "\u0433\u0438\u0448\u04AF\u04AF\u043D\u0447\u043B\u044D\u043B", "pt-BR": "ades\xE3o", "ru": "\u0443\u0447\u0430\u0441\u0442\u0438\u0435", "uk": "\u0441\u0442\u0430\u0442\u0443\u0441", "uz": "A'zolik", "uzb": "\u0410\u044A\u0437\u043E\u043B\u0438\u043A" }, "notes": { "ru": "not capitalised as VIP-related term", "uk": "possible option if we have '\u0441\u0442\u0430\u0442\u0443\u0441' in Russian", "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 642, "terms": { "en-GB": "minor penalty", "ru": "\u043C\u0430\u043B\u044B\u0439 \u0448\u0442\u0440\u0430\u0444" } }, { "id": 643, "terms": { "en-GB": "misconduct penalty", "ru": "\u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u043D\u0430 10 \u043C\u0438\u043D\u0443\u0442 \u0431\u0435\u0437 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u043C\u0435\u043D\u044B" } }, { "id": 644, "terms": { "en-GB": "multicast", "da": "multicast", "pt-BR": "multicast", "ru": "\u043F\u0440\u043E\u0433\u043D\u043E\u0437\u044B", "uz": "bashoratlar", "uzb": "\u0431\u0430\u0448\u043E\u0440\u0430\u0442\u043B\u0430\u0440" } }, { "id": 645, "terms": { "en-GB": "NBA", "ru": "NBA" }, "notes": { "en-GB": "Always capitalised\u2014acronym" } }, { "id": 646, "terms": { "en-GB": "no contest", "ru": "\u0431\u0435\u0437 \u0440\u0435\u0448\u0435\u043D\u0438\u044F" } }, { "id": 647, "terms": { "en-GB": "no goalscorer", "ru": "\u0431\u0435\u0437 \u0433\u043E\u043B\u043E\u0432" } }, { "id": 648, "terms": { "en-GB": "non runner", "az": "qa\xE7mayan", "da": "non-runner", "mn": "\u0443\u0440\u0430\u043B\u0434\u0434\u0430\u0433\u0433\u04AF\u0439 \u0431\u043E\u043B", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043D\u0435 \u0444\u0438\u043D\u0438\u0448\u0438\u0440\u043E\u0432\u0430\u043B", "uk": "\u0443\u0447\u0430\u0441\u043D\u0438\u043A, \u0449\u043E \u043D\u0435 \u0444\u0456\u043D\u0456\u0448\u0443\u0432\u0430\u0432" } }, { "id": 649, "terms": { "en-GB": "non-finisher", "da": "udg\xE5et", "pt-BR": "participante que n\xE3o terminou a corrida", "ru": "\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043D\u0435 \u0444\u0438\u043D\u0438\u0448\u0438\u0440\u043E\u0432\u0430\u043B" } }, { "id": 650, "terms": { "en-GB": "not to be placed", "mn": "\u0431\u0430\u0439\u0440 \u044D\u0437\u043B\u044D\u0445\u0433\u04AF\u0439", "pt-BR": "n\xE3o colocado", "ru": "\u043D\u0435 \u0437\u0430\u0439\u043C\u0435\u0442 \u043C\u0435\u0441\u0442\u043E", "uk": "\u043D\u0435 \u043F\u043E\u0441\u044F\u0434\u0435 \u043C\u0456\u0441\u0446\u0435", "uz": "o'rin olmaydi", "uzb": "\u045E\u0440\u0438\u043D \u043E\u043B\u043C\u0430\u0439\u0434\u0438" } }, { "id": 651, "terms": { "en-GB": "offer", "da": "forslag", "mn": "\u0441\u0430\u043D\u0430\u043B", "ru": "\u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435", "uk": "\u043F\u0440\u043E\u043F\u043E\u0437\u0438\u0446\u0456\u044F", "uz": "taklif", "uzb": "\u0442\u0430\u043A\u043B\u0438\u0444" } }, { "id": 652, "terms": { "en-GB": "Olympic Games", "ru": "\u041E\u043B\u0438\u043C\u043F\u0438\u0439\u0441\u043A\u0438\u0435 \u0438\u0433\u0440\u044B" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 653, "terms": { "en-GB": "online casino", "ru": "\u043E\u043D\u043B\u0430\u0439\u043D-\u043A\u0430\u0437\u0438\u043D\u043E" }, "notes": { "ru": "in a general sense" } }, { "id": 654, "terms": { "en-GB": "Our partners", "da": "Vores partnere", "mn": "\u0411\u0438\u0434\u043D\u0438\u0439 \u0442\u04AF\u043D\u0448\u04AF\u04AF\u0434", "pt-BR": "Nossos parceiros", "ru": "\u041D\u0430\u0448\u0438 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u044B", "uk": "\u041D\u0430\u0448\u0456 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0438", "uz": "Hamkorlarimiz", "uzb": "\u04B2\u0430\u043C\u043A\u043E\u0440\u043B\u0430\u0440\u0438\u043C\u0438\u0437" }, "notes": { "da": "First letter is capitalised when it's a section name.", "ru": `"\u041D\u0430\u0448\u0438" is capitalised because it's a section name`, "uk": `"\u041D\u0430\u0448\u0456" is capitalised because it's a section name` } }, { "id": 655, "terms": { "en-GB": "outdoor court", "pt-BR": "quadra aberta", "ru": "\u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0439 \u043A\u043E\u0440\u0442", "uz": "ochiq kort", "uzb": "\u043E\u0447\u0438\u049B \u043A\u043E\u0440\u0442" } }, { "id": 656, "terms": { "en-GB": "own goal", "az": "avtoqol", "da": "selvm\xE5l", "mn": "\u04E9\u04E9\u0440\u0438\u0439\u043D \u0433\u043E\u043E\u043B", "pt-BR": "gol contra", "ru": "\u0433\u043E\u043B \u0432 \u0441\u0432\u043E\u0438 \u0432\u043E\u0440\u043E\u0442\u0430", "uk": "\u0433\u043E\u043B \u0443 \u0441\u0432\u043E\u0457 \u0432\u043E\u0440\u043E\u0442\u0430", "uz": "avtogol", "uzb": "\u0430\u0432\u0442\u043E\u0433\u043E\u043B" } }, { "id": 657, "terms": { "en-GB": "penalty shootouts", "az": "penalti seriyas\u0131", "da": "straffekastskonkurrence", "mn": "\u0442\u043E\u0440\u0433\u0443\u0443\u043B\u0438\u0439\u043D \u0446\u043E\u0445\u0438\u043B\u0442\u044B\u043D \u0446\u0443\u0432\u0440\u0430\u043B", "pt-BR": "decis\xE3o por p\xEAnaltis", "ru": "\u0441\u0435\u0440\u0438\u044F \u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438", "uk": "\u043F\u0456\u0441\u043B\u044F\u043C\u0430\u0442\u0447\u0435\u0432\u0456 \u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0456", "uz": "penaltilar seriyasi", "uzb": "\u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438\u043B\u0430\u0440 \u0441\u0435\u0440\u0438\u044F\u0441\u0438" } }, { "id": 658, "terms": { "en-GB": "penalty shot", "ru": "\u0448\u0442\u0440\u0430\u0444\u043D\u043E\u0439 \u0431\u0440\u043E\u0441\u043E\u043A" } }, { "id": 659, "terms": { "en-GB": "pending transactions", "ru": "\u043D\u0435\u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u044B\u0435 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438" } }, { "id": 660, "terms": { "en-GB": "Player Protection measures", "az": "Oyun\xE7unu m\xFChafiz\u0259 t\u0259dbirl\u0259ri", "da": "spillerbeskyttelsesforanstaltning", "mn": "\u0422\u043E\u0433\u043B\u043E\u0433\u0447 \u0445\u0430\u043C\u0433\u0430\u0430\u043B\u0430\u0445 \u0430\u0440\u0433\u0430 \u0445\u044D\u043C\u0436\u044D\u044D", "pt-BR": "medidas de prote\xE7\xE3o ao jogador", "ru": "\u043C\u0435\u0440\u044B \u043F\u043E \u0437\u0430\u0449\u0438\u0442\u0435 \u0438\u0433\u0440\u043E\u043A\u043E\u0432", "uk": "\u0437\u0430\u0445\u043E\u0434\u0438 \u0456\u0437 \u0437\u0430\u0445\u0438\u0441\u0442\u0443 \u0433\u0440\u0430\u0432\u0446\u0456\u0432", "uz": "O'yinchini himoya qilish chorasi", "uzb": "\u040E\u0439\u0438\u043D\u0447\u0438\u043D\u0438 \u04B3\u0438\u043C\u043E\u044F \u049B\u0438\u043B\u0438\u0448 \u0447\u043E\u0440\u0430\u0441\u0438" } }, { "id": 661, "terms": { "en-GB": "Potential returns", "da": "Mulig gevinst", "mn": "\u0411\u043E\u043B\u043E\u043C\u0436\u0438\u0442 \u043E\u0440\u043B\u043E\u0433\u043E", "pt-BR": "ganhos potenciais", "ru": "\u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u044B\u043F\u043B\u0430\u0442\u0430", "uk": "\u041F\u043E\u0442\u0435\u043D\u0446\u0456\u0439\u043D\u0430 \u0432\u0438\u043F\u043B\u0430\u0442\u0430", "uz": "Potentsial foyda", "uzb": "\u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u0444\u043E\u0439\u0434\u0430" }, "notes": { "ru": '"\u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F" is capitalised only if used as a section/button name or at the beginning of a sentence', "uk": '"\u041F\u043E\u0442\u0435\u043D\u0446\u0456\u0439\u043D\u0430" is capitalised only if used as a section/button name or at the beginning of a sentence', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 662, "terms": { "en-GB": "powerplay", "ru": "\u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u043E" } }, { "id": 663, "terms": { "en-GB": "powerplay goal", "ru": "\u0433\u043E\u043B \u0432 \u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u0435" } }, { "id": 664, "terms": { "en-GB": "Privileges", "az": "G\xFCz\u0259\u015Ftl\u0259r", "mn": "\u0414\u0430\u0432\u0443\u0443 \u044D\u0440\u0445", "pt-BR": "Privil\xE9gios", "ru": "\u041F\u0440\u0438\u0432\u0438\u043B\u0435\u0433\u0438\u0438", "uk": "\u041F\u0440\u0438\u0432\u0456\u043B\u0435\u0457", "uz": "Imtiyozlar", "uzb": "\u0418\u043C\u0442\u0438\u0451\u0437\u043B\u0430\u0440" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 665, "terms": { "en-GB": "progressive jackpot", "mn": "\u04E9\u0441\u04E9\u043B\u0442\u0442\u044D\u0439 \u0436\u044D\u043A\u043F\u043E\u0442", "ru": "\u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0438\u0432\u043D\u044B\u0439 \u0434\u0436\u0435\u043A\u043F\u043E\u0442", "uk": "\u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0438\u0432\u043D\u0438\u0439 \u0434\u0436\u0435\u043A-\u043F\u043E\u0442" } }, { "id": 666, "terms": { "en-GB": "purse", "az": "pulqab\u0131", "da": "E-wallet", "mn": "\u0445\u044D\u0442\u044D\u0432\u0447", "pt-BR": "carteira", "ru": "\u043A\u043E\u0448\u0435\u043B\u0435\u043A", "uk": "\u0433\u0430\u043C\u0430\u043D\u0435\u0446\u044C", "uz": "hamyon", "uzb": "\u04B3\u0430\u043C\u0451\u043D" }, "notes": { "da": "An\xA0electronic device,\xA0online service, or\xA0software program\xA0that allows one party to make\xA0electronic transactions." } }, { "id": 667, "terms": { "en-GB": "Reality Check", "ru": "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u0432\u0440\u0435\u043C\u0435\u043D\u0438" } }, { "id": 668, "terms": { "en-GB": "red card", "az": "q\u0131rm\u0131z\u0131 v\u0259r\u0259q\u0259", "da": "r\xF8dt kort", "mn": "\u0443\u043B\u0430\u0430\u043D \u0445\u0443\u0443\u0434\u0430\u0441", "ru": "\u043A\u0440\u0430\u0441\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430", "uk": "\u0447\u0435\u0440\u0432\u043E\u043D\u0430 \u043A\u0430\u0440\u0442\u043A\u0430" } }, { "id": 669, "terms": { "en-GB": "Refresh", "da": "Genindl\xE6s", "mn": "\u0428\u0438\u043D\u044D\u0447\u043B\u044D\u0445", "pt-BR": "Atualizar", "ru": "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C", "uk": "\u041E\u043D\u043E\u0432\u0438\u0442\u0438", "uz": "yangilamoq", "uzb": "\u044F\u043D\u0433\u0438\u043B\u0430\u043C\u043E\u049B" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 670, "terms": { "en-GB": "regular season", "ru": "\u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0447\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0442" } }, { "id": 671, "terms": { "en-GB": "Remove All", "ru": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435" }, "notes": { "en-GB": "Capitalised as shown as UI button", "ru": '"\u0423\u0434\u0430\u043B\u0438\u0442\u044C" is capitalised if the phrase is used as a button/feature name' } }, { "id": 672, "terms": { "en-GB": "result", "da": "resultat", "mn": "\u04AF\u0440 \u0434\u04AF\u043D", "ru": "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "uk": "\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442" } }, { "id": 673, "terms": { "en-GB": "reverse forecast double", "mn": "\u0443\u0440\u0432\u0443\u0443 \u0442\u0430\u0430\u043C\u0430\u0433\u043B\u0430\u043B\u044B\u043D \u0445\u043E\u0441", "ru": "\xAB\u0434\u0432\u043E\u0439\u043D\u0438\u043A\xBB \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0432 \u043B\u044E\u0431\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435", "uk": "\xAB\u0434\u0432\u0456\u0439\u043D\u0438\u043A\xBB \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0443 \u0431\u0443\u0434\u044C-\u044F\u043A\u043E\u043C\u0443 \u043F\u043E\u0440\u044F\u0434\u043A\u0443" } }, { "id": 674, "terms": { "en-GB": "round of 16", "ru": "1/8 \u0444\u0438\u043D\u0430\u043B\u0430", "es": "octavos de final", "es-AR": "octavos de final" } }, { "id": 675, "terms": { "en-GB": "round of 32", "ru": "1/16 \u0444\u0438\u043D\u0430\u043B\u0430", "es": "dieciseisavos de final", "es-AR": "dieciseisavos de final" } }, { "id": 676, "terms": { "en-GB": "Round Robin", "az": "Dair\u0259vi sistem", "da": "round-robin", "mn": "\u0420\u043E\u0431\u0438\u043D \u0422\u043E\u0439\u0440\u043E\u0433", "pt-BR": "todos contra todos", "ru": "\u0420\u0430\u0443\u043D\u0434 \u0420\u043E\u0431\u0438\u043D", "es": "todos contra todos", "es-AR": "todos contra todos", "uk": "\u043A\u0440\u0443\u0433\u043E\u0432\u0438\u0439 \u0442\u0443\u0440\u043D\u0456\u0440", "uz": "Raund Robin", "uzb": "\u0420\u0430\u0443\u043D\u0434 \u0420\u043E\u0431\u0438\u043D" }, "notes": { "az": "as a competition form when all play agains all", "pt-BR": "sports competition system" } }, { "id": 677, "terms": { "en-GB": "Run Outs", "mn": "\u0420\u0430\u043D-\u0410\u0443\u0442", "pt-BR": "run out", "ru": "Run Outs", "uk": "\u0440\u0430\u043D-\u0430\u0443\u0442", "uz": "ran-autlar", "uzb": "\u0440\u0430\u043D-\u0430\u0443\u0442\u043B\u0430\u0440" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 678, "terms": { "en-GB": "Russian Premier League", "ru": "\u0440\u043E\u0441\u0441\u0438\u0439\u0441\u043A\u0430\u044F \u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 679, "terms": { "en-GB": "second leg matches", "ru": "\u043E\u0442\u0432\u0435\u0442\u043D\u044B\u0435 \u043C\u0430\u0442\u0447\u0438" } }, { "id": 680, "terms": { "en-GB": "semi-finalist", "ru": "\u043F\u043E\u043B\u0443\u0444\u0438\u043D\u0430\u043B\u0438\u0441\u0442" } }, { "id": 681, "terms": { "en-GB": "series", "da": "serie", "pt-BR": "s\xE9rie", "ru": "\u0441\u0435\u0440\u0438\u044F", "uz": "seriyalar", "uzb": "\u0441\u0435\u0440\u0438\u044F\u043B\u0430\u0440" } }, { "id": 682, "terms": { "en-GB": "shootouts", "az": "penalti seriyas\u0131", "mn": "\u0442\u043E\u0440\u0433\u0443\u0443\u043B\u0438\u0439\u043D \u0446\u043E\u0445\u0438\u043B\u0442", "ru": "\u043F\u043E\u0441\u043B\u0435\u043C\u0430\u0442\u0447\u0435\u0432\u044B\u0435 \u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438", "uk": "\u043F\u0456\u0441\u043B\u044F\u043C\u0430\u0442\u0447\u0435\u0432\u0456 \u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0456" } }, { "id": 683, "terms": { "en-GB": "shoot-outs", "mn": "\u0442\u043E\u0440\u0433\u0443\u0443\u043B\u0438\u0439\u043D \u0446\u043E\u0445\u0438\u043B\u0442", "ru": "\u043F\u043E\u0441\u043B\u0435\u043C\u0430\u0442\u0447\u0435\u0432\u044B\u0435 \u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0438", "uk": "\u043F\u0456\u0441\u043B\u044F\u043C\u0430\u0442\u0447\u0435\u0432\u0456 \u043F\u0435\u043D\u0430\u043B\u044C\u0442\u0456" } }, { "id": 684, "terms": { "en-GB": "Shots on Target", "az": "\xC7\u0259r\xE7iv\u0259y\u0259 d\xFC\u015F\u0259n z\u0259rb\u0259l\u0259r", "da": "Skud p\xE5 m\xE5l", "mn": "\u041E\u043D\u043E\u0432\u0447\u0442\u043E\u0439 \u0446\u043E\u0445\u0438\u043B\u0442", "pt-BR": "Finaliza\xE7\xF5es no gol", "ru": "\u0423\u0434\u0430\u0440\u044B \u0432 \u0441\u0442\u0432\u043E\u0440", "es": "Tiros a puerta", "es-AR": "Tiros a puerta", "uk": "\u0423\u0434\u0430\u0440\u0438 \u0443 \u0441\u0442\u0432\u043E\u0440", "uz": "Darvozaga aniq zarbalar", "uzb": "\u0414\u0430\u0440\u0432\u043E\u0437\u0430\u0433\u0430 \u0430\u043D\u0438\u049B \u0437\u0430\u0440\u0431\u0430\u043B\u0430\u0440" }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 685, "terms": { "en-GB": "side", "da": "hold", "ru": "\u043A\u043E\u043C\u0430\u043D\u0434\u0430", "uk": "\u043A\u043E\u043C\u0430\u043D\u0434\u0430", "uz": "jamoa", "uzb": "\u0436\u0430\u043C\u043E\u0430" } }, { "id": 686, "terms": { "en-GB": "straight forecast double", "mn": "\u0448\u0443\u0443\u0434 \u0442\u0430\u0430\u043C\u0430\u0433\u043B\u0430\u043B\u044B\u043D \u0445\u043E\u0441", "ru": "\u0441\u0442\u0430\u0432\u043A\u0430 \xAB\u0434\u0432\u043E\u0439\u043D\u0438\u043A\xBB \u043D\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0432 \u043B\u044E\u0431\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435", "uk": "\xAB\u0434\u0432\u0456\u0439\u043D\u0438\u043A\xBB \u043D\u0430 \u043F\u0440\u044F\u043C\u0438\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437" } }, { "id": 687, "terms": { "en-GB": "substitution", "ru": "\u0437\u0430\u043C\u0435\u043D\u0430" } }, { "id": 688, "terms": { "en-GB": "Super Over", "ru": "\u0421\u0443\u043F\u0435\u0440 \u043E\u0432\u0435\u0440" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 689, "terms": { "en-GB": "System", "az": "Sistem", "da": "systemspil", "mn": "\u0441\u0438\u0441\u0442\u0435\u043C", "pt-BR": "aposta do Sistema", "ru": "\u0441\u0438\u0441\u0442\u0435\u043C\u0430", "es": "apuesta de sistema", "es-AR": "apuesta de sistema", "uk": "\xABc\u0438\u0441\u0442\u0435\u043C\u0430\xBB", "uz": "\xABSistema\xBB", "uzb": "\xAB\u0421\u0438\u0441\u0442\u0435\u043C\u0430\xBB" }, "notes": { "uz": "type of bet", "uzb": "type of bet" } }, { "id": 690, "terms": { "en-GB": "technical decision", "ru": "\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u0435" } }, { "id": 691, "terms": { "en-GB": "Telegram", "ru": "\u0422\u0435\u043B\u0435\u0433\u0440\u0430\u043C" } }, { "id": 692, "terms": { "en-GB": "Telegram bot", "ru": "\u0442\u0435\u043B\u0435\u0433\u0440\u0430\u043C-\u0431\u043E\u0442" } }, { "id": 693, "terms": { "en-GB": "Telegram channel", "ru": "\u0442\u0435\u043B\u0435\u0433\u0440\u0430\u043C-\u043A\u0430\u043D\u0430\u043B" } }, { "id": 694, "terms": { "en-GB": "test match", "da": "testkamp", "mn": "\u0442\u0443\u0440\u0448\u0438\u043B\u0442\u044B\u043D \u0442\u043E\u0433\u043B\u043E\u043B\u0442", "ru": "\u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u043C\u0430\u0442\u0447", "uk": "\u0442\u0435\u0441\u0442\u043E\u0432\u0438\u0439 \u043C\u0430\u0442\u0447" } }, { "id": 695, "terms": { "en-GB": "Total Shots", "ru": "\u0423\u0434\u0430\u0440\u044B \u0432\u0441\u0435\u0433\u043E" }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 696, "terms": { "en-GB": "Total Wides", "ru": '\u0422\u043E\u0442\u0430\u043B "Wides"' }, "notes": { "en-GB": "Capitalised as market name" } }, { "id": 697, "terms": { "en-GB": "Toto Game", "mn": "\u0422\u043E\u0442\u043E \u0437\u04E9\u0432 \u043E\u043D\u043E\u043E", "ru": "\u0442\u043E\u0442\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \xAB\u0422\u043E\u0447\u043D\u044B\u0439 \u0441\u0447\u0435\u0442\xBB", "uk": "\u0442\u0438\u0440\u0430\u0436" }, "notes": { "en-GB": "Both words are written with capital letters when the term refers to a specific game, e.g. 'Toto Game #3258'." } }, { "id": 698, "terms": { "en-GB": "Toto pool", "az": "Toto fondu", "mn": "\u0422\u043E\u0442\u043E \u0441\u0430\u043D", "ru": "\u043F\u0443\u043B", "uk": "\u043F\u0443\u043B" } }, { "id": 699, "terms": { "en-GB": "Toto prize pool", "mn": "\u0422\u043E\u0442\u043E \u0448\u0430\u0433\u043D\u0430\u043B\u044B\u043D \u0441\u0430\u043D", "ru": "\u043F\u0440\u0438\u0437\u043E\u0432\u043E\u0439 \u0444\u043E\u043D\u0434", "uk": "\u043F\u0440\u0438\u0437\u043E\u0432\u0438\u0439 \u0444\u043E\u043D\u0434 \u0442\u043E\u0442\u0430\u043B\u0456\u0437\u0430\u0442\u043E\u0440\u0430" } }, { "id": 700, "terms": { "en-GB": "turnover requirements", "da": "gennemspilskrav", "mn": "\u044D\u0440\u0433\u044D\u043B\u0442\u0438\u0439\u043D \u0448\u0430\u0430\u0440\u0434\u043B\u0430\u0433\u0430", "pt-BR": "requisito de volume de apostas", "ru": "\u0443\u0441\u043B\u043E\u0432\u0438\u044F \u043E\u0442\u044B\u0433\u0440\u044B\u0448\u0430", "uk": "\u0432\u0438\u043C\u043E\u0433\u0438 \u0434\u043E \u043E\u0431\u043E\u0440\u043E\u0442\u0443" }, "notes": { "uk": "possible option if we have '\u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F \u043F\u043E \u043E\u0431\u043E\u0440\u043E\u0442\u0443' in Russian" } }, { "id": 701, "terms": { "en-GB": "Twenty20", "ru": "\u0422\u0432\u0435\u043D\u0442\u0438-\u0442\u0432\u0435\u043D\u0442\u0438" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 702, "terms": { "en-GB": "Upload ID", "ru": "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B" }, "notes": { "en-GB": "Capitalised as shown as UI element/button (internally used term)", "ru": "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C is capitalised if the phrase is used as a button/feature name or at the beginning of a sentence~when referring to the feature and the button name" } }, { "id": 703, "terms": { "en-GB": "VIP club", "ru": "VIP \u041A\u043B\u0443\u0431" }, "notes": { "en-GB": "Always capitalised as shown\u2014acronym" } }, { "id": 704, "terms": { "en-GB": "VIP Club member", "ru": "\u0423\u0447\u0430\u0441\u0442\u043D\u0438\u043A VIP \u041A\u043B\u0443\u0431\u0430" }, "notes": { "en-GB": "Capitalised as shown in general text\u2014proper noun. Capitalised as 'VIP Club Member' as heading on VIP page." } }, { "id": 705, "terms": { "en-GB": "VIP Club membership", "ru": "\u0423\u0447\u0430\u0441\u0442\u0438\u0435 \u0432 VIP \u041A\u043B\u0443\u0431\u0435" }, "notes": { "en-GB": "Capitalised as shown in general text. Capitalised as 'VIP Club Membership' as heading on VIP page." } }, { "id": 706, "terms": { "en-GB": "Virtual Football League", "ru": "\u0412\u0438\u0440\u0442\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0424\u0443\u0442\u0431\u043E\u043B\u044C\u043D\u0430\u044F \u041B\u0438\u0433\u0430" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 707, "terms": { "en-GB": "weigh-in", "ru": "\u0432\u0437\u0432\u0435\u0448\u0438\u0432\u0430\u043D\u0438\u0435" } }, { "id": 708, "terms": { "en-GB": "winless streak", "ru": "\u043D\u0435\u0443\u0434\u0430\u0447\u043D\u0430\u044F \u0441\u0435\u0440\u0438\u044F" } }, { "id": 709, "terms": { "en-GB": "winning streak", "ru": "\u0443\u0441\u043F\u0435\u0448\u043D\u0430\u044F \u0441\u0435\u0440\u0438\u044F" } }, { "id": 710, "terms": { "en-GB": "women's doubles", "ru": "\u0436\u0435\u043D\u0441\u043A\u0438\u0435 \u043F\u0430\u0440\u043D\u044B\u0435 \u0441\u043E\u0440\u0435\u0432\u043D\u043E\u0432\u0430\u043D\u0438\u044F" } }, { "id": 711, "terms": { "en-GB": "women's singles", "ru": "\u0436\u0435\u043D\u0441\u043A\u0438\u0435 \u043E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0435 \u0441\u043E\u0440\u0435\u0432\u043D\u043E\u0432\u0430\u043D\u0438\u044F" } }, { "id": 712, "terms": { "en-GB": "World Cup", "ru": "\u0447\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0442 \u043C\u0438\u0440\u0430" }, "notes": { "en-GB": "Always capitalised\u2014proper noun" } }, { "id": 713, "terms": { "en-GB": "Affiliates", "uz": "Hamkorlik dasturi", "uzb": "\u04B2\u0430\u043C\u043A\u043E\u0440\u043B\u0438\u043A \u0434\u0430\u0441\u0442\u0443\u0440\u0438" }, "notes": { "en-GB": "as a section name" } }, { "id": 714, "terms": { "en-GB": "attempt", "uz": "urinish", "uzb": "\u0443\u0440\u0438\u043D\u0438\u0448" } }, { "id": 715, "terms": { "en-GB": "available bonus", "pt-BR": "b\xF4nus dispon\xEDveis", "ru": "\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0431\u043E\u043D\u0443\u0441", "uk": "\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u0431\u043E\u043D\u0443\u0441", "uz": "mavjud bonus", "uzb": "\u043C\u0430\u0432\u0436\u0443\u0434 \u0431\u043E\u043D\u0443\u0441" } }, { "id": 716, "terms": { "en-GB": "champion", "uz": "chempion", "uzb": "\u0447\u0435\u043C\u043F\u0438\u043E\u043D" } }, { "id": 717, "terms": { "en-GB": "federation", "uz": "federatsiya", "uzb": "\u0444\u0435\u0434\u0435\u0440\u0430\u0446\u0438\u044F" } }, { "id": 718, "terms": { "en-GB": "finisher", "uz": "finisher", "uzb": "\u0444\u0438\u043D\u0438\u0448\u0435\u0440" } }, { "id": 719, "terms": { "en-GB": "Gambling rules", "uz": "qimor qoidalari", "uzb": "\u049B\u0438\u043C\u043E\u0440 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440\u0438" }, "notes": { "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 720, "terms": { "en-GB": "Log in", "pt-BR": "fazer login", "uz": "Kirish", "uzb": "\u041A\u0438\u0440\u0438\u0448" }, "notes": { "uz": "UI", "uzb": "UI" } }, { "id": 721, "terms": { "en-GB": "Log out", "uz": "Chiqish", "uzb": "\u0427\u0438\u049B\u0438\u0448" } }, { "id": 722, "terms": { "en-GB": "Marathonbet Terms and Conditions", "uz": "Marathonbet shartlari va qoidalari", "uzb": "Marathonbet \u0448\u0430\u0440\u0442\u043B\u0430\u0440\u0438 \u0432\u0430 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440\u0438" }, "notes": { "uz": "always capitalised first letter", "uzb": "always capitalised first letter" } }, { "id": 723, "terms": { "en-GB": "Prize Pool", "uz": "mukofot jamg'armasi", "uzb": "\u043C\u0443\u043A\u043E\u0444\u043E\u0442 \u0436\u0430\u043C\u0493\u0430\u0440\u043C\u0430\u0441\u0438" } }, { "id": 724, "terms": { "en-GB": "Promotion Terms and Conditions", "uz": "Aksiya shartlari va qoidalari", "uzb": "\u0410\u043A\u0446\u0438\u044F \u0448\u0430\u0440\u0442\u043B\u0430\u0440\u0438 \u0432\u0430 \u049B\u043E\u0438\u0434\u0430\u043B\u0430\u0440\u0438" }, "notes": { "uz": "always capitalised first letter", "uzb": "always capitalised first letter" } }, { "id": 725, "terms": { "en-GB": "Remove all", "da": "Fjern alle", "mn": "\u0411\u04AF\u0433\u0434\u0438\u0439\u0433 \u0443\u0441\u0442\u0433\u0430\u0445", "pt-BR": "Remover tudo", "ru": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435", "uk": "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u0432\u0441\u0435", "uz": "Barchasini olib tashlash", "uzb": "\u0411\u0430\u0440\u0447\u0430\u0441\u0438\u043D\u0438 \u043E\u043B\u0438\u0431 \u0442\u0430\u0448\u043B\u0430\u0448" }, "notes": { "ru": '"\u0423\u0434\u0430\u043B\u0438\u0442\u044C" is capitalised if the phrase is used as a button/feature name', "uz": "Standard capitalisation rules apply", "uzb": "Standard capitalisation rules apply" } }, { "id": 726, "terms": { "en-GB": "semi final", "uz": "yarim final", "uzb": "\u044F\u0440\u0438\u043C \u0444\u0438\u043D\u0430\u043B" } }, { "id": 727, "terms": { "en-GB": "sport statistics", "az": "idman statistikas\u0131", "uz": "sport statistikasi", "uzb": "\u0441\u043F\u043E\u0440\u0442 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430\u0441\u0438" } }, { "id": 728, "terms": { "en-GB": "Time Out", "mn": "\u0417\u0430\u0432\u0441\u0430\u0440\u043B\u0430\u0433\u0430", "ru": "\u0442\u0430\u0439\u043C-\u0430\u0443\u0442", "uk": "\u0442\u0430\u0439\u043C-\u0430\u0443\u0442", "uz": "brief game suspension in sports", "uzb": "\u0442\u0430\u043D\u0430\u0444\u0444\u0443\u0441" }, "notes": { "uz": "tanaffus", "uzb": "brief game suspension in sports" } }, { "id": 729, "terms": { "en-GB": "tour", "uz": "turne", "uzb": "\u0442\u0443\u0440\u043D\u0435" } }, { "id": 730, "terms": { "en-GB": "Union Jack", "uz": "Yunion Jek", "uzb": "\u042E\u043D\u0438\u043E\u043D \u0416\u0435\u043A" } }, { "id": 731, "terms": { "en-GB": "Aussie Rules", "da": "australsk fodbold", "mn": "AFL (\u0410\u0432\u0441\u0442\u0440\u0430\u043B\u0438 \u0434\u04AF\u0440\u044D\u043C)", "ru": "\u0430\u0432\u0441\u0442\u0440\u0430\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B", "uk": "\u0430\u0432\u0441\u0442\u0440\u0430\u043B\u0456\u0439\u0441\u044C\u043A\u0438\u0439 \u0444\u0443\u0442\u0431\u043E\u043B" } }, { "id": 732, "terms": { "en-GB": "Bet Max", "da": "Max-spil" } }, { "id": 733, "terms": { "en-GB": "Bonus code", "da": "Bonuskode" } }, { "id": 734, "terms": { "en-GB": "cashback", "da": "cashback" } }, { "id": 735, "terms": { "en-GB": "Championship", "da": "Championship" }, "notes": { "da": "The second-highest league in the English football league system" } }, { "id": 736, "terms": { "en-GB": "Combination Forecast", "az": "Kombinasiyal\u0131 proqnoz", "da": "Komb (Serie)", "pt-BR": "Previs\xE3o de combina\xE7\xE3o" }, "notes": { "pt-BR": "The English version should be added to the first occurrence for clarity purposes: 'Previs\xE3o de combina\xE7\xE3o (Combination Forecast)'." } }, { "id": 737, "terms": { "en-GB": "Combination Tricast", "az": "Kombinasiyal\u0131 \xFC\xE7l\xFC proqnoz", "da": "Trio (Serie)", "pt-BR": "Tricast de combina\xE7\xE3o" }, "notes": { "pt-BR": "The English version should be added to the first occurrence for clarity purposes: 'Tricast de combina\xE7\xE3o (Combination Tricast)'." } }, { "id": 738, "terms": { "en-GB": "Double Forecast", "da": "Dobbelt-komb" } }, { "id": 739, "terms": { "en-GB": "Draw No Bet", "da": "Draw No Bet", "pt-BR": "Empate anula aposta" } }, { "id": 740, "terms": { "en-GB": "Extra Bet", "da": "Extrabet" }, "notes": { "da": 'Spelled with "X" for brand purposes.' } }, { "id": 741, "terms": { "en-GB": "Extra Spin", "da": "Extraspin" }, "notes": { "da": 'Spelled with "X" for brand purposes.' } }, { "id": 742, "terms": { "en-GB": "Logout", "da": "Log ud", "mn": "\u0413\u0430\u0440\u0430\u0445", "pt-BR": "Encerrar sess\xE3o", "ru": "\u0412\u044B\u0439\u0442\u0438", "uk": "\u0412\u0438\u0439\u0442\u0438" }, "notes": { "da": "First word capitalised when used as a button name.", "pt-BR": "Verb" } }, { "id": 743, "terms": { "en-GB": "Not to be Placed", "da": "Bliver Ikke Placeret" }, "notes": { "en-GB": "Capitalised when market name", "da": "All words capitalised, when it's a market name." } }, { "id": 744, "terms": { "en-GB": "permutation bet", "da": "permutationsv\xE6ddem\xE5l" } }, { "id": 745, "terms": { "en-GB": "Play now", "da": "Spil nu" } }, { "id": 746, "terms": { "en-GB": "Reverse Forecast", "da": "Tvilling (Reverse)", "pt-BR": "Previs\xE3o invertida" } }, { "id": 747, "terms": { "en-GB": "Reverse Forecast Double", "da": "Dobbelt-tvilling (Reverse)" } }, { "id": 748, "terms": { "en-GB": "Reverse Tricast", "da": "Trio (Reverse)" } }, { "id": 749, "terms": { "en-GB": "Run Out", "da": "\u201DL\xF8bet ud\u201D" } }, { "id": 750, "terms": { "en-GB": "Straight Forecast", "da": "Komb (Ren)", "pt-BR": "Previs\xE3o direta" }, "notes": { "pt-BR": "The English version should be added to the first occurrence for clarity purposes: 'Previs\xE3o direta (Straight Forecast)'." } }, { "id": 751, "terms": { "en-GB": "Straight Forecast Double", "da": "Dobbelt-komb (Ren)" } }, { "id": 752, "terms": { "en-GB": "Straight Tricast", "da": "Trio (Ren)", "pt-BR": "Tricast Direta" }, "notes": { "pt-BR": "The English version should be added to the first occurrence for clarity purposes: 'Tricast Direta (Straight Tricast)'." } }, { "id": 753, "terms": { "en-GB": "To be Placed", "da": "Bliver Placeret" } }, { "id": 754, "terms": { "en-GB": "To Win from Behind", "da": "Vinder Efter At Have V\xE6ret Bagud" }, "notes": { "en-GB": "Capitalised when market name", "da": "All words capitalised when it's market name." } }, { "id": 755, "terms": { "en-GB": "Tricast", "da": "Trio" } }, { "id": 756, "terms": { "en-GB": "Weekly Limit", "da": "ugentlig gr\xE6nse" } }, { "id": 757, "terms": { "en-GB": "Flag", "mn": "\u0422\u0443\u0433", "ru": "\u0444\u043B\u0430\u0433", "uk": "\u0444\u043B\u0430\u0433" } }, { "id": 758, "terms": { "en-GB": "internet", "mn": "\u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442", "ru": "\u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442" } }, { "id": 759, "terms": { "en-GB": "Advancebet", "pt-BR": "Advancebet" } }, { "id": 760, "terms": { "en-GB": "heat", "pt-BR": "bateria" }, "notes": { "en-GB": "in the meaning of 'round'" } }, { "id": 761, "terms": { "en-GB": "high-octane", "pt-BR": "din\xE2mico" }, "notes": { "en-GB": "referring to a game (jogo)" } }, { "id": 762, "terms": { "en-GB": "Important operations", "pt-BR": "opera\xE7\xF5es importantes" }, "notes": { "en-GB": "Capitalised as function name" } }, { "id": 763, "terms": { "en-GB": "inactive", "az": "f\u0259aliyy\u0259tsiz", "pt-BR": "sem movimenta\xE7\xE3o" } }, { "id": 764, "terms": { "en-GB": "limit", "pt-BR": "limite" } }, { "id": 765, "terms": { "en-GB": "mechanics", "pt-BR": "din\xE2mica" }, "notes": { "en-GB": "for 'promotion mechanics' and similar meanings in promotion T&Cs" } }, { "id": 766, "terms": { "en-GB": "prediction", "pt-BR": "palpite" }, "notes": { "en-GB": "betting, for blog" } }, { "id": 767, "terms": { "en-GB": "preview", "pt-BR": "palpite" }, "notes": { "en-GB": "betting, for blog" } }, { "id": 768, "terms": { "en-GB": "To Win Match with Handicap", "pt-BR": "Ganha a partida com handicap" } }, { "id": 769, "terms": { "en-GB": "try", "az": "c\u0259hd", "pt-BR": "try" } }, { "id": 770, "terms": { "en-GB": "advance", "az": "avans" } }, { "id": 771, "terms": { "en-GB": "ATM", "az": "bankomat" } }, { "id": 772, "terms": { "en-GB": "bet return", "az": "m\u0259rc qazanc\u0131" } }, { "id": 773, "terms": { "en-GB": "betting partner", "az": "m\u0259rc orta\u011F\u0131" } }, { "id": 774, "terms": { "en-GB": "Betting Rules", "az": "M\u0259rcl\u0259\u015Fm\u0259 Qaydalar\u0131" } }, { "id": 775, "terms": { "en-GB": "Bonus catalogue", "az": "bonus kataloqu" } }, { "id": 776, "terms": { "en-GB": "cookies", "az": "kuki" } }, { "id": 777, "terms": { "en-GB": "Dear $name", "az": "\u018Fziz $name" } }, { "id": 778, "terms": { "en-GB": "Dear customer", "az": "H\xF6rm\u0259tli M\xFC\u015Ft\u0259ri" } }, { "id": 779, "terms": { "en-GB": "download", "az": "endir" } }, { "id": 780, "terms": { "en-GB": "general rules", "az": "\xFCmumi qaydalar" } }, { "id": 781, "terms": { "en-GB": "home page", "az": "\u0259sas s\u0259hif\u0259" } }, { "id": 782, "terms": { "en-GB": "JavaScript", "az": "JavaScript" } }, { "id": 783, "terms": { "en-GB": "link", "az": "link", "es": "enlace", "es-AR": "enlace" } }, { "id": 784, "terms": { "en-GB": "Live", "az": "Canl\u0131" } }, { "id": 785, "terms": { "en-GB": "live events", "az": "canl\u0131 t\u0259dbirl\u0259r" } }, { "id": 786, "terms": { "en-GB": "loser", "az": "uduzan" } }, { "id": 787, "terms": { "en-GB": "Loss Limit", "az": "itki limiti" } }, { "id": 788, "terms": { "en-GB": "Loyalty Program History", "az": "Loyall\u0131q proqram\u0131n\u0131n tarix\xE7\u0259si" } }, { "id": 789, "terms": { "en-GB": "Match Result", "az": "Mat\xE7 n\u0259tic\u0259si" } }, { "id": 790, "terms": { "en-GB": "Match Winner", "az": "Mat\xE7 qalibi" } }, { "id": 791, "terms": { "en-GB": "multiply", "az": "\xE7oxsayl\u0131" } }, { "id": 792, "terms": { "en-GB": "Not To Be Placed", "az": "Yer tutmayacaq" }, "notes": { "az": "used in markets" } }, { "id": 793, "terms": { "en-GB": "outright bet", "az": "yekun m\u0259rc" } }, { "id": 794, "terms": { "en-GB": "receipt", "az": "q\u0259bz" } }, { "id": 795, "terms": { "en-GB": "regular time", "az": "\u0259sas vaxt" }, "notes": { "az": "for all sports" } }, { "id": 796, "terms": { "en-GB": "score draw", "az": "He\xE7-he\xE7\u0259 et" } }, { "id": 797, "terms": { "en-GB": "settings", "az": "parametrl\u0259r" } }, { "id": 798, "terms": { "en-GB": "settlement", "az": "hesablanma" } }, { "id": 799, "terms": { "en-GB": "shoot", "az": "vuru\u015F" }, "notes": { "az": "can be used in ice hockey for 'shot'" } }, { "id": 800, "terms": { "en-GB": "Tattersalls", "az": "Tattersalls" } }, { "id": 801, "terms": { "en-GB": "Tattersalls' rule", "az": "Tattersalls qaydas\u0131" } }, { "id": 802, "terms": { "en-GB": "tie-break", "az": "tay-breyk" } }, { "id": 803, "terms": { "en-GB": "timeout", "az": "taym-aut" } }, { "id": 804, "terms": { "en-GB": "to be Placed", "az": "Yer tutacaq" }, "notes": { "en-GB": "used in markets" } }, { "id": 805, "terms": { "en-GB": "To Be Promoted", "az": "Daha y\xFCks\u0259k \xE7empionatda oynamaq \xFC\xE7\xFCn" } }, { "id": 806, "terms": { "en-GB": "To Qualify", "az": "N\xF6vb\u0259ti m\u0259rh\u0259l\u0259y\u0259 \xE7\u0131x\u0131\u015F \xFC\xE7\xFCn" } }, { "id": 807, "terms": { "en-GB": "Total", "az": "Toplam" } }, { "id": 808, "terms": { "en-GB": "Win From Behind", "az": "Uduzaraq mat\xE7\u0131 q\u0259l\u0259b\u0259 il\u0259 bitirm\u0259k" } }, { "id": 809, "terms": { "en-GB": "Win To Nil", "az": "Quru hesabla q\u0259l\u0259b\u0259" } }, { "id": 810, "terms": { "en-GB": "Winning Margin", "az": "Hesab f\u0259rqi" } }, { "id": 811, "terms": { "en-GB": "cryptocurrency", "az": "kriptovalyuta", "es": "criptomoneda", "es-AR": "criptomoneda" } }, { "id": 812, "terms": { "en-GB": "mobile phone", "es": "tel\xE9fono m\xF3vil", "es-AR": "tel\xE9fono celular" } }, { "id": 813, "terms": { "en-GB": "World Championship (League of Legends)", "es": "Mundial", "es-AR": "Worlds" } }, { "id": 814, "terms": { "en-GB": "goalpost", "es-AR": "arco" } }, { "id": 815, "terms": { "en-GB": "football pitch", "es-AR": "cancha" } }, { "id": 816, "terms": { "en-GB": "Free Chips", "az": "pulsuz \xE7ipsl\u0259r", "ru": "\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0435 \u0444\u0438\u0448\u043A\u0438", "es": "Fichas Gratis", "es-AR": "Fichas Gratis", "uz": "bepul chiplar", "uzb": "\u0431\u0435\u043F\u0443\u043B \u0447\u0438\u043F\u043B\u0430\u0440" } }, { "id": 817, "terms": { "en-GB": "Reload Bonus", "az": "Yenid\u0259n y\xFCkl\u0259m\u0259 bonusu", "mn": "\u0414\u0430\u0445\u0438\u043D \u0446\u044D\u043D\u044D\u0433\u043B\u044D\u0433\u0447 \u0411\u043E\u043D\u0443\u0441", "pt-BR": "B\xF4nus de Recarga", "ru": "\u0420\u0435\u043B\u043E\u0430\u0434-\u0431\u043E\u043D\u0443\u0441", "es": "Bono de recarga", "es-AR": "Bono de recarga", "uz": "Reload bonusi", "uzb": "\u0420\u0435\u043B\u043E\u0430\u0434 \u0431\u043E\u043D\u0443\u0441\u0438" } }, { "id": 818, "terms": { "en-GB": "crypto wallet", "es-AR": "billetera cripto" } }, { "id": 819, "terms": { "en-GB": "match", "es": "partida", "es-AR": "partida" } }, { "id": 820, "terms": { "en-GB": "draft", "es": "fase de selecci\xF3n", "es-AR": "fase de selecci\xF3n" } }, { "id": 821, "terms": { "en-GB": "European Championship", "es": "EURO", "es-AR": "EURO" } }, { "id": 822, "terms": { "en-GB": "quarter final", "es": "cuartos de final", "es-AR": "cuartos de final" } }];

  // src/domain.js
  var POOLS2 = Object.freeze([
    "Numbers",
    "Currency",
    "Percentage",
    "Punctuation",
    "Spacing",
    "Capitalization",
    "Placeholders",
    "Terminology",
    "Formatting",
    "Transliteration",
    "Dates & Time",
    "File structure"
  ]);
  var SEVERITIES2 = Object.freeze(["Critical", "Major", "Minor", "Info"]);
  function createIssue2({ error_type, pool, severity = "Minor", location_in_target, location_in_source, explanation, glossary, timezone, format }) {
    if (!error_type || !POOLS2.includes(pool) || !SEVERITIES2.includes(severity)) {
      throw new Error("Invalid issue contract");
    }
    return {
      error_type,
      pool,
      severity,
      location_in_target: location_in_target ?? { start: 0, end: 0 },
      ...location_in_source ? { location_in_source } : {},
      ...explanation ? { explanation } : {},
      ...glossary ? { glossary } : {},
      ...timezone ? { timezone } : {},
      ...format ? { format } : {}
    };
  }
  function location2(start, end) {
    return { start, end };
  }

  // src/glossary.js?v=2.2
  var GLOSSARY_LANGUAGES = Object.freeze({
    en: "en-GB",
    az: "az",
    da: "da",
    mn: "mn",
    "pt-BR": "pt-BR",
    ru: "ru",
    es: "es",
    "es-AR": "es-AR",
    uk: "uk",
    "uz-Latn": "uz",
    "uz-Cyrl": "uzb"
  });
  var STORAGE_KEY2 = "checkform-glossary-edits-v1";
  var overrides = {};
  var customRows = [];
  function browserStorage2() {
    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }
  function glossarySourceLanguage(targetLanguage2) {
    return targetLanguage2 === "uk" ? "ru" : "en";
  }
  function loadGlossaryEdits(storage = browserStorage2()) {
    try {
      const saved = JSON.parse(storage?.getItem(STORAGE_KEY2) ?? "{}");
      overrides = saved.overrides && typeof saved.overrides === "object" ? saved.overrides : {};
      customRows = Array.isArray(saved.customRows) ? saved.customRows : [];
    } catch {
      overrides = {};
      customRows = [];
    }
    return getGlossaryRows();
  }
  function getGlossaryRows() {
    return [...GLOSSARY_DEFAULTS, ...customRows].map((row) => ({
      ...row,
      terms: { ...row.terms, ...overrides[row.id] ?? {} }
    }));
  }
  function persist(storage = browserStorage2()) {
    try {
      storage?.setItem(STORAGE_KEY2, JSON.stringify({ overrides, customRows }));
      return true;
    } catch {
      return false;
    }
  }
  function updateGlossaryTerm(rowId, language, value, storage = browserStorage2()) {
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
  function addGlossaryRow(sourceLanguage2, targetLanguage2, sourceTerm, targetTerm, storage = browserStorage2()) {
    const from = GLOSSARY_LANGUAGES[sourceLanguage2];
    const to = GLOSSARY_LANGUAGES[targetLanguage2];
    if (!from || !to || !String(sourceTerm).trim()) return null;
    const row = { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, terms: { [from]: String(sourceTerm).trim(), [to]: String(targetTerm).trim() } };
    customRows.push(row);
    persist(storage);
    return row;
  }
  function glossaryEntryCount() {
    return GLOSSARY_DEFAULTS.length + customRows.length;
  }
  function phrasePattern(term, matchCase = false) {
    const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
  }
  function targetAnchor(target, sourcePosition, sourceLength) {
    if (!target.length) return location2(0, 0);
    const approximate = Math.min(target.length - 1, Math.floor(sourcePosition / Math.max(sourceLength, 1) * target.length));
    const after = target.slice(approximate).search(/[\p{L}\p{N}]/u);
    const before = [...target.slice(0, approximate + 1).matchAll(/[\p{L}\p{N}]/gu)].at(-1)?.index;
    const start = after >= 0 ? approximate + after : before ?? 0;
    const word = target.slice(start).match(/^[\p{L}\p{N}]+/u)?.[0] ?? target[start];
    return location2(start, start + word.length);
  }
  function checkGlossary(source, target, sourceLanguage2, targetLanguage2, rows = getGlossaryRows()) {
    if (sourceLanguage2 !== glossarySourceLanguage(targetLanguage2) || !GLOSSARY_LANGUAGES[targetLanguage2]) return [];
    const from = GLOSSARY_LANGUAGES[sourceLanguage2];
    const to = GLOSSARY_LANGUAGES[targetLanguage2];
    const groups = /* @__PURE__ */ new Map();
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
        const enforceCase = Boolean(exactEntries.length) && (/[\p{Lu}]/u.test(match[0]) || expectedTerms.some((term) => /[\p{Lu}]/u.test(term)));
        if (caseOnlyMatch) {
          if (!enforceCase) continue;
          matched.push(createIssue2({
            error_type: "GLOSSARY_CASE_MISMATCH",
            pool: "Terminology",
            severity: "Minor",
            location_in_source: location2(start, end),
            location_in_target: location2(caseOnlyMatch.index, caseOnlyMatch.index + caseOnlyMatch[0].length),
            glossary: { sourceTerm: match[0], expectedTerms, actualTerm: caseOnlyMatch[0], rows: entries.map((entry) => entry.id) },
            explanation: `Glossary translation has the wrong letter case. Expected: ${expectedTerms.join(" / ")}; found: ${caseOnlyMatch[0]}.`
          }));
          continue;
        }
        matched.push(createIssue2({
          error_type: "GLOSSARY_TRANSLATION_MISSING",
          pool: "Terminology",
          severity: "Major",
          location_in_source: location2(start, end),
          location_in_target: targetAnchor(target, start, source.length),
          glossary: { sourceTerm: match[0], expectedTerms, rows: entries.map((entry) => entry.id) },
          explanation: `Glossary term \u201C${match[0]}\u201D has no listed translation in this target passage. Expected: ${expectedTerms.join(" / ")}.`
        }));
      }
    }
    return matched;
  }

  // src/segments.js?v=1.1
  var LABEL_RE = /^(\p{L}[\p{L} ]{1,28}):[ \t]*$/gmu;
  function normalizeLabel(label) {
    const plain = label.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    return { texto: "text", boton: "button", encabezado: "header", preencabezado: "preheader" }[plain] ?? plain;
  }
  function extractLabeledSegments(text) {
    const labels = [...text.matchAll(LABEL_RE)];
    return labels.map((match, index) => {
      const contentStart = match.index + match[0].length;
      const contentEnd = labels[index + 1]?.index ?? text.length;
      const raw = text.slice(contentStart, contentEnd);
      const leading = raw.search(/\S/);
      const trimmed = leading < 0 ? "" : raw.trim();
      const value = normalizeLabel(match[1]) === "button" ? trimmed.split(/\r?\n/).find(Boolean) ?? "" : trimmed;
      const start = leading < 0 ? contentStart : contentStart + leading;
      return { label: normalizeLabel(match[1]), text: value, start, end: start + value.length, lineStart: match.index };
    }).filter((segment) => segment.text);
  }
  function pairHeaderBlocks(source, target) {
    const sourceHeaders = extractLabeledSegments(source).filter((segment) => segment.label === "header");
    const targetHeaders = extractLabeledSegments(target).filter((segment) => segment.label === "header");
    if (sourceHeaders.length < 2 || targetHeaders.length < 2 || sourceHeaders.length !== targetHeaders.length) return [];
    return sourceHeaders.map((sourceHeader, index) => {
      const targetHeader = targetHeaders[index];
      const sourceEnd = sourceHeaders[index + 1]?.lineStart ?? source.length;
      const targetEnd = targetHeaders[index + 1]?.lineStart ?? target.length;
      return {
        source: { text: source.slice(sourceHeader.start, sourceEnd).trim(), start: sourceHeader.start },
        target: { text: target.slice(targetHeader.start, targetEnd).trim(), start: targetHeader.start }
      };
    });
  }
  function pairLabeledSegments(source, target) {
    const sourceSegments = extractLabeledSegments(source);
    const targetSegments = extractLabeledSegments(target);
    if (sourceSegments.length < 2 || targetSegments.length < 2) return [];
    const targetByLabel = /* @__PURE__ */ new Map();
    for (const segment of targetSegments) {
      const items = targetByLabel.get(segment.label) ?? [];
      items.push(segment);
      targetByLabel.set(segment.label, items);
    }
    const used = /* @__PURE__ */ new Map();
    return sourceSegments.flatMap((sourceSegment) => {
      const items = targetByLabel.get(sourceSegment.label) ?? [];
      const index = used.get(sourceSegment.label) ?? 0;
      used.set(sourceSegment.label, index + 1);
      const targetSegment = items[index];
      return targetSegment ? [{ source: sourceSegment, target: targetSegment }] : [];
    });
  }

  // src/engine.js?v=3.0
  var NUMBER_RE = /(?<![\w.,])(?:\d{1,3}(?:[.,\u00a0 ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(?![\w]|[.,](?=\d))/g;
  var PLACEHOLDER_RE = /\{[^{}]+\}|%\w+|\$\{[^}]+\}/g;
  var MASKED_PLACEHOLDER_RE = /(?:(?:AR|ARS)\$)?[XХ](?:[.,][XХ]{3})+/gu;
  var DATE_WORDS = "january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\u044F\u043D\u0432\u0430\u0440\u044F|\u0444\u0435\u0432\u0440\u0430\u043B\u044F|\u043C\u0430\u0440\u0442\u0430|\u0430\u043F\u0440\u0435\u043B\u044F|\u043C\u0430\u044F|\u0438\u044E\u043D\u044F|\u0438\u044E\u043B\u044F|\u0430\u0432\u0433\u0443\u0441\u0442\u0430|\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F|\u043E\u043A\u0442\u044F\u0431\u0440\u044F|\u043D\u043E\u044F\u0431\u0440\u044F|\u0434\u0435\u043A\u0430\u0431\u0440\u044F";
  var DAY = "(?:0?[1-9]|[12]\\d|3[01])";
  var MONTH = "(?:0?[1-9]|1[0-2])";
  var TEMPORAL_TOKEN_RE = new RegExp(`\\b\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}\\b|\\b${DAY}[/]${MONTH}(?:[/]\\d{2,4})?\\b|\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:(?:the|of|de)\\s+)?(?:${DATE_WORDS})(?:\\s+(?:de|of))?(?:\\s+\\d{4})?\\b|\\b(?:\\d{1,3}(?:st|nd|rd|th)?\\s+(?:minute|minutes)|(?:minute|minuto|minutos)\\s+\\d{1,3})\\b|\\b\\d{1,2}:\\d{2}(?::\\d{2})?\\s*(?:AM|PM)?\\s*(?:(?:(?:GMT|UTC|MSK|\u041C\u0421\u041A)(?:\\s*[+\\-\u2212]\\s*\\d{0,2}(?::?\\d{2})?)?))?`, "giu");
  var SCORE_RE = /\b\d{1,3}\s*[-:]\s*\d{1,3}\b/g;
  var MALFORMED_DATE_RE = /\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{5,}|\d{4}[-/.]\d{1,2}[-/.]\d{3,})\b/g;
  var DATE_SHAPE_RE = /\b\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/g;
  var ATTACHED_NUMBER_WORD_RE = /(?:\b\d+(?:[.,]\d+)?[\p{Ll}][\p{L}]*\b|\b[\p{Ll}][\p{L}]*\d+(?:[.,]\d+)?\b)/gu;
  var CURRENCY_RE = /ARS\$|AR\$|US\$|R\$|[€$£₽₮₼]|(?<![\w])(USD|EUR|GBP|RUB|UAH|KZT|MNT|AZN|UZS|BRL)(?![\w])/gi;
  function compareTokens(source, target, regex, issue) {
    const sourceTokens = [...source.matchAll(regex)].map((m) => m[0]);
    const targetTokens = [...target.matchAll(regex)].map((m) => m[0]);
    if (sourceTokens.join("|") === targetTokens.join("|")) return [];
    const sourceMatch = source.matchAll(regex).next().value;
    const targetMatch = target.matchAll(regex).next().value;
    return [createIssue({ ...issue, location_in_source: sourceMatch ? location(sourceMatch.index, sourceMatch.index + sourceMatch[0].length) : location(0, 0), location_in_target: targetMatch ? location(targetMatch.index, targetMatch.index + targetMatch[0].length) : location(0, 0) })];
  }
  function canonicalNumber(value) {
    const [integer, fraction] = value.split(".");
    const normalizedInteger = integer.replace(/^0+(?=\d)/, "");
    const normalizedFraction = fraction?.replace(/0+$/, "");
    return normalizedFraction ? `${normalizedInteger}.${normalizedFraction}` : normalizedInteger;
  }
  function normalizeNumber(token, profile) {
    const value = token.replace(/[\s\u00a0]/g, "");
    const decimalSeparator = profile.decimal ?? ".";
    const alternateSeparator = decimalSeparator === "." ? "," : ".";
    const hasDecimal = value.includes(decimalSeparator);
    const hasAlternate = value.includes(alternateSeparator);
    if (hasDecimal && hasAlternate) {
      const lastSeparator = Math.max(value.lastIndexOf(decimalSeparator), value.lastIndexOf(alternateSeparator));
      return canonicalNumber(`${value.slice(0, lastSeparator).replace(/[.,]/g, "")}.${value.slice(lastSeparator + 1)}`);
    }
    if (hasAlternate) {
      const parts = value.split(alternateSeparator);
      const isGrouped = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
      if (isGrouped) return canonicalNumber(parts.join(""));
      const [integer, fraction] = parts;
      return canonicalNumber(`${integer}.${fraction}`);
    }
    return canonicalNumber(hasDecimal ? value.replace(decimalSeparator, ".") : value);
  }
  function numberTokens(text, profile) {
    const masked = text.replace(TEMPORAL_TOKEN_RE, (token) => " ".repeat(token.length)).replace(SCORE_RE, (token) => " ".repeat(token.length));
    return [...masked.matchAll(NUMBER_RE)].map((match) => ({
      raw: match[0],
      normalized: normalizeNumber(match[0], profile),
      index: match.index ?? 0
    })).filter((token) => {
      const before = text.slice(Math.max(0, token.index - 12), token.index).toLowerCase();
      return !/(?:\bdel|\bon the|\bthe)\s*$/.test(before);
    });
  }
  function shouldCompareTerminalPunctuation(source, target) {
    const sourceText2 = source.trim();
    const targetText2 = target.trim();
    const sourceTerminal = sourceText2.match(/[.!?]$/)?.[0] ?? "";
    const targetTerminal = targetText2.match(/[.!?]$/)?.[0] ?? "";
    if (Boolean(sourceTerminal) === Boolean(targetTerminal)) return false;
    const headingLike = sourceText2.length < 90 && targetText2.length < 120 && !/[.!?,;]/.test(sourceText2.slice(0, -1)) && !/[.!?,;]/.test(targetText2.slice(0, -1));
    if (headingLike) return false;
    if (sourceTerminal === "." && targetText2.endsWith(";") && /^[a-záéíóúüñ]/u.test(sourceText2) && /^[a-záéíóúüñ]/u.test(targetText2)) return false;
    return true;
  }
  function spanishQuestionMarkChecks(target) {
    const issues = [];
    for (const match of target.matchAll(/\?/g)) {
      const sentenceStart = Math.max(target.lastIndexOf(".", match.index - 1), target.lastIndexOf("!", match.index - 1), target.lastIndexOf("?", match.index - 1), target.lastIndexOf("\n", match.index - 1)) + 1;
      if (!target.slice(sentenceStart, match.index + 1).includes("\xBF")) {
        issues.push(createIssue({
          error_type: "SPANISH_QUESTION_MARKS",
          pool: "Punctuation",
          severity: "Minor",
          location_in_target: location(match.index, match.index + 1),
          explanation: "In Spanish, a question should open with \xBF and close with ?."
        }));
      }
    }
    for (const match of target.matchAll(/¿/g)) {
      const nextBoundary = target.slice(match.index + 1).search(/[.!?\n]/);
      const end = nextBoundary < 0 ? target.length : match.index + 1 + nextBoundary;
      if (!target.slice(match.index + 1, end + 1).includes("?")) {
        issues.push(createIssue({
          error_type: "SPANISH_QUESTION_MARKS",
          pool: "Punctuation",
          severity: "Minor",
          location_in_target: location(match.index, match.index + 1),
          explanation: "In Spanish, a question should open with \xBF and close with ?."
        }));
      }
    }
    return issues;
  }
  function currencyForNumber(text, token) {
    for (const currency of text.matchAll(CURRENCY_RE)) {
      const start = currency.index ?? 0;
      const end = start + currency[0].length;
      const touches = token.index >= end && /^[ \t\u00a0]*$/.test(text.slice(end, token.index)) || token.index + token.raw.length <= start && /^[ \t\u00a0]*$/.test(text.slice(token.index + token.raw.length, start));
      if (touches) return canonicalCurrency(currency[0]);
    }
    return null;
  }
  function compareNumbersOutsideTemporalText(source, target, sourceProfile, targetProfile, compareCount = true) {
    MALFORMED_DATE_RE.lastIndex = 0;
    const malformedDate = MALFORMED_DATE_RE.exec(target);
    if (malformedDate) {
      DATE_SHAPE_RE.lastIndex = 0;
      const sourceDate = DATE_SHAPE_RE.exec(source);
      return [createIssue({
        error_type: "NUMBER_MISMATCH",
        pool: "Numbers",
        severity: "Major",
        location_in_source: sourceDate ? location(sourceDate.index, sourceDate.index + sourceDate[0].length) : location(0, 0),
        location_in_target: location(malformedDate.index, malformedDate.index + malformedDate[0].length),
        explanation: "A numeric date token contains an extra or malformed digit."
      })];
    }
    const sourceTokens = numberTokens(source, sourceProfile).map((token) => ({ ...token, currency: currencyForNumber(source, token) }));
    const targetTokens = numberTokens(target, targetProfile).map((token) => ({ ...token, currency: currencyForNumber(target, token) }));
    if (!compareCount && sourceTokens.length !== targetTokens.length) return [];
    const comparable = sourceTokens.map((sourceToken2, index) => [sourceToken2, targetTokens[index]]).filter(([sourceToken2, targetToken2]) => !(sourceToken2?.currency && targetToken2?.currency && sourceToken2.currency !== targetToken2.currency));
    const same = sourceTokens.length === targetTokens.length && comparable.every(([sourceToken2, targetToken2]) => sourceToken2.normalized === targetToken2?.normalized);
    if (same) return [];
    const mismatch = comparable.find(([sourceToken2, targetToken2]) => sourceToken2.normalized !== targetToken2?.normalized);
    let sourceToken = mismatch?.[0];
    let targetToken = mismatch?.[1];
    if (!mismatch && sourceTokens.length !== targetTokens.length) {
      const commonLength = Math.min(sourceTokens.length, targetTokens.length);
      const firstDifferent = Array.from({ length: commonLength }, (_, index2) => index2).find((index2) => sourceTokens[index2].normalized !== targetTokens[index2].normalized);
      const index = firstDifferent ?? commonLength;
      sourceToken = sourceTokens[index];
      targetToken = targetTokens[index];
    }
    sourceToken ??= sourceTokens[0];
    targetToken ??= targetTokens[0];
    return [createIssue({ error_type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", location_in_source: sourceToken ? location(sourceToken.index, sourceToken.index + sourceToken.raw.length) : location(0, 0), location_in_target: targetToken ? location(targetToken.index, targetToken.index + targetToken.raw.length) : location(0, 0), explanation: "Numeric values outside dates and times differ between source and target." })];
  }
  function compareAttachedNumberWords(source, target) {
    ATTACHED_NUMBER_WORD_RE.lastIndex = 0;
    const targetMatch = ATTACHED_NUMBER_WORD_RE.exec(target);
    if (!targetMatch) return [];
    ATTACHED_NUMBER_WORD_RE.lastIndex = 0;
    const sourceTokens = [...source.matchAll(ATTACHED_NUMBER_WORD_RE)].map((match) => match[0].toLowerCase());
    if (sourceTokens.includes(targetMatch[0].toLowerCase())) return [];
    return [createIssue({
      error_type: "NUMBER_WORD_JOINED",
      pool: "Numbers",
      severity: "Minor",
      location_in_source: location(0, 0),
      location_in_target: location(targetMatch.index, targetMatch.index + targetMatch[0].length),
      explanation: "A number is attached to a word; check whether a space or a missing letter is required."
    })];
  }
  function maskedPlaceholderTokens(text) {
    return [...text.matchAll(MASKED_PLACEHOLDER_RE)].map((match) => ({
      raw: match[0],
      index: match.index ?? 0,
      shape: match[0].replace(/[XХ]/gu, "X").replace(/[.,]/g, "")
    }));
  }
  function compareMaskedPlaceholders(source, target) {
    const sourceTokens = maskedPlaceholderTokens(source);
    const targetTokens = maskedPlaceholderTokens(target);
    for (const [index, targetToken] of targetTokens.entries()) {
      if (!/[XХ]/u.test(targetToken.raw) || !/[X]/u.test(targetToken.raw) || !/[Х]/u.test(targetToken.raw)) continue;
      const sourceToken = sourceTokens[index];
      return [createIssue({
        error_type: "PLACEHOLDER_MISMATCH",
        pool: "Placeholders",
        severity: "Major",
        location_in_source: sourceToken ? location(sourceToken.index, sourceToken.index + sourceToken.raw.length) : location(0, 0),
        location_in_target: location(targetToken.index, targetToken.index + targetToken.raw.length),
        explanation: "A placeholder mixes Latin and Cyrillic characters in the target."
      })];
    }
    return [];
  }
  function offsetIssues(issues, targetOffset, sourceOffset = 0) {
    return issues.map((issue) => ({
      ...issue,
      location_in_source: issue.location_in_source ? location(issue.location_in_source.start + sourceOffset, issue.location_in_source.end + sourceOffset) : issue.location_in_source,
      location_in_target: location(issue.location_in_target.start + targetOffset, issue.location_in_target.end + targetOffset)
    }));
  }
  function splitParagraphs(text) {
    const paragraphs = [];
    const separator = /\r?\n(?:[ \t]*\r?\n)+/g;
    let start = 0;
    for (const match of text.matchAll(separator)) {
      const raw2 = text.slice(start, match.index);
      const leading2 = raw2.search(/\S/);
      if (leading2 >= 0) paragraphs.push({ text: raw2.trim(), start: start + leading2 });
      start = (match.index ?? 0) + match[0].length;
    }
    const raw = text.slice(start);
    const leading = raw.search(/\S/);
    if (leading >= 0) paragraphs.push({ text: raw.trim(), start: start + leading });
    return paragraphs;
  }
  function pairPlainParagraphs(source, target) {
    const sourceParagraphs = splitParagraphs(source);
    const targetParagraphs = splitParagraphs(target);
    if (sourceParagraphs.length < 2 || sourceParagraphs.length !== targetParagraphs.length) return [];
    return sourceParagraphs.map((sourceParagraph, index) => ({ source: sourceParagraph, target: targetParagraphs[index] }));
  }
  function pairPlainLines(source, target) {
    const sourceLines = source.split(/\r?\n/);
    const targetLines = target.split(/\r?\n/);
    if (sourceLines.length < 8 || sourceLines.length !== targetLines.length) return [];
    let sourceOffset = 0;
    let targetOffset = 0;
    const sourceNewlineLength = source.includes("\r\n") ? 2 : 1;
    const targetNewlineLength = target.includes("\r\n") ? 2 : 1;
    const pairs = sourceLines.map((sourceLine, index) => {
      const targetLine = targetLines[index];
      const pair = { source: { text: sourceLine, start: sourceOffset }, target: { text: targetLine, start: targetOffset } };
      sourceOffset += sourceLine.length + sourceNewlineLength;
      targetOffset += targetLine.length + targetNewlineLength;
      return pair;
    });
    return pairs.some((pair) => pair.source.text.trim() && pair.target.text.trim()) ? pairs : [];
  }
  function coreChecks(source, target, sourceProfile, targetProfile, includePunctuation = true, compareCount = true, targetTimezoneRule = null) {
    const issues = [];
    issues.push(...checkDatesAndTime(source, target, { sourceProfile, targetProfile, targetTimezoneRule }));
    issues.push(...checkNumericDateFormat(source, target, targetProfile));
    issues.push(...compareNumbersOutsideTemporalText(source, target, sourceProfile, targetProfile, compareCount));
    issues.push(...compareAttachedNumberWords(source, target));
    const spanishQuestionIssues = targetProfile.language === "es" ? spanishQuestionMarkChecks(target) : [];
    issues.push(...spanishQuestionIssues);
    issues.push(...compareTokens(source, target, PLACEHOLDER_RE, { error_type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", explanation: "A placeholder is missing or changed in the target." }));
    issues.push(...compareMaskedPlaceholders(source, target));
    if (includePunctuation && shouldCompareTerminalPunctuation(source, target) && !spanishQuestionIssues.length) {
      issues.push(createIssue({ error_type: "PUNCTUATION_MISMATCH", pool: "Punctuation", severity: "Minor", location_in_source: location(Math.max(source.trim().length - 1, 0), source.trim().length), location_in_target: location(Math.max(target.length - 1, 0), target.length), explanation: "Terminal punctuation differs between source and target." }));
    }
    return issues;
  }
  function checkNumericDateFormat(source, target, profile) {
    if (!profile.dateSeparator) return [];
    const sourceDates = [...source.matchAll(DATE_SHAPE_RE)];
    return [...target.matchAll(DATE_SHAPE_RE)].flatMap((match, index) => {
      const parts = match[0].split(/[-/.]/);
      const actualOrder = parts[0].length === 4 ? "YMD" : "DMY";
      const separators = match[0].match(/[-/.]/g) ?? [];
      if (actualOrder === profile.dateOrder && separators.every((separator) => separator === profile.dateSeparator)) return [];
      const counterpart = sourceDates[index];
      return [createIssue({
        error_type: "DATE_FORMAT",
        pool: "Dates & Time",
        severity: "Minor",
        location_in_source: counterpart ? location(counterpart.index, counterpart.index + counterpart[0].length) : location(0, 0),
        location_in_target: location(match.index, match.index + match[0].length),
        explanation: `Numeric dates in this language should use ${profile.dateFormat}.`,
        format: { expected: profile.dateFormat, actual: match[0] }
      })];
    });
  }
  function addSpacingChecks(target, targetProfile, issues) {
    const multiple = target.match(/ {2,}/);
    if (multiple) issues.push(createIssue({ error_type: "MULTIPLE_SPACES", pool: "Spacing", severity: "Minor", location_in_target: location(multiple.index, multiple.index + multiple[0].length), explanation: "Target contains consecutive spaces." }));
    const trailing = target.match(/[ \t]+(?=\r?\n|$)/);
    if (trailing) issues.push(createIssue({ error_type: "TRAILING_SPACE", pool: "Spacing", severity: "Minor", location_in_target: location(trailing.index, trailing.index + trailing[0].length), explanation: "Target contains a space at the end of a line." }));
    const beforePunctuation = target.match(/[ \t]+[,.!?;:]/);
    if (beforePunctuation) issues.push(createIssue({ error_type: "SPACE_BEFORE_PUNCTUATION", pool: "Spacing", severity: "Minor", location_in_target: location(beforePunctuation.index, beforePunctuation.index + beforePunctuation[0].length), explanation: "There is an unnecessary space before punctuation." }));
    if (targetProfile.grouping === "nbsp") {
      const regularGrouped = target.match(/\d \d{3}(?: \d{3})*/);
      if (regularGrouped) issues.push(createIssue({ error_type: "NON_BREAKING_SPACE", pool: "Spacing", severity: "Minor", location_in_target: location(regularGrouped.index, regularGrouped.index + regularGrouped[0].length), explanation: "Digit groups should use a non-breaking space in this language profile." }));
    }
  }
  function addNumberFormatChecks(target, targetProfile, issues) {
    for (const token of numberTokens(target, targetProfile)) {
      const separators = [...token.raw.matchAll(/[.,\u00a0 ](?=\d{3}(?:[.,\u00a0 ]|$))/g)].map((match) => match[0]);
      if (separators.length < 2) continue;
      const expected = targetProfile.grouping === "nbsp" ? "\xA0" : targetProfile.grouping;
      if (separators.some((separator) => separator !== expected && !(expected === " " && separator === "\xA0"))) {
        issues.push(createIssue({ error_type: "NUMBER_FORMAT", pool: "Numbers", severity: "Minor", location_in_target: location(token.index, token.index + token.raw.length), explanation: `Digit groups should use ${targetProfile.grouping === "nbsp" ? "non-breaking spaces" : `\u201C${targetProfile.grouping}\u201D`} in this language profile.` }));
        break;
      }
    }
  }
  function addPercentageChecks(target, targetProfile, issues) {
    const match = target.match(/\d(?:[\d.,\u00a0 ]*)[ \t]*%/);
    if (!match) return;
    const percentIndex = match[0].lastIndexOf("%");
    const actualSpace = match[0].slice(0, percentIndex).match(/[ \t]+$/)?.[0] ?? "";
    const expectedSpace = targetProfile.percentSpace ? " " : "";
    if (actualSpace !== expectedSpace) issues.push(createIssue({ error_type: "PERCENTAGE_FORMAT", pool: "Percentage", severity: "Minor", location_in_target: location(match.index, match.index + match[0].length), explanation: `The percentage sign should be placed ${targetProfile.percentSpace ? "after a space" : "without a space"}.` }));
  }
  function currencyRule(profile, marker) {
    return profile.currencyRules?.[marker.toUpperCase()] ?? { placement: profile.currencyPlacement, space: profile.currencySpace };
  }
  function canonicalCurrency(marker) {
    return marker.toUpperCase() === "ARS$" ? "AR$" : marker.toUpperCase();
  }
  function addCurrencyChecks(target, targetProfile, issues) {
    const numbers = numberTokens(target, targetProfile);
    for (const currency of target.matchAll(CURRENCY_RE)) {
      if (currency[0] === "$" && target[currency.index - 1] === "{") continue;
      const currencyStart = currency.index ?? 0;
      const currencyEnd = currencyStart + currency[0].length;
      const adjacent = numbers.find(
        (number) => number.index >= currencyEnd && /^[ \t\u00a0]*$/.test(target.slice(currencyEnd, number.index)) || number.index + number.raw.length <= currencyStart && /^[ \t\u00a0]*$/.test(target.slice(number.index + number.raw.length, currencyStart))
      );
      if (!adjacent) continue;
      if (currency[0].toUpperCase() === "ARS$" && targetProfile.currencyRules?.["AR$"]) {
        issues.push(createIssue({ error_type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", location_in_target: location(currencyStart, currencyEnd), explanation: "Use the Argentine peso marker AR$ in this language profile." }));
        break;
      }
      const rule = currencyRule(targetProfile, currency[0]);
      const numberBefore = adjacent.index + adjacent.raw.length <= currencyStart;
      const actualPlacement = numberBefore ? "suffix" : "prefix";
      const betweenStart = actualPlacement === "suffix" ? adjacent.index + adjacent.raw.length : currencyEnd;
      const betweenEnd = actualPlacement === "suffix" ? currencyStart : adjacent.index;
      const actualSpace = target.slice(betweenStart, betweenEnd);
      const expectedSpace = rule.space === "nbsp" ? "\xA0" : rule.space ?? "";
      if (actualPlacement !== rule.placement || actualSpace !== expectedSpace) {
        issues.push(createIssue({ error_type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", location_in_target: location(Math.min(currencyStart, adjacent.index), Math.max(currencyEnd, adjacent.index + adjacent.raw.length)), explanation: `Currency should be ${rule.placement === "prefix" ? "before" : "after"} the amount${expectedSpace ? " with the profile\u2019s required space" : " without a space"}.` }));
        break;
      }
    }
  }
  function addCurrencyMismatch(source, target, issues) {
    const sourceMatches = [...source.matchAll(CURRENCY_RE)];
    const targetMatches = [...target.matchAll(CURRENCY_RE)];
    const sourceCurrencies = sourceMatches.map((match) => canonicalCurrency(match[0]));
    const targetCurrencies = targetMatches.map((match) => canonicalCurrency(match[0]));
    if (sourceCurrencies.length !== targetCurrencies.length) return;
    if (sourceCurrencies.join("|") === targetCurrencies.join("|")) return;
    const mismatchIndex = sourceCurrencies.findIndex((currency, index) => currency !== targetCurrencies[index]);
    const sourceMatch = sourceMatches[mismatchIndex] ?? sourceMatches[0];
    const targetMatch = targetMatches[mismatchIndex] ?? targetMatches[0];
    issues.push(createIssue({ error_type: "CURRENCY_MISMATCH", pool: "Currency", severity: "Major", location_in_source: sourceMatch ? location(sourceMatch.index, sourceMatch.index + sourceMatch[0].length) : location(0, 0), location_in_target: targetMatch ? location(targetMatch.index, targetMatch.index + targetMatch[0].length) : location(0, 0), explanation: "Currency markers differ between source and target." }));
  }
  function addQuotationChecks(target, targetProfile, issues) {
    if (!targetProfile.quoteStyle) return;
    const invalid = targetProfile.quoteStyle === "guillemets" ? target.match(/["“”]/) : targetProfile.quoteStyle === "double" ? target.match(/[«»“”]/) : target.match(/"/);
    if (invalid) issues.push(createIssue({ error_type: "QUOTATION_STYLE", pool: "Punctuation", severity: "Minor", location_in_target: location(invalid.index, invalid.index + invalid[0].length), explanation: "Quotation marks do not follow the selected language profile." }));
  }
  function addLightChecks(source, target, targetProfile, issues) {
    addSpacingChecks(target, targetProfile, issues);
    addNumberFormatChecks(target, targetProfile, issues);
    addPercentageChecks(target, targetProfile, issues);
    addCurrencyChecks(target, targetProfile, issues);
    addCurrencyMismatch(source, target, issues);
    addQuotationChecks(target, targetProfile, issues);
  }
  function runRuleEngine({ source, target, sourceLanguage: sourceLanguage2 = "en", targetLanguage: targetLanguage2 = "ru", glossaryRows }) {
    if (!source.trim() || !target.trim()) return [];
    const sourceProfile = { ...getProfile(sourceLanguage2), language: sourceLanguage2.split("-")[0] };
    const targetProfile = { ...getProfile(targetLanguage2), language: targetLanguage2.split("-")[0] };
    const timezoneRule = getTimezoneRule(targetLanguage2);
    const issues = [];
    const headerBlocks = pairHeaderBlocks(source, target);
    const pairs = pairLabeledSegments(source, target);
    const plainParagraphPairs = pairPlainParagraphs(source, target);
    const plainLinePairs = pairPlainLines(source, target);
    if (headerBlocks.length >= 2) {
      for (const pair of headerBlocks) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile, false, false, timezoneRule), pair.target.start, pair.source.start));
    } else if (pairs.length >= 2) {
      for (const pair of pairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile, true, true, timezoneRule), pair.target.start, pair.source.start));
    } else if (plainParagraphPairs.length >= 8) {
      for (const pair of plainParagraphPairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile, true, true, timezoneRule), pair.target.start, pair.source.start));
    } else if (plainLinePairs.length >= 8) {
      for (const pair of plainLinePairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile, true, true, timezoneRule), pair.target.start, pair.source.start));
    } else {
      issues.push(...coreChecks(source, target, sourceProfile, targetProfile, true, true, timezoneRule));
    }
    const glossaryPairs = headerBlocks.length >= 2 ? headerBlocks : pairs.length >= 2 ? pairs : plainParagraphPairs.length >= 2 ? plainParagraphPairs : plainLinePairs.length >= 8 ? plainLinePairs : [];
    if (glossaryPairs.length) {
      for (const pair of glossaryPairs) {
        issues.push(...offsetIssues(
          checkGlossary(pair.source.text, pair.target.text, sourceLanguage2, targetLanguage2, glossaryRows),
          pair.target.start,
          pair.source.start
        ));
      }
    } else {
      issues.push(...checkGlossary(source, target, sourceLanguage2, targetLanguage2, glossaryRows));
    }
    addLightChecks(source, target, targetProfile, issues);
    return issues;
  }

  // src/language-detection.js?v=1.3
  var WORDS = {
    en: ["the", "and", "this", "with", "payment", "must", "your"],
    es: ["el", "la", "los", "las", "que", "para", "con", "pago", "hola", "gracias"],
    "pt-BR": ["o", "a", "os", "as", "que", "para", "com", "pagamento", "ol\xE1", "obrigado"],
    da: ["og", "det", "den", "til", "med", "ikke", "betaling", "hej", "tak"],
    az: ["v\u0259", "bu", "\xFC\xE7\xFCn", "il\u0259", "olan", "\xF6d\u0259ni\u015F", "salam", "t\u0259\u015F\u0259kk\xFCr"],
    "uz-Latn": ["va", "bu", "uchun", "bilan", "to'lov", "to\u2018lov", "salom", "rahmat"],
    ru: ["\u0438", "\u044D\u0442\u043E", "\u0434\u043B\u044F", "\u0441", "\u043F\u043B\u0430\u0442\u0451\u0436", "\u043E\u043F\u043B\u0430\u0442\u0430", "\u0434\u043E\u043B\u0436\u0435\u043D"],
    uk: ["\u0456", "\u0446\u0435", "\u0434\u043B\u044F", "\u0437", "\u043F\u043B\u0430\u0442\u0456\u0436", "\u043E\u043F\u043B\u0430\u0442\u0430", "\u043F\u043E\u0432\u0438\u043D\u0435\u043D"],
    "uz-Cyrl": ["\u0432\u0430", "\u0431\u0443", "\u0443\u0447\u0443\u043D", "\u0431\u0438\u043B\u0430\u043D", "\u0442\u045E\u043B\u043E\u0432", "\u043A\u0435\u0440\u0430\u043A"],
    mn: ["\u0431\u0430", "\u044D\u043D\u044D", "\u043D\u044C", "\u0431\u043E\u043B\u043E\u043D", "\u0442\u04E9\u043B\u0431\u04E9\u0440", "\u0451\u0441\u0442\u043E\u0439", "\u0441\u0430\u0439\u043D"]
  };
  var SPECIALS = {
    uk: /[іїєґ]/giu,
    ru: /[ёыэъ]/giu,
    "uz-Cyrl": /[қғўҳ]/giu,
    mn: /[өү]/giu,
    es: /[ñ¿¡]/giu,
    "pt-BR": /[ãõç]/giu,
    da: /[æøå]/giu,
    az: /[əğıöşü]/giu,
    "uz-Latn": /(?:[oOgG][ʻʼ‘’])/gu
  };
  function countMatches(text, pattern) {
    return text.match(pattern)?.length ?? 0;
  }
  function wordPattern(word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|\\s|[,.!?])${escaped}(?:$|\\s|[,.!?])`, "iu");
  }
  function detectLanguage(text) {
    const normalized = text.trim().toLocaleLowerCase();
    if (!normalized) return { code: "en", label: LANGUAGE_PROFILES.en.label, confidence: 0, reason: "No text" };
    const scores = Object.fromEntries(Object.keys(LANGUAGE_PROFILES).map((code2) => [code2, 0]));
    for (const [code2, pattern] of Object.entries(SPECIALS)) scores[code2] += countMatches(normalized, pattern) * 4;
    for (const [code2, words] of Object.entries(WORDS)) {
      for (const word of words) if (wordPattern(word).test(normalized)) scores[code2] += 2;
    }
    if (/[а-яё]/iu.test(normalized)) {
      scores.ru += 1;
      scores.uk += 1;
      scores["uz-Cyrl"] += 1;
      scores.mn += 1;
    }
    if (/[a-z]/iu.test(normalized)) {
      scores.en += 1;
      scores.es += 1;
      scores["pt-BR"] += 1;
      scores.da += 1;
      scores.az += 1;
      scores["uz-Latn"] += 1;
    }
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [code, score] = ranked[0];
    const secondScore = ranked[1]?.[1] ?? 0;
    const confidence = score === 0 ? 0 : Math.min(0.99, Math.max(0.45, 0.55 + (score - secondScore) * 0.08));
    return { code, label: LANGUAGE_PROFILES[code].label, confidence, reason: score > secondScore ? "Script and lexical markers" : "Low-signal heuristic" };
  }

  // src/docx.js
  var END_OF_CENTRAL_DIRECTORY = 101010256;
  var CENTRAL_DIRECTORY_ENTRY = 33639248;
  var LOCAL_FILE_HEADER = 67324752;
  function findEndOfCentralDirectory(view) {
    const firstOffset = Math.max(0, view.byteLength - 65557);
    for (let offset = view.byteLength - 22; offset >= firstOffset; offset -= 1) {
      if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY) return offset;
    }
    throw new Error("Invalid DOCX archive.");
  }
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This browser cannot unpack DOCX files locally.");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function readDocxText(file) {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    const eocd = findEndOfCentralDirectory(view);
    const entryCount = view.getUint16(eocd + 10, true);
    const centralDirectoryOffset = view.getUint32(eocd + 16, true);
    let cursor = centralDirectoryOffset;
    let documentXml;
    for (let index = 0; index < entryCount; index += 1) {
      if (view.getUint32(cursor, true) !== CENTRAL_DIRECTORY_ENTRY) throw new Error("Invalid DOCX directory.");
      const compression = view.getUint16(cursor + 10, true);
      const compressedSize = view.getUint32(cursor + 20, true);
      const nameLength = view.getUint16(cursor + 28, true);
      const extraLength = view.getUint16(cursor + 30, true);
      const commentLength = view.getUint16(cursor + 32, true);
      const localOffset = view.getUint32(cursor + 42, true);
      const name = new TextDecoder().decode(new Uint8Array(buffer, cursor + 46, nameLength));
      if (name === "word/document.xml") {
        if (view.getUint32(localOffset, true) !== LOCAL_FILE_HEADER) throw new Error("Invalid DOCX document entry.");
        const localNameLength = view.getUint16(localOffset + 26, true);
        const localExtraLength = view.getUint16(localOffset + 28, true);
        const dataStart = localOffset + 30 + localNameLength + localExtraLength;
        const compressed = new Uint8Array(buffer, dataStart, compressedSize);
        documentXml = compression === 0 ? compressed : compression === 8 ? await inflateRaw(compressed) : null;
        if (!documentXml) throw new Error("Unsupported DOCX compression.");
        break;
      }
      cursor += 46 + nameLength + extraLength + commentLength;
    }
    if (!documentXml) throw new Error("DOCX does not contain word/document.xml.");
    const xml = new DOMParser().parseFromString(new TextDecoder().decode(documentXml), "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("Could not read DOCX document content.");
    const paragraphs = Array.from(xml.getElementsByTagNameNS("*", "p"));
    return paragraphs.map((paragraph) => Array.from(paragraph.getElementsByTagNameNS("*", "t")).map((node) => node.textContent).join("")).filter((paragraph) => paragraph.length > 0).join("\n\n");
  }

  // src/i18n.js
  var INTERFACE_LOCALES = Object.freeze(["en", "ru"]);
  var UI = {
    en: {
      eyebrow: "LOCAL \xB7 RULE-BASED QA",
      title: "CHECKform",
      subtitle: "Find what others miss",
      workspace: "Translation workspace",
      original: "ORIGINAL",
      sourceLanguage: "Source language",
      goalLanguage: "Goal language",
      sourcePlaceholder: "Paste the source text here or drop a file\u2026",
      targetPlaceholder: "Paste the translation here\u2026",
      dropOriginal: "Drop Original file here",
      dropGoal: "Drop Goal file here",
      openFile: "Open file",
      chooseProfile: "Choose a profile or use Auto-detect. The selected profile controls date formats, punctuation and numeric conventions.",
      dropGoalCopy: "Drop the Goal file here or use Open file. It will appear in Target Review.",
      waitingForGoal: "Waiting for goal text",
      manualProfile: "Manual profile",
      detected: "Detected",
      supportedProfiles: "Supported profiles",
      profilesCount: "11 language profiles",
      targetReview: "TARGET REVIEW",
      issues: "ISSUES",
      reviewFindings: "Review findings",
      checking: "Checking\u2026",
      finding: "finding",
      findings: "findings",
      excluded: "excluded",
      noFindings: "No findings",
      noViolations: "No rule violations found in this increment.",
      exportPdf: "Export PDF",
      count: "Count",
      edit: "Edit",
      done: "Done",
      explanation: "Explanation",
      goToIssue: "Go to {type} in target text",
      noPopup: "Allow pop-ups to export PDF",
      checked: "Checked {time}",
      ready: "Ready",
      footer: "Deterministic checks \xB7 No LLM \xB7 No auto-correction",
      errorTable: "Error table",
      checkTab: "Check",
      glossaryTab: "Glossary",
      gmtTab: "GMT",
      gmtTitle: "GMT & time zones",
      gmtIntro: "Set the expected marker and offset by target language. Changes are saved in this browser and applied to the next check.",
      gmtNote: "A language is not a time zone. Until a market-specific rule is confirmed, keep the source marker and offset. English is the usual source; Ukrainian normally uses Russian.",
      gmtSource: "Usual source",
      gmtRule: "Target rule",
      gmtMarker: "Marker",
      gmtOffset: "Offset from GMT (hours)",
      gmtExample: "Example from 20:59 GMT",
      gmtInherit: "Keep source zone",
      gmtEquivalent: "Equivalent moment (any marker)",
      gmtFixed: "Fixed marker and offset",
      gmtExamplesTitle: "Checks",
      gmtExamplesCopy: "20:59 GMT \u2192 17:59 GMT-3 passes for Argentine Spanish. GMT -3 has an extra space. 12:00 \u041C\u0421\u041A = 09:00 GMT.",
      gmtSaved: "GMT rule saved in this browser",
      gmtSaveError: "Enter a valid offset from -12 to +14 hours",
      rulesTab: "Language rules",
      rulesTitle: "Language conventions",
      rulesIntro: "A quick reference based on the supplied style guides and CHECKform's language profiles.",
      rulesNote: "Examples show default formats. Market and content-type exceptions need manual review.",
      rulesLanguage: "Language",
      rulesDate: "Date",
      rulesNumber: "Numbers",
      rulesCurrency: "Currency",
      rulesPercent: "Percent",
      rulesQuotes: "Quotes",
      rulesNotes: "Exceptions / guide",
      rulesChecksTitle: "Automated checks",
      rulesChecksCopy: "CHECKform checks comparable numeric values, dates, currency markers and placement, percent spacing, quotation style, and extra spaces. Ambiguous formats require review.",
      glossaryTitle: "Glossary",
      glossaryIntro: "Edit a term here and CHECKform will use the new translation in the next check. Changes are saved in this browser.",
      glossarySearch: "Search terms or translations\u2026",
      glossaryFrom: "Source term",
      glossaryTo: "Goal term",
      glossaryNotes: "Notes",
      glossaryAdd: "Add term",
      glossaryAddSource: "New source term",
      glossaryAddTarget: "New goal term",
      glossarySaved: "Saved in this browser",
      glossarySaveError: "Could not save changes in this browser",
      glossaryRows: "{count} entries",
      glossaryEmpty: "No entries match the search.",
      glossaryMissing: "No translation in glossary",
      glossaryShowMore: "Show more",
      glossarySourceRule: "Source: {language}",
      errorTableTitle: "Error table",
      errorTableDescription: "Supported checks and their default severity",
      close: "Close",
      errorType: "Error type",
      pool: "Pool",
      severity: "Severity",
      description: "Description",
      profileRulesTitle: "Profile conventions",
      dateFormat: "Date format",
      targetTimezone: "Target time zone",
      decimalSeparator: "Decimal separator",
      thousandSeparator: "Thousand separator",
      currencyFormat: "Currency",
      percentageFormat: "Percentage",
      quotationMarks: "Quotation marks",
      before: "before",
      after: "after",
      withoutSpace: "without space",
      withSpace: "with space",
      notSpecified: "Not specified",
      interfaceLanguage: "Interface language",
      autoDetect: "Auto-detect",
      sourceFileReceived: "Source file received \xB7 waiting for the other file",
      targetFileReceived: "Goal file received \xB7 waiting for the other file",
      bothFilesLoaded: "Both files loaded",
      fileLoaded: "File loaded",
      sourceFile: "Source file",
      targetFile: "Goal file"
    },
    ru: {
      eyebrow: "\u041B\u041E\u041A\u0410\u041B\u042C\u041D\u0410\u042F \xB7 RULE-BASED QA",
      title: "CHECKform",
      subtitle: "\u041D\u0430\u0445\u043E\u0434\u0438\u043C \u0442\u043E, \u0447\u0442\u043E \u0434\u0440\u0443\u0433\u0438\u0435 \u043D\u0435 \u0432\u0438\u0434\u044F\u0442",
      workspace: "\u0420\u0430\u0431\u043E\u0447\u0430\u044F \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      original: "\u041E\u0420\u0418\u0413\u0418\u041D\u0410\u041B",
      sourceLanguage: "\u042F\u0437\u044B\u043A \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      goalLanguage: "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u044F\u0437\u044B\u043A",
      sourcePlaceholder: "\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u2026",
      targetPlaceholder: "\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u2026",
      dropOriginal: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u0441\u044E\u0434\u0430",
      dropGoal: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0441\u044E\u0434\u0430",
      openFile: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u0430\u0439\u043B",
      chooseProfile: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0430\u0432\u0442\u043E\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435. \u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0437\u0430\u0434\u0430\u0451\u0442 \u0444\u043E\u0440\u043C\u0430\u0442\u044B \u0434\u0430\u0442, \u043F\u0443\u043D\u043A\u0442\u0443\u0430\u0446\u0438\u0438 \u0438 \u0447\u0438\u0441\u0435\u043B.",
      dropGoalCopy: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u0430\u0439\u043B\xBB. \u041E\u043D \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0432 \u043E\u043A\u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u043F\u0440\u0430\u0432\u0430.",
      waitingForGoal: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0442\u0435\u043A\u0441\u0442\u0430 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      manualProfile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0432\u044B\u0431\u0440\u0430\u043D \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
      detected: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D",
      supportedProfiles: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u0438",
      profilesCount: "11 \u044F\u0437\u044B\u043A\u043E\u0432\u044B\u0445 \u043F\u0440\u043E\u0444\u0438\u043B\u0435\u0439",
      targetReview: "\u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0410 \u041F\u0415\u0420\u0415\u0412\u041E\u0414\u0410",
      issues: "\u041E\u0428\u0418\u0411\u041A\u0418",
      reviewFindings: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
      checking: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430\u2026",
      finding: "\u043E\u0448\u0438\u0431\u043A\u0430",
      findings: "\u043E\u0448\u0438\u0431\u043E\u043A",
      excluded: "\u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
      noFindings: "\u041E\u0448\u0438\u0431\u043E\u043A \u043D\u0435\u0442",
      noViolations: "\u041D\u0430 \u044D\u0442\u043E\u043C \u044D\u0442\u0430\u043F\u0435 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.",
      exportPdf: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 PDF",
      count: "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0442\u044C",
      edit: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
      done: "\u0413\u043E\u0442\u043E\u0432\u043E",
      explanation: "\u041F\u043E\u044F\u0441\u043D\u0435\u043D\u0438\u0435",
      goToIssue: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043E\u0448\u0438\u0431\u043A\u0435 {type} \u0432 \u0442\u0435\u043A\u0441\u0442\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      noPopup: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u043E\u043A\u043D\u0430 \u0434\u043B\u044F \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430 PDF",
      checked: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E \u0432 {time}",
      ready: "\u0413\u043E\u0442\u043E\u0432\u043E",
      footer: "\u0414\u0435\u0442\u0435\u0440\u043C\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \xB7 \u0411\u0435\u0437 LLM \xB7 \u0411\u0435\u0437 \u0430\u0432\u0442\u043E\u043A\u043E\u0440\u0440\u0435\u043A\u0446\u0438\u0438",
      errorTable: "\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043E\u0448\u0438\u0431\u043E\u043A",
      checkTab: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430",
      glossaryTab: "\u0421\u043B\u043E\u0432\u0430\u0440\u044C",
      gmtTab: "GMT",
      gmtTitle: "GMT \u0438 \u0447\u0430\u0441\u043E\u0432\u044B\u0435 \u043F\u043E\u044F\u0441\u0430",
      gmtIntro: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043C\u0430\u0440\u043A\u0435\u0440 \u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u0446\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u044F\u0437\u044B\u043A\u0430. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u043F\u0440\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435.",
      gmtNote: "\u042F\u0437\u044B\u043A \u043D\u0435 \u0440\u0430\u0432\u0435\u043D \u0447\u0430\u0441\u043E\u0432\u043E\u043C\u0443 \u043F\u043E\u044F\u0441\u0443. \u041F\u043E\u043A\u0430 \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u0440\u044B\u043D\u043A\u0430 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C \u043C\u0430\u0440\u043A\u0435\u0440 \u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430. \u041E\u0431\u044B\u0447\u043D\u043E \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439; \u0434\u043B\u044F \u0443\u043A\u0440\u0430\u0438\u043D\u0441\u043A\u043E\u0433\u043E \u2014 \u0440\u0443\u0441\u0441\u043A\u0438\u0439.",
      gmtSource: "\u041E\u0431\u044B\u0447\u043D\u044B\u0439 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B",
      gmtRule: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      gmtMarker: "\u041C\u0430\u0440\u043A\u0435\u0440",
      gmtOffset: "\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 GMT (\u0447\u0430\u0441\u044B)",
      gmtExample: "\u041F\u0440\u0438\u043C\u0435\u0440 \u043E\u0442 20:59 GMT",
      gmtInherit: "\u041A\u0430\u043A \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435",
      gmtEquivalent: "\u0422\u043E\u0442 \u0436\u0435 \u043C\u043E\u043C\u0435\u043D\u0442 (\u043B\u044E\u0431\u043E\u0439 \u043C\u0430\u0440\u043A\u0435\u0440)",
      gmtFixed: "\u0417\u0430\u0434\u0430\u043D\u044B \u043C\u0430\u0440\u043A\u0435\u0440 \u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435",
      gmtExamplesTitle: "\u041F\u0440\u0438\u043C\u0435\u0440\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A",
      gmtExamplesCopy: "20:59 GMT \u2192 17:59 GMT-3 \u2014 \u0432\u0435\u0440\u043D\u043E \u0434\u043B\u044F \u0430\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0441\u043A\u043E\u0433\u043E \u0438\u0441\u043F\u0430\u043D\u0441\u043A\u043E\u0433\u043E. GMT -3 \u2014 \u043B\u0438\u0448\u043D\u0438\u0439 \u043F\u0440\u043E\u0431\u0435\u043B. 12:00 \u041C\u0421\u041A = 09:00 GMT.",
      gmtSaved: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E GMT \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      gmtSaveError: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0435 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 \u221212 \u0434\u043E +14 \u0447\u0430\u0441\u043E\u0432",
      rulesTab: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u044F\u0437\u044B\u043A\u043E\u0432",
      rulesTitle: "\u042F\u0437\u044B\u043A\u043E\u0432\u044B\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430",
      rulesIntro: "\u041A\u0440\u0430\u0442\u043A\u0430\u044F \u043F\u0430\u043C\u044F\u0442\u043A\u0430 \u043F\u043E \u043F\u0440\u0438\u0441\u043B\u0430\u043D\u043D\u044B\u043C \u0441\u0442\u0430\u0439\u043B\u0433\u0430\u0439\u0434\u0430\u043C \u0438 \u044F\u0437\u044B\u043A\u043E\u0432\u044B\u043C \u043F\u0440\u043E\u0444\u0438\u043B\u044F\u043C CHECKform.",
      rulesNote: "\u0412 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 \u0431\u0430\u0437\u043E\u0432\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B. \u0418\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u043F\u043E \u0440\u044B\u043D\u043A\u0443 \u0438 \u0442\u0438\u043F\u0443 \u0442\u0435\u043A\u0441\u0442\u0430 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u043E\u043C.",
      rulesLanguage: "\u042F\u0437\u044B\u043A",
      rulesDate: "\u0414\u0430\u0442\u0430",
      rulesNumber: "\u0427\u0438\u0441\u043B\u0430",
      rulesCurrency: "\u0412\u0430\u043B\u044E\u0442\u0430",
      rulesPercent: "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B",
      rulesQuotes: "\u041A\u0430\u0432\u044B\u0447\u043A\u0438",
      rulesNotes: "\u0418\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F / \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442",
      rulesChecksTitle: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
      rulesChecksCopy: "CHECKform \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u0442 \u0447\u0438\u0441\u043B\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u0434\u0430\u0442\u044B, \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u0430\u043B\u044E\u0442, \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u043F\u0435\u0440\u0435\u0434 %, \u043A\u0430\u0432\u044B\u0447\u043A\u0438 \u0438 \u043B\u0438\u0448\u043D\u0438\u0435 \u043F\u0440\u043E\u0431\u0435\u043B\u044B. \u041D\u0435\u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430.",
      glossaryTitle: "\u0421\u043B\u043E\u0432\u0430\u0440\u044C",
      glossaryIntro: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u0435 \u0442\u0435\u0440\u043C\u0438\u043D \u0437\u0434\u0435\u0441\u044C \u2014 CHECKform \u0443\u0447\u0442\u0451\u0442 \u043D\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u043F\u0440\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435.",
      glossarySearch: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043C \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430\u043C\u2026",
      glossaryFrom: "\u0422\u0435\u0440\u043C\u0438\u043D \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      glossaryTo: "\u0422\u0435\u0440\u043C\u0438\u043D \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      glossaryNotes: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u044F",
      glossaryAdd: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u0440\u043C\u0438\u043D",
      glossaryAddSource: "\u041D\u043E\u0432\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      glossaryAddTarget: "\u041D\u043E\u0432\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      glossarySaved: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      glossarySaveError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      glossaryRows: "{count} \u0437\u0430\u043F\u0438\u0441\u0435\u0439",
      glossaryEmpty: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043D\u0435\u0442.",
      glossaryMissing: "\u041D\u0435\u0442 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0432 \u0441\u043B\u043E\u0432\u0430\u0440\u0435",
      glossaryShowMore: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451",
      glossarySourceRule: "\u041E\u0440\u0438\u0433\u0438\u043D\u0430\u043B: {language}",
      errorTableTitle: "\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043E\u0448\u0438\u0431\u043E\u043A",
      errorTableDescription: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0438 \u0438\u0445 \u0433\u0440\u0430\u0434\u0430\u0446\u0438\u044F \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
      errorType: "\u0422\u0438\u043F \u043E\u0448\u0438\u0431\u043A\u0438",
      pool: "\u041F\u0443\u043B",
      severity: "\u0413\u0440\u0430\u0434\u0430\u0446\u0438\u044F",
      description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
      profileRulesTitle: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044F",
      dateFormat: "\u0424\u043E\u0440\u043C\u0430\u0442 \u0434\u0430\u0442\u044B",
      targetTimezone: "\u0427\u0430\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u044F\u0441 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      decimalSeparator: "\u0414\u0435\u0441\u044F\u0442\u0438\u0447\u043D\u044B\u0439 \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C",
      thousandSeparator: "\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u0442\u044B\u0441\u044F\u0447",
      currencyFormat: "\u0412\u0430\u043B\u044E\u0442\u0430",
      percentageFormat: "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B",
      quotationMarks: "\u041A\u0430\u0432\u044B\u0447\u043A\u0438",
      before: "\u043F\u0435\u0440\u0435\u0434 \u0447\u0438\u0441\u043B\u043E\u043C",
      after: "\u043F\u043E\u0441\u043B\u0435 \u0447\u0438\u0441\u043B\u0430",
      withoutSpace: "\u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u0430",
      withSpace: "\u0441 \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u043C",
      notSpecified: "\u041D\u0435 \u0437\u0430\u0434\u0430\u043D\u043E",
      interfaceLanguage: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430",
      autoDetect: "\u0410\u0432\u0442\u043E\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435",
      sourceFileReceived: "\u0424\u0430\u0439\u043B \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D \xB7 \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F \u0432\u0442\u043E\u0440\u043E\u0439 \u0444\u0430\u0439\u043B",
      targetFileReceived: "\u0424\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D \xB7 \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F \u0432\u0442\u043E\u0440\u043E\u0439 \u0444\u0430\u0439\u043B",
      bothFilesLoaded: "\u041E\u0431\u0430 \u0444\u0430\u0439\u043B\u0430 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B",
      fileLoaded: "\u0424\u0430\u0439\u043B \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D",
      sourceFile: "\u0424\u0430\u0439\u043B \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      targetFile: "\u0424\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430"
    }
  };
  var PROFILE_LABELS = Object.freeze({
    ru: {
      en: "\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439",
      ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
      es: "\u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439",
      "es-AR": "\u0410\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0441\u043A\u0438\u0439 \u0438\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439",
      "uz-Cyrl": "\u0423\u0437\u0431\u0435\u043A\u0441\u043A\u0438\u0439 (\u043A\u0438\u0440\u0438\u043B\u043B\u0438\u0446\u0430)",
      "uz-Latn": "\u0423\u0437\u0431\u0435\u043A\u0441\u043A\u0438\u0439 (\u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0430)",
      uk: "\u0423\u043A\u0440\u0430\u0438\u043D\u0441\u043A\u0438\u0439",
      mn: "\u041C\u043E\u043D\u0433\u043E\u043B\u044C\u0441\u043A\u0438\u0439",
      da: "\u0414\u0430\u0442\u0441\u043A\u0438\u0439",
      "pt-BR": "\u0411\u0440\u0430\u0437\u0438\u043B\u044C\u0441\u043A\u0438\u0439 \u043F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u044C\u0441\u043A\u0438\u0439",
      az: "\u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043D\u0441\u043A\u0438\u0439"
    }
  });
  var ISSUE_CATALOG = Object.freeze([
    { type: "GLOSSARY_TRANSLATION_MISSING", pool: "Terminology", severity: "Major", en: "A source term is present, but its listed glossary translation is missing from the matching target passage.", ru: "\u0422\u0435\u0440\u043C\u0438\u043D \u0435\u0441\u0442\u044C \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435, \u043D\u043E \u0435\u0433\u043E \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0438\u0437 \u0441\u043B\u043E\u0432\u0430\u0440\u044F \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u043C \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442\u0435." },
    { type: "GLOSSARY_CASE_MISMATCH", pool: "Terminology", severity: "Minor", en: "The glossary translation is present but its letter case differs.", ru: "\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u0438\u0437 \u0441\u043B\u043E\u0432\u0430\u0440\u044F \u043D\u0430\u0439\u0434\u0435\u043D, \u043D\u043E \u0440\u0435\u0433\u0438\u0441\u0442\u0440 \u0431\u0443\u043A\u0432 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F." },
    { type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", en: "Numeric values outside dates and times differ between source and target.", ru: "\u0427\u0438\u0441\u043B\u043E\u0432\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432\u043D\u0435 \u0434\u0430\u0442\u044B \u0438\u043B\u0438 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "NUMBER_WORD_JOINED", pool: "Numbers", severity: "Minor", en: "A number is attached to a word and may indicate a typo or a missing space.", ru: "\u0426\u0438\u0444\u0440\u0430 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0430 \u043A \u0441\u043B\u043E\u0432\u0443 \u2014 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u044D\u0442\u043E \u043E\u043F\u0435\u0447\u0430\u0442\u043A\u0430 \u0438\u043B\u0438 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "SPANISH_QUESTION_MARKS", pool: "Punctuation", severity: "Minor", en: "Spanish questions should use an opening \xBF and a closing ?.", ru: "\u0412 \u0438\u0441\u043F\u0430\u043D\u0441\u043A\u043E\u043C \u0432\u043E\u043F\u0440\u043E\u0441\u0435 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u0437\u043D\u0430\u043A \xBF \u0438 \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0439 ?." },
    { type: "NUMBER_FORMAT", pool: "Numbers", severity: "Minor", en: "Digit grouping does not follow the selected language profile.", ru: "\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u0438 \u0440\u0430\u0437\u0440\u044F\u0434\u043E\u0432 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u044F\u0437\u044B\u043A\u043E\u0432\u043E\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E." },
    { type: "CURRENCY_MISMATCH", pool: "Currency", severity: "Major", en: "Currency markers differ between source and target.", ru: "\u041E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0432\u0430\u043B\u044E\u0442\u044B \u043E\u0442\u043B\u0438\u0447\u0430\u044E\u0442\u0441\u044F \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", en: "Currency placement or spacing does not follow the selected profile.", ru: "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u0430\u043B\u044E\u0442\u044B \u0438\u043B\u0438 \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E." },
    { type: "PERCENTAGE_FORMAT", pool: "Percentage", severity: "Minor", en: "The percentage sign uses an incorrect position or spacing.", ru: "\u0417\u043D\u0430\u043A \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0430 \u0441\u0442\u043E\u0438\u0442 \u043D\u0435\u0432\u0435\u0440\u043D\u043E \u0438\u043B\u0438 \u043E\u0442\u0434\u0435\u043B\u0451\u043D \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u043C \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u043C." },
    { type: "PUNCTUATION_MISMATCH", pool: "Punctuation", severity: "Minor", en: "Terminal punctuation differs between source and target.", ru: "\u041A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u0437\u043D\u0430\u043A \u043F\u0440\u0435\u043F\u0438\u043D\u0430\u043D\u0438\u044F \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "QUOTATION_STYLE", pool: "Punctuation", severity: "Minor", en: "Quotation marks do not follow the selected language profile.", ru: "\u041A\u0430\u0432\u044B\u0447\u043A\u0438 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u044F\u0437\u044B\u043A\u043E\u0432\u043E\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E." },
    { type: "MULTIPLE_SPACES", pool: "Spacing", severity: "Minor", en: "Target contains consecutive spaces.", ru: "\u0412 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u044B \u0434\u0432\u043E\u0439\u043D\u044B\u0435 \u0438\u043B\u0438 \u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0431\u0435\u043B\u044B." },
    { type: "TRAILING_SPACE", pool: "Spacing", severity: "Minor", en: "Target contains a space at the end of a line.", ru: "\u0412 \u043A\u043E\u043D\u0446\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0441\u0442\u043E\u0438\u0442 \u043B\u0438\u0448\u043D\u0438\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "SPACE_BEFORE_PUNCTUATION", pool: "Spacing", severity: "Minor", en: "There is an unnecessary space before punctuation.", ru: "\u041F\u0435\u0440\u0435\u0434 \u0437\u043D\u0430\u043A\u043E\u043C \u043F\u0440\u0435\u043F\u0438\u043D\u0430\u043D\u0438\u044F \u0441\u0442\u043E\u0438\u0442 \u043B\u0438\u0448\u043D\u0438\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "NON_BREAKING_SPACE", pool: "Spacing", severity: "Minor", en: "Digit groups should use a non-breaking space in this language profile.", ru: "\u0412 \u044D\u0442\u043E\u043C \u044F\u0437\u044B\u043A\u043E\u0432\u043E\u043C \u043F\u0440\u043E\u0444\u0438\u043B\u0435 \u043C\u0435\u0436\u0434\u0443 \u0440\u0430\u0437\u0440\u044F\u0434\u0430\u043C\u0438 \u043D\u0443\u0436\u0435\u043D \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", en: "A placeholder is missing or changed in the target.", ru: "\u041F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "TIMEZONE_MISSING", pool: "Dates & Time", severity: "Major", en: "Timezone is present in the source but missing in the target.", ru: "\u0412 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0435\u0441\u0442\u044C \u0447\u0430\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u044F\u0441, \u043D\u043E \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043E\u043D \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442." },
    { type: "TIMEZONE_EXTRA", pool: "Dates & Time", severity: "Minor", en: "Target adds a timezone that is not present in the source.", ru: "\u0412 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0447\u0430\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u044F\u0441, \u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E \u043D\u0435\u0442 \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435." },
    { type: "TIMEZONE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target uses an incorrect GMT offset for the selected locale or the local time was not converted.", ru: "\u0412 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 GMT \u0434\u043B\u044F \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u0438\u043B\u0438 \u043C\u0435\u0441\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043D\u0435 \u043F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043D\u043E." },
    { type: "TIMEZONE_OFFSET_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target timezone offset differs from the GMT table.", ru: "\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0447\u0430\u0441\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u044F\u0441\u0430 \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 GMT." },
    { type: "TIMEZONE_LABEL_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target timezone marker differs from the GMT table.", ru: "\u041C\u0430\u0440\u043A\u0435\u0440 \u0447\u0430\u0441\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u044F\u0441\u0430 \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 GMT." },
    { type: "TIMEZONE_FORMAT", pool: "Dates & Time", severity: "Minor", en: "The timezone marker contains a space or non-standard sign; use its exact spelling from the GMT table.", ru: "\u041C\u0430\u0440\u043A\u0435\u0440 \u0447\u0430\u0441\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u044F\u0441\u0430 \u043D\u0430\u043F\u0438\u0441\u0430\u043D \u0441 \u043B\u0438\u0448\u043D\u0438\u043C \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u043C \u0438\u043B\u0438 \u043D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C \u0437\u043D\u0430\u043A\u043E\u043C; \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u043E\u0447\u043D\u0443\u044E \u0437\u0430\u043F\u0438\u0441\u044C \u0438\u0437 \u0442\u0430\u0431\u043B\u0438\u0446\u044B GMT." },
    { type: "INVALID_DATE", pool: "Dates & Time", severity: "Major", en: "A calendar date, clock time, or GMT offset is invalid in the source or target.", ru: "\u0412 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u043D\u0430\u044F \u0434\u0430\u0442\u0430, \u0432\u0440\u0435\u043C\u044F \u0438\u043B\u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 GMT." },
    { type: "DATE_FORMAT", pool: "Dates & Time", severity: "Minor", en: "Numeric date format does not follow the selected language profile.", ru: "\u0427\u0438\u0441\u043B\u043E\u0432\u0430\u044F \u0434\u0430\u0442\u0430 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0444\u043E\u0440\u043C\u0430\u0442\u0443 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u044F\u0437\u044B\u043A\u0430." },
    { type: "DATE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target contain different calendar dates.", ru: "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u043D\u044B\u0435 \u0434\u0430\u0442\u044B \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0440\u0430\u0437\u043B\u0438\u0447\u0430\u044E\u0442\u0441\u044F." },
    { type: "TIME_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target contain different clock times.", ru: "\u0412\u0440\u0435\u043C\u044F \u043D\u0430 \u0447\u0430\u0441\u0430\u0445 \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0440\u0430\u0437\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F." },
    { type: "DATETIME_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target resolve to different moments after timezone normalization.", ru: "\u041F\u043E\u0441\u043B\u0435 \u043D\u043E\u0440\u043C\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0447\u0430\u0441\u043E\u0432\u044B\u0445 \u043F\u043E\u044F\u0441\u043E\u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0443\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u043D\u0430 \u0440\u0430\u0437\u043D\u044B\u0435 \u043C\u043E\u043C\u0435\u043D\u0442\u044B." }
  ]);
  function t(locale, key, variables = {}) {
    let value = UI[locale]?.[key] ?? UI.en[key] ?? key;
    for (const [name, replacement] of Object.entries(variables)) value = value.replace(`{${name}}`, replacement);
    return value;
  }
  function profileLabel(locale, code, fallback) {
    return PROFILE_LABELS[locale]?.[code] ?? fallback;
  }

  // src/glossary-view.js
  var $ = (id) => document.getElementById(id);
  var PAGE_SIZE = 60;
  function initGlossaryView({ getLocale: getLocale2, getGoalLanguage, onChange }) {
    const languageSelect = $("glossary-language");
    const search = $("glossary-search");
    const tableBody = $("glossary-table-body");
    const status = $("glossary-status");
    const more = $("glossary-show-more");
    let visibleCount = PAGE_SIZE;
    let manuallySelected = false;
    let saveTimer;
    function currentLanguages() {
      const target = languageSelect.value || "ru";
      return { source: glossarySourceLanguage(target), target };
    }
    function populateLanguages() {
      const previous = languageSelect.value || (getGoalLanguage() === "en" ? "ru" : getGoalLanguage());
      languageSelect.replaceChildren();
      for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
        if (code === "en") continue;
        languageSelect.add(new Option(profileLabel(getLocale2(), code, profile.label), code));
      }
      languageSelect.value = previous;
      if (!languageSelect.value) languageSelect.value = "ru";
    }
    function updateLabels() {
      const locale = getLocale2();
      const { source, target } = currentLanguages();
      $("check-tab").textContent = t(locale, "checkTab");
      $("glossary-tab").textContent = t(locale, "glossaryTab");
      $("glossary-title").textContent = t(locale, "glossaryTitle");
      $("glossary-intro").textContent = t(locale, "glossaryIntro");
      $("glossary-language-label").textContent = t(locale, "goalLanguage");
      search.placeholder = t(locale, "glossarySearch");
      $("glossary-from-heading").textContent = `${t(locale, "glossaryFrom")} \xB7 ${profileLabel(locale, source, LANGUAGE_PROFILES[source].label)}`;
      $("glossary-to-heading").textContent = `${t(locale, "glossaryTo")} \xB7 ${profileLabel(locale, target, LANGUAGE_PROFILES[target].label)}`;
      $("glossary-notes-heading").textContent = t(locale, "glossaryNotes");
      $("glossary-add-source").placeholder = t(locale, "glossaryAddSource");
      $("glossary-add-target").placeholder = t(locale, "glossaryAddTarget");
      $("glossary-add-button").textContent = t(locale, "glossaryAdd");
      more.textContent = t(locale, "glossaryShowMore");
      $("glossary-source-rule").textContent = t(locale, "glossarySourceRule", { language: profileLabel(locale, source, LANGUAGE_PROFILES[source].label) });
    }
    function makeInput(row, language, placeholder) {
      const input = document.createElement("input");
      input.className = "glossary-term-input";
      input.value = row.terms[GLOSSARY_LANGUAGES[language]] ?? "";
      input.placeholder = placeholder;
      input.dataset.rowId = String(row.id);
      input.dataset.language = GLOSSARY_LANGUAGES[language];
      input.setAttribute("aria-label", `${language} \xB7 ${row.id}`);
      return input;
    }
    function renderRows() {
      const locale = getLocale2();
      const { source, target } = currentLanguages();
      const query = search.value.trim().toLocaleLowerCase();
      const sourceCode = GLOSSARY_LANGUAGES[source];
      const targetCode = GLOSSARY_LANGUAGES[target];
      const matching = getGlossaryRows().filter((row) => {
        const sourceTerm = row.terms[sourceCode] ?? "";
        const targetTerm = row.terms[targetCode] ?? "";
        return (sourceTerm || targetTerm) && (!query || `${sourceTerm} ${targetTerm}`.toLocaleLowerCase().includes(query));
      });
      $("glossary-count").textContent = t(locale, "glossaryRows", { count: String(matching.length) });
      more.hidden = matching.length <= visibleCount;
      tableBody.replaceChildren();
      if (!matching.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.className = "glossary-empty";
        td.textContent = t(locale, "glossaryEmpty");
        tr.append(td);
        tableBody.append(tr);
        return;
      }
      const fragment = document.createDocumentFragment();
      for (const row of matching.slice(0, visibleCount)) {
        const tr = document.createElement("tr");
        const number = document.createElement("td");
        number.className = "glossary-row-number";
        number.textContent = String(row.id);
        const from = document.createElement("td");
        from.append(makeInput(row, source, t(locale, "glossaryMissing")));
        const to = document.createElement("td");
        to.append(makeInput(row, target, t(locale, "glossaryMissing")));
        const notes = document.createElement("td");
        notes.className = "glossary-note";
        notes.textContent = [row.notes?.[sourceCode], row.notes?.[targetCode]].filter(Boolean).join(" \xB7 ");
        tr.append(number, from, to, notes);
        fragment.append(tr);
      }
      tableBody.append(fragment);
    }
    function refresh() {
      populateLanguages();
      updateLabels();
      renderRows();
    }
    function syncLanguage(code) {
      if (manuallySelected || !code || code === "en" || !GLOSSARY_LANGUAGES[code]) return;
      if (languageSelect.value !== code) {
        languageSelect.value = code;
        visibleCount = PAGE_SIZE;
        updateLabels();
        renderRows();
      }
    }
    languageSelect.addEventListener("change", () => {
      manuallySelected = true;
      visibleCount = PAGE_SIZE;
      updateLabels();
      renderRows();
    });
    search.addEventListener("input", () => {
      visibleCount = PAGE_SIZE;
      renderRows();
    });
    more.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderRows();
    });
    tableBody.addEventListener("input", (event) => {
      const input = event.target.closest("input[data-row-id]");
      if (!input) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const saved = updateGlossaryTerm(input.dataset.rowId, input.dataset.language, input.value);
        status.textContent = t(getLocale2(), saved ? "glossarySaved" : "glossarySaveError");
        onChange();
      }, 250);
    });
    tableBody.addEventListener("change", (event) => {
      const input = event.target.closest("input[data-row-id]");
      if (!input) return;
      clearTimeout(saveTimer);
      const saved = updateGlossaryTerm(input.dataset.rowId, input.dataset.language, input.value);
      status.textContent = t(getLocale2(), saved ? "glossarySaved" : "glossarySaveError");
      onChange();
    });
    $("glossary-add-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const { source, target } = currentLanguages();
      const row = addGlossaryRow(source, target, $("glossary-add-source").value, $("glossary-add-target").value);
      if (!row) return;
      $("glossary-add-source").value = "";
      $("glossary-add-target").value = "";
      search.value = "";
      visibleCount = glossaryEntryCount();
      renderRows();
      tableBody.lastElementChild?.scrollIntoView({ block: "nearest" });
      status.textContent = t(getLocale2(), "glossarySaved");
      onChange();
    });
    refresh();
    return { refresh, syncLanguage };
  }

  // src/gmt-view.js
  var $2 = (id) => document.getElementById(id);
  function clockAt(offsetMinutes) {
    const total = (20 * 60 + 59 + offsetMinutes + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }
  function initGmtView({ getLocale: getLocale2, onChange }) {
    const body = $2("gmt-table-body");
    const status = $2("gmt-status");
    function refresh() {
      const locale = getLocale2();
      for (const [id, key] of [
        ["gmt-tab", "gmtTab"],
        ["gmt-title", "gmtTitle"],
        ["gmt-intro", "gmtIntro"],
        ["gmt-note", "gmtNote"],
        ["gmt-language-heading", "goalLanguage"],
        ["gmt-source-heading", "gmtSource"],
        ["gmt-rule-heading", "gmtRule"],
        ["gmt-marker-heading", "gmtMarker"],
        ["gmt-offset-heading", "gmtOffset"],
        ["gmt-example-heading", "gmtExample"],
        ["gmt-examples-title", "gmtExamplesTitle"],
        ["gmt-examples-copy", "gmtExamplesCopy"]
      ]) $2(id).textContent = t(locale, key);
      body.replaceChildren();
      for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
        const rule = getTimezoneRule(code);
        const row = document.createElement("tr");
        row.dataset.language = code;
        const language = document.createElement("td");
        language.textContent = profileLabel(locale, code, profile.label);
        const source = document.createElement("td");
        const sourceCode = timezoneSourceLanguage(code);
        source.textContent = profileLabel(locale, sourceCode, LANGUAGE_PROFILES[sourceCode].label);
        const modeCell = document.createElement("td");
        const mode = document.createElement("select");
        mode.dataset.field = "mode";
        mode.add(new Option(t(locale, "gmtInherit"), "source"));
        mode.add(new Option(t(locale, "gmtEquivalent"), "equivalent"));
        mode.add(new Option(t(locale, "gmtFixed"), "fixed"));
        mode.value = rule.mode;
        modeCell.append(mode);
        const labelCell = document.createElement("td");
        const label = document.createElement("select");
        label.dataset.field = "label";
        for (const value of ["GMT", "UTC", "\u041C\u0421\u041A", "MSK"]) label.add(new Option(value, value));
        label.value = rule.label;
        label.disabled = rule.mode !== "fixed";
        labelCell.append(label);
        const offsetCell = document.createElement("td");
        const offset = document.createElement("input");
        offset.dataset.field = "offset";
        offset.type = "number";
        offset.min = "-12";
        offset.max = "14";
        offset.step = "0.25";
        offset.value = String(rule.offsetMinutes / 60);
        offset.disabled = rule.mode !== "fixed" || ["MSK", "\u041C\u0421\u041A"].includes(rule.label);
        offset.setAttribute("aria-label", `${code} \xB7 ${t(locale, "gmtOffset")}`);
        offsetCell.append(offset);
        const example = document.createElement("td");
        example.className = "gmt-example";
        example.textContent = rule.mode === "source" ? "20:59 GMT \u2192 20:59 GMT" : rule.mode === "equivalent" ? "20:59 GMT \u2194 23:59 \u041C\u0421\u041A" : `20:59 GMT \u2192 ${clockAt(rule.offsetMinutes)} ${formatTimezone(rule.label, rule.offsetMinutes)}`;
        row.append(language, source, modeCell, labelCell, offsetCell, example);
        body.append(row);
      }
    }
    body.addEventListener("change", (event) => {
      const input = event.target.closest("select, input");
      const row = input?.closest("tr[data-language]");
      if (!row) return;
      const code = row.dataset.language;
      const mode = row.querySelector('[data-field="mode"]').value;
      const label = row.querySelector('[data-field="label"]').value;
      const offset = Number(row.querySelector('[data-field="offset"]').value);
      const next = {
        mode,
        label,
        offsetMinutes: ["MSK", "\u041C\u0421\u041A"].includes(label) ? 180 : Math.round(offset * 60)
      };
      if (!Number.isFinite(offset) || Math.abs(offset * 60 - next.offsetMinutes) > 1e-3 || !updateTimezoneRule(code, next)) {
        status.textContent = t(getLocale2(), "gmtSaveError");
        return;
      }
      status.textContent = t(getLocale2(), "gmtSaved");
      refresh();
      onChange();
    });
    refresh();
    return { refresh };
  }

  // src/language-rules-view.js
  var $3 = (id) => document.getElementById(id);
  var GUIDE = {
    en: "English Language Style Guide",
    ru: "Russian Language Style Guide",
    es: "Spanish Language Style Guide",
    "es-AR": "Spanish Language Style Guide \xB7 Argentina terms",
    "uz-Cyrl": "Uzbek Language Style Guide Cyrillic",
    "uz-Latn": "Uzbek Language Style Guide Latin",
    uk: "Ukrainian Language Style Guide",
    mn: "Mongolian Language Style Guide",
    da: "Danish Language Style Guide",
    "pt-BR": "Brazilian Portuguese Language Style Guide",
    az: "Azerbaijani Language Style Guide"
  };
  var CURRENCY_EXAMPLES = {
    en: "$100",
    ru: "100 \u20BD",
    es: "100\u20AC \xB7 US$20",
    "es-AR": "AR$100 \xB7 US$20",
    "uz-Cyrl": "100 USD",
    "uz-Latn": "100 USD",
    uk: "\u20AC100 \xB7 100\xA0UAH",
    mn: "\u20AC100 \xB7 100MNT",
    da: "100 kr. \xB7 100 DKK",
    "pt-BR": "R$\xA0100 \xB7 100\xA0BRL",
    az: "100\xA0\u20BC"
  };
  var NOTES = {
    en: { en: "UK English conventions.", ru: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0431\u0440\u0438\u0442\u0430\u043D\u0441\u043A\u043E\u0433\u043E \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u0433\u043E." },
    ru: { en: "Promotion T&Cs use HH:mm \u041C\u0421\u041A DD.MM.YYYY; grouping starts at five digits.", ru: "\u0412 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u0445 \u0430\u043A\u0446\u0438\u0438: \u0427\u0427:\u041C\u041C \u041C\u0421\u041A \u0414\u0414.\u041C\u041C.\u0413\u0413\u0413\u0413; \u0433\u0440\u0443\u043F\u043F\u044B \u0446\u0438\u0444\u0440 \u2014 \u043E\u0442 \u043F\u044F\u0442\u0438 \u0437\u043D\u0430\u043A\u043E\u0432." },
    es: { en: "Symbols usually follow the amount; US$/AR$ precede it. ISO codes have separate rules.", ru: "\u0421\u0438\u043C\u0432\u043E\u043B \u043E\u0431\u044B\u0447\u043D\u043E \u043F\u043E\u0441\u043B\u0435 \u0441\u0443\u043C\u043C\u044B; US$/AR$ \u043F\u0435\u0440\u0435\u0434 \u043D\u0435\u0439. \u0414\u043B\u044F \u043A\u043E\u0434\u043E\u0432 ISO \u2014 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430." },
    "es-AR": { en: "Distinguish US$ and AR$; do not change the source currency or amount without instruction.", ru: "\u0420\u0430\u0437\u043B\u0438\u0447\u0430\u0439\u0442\u0435 US$ \u0438 AR$; \u043D\u0435 \u043C\u0435\u043D\u044F\u0439\u0442\u0435 \u0432\u0430\u043B\u044E\u0442\u0443 \u0438\u043B\u0438 \u0441\u0443\u043C\u043C\u0443 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u0431\u0435\u0437 \u0443\u043A\u0430\u0437\u0430\u043D\u0438\u044F." },
    "uz-Cyrl": { en: "24-hour time; numeric dates use dots; five-digit grouping uses NBSP.", ru: "24-\u0447\u0430\u0441\u043E\u0432\u043E\u0435 \u0432\u0440\u0435\u043C\u044F; \u0434\u0430\u0442\u044B \u0447\u0435\u0440\u0435\u0437 \u0442\u043E\u0447\u043A\u0443; \u0440\u0430\u0437\u0440\u044F\u0434\u044B \u043E\u0442 \u043F\u044F\u0442\u0438 \u0446\u0438\u0444\u0440 \u2014 \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    "uz-Latn": { en: "24-hour time; numeric dates use dots; five-digit grouping uses NBSP.", ru: "24-\u0447\u0430\u0441\u043E\u0432\u043E\u0435 \u0432\u0440\u0435\u043C\u044F; \u0434\u0430\u0442\u044B \u0447\u0435\u0440\u0435\u0437 \u0442\u043E\u0447\u043A\u0443; \u0440\u0430\u0437\u0440\u044F\u0434\u044B \u043E\u0442 \u043F\u044F\u0442\u0438 \u0446\u0438\u0444\u0440 \u2014 \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    uk: { en: "UAH uses a non-breaking space after the amount; \u20AC, $ and \u20BD have no space before the amount.", ru: "UAH \u043F\u043E\u0441\u043B\u0435 \u0441\u0443\u043C\u043C\u044B \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B; \u20AC, $ \u0438 \u20BD \u043F\u0435\u0440\u0435\u0434 \u0441\u0443\u043C\u043C\u043E\u0439 \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u0430." },
    mn: { en: "MNT follows the number without a space; $, \u20AC and \u20BD precede it.", ru: "MNT \u043F\u043E\u0441\u043B\u0435 \u0447\u0438\u0441\u043B\u0430 \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u0430; $, \u20AC \u0438 \u20BD \u043F\u0435\u0440\u0435\u0434 \u0447\u0438\u0441\u043B\u043E\u043C." },
    da: { en: "Dynamic content, markets and odds may retain English decimal conventions.", ru: "\u0412 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u043C \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0435, \u0440\u044B\u043D\u043A\u0430\u0445 \u0438 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442\u0430\u0445 \u043C\u043E\u0436\u0435\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C\u0441\u044F \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0434\u0440\u043E\u0431\u0435\u0439." },
    "pt-BR": { en: "Use NBSP for R$ and BRL; some odds and score formats have explicit exceptions.", ru: "\u0414\u043B\u044F R$ \u0438 BRL \u043D\u0443\u0436\u0435\u043D \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B; \u0434\u043B\u044F \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442\u043E\u0432 \u0438 \u0441\u0447\u0451\u0442\u0430 \u0435\u0441\u0442\u044C \u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F." },
    az: { en: "\u20BC follows the amount with a non-breaking space.", ru: "\u20BC \u043F\u043E\u0441\u043B\u0435 \u0441\u0443\u043C\u043C\u044B \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." }
  };
  function exampleDate(profile) {
    const separator = profile.dateSeparator ?? "/";
    return profile.dateOrder === "YMD" ? `2026${separator}03${separator}17` : `17${separator}03${separator}2026`;
  }
  function quoteExample(style) {
    return style === "guillemets" ? "\xAB\u2026\xBB" : style === "uk-single" ? "\u2018\u2026\u2019" : style === "double" ? '"\u2026"' : "\u2014";
  }
  function initLanguageRulesView({ getLocale: getLocale2 }) {
    function refresh() {
      const locale = getLocale2();
      for (const [id, key] of [
        ["language-rules-tab", "rulesTab"],
        ["language-rules-title", "rulesTitle"],
        ["language-rules-intro", "rulesIntro"],
        ["language-rules-note", "rulesNote"],
        ["rules-language-heading", "rulesLanguage"],
        ["rules-date-heading", "rulesDate"],
        ["rules-number-heading", "rulesNumber"],
        ["rules-currency-heading", "rulesCurrency"],
        ["rules-percent-heading", "rulesPercent"],
        ["rules-quotes-heading", "rulesQuotes"],
        ["rules-notes-heading", "rulesNotes"],
        ["language-rules-checks-title", "rulesChecksTitle"],
        ["language-rules-checks-copy", "rulesChecksCopy"]
      ]) $3(id).textContent = t(locale, key);
      const body = $3("language-rules-body");
      body.replaceChildren();
      for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
        const row = document.createElement("tr");
        const numberExample = `12${profile.decimal}35 \xB7 12${profile.grouping === "nbsp" ? "\xA0" : profile.grouping}345`;
        const cells = [
          `${profileLabel(locale, code, profile.label)} (${code})`,
          `${profile.dateFormat}
${exampleDate(profile)}`,
          numberExample,
          CURRENCY_EXAMPLES[code],
          `25${profile.percentSpace ? " " : ""}%`,
          quoteExample(profile.quoteStyle),
          `${NOTES[code][locale]}
${GUIDE[code]}`
        ];
        for (const value of cells) {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        }
        body.append(row);
      }
    }
    refresh();
    return { refresh };
  }

  // src/language-detection.js
  var WORDS2 = {
    en: ["the", "and", "this", "with", "payment", "must", "your"],
    es: ["el", "la", "los", "las", "que", "para", "con", "pago", "hola", "gracias"],
    "pt-BR": ["o", "a", "os", "as", "que", "para", "com", "pagamento", "ol\xE1", "obrigado"],
    da: ["og", "det", "den", "til", "med", "ikke", "betaling", "hej", "tak"],
    az: ["v\u0259", "bu", "\xFC\xE7\xFCn", "il\u0259", "olan", "\xF6d\u0259ni\u015F", "salam", "t\u0259\u015F\u0259kk\xFCr"],
    "uz-Latn": ["va", "bu", "uchun", "bilan", "to'lov", "to\u2018lov", "salom", "rahmat"],
    ru: ["\u0438", "\u044D\u0442\u043E", "\u0434\u043B\u044F", "\u0441", "\u043F\u043B\u0430\u0442\u0451\u0436", "\u043E\u043F\u043B\u0430\u0442\u0430", "\u0434\u043E\u043B\u0436\u0435\u043D"],
    uk: ["\u0456", "\u0446\u0435", "\u0434\u043B\u044F", "\u0437", "\u043F\u043B\u0430\u0442\u0456\u0436", "\u043E\u043F\u043B\u0430\u0442\u0430", "\u043F\u043E\u0432\u0438\u043D\u0435\u043D"],
    "uz-Cyrl": ["\u0432\u0430", "\u0431\u0443", "\u0443\u0447\u0443\u043D", "\u0431\u0438\u043B\u0430\u043D", "\u0442\u045E\u043B\u043E\u0432", "\u043A\u0435\u0440\u0430\u043A"],
    mn: ["\u0431\u0430", "\u044D\u043D\u044D", "\u043D\u044C", "\u0431\u043E\u043B\u043E\u043D", "\u0442\u04E9\u043B\u0431\u04E9\u0440", "\u0451\u0441\u0442\u043E\u0439", "\u0441\u0430\u0439\u043D"]
  };
  var SPECIALS2 = {
    uk: /[іїєґ]/giu,
    ru: /[ёыэъ]/giu,
    "uz-Cyrl": /[қғўҳ]/giu,
    mn: /[өү]/giu,
    es: /[ñ¿¡]/giu,
    "pt-BR": /[ãõç]/giu,
    da: /[æøå]/giu,
    az: /[əğıöşü]/giu,
    "uz-Latn": /(?:[oOgG][ʻʼ‘’])/gu
  };
  function countMatches2(text, pattern) {
    return text.match(pattern)?.length ?? 0;
  }
  function wordPattern2(word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|\\s|[,.!?])${escaped}(?:$|\\s|[,.!?])`, "iu");
  }
  function detectLanguage2(text) {
    const normalized = text.trim().toLocaleLowerCase();
    if (!normalized) return { code: "en", label: LANGUAGE_PROFILES.en.label, confidence: 0, reason: "No text" };
    const scores = Object.fromEntries(Object.keys(LANGUAGE_PROFILES).map((code2) => [code2, 0]));
    for (const [code2, pattern] of Object.entries(SPECIALS2)) scores[code2] += countMatches2(normalized, pattern) * 4;
    for (const [code2, words] of Object.entries(WORDS2)) {
      for (const word of words) if (wordPattern2(word).test(normalized)) scores[code2] += 2;
    }
    if (/[а-яё]/iu.test(normalized)) {
      scores.ru += 1;
      scores.uk += 1;
      scores["uz-Cyrl"] += 1;
      scores.mn += 1;
    }
    if (/[a-z]/iu.test(normalized)) {
      scores.en += 1;
      scores.es += 1;
      scores["pt-BR"] += 1;
      scores.da += 1;
      scores.az += 1;
      scores["uz-Latn"] += 1;
    }
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [code, score] = ranked[0];
    const secondScore = ranked[1]?.[1] ?? 0;
    const confidence = score === 0 ? 0 : Math.min(0.99, Math.max(0.45, 0.55 + (score - secondScore) * 0.08));
    return { code, label: LANGUAGE_PROFILES[code].label, confidence, reason: score > secondScore ? "Script and lexical markers" : "Low-signal heuristic" };
  }

  // src/text-segmentation.js?v=1.5
  function scriptFamily(text) {
    if (/[а-яёіїєґқғўҳөү]/iu.test(text)) return "cyrillic";
    if (/[a-zа-яёіїєґқғўҳөү]/iu.test(text)) return "latin";
    return "neutral";
  }
  function selectPrimaryLanguageBlock(text, preferredCode = "auto") {
    const separator = /\r?\n(?:[ \t]*\r?\n)+/;
    const paragraphs = (separator.test(text) ? text.split(separator) : text.split(/\r?\n/)).map((paragraph) => paragraph.trim()).filter(Boolean);
    if (paragraphs.length < 2) return text;
    const signals = paragraphs.map((paragraph) => detectLanguage2(paragraph));
    const strongCodes = new Set(signals.filter((signal, index) => paragraphs[index].length >= 28 && signal.confidence >= 0.7).map((signal) => signal.code));
    if (strongCodes.size < 2 && preferredCode === "auto") return text;
    const primaryIndex = signals.findIndex((signal, index) => paragraphs[index].length >= 28 && signal.confidence >= 0.7 && (preferredCode === "auto" || signal.code === preferredCode));
    const primaryCode = preferredCode !== "auto" ? preferredCode : signals[primaryIndex]?.code;
    if (!primaryCode || preferredCode !== "auto" && !strongCodes.has(primaryCode)) return text;
    const primaryScript = scriptFamily(paragraphs[primaryIndex >= 0 ? primaryIndex : 0]);
    return paragraphs.filter((paragraph, index) => scriptFamily(paragraph) === primaryScript || signals[index].confidence < 0.7).join("\n\n");
  }

  // src/i18n.js?v=2.2
  var INTERFACE_LOCALES2 = Object.freeze(["en", "ru"]);
  var UI2 = {
    en: {
      eyebrow: "LOCAL \xB7 RULE-BASED QA",
      title: "CHECKform",
      subtitle: "Find what others miss",
      workspace: "Translation workspace",
      original: "ORIGINAL",
      sourceLanguage: "Source language",
      goalLanguage: "Goal language",
      sourcePlaceholder: "Paste the source text here or drop a file\u2026",
      targetPlaceholder: "Paste the translation here\u2026",
      dropOriginal: "Drop Original file here",
      dropGoal: "Drop Goal file here",
      openFile: "Open file",
      chooseProfile: "Choose a profile or use Auto-detect. The selected profile controls date formats, punctuation and numeric conventions.",
      dropGoalCopy: "Drop the Goal file here or use Open file. It will appear in Target Review.",
      waitingForGoal: "Waiting for goal text",
      manualProfile: "Manual profile",
      detected: "Detected",
      supportedProfiles: "Supported profiles",
      profilesCount: "11 language profiles",
      targetReview: "TARGET REVIEW",
      issues: "ISSUES",
      reviewFindings: "Review findings",
      checking: "Checking\u2026",
      finding: "finding",
      findings: "findings",
      excluded: "excluded",
      noFindings: "No findings",
      noViolations: "No rule violations found in this increment.",
      exportPdf: "Export PDF",
      count: "Count",
      edit: "Edit",
      done: "Done",
      explanation: "Explanation",
      goToIssue: "Go to {type} in target text",
      noPopup: "Allow pop-ups to export PDF",
      checked: "Checked {time}",
      ready: "Ready",
      footer: "Deterministic checks \xB7 No LLM \xB7 No auto-correction",
      errorTable: "Error table",
      checkTab: "Check",
      glossaryTab: "Glossary",
      gmtTab: "GMT",
      gmtTitle: "GMT & time zones",
      gmtIntro: "Set the expected marker and offset by target language. Changes are saved in this browser and applied to the next check.",
      gmtNote: "A language is not a time zone. Until a market-specific rule is confirmed, keep the source marker and offset. English is the usual source; Ukrainian normally uses Russian.",
      gmtSource: "Usual source",
      gmtRule: "Target rule",
      gmtMarker: "Marker",
      gmtOffset: "Offset from GMT (hours)",
      gmtExample: "Example from 20:59 GMT",
      gmtInherit: "Keep source zone",
      gmtEquivalent: "Equivalent moment (any marker)",
      gmtFixed: "Fixed marker and offset",
      gmtExamplesTitle: "Checks",
      gmtExamplesCopy: "20:59 GMT \u2192 17:59 GMT-3 passes for Argentine Spanish. GMT -3 has an extra space. 12:00 \u041C\u0421\u041A = 09:00 GMT.",
      gmtSaved: "GMT rule saved in this browser",
      gmtSaveError: "Enter a valid offset from -12 to +14 hours",
      rulesTab: "Language rules",
      rulesTitle: "Language conventions",
      rulesIntro: "A quick reference based on the supplied style guides and CHECKform's language profiles.",
      rulesNote: "Examples show default formats. Market and content-type exceptions need manual review.",
      rulesLanguage: "Language",
      rulesDate: "Date",
      rulesNumber: "Numbers",
      rulesCurrency: "Currency",
      rulesPercent: "Percent",
      rulesQuotes: "Quotes",
      rulesNotes: "Exceptions / guide",
      rulesChecksTitle: "Automated checks",
      rulesChecksCopy: "CHECKform checks comparable numeric values, dates, currency markers and placement, percent spacing, quotation style, and extra spaces. Ambiguous formats require review.",
      glossaryTitle: "Glossary",
      glossaryIntro: "Edit a term here and CHECKform will use the new translation in the next check. Changes are saved in this browser.",
      glossarySearch: "Search terms or translations\u2026",
      glossaryFrom: "Source term",
      glossaryTo: "Goal term",
      glossaryNotes: "Notes",
      glossaryAdd: "Add term",
      glossaryAddSource: "New source term",
      glossaryAddTarget: "New goal term",
      glossarySaved: "Saved in this browser",
      glossarySaveError: "Could not save changes in this browser",
      glossaryRows: "{count} entries",
      glossaryEmpty: "No entries match the search.",
      glossaryMissing: "No translation in glossary",
      glossaryShowMore: "Show more",
      glossarySourceRule: "Source: {language}",
      errorTableTitle: "Error table",
      errorTableDescription: "Supported checks and their default severity",
      close: "Close",
      errorType: "Error type",
      pool: "Pool",
      severity: "Severity",
      description: "Description",
      profileRulesTitle: "Profile conventions",
      dateFormat: "Date format",
      targetTimezone: "Target time zone",
      decimalSeparator: "Decimal separator",
      thousandSeparator: "Thousand separator",
      currencyFormat: "Currency",
      percentageFormat: "Percentage",
      quotationMarks: "Quotation marks",
      before: "before",
      after: "after",
      withoutSpace: "without space",
      withSpace: "with space",
      notSpecified: "Not specified",
      interfaceLanguage: "Interface language",
      autoDetect: "Auto-detect",
      sourceFileReceived: "Source file received \xB7 waiting for the other file",
      targetFileReceived: "Goal file received \xB7 waiting for the other file",
      bothFilesLoaded: "Both files loaded",
      fileLoaded: "File loaded",
      sourceFile: "Source file",
      targetFile: "Goal file"
    },
    ru: {
      eyebrow: "\u041B\u041E\u041A\u0410\u041B\u042C\u041D\u0410\u042F \xB7 RULE-BASED QA",
      title: "CHECKform",
      subtitle: "\u041D\u0430\u0445\u043E\u0434\u0438\u043C \u0442\u043E, \u0447\u0442\u043E \u0434\u0440\u0443\u0433\u0438\u0435 \u043D\u0435 \u0432\u0438\u0434\u044F\u0442",
      workspace: "\u0420\u0430\u0431\u043E\u0447\u0430\u044F \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      original: "\u041E\u0420\u0418\u0413\u0418\u041D\u0410\u041B",
      sourceLanguage: "\u042F\u0437\u044B\u043A \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      goalLanguage: "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u044F\u0437\u044B\u043A",
      sourcePlaceholder: "\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u2026",
      targetPlaceholder: "\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u2026",
      dropOriginal: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u0441\u044E\u0434\u0430",
      dropGoal: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0441\u044E\u0434\u0430",
      openFile: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u0430\u0439\u043B",
      chooseProfile: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0430\u0432\u0442\u043E\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435. \u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0437\u0430\u0434\u0430\u0451\u0442 \u0444\u043E\u0440\u043C\u0430\u0442\u044B \u0434\u0430\u0442, \u043F\u0443\u043D\u043A\u0442\u0443\u0430\u0446\u0438\u0438 \u0438 \u0447\u0438\u0441\u0435\u043B.",
      dropGoalCopy: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u0430\u0439\u043B\xBB. \u041E\u043D \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0432 \u043E\u043A\u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u043F\u0440\u0430\u0432\u0430.",
      waitingForGoal: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0442\u0435\u043A\u0441\u0442\u0430 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      manualProfile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0432\u044B\u0431\u0440\u0430\u043D \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
      detected: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D",
      supportedProfiles: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u0438",
      profilesCount: "11 \u044F\u0437\u044B\u043A\u043E\u0432\u044B\u0445 \u043F\u0440\u043E\u0444\u0438\u043B\u0435\u0439",
      targetReview: "\u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0410 \u041F\u0415\u0420\u0415\u0412\u041E\u0414\u0410",
      issues: "\u041E\u0428\u0418\u0411\u041A\u0418",
      reviewFindings: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
      checking: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430\u2026",
      finding: "\u043E\u0448\u0438\u0431\u043A\u0430",
      findings: "\u043E\u0448\u0438\u0431\u043E\u043A",
      excluded: "\u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
      noFindings: "\u041E\u0448\u0438\u0431\u043E\u043A \u043D\u0435\u0442",
      noViolations: "\u041D\u0430 \u044D\u0442\u043E\u043C \u044D\u0442\u0430\u043F\u0435 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.",
      exportPdf: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 PDF",
      count: "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0442\u044C",
      edit: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
      done: "\u0413\u043E\u0442\u043E\u0432\u043E",
      explanation: "\u041F\u043E\u044F\u0441\u043D\u0435\u043D\u0438\u0435",
      goToIssue: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043E\u0448\u0438\u0431\u043A\u0435 {type} \u0432 \u0442\u0435\u043A\u0441\u0442\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      noPopup: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u043E\u043A\u043D\u0430 \u0434\u043B\u044F \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430 PDF",
      checked: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E \u0432 {time}",
      ready: "\u0413\u043E\u0442\u043E\u0432\u043E",
      footer: "\u0414\u0435\u0442\u0435\u0440\u043C\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \xB7 \u0411\u0435\u0437 LLM \xB7 \u0411\u0435\u0437 \u0430\u0432\u0442\u043E\u043A\u043E\u0440\u0440\u0435\u043A\u0446\u0438\u0438",
      errorTable: "\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043E\u0448\u0438\u0431\u043E\u043A",
      checkTab: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430",
      glossaryTab: "\u0421\u043B\u043E\u0432\u0430\u0440\u044C",
      gmtTab: "GMT",
      gmtTitle: "GMT \u0438 \u0447\u0430\u0441\u043E\u0432\u044B\u0435 \u043F\u043E\u044F\u0441\u0430",
      gmtIntro: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043C\u0430\u0440\u043A\u0435\u0440 \u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u0446\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u044F\u0437\u044B\u043A\u0430. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u043F\u0440\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435.",
      gmtNote: "\u042F\u0437\u044B\u043A \u043D\u0435 \u0440\u0430\u0432\u0435\u043D \u0447\u0430\u0441\u043E\u0432\u043E\u043C\u0443 \u043F\u043E\u044F\u0441\u0443. \u041F\u043E\u043A\u0430 \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u0440\u044B\u043D\u043A\u0430 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C \u043C\u0430\u0440\u043A\u0435\u0440 \u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430. \u041E\u0431\u044B\u0447\u043D\u043E \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439; \u0434\u043B\u044F \u0443\u043A\u0440\u0430\u0438\u043D\u0441\u043A\u043E\u0433\u043E \u2014 \u0440\u0443\u0441\u0441\u043A\u0438\u0439.",
      gmtSource: "\u041E\u0431\u044B\u0447\u043D\u044B\u0439 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B",
      gmtRule: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      gmtMarker: "\u041C\u0430\u0440\u043A\u0435\u0440",
      gmtOffset: "\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 GMT (\u0447\u0430\u0441\u044B)",
      gmtExample: "\u041F\u0440\u0438\u043C\u0435\u0440 \u043E\u0442 20:59 GMT",
      gmtInherit: "\u041A\u0430\u043A \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435",
      gmtEquivalent: "\u0422\u043E\u0442 \u0436\u0435 \u043C\u043E\u043C\u0435\u043D\u0442 (\u043B\u044E\u0431\u043E\u0439 \u043C\u0430\u0440\u043A\u0435\u0440)",
      gmtFixed: "\u0417\u0430\u0434\u0430\u043D\u044B \u043C\u0430\u0440\u043A\u0435\u0440 \u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435",
      gmtExamplesTitle: "\u041F\u0440\u0438\u043C\u0435\u0440\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A",
      gmtExamplesCopy: "20:59 GMT \u2192 17:59 GMT-3 \u2014 \u0432\u0435\u0440\u043D\u043E \u0434\u043B\u044F \u0430\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0441\u043A\u043E\u0433\u043E \u0438\u0441\u043F\u0430\u043D\u0441\u043A\u043E\u0433\u043E. GMT -3 \u2014 \u043B\u0438\u0448\u043D\u0438\u0439 \u043F\u0440\u043E\u0431\u0435\u043B. 12:00 \u041C\u0421\u041A = 09:00 GMT.",
      gmtSaved: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E GMT \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      gmtSaveError: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0435 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 \u221212 \u0434\u043E +14 \u0447\u0430\u0441\u043E\u0432",
      rulesTab: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u044F\u0437\u044B\u043A\u043E\u0432",
      rulesTitle: "\u042F\u0437\u044B\u043A\u043E\u0432\u044B\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430",
      rulesIntro: "\u041A\u0440\u0430\u0442\u043A\u0430\u044F \u043F\u0430\u043C\u044F\u0442\u043A\u0430 \u043F\u043E \u043F\u0440\u0438\u0441\u043B\u0430\u043D\u043D\u044B\u043C \u0441\u0442\u0430\u0439\u043B\u0433\u0430\u0439\u0434\u0430\u043C \u0438 \u044F\u0437\u044B\u043A\u043E\u0432\u044B\u043C \u043F\u0440\u043E\u0444\u0438\u043B\u044F\u043C CHECKform.",
      rulesNote: "\u0412 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 \u0431\u0430\u0437\u043E\u0432\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B. \u0418\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u043F\u043E \u0440\u044B\u043D\u043A\u0443 \u0438 \u0442\u0438\u043F\u0443 \u0442\u0435\u043A\u0441\u0442\u0430 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u043E\u043C.",
      rulesLanguage: "\u042F\u0437\u044B\u043A",
      rulesDate: "\u0414\u0430\u0442\u0430",
      rulesNumber: "\u0427\u0438\u0441\u043B\u0430",
      rulesCurrency: "\u0412\u0430\u043B\u044E\u0442\u0430",
      rulesPercent: "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B",
      rulesQuotes: "\u041A\u0430\u0432\u044B\u0447\u043A\u0438",
      rulesNotes: "\u0418\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F / \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442",
      rulesChecksTitle: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
      rulesChecksCopy: "CHECKform \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u0442 \u0447\u0438\u0441\u043B\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u0434\u0430\u0442\u044B, \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u0430\u043B\u044E\u0442, \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u043F\u0435\u0440\u0435\u0434 %, \u043A\u0430\u0432\u044B\u0447\u043A\u0438 \u0438 \u043B\u0438\u0448\u043D\u0438\u0435 \u043F\u0440\u043E\u0431\u0435\u043B\u044B. \u041D\u0435\u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430.",
      glossaryTitle: "\u0421\u043B\u043E\u0432\u0430\u0440\u044C",
      glossaryIntro: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u0435 \u0442\u0435\u0440\u043C\u0438\u043D \u0437\u0434\u0435\u0441\u044C \u2014 CHECKform \u0443\u0447\u0442\u0451\u0442 \u043D\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u043F\u0440\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435.",
      glossarySearch: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043C \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430\u043C\u2026",
      glossaryFrom: "\u0422\u0435\u0440\u043C\u0438\u043D \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      glossaryTo: "\u0422\u0435\u0440\u043C\u0438\u043D \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      glossaryNotes: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u044F",
      glossaryAdd: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u0440\u043C\u0438\u043D",
      glossaryAddSource: "\u041D\u043E\u0432\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      glossaryAddTarget: "\u041D\u043E\u0432\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      glossarySaved: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      glossarySaveError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      glossaryRows: "{count} \u0437\u0430\u043F\u0438\u0441\u0435\u0439",
      glossaryEmpty: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043D\u0435\u0442.",
      glossaryMissing: "\u041D\u0435\u0442 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0432 \u0441\u043B\u043E\u0432\u0430\u0440\u0435",
      glossaryShowMore: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451",
      glossarySourceRule: "\u041E\u0440\u0438\u0433\u0438\u043D\u0430\u043B: {language}",
      errorTableTitle: "\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043E\u0448\u0438\u0431\u043E\u043A",
      errorTableDescription: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0438 \u0438\u0445 \u0433\u0440\u0430\u0434\u0430\u0446\u0438\u044F \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
      errorType: "\u0422\u0438\u043F \u043E\u0448\u0438\u0431\u043A\u0438",
      pool: "\u041F\u0443\u043B",
      severity: "\u0413\u0440\u0430\u0434\u0430\u0446\u0438\u044F",
      description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
      profileRulesTitle: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044F",
      dateFormat: "\u0424\u043E\u0440\u043C\u0430\u0442 \u0434\u0430\u0442\u044B",
      targetTimezone: "\u0427\u0430\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u044F\u0441 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430",
      decimalSeparator: "\u0414\u0435\u0441\u044F\u0442\u0438\u0447\u043D\u044B\u0439 \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C",
      thousandSeparator: "\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u0442\u044B\u0441\u044F\u0447",
      currencyFormat: "\u0412\u0430\u043B\u044E\u0442\u0430",
      percentageFormat: "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B",
      quotationMarks: "\u041A\u0430\u0432\u044B\u0447\u043A\u0438",
      before: "\u043F\u0435\u0440\u0435\u0434 \u0447\u0438\u0441\u043B\u043E\u043C",
      after: "\u043F\u043E\u0441\u043B\u0435 \u0447\u0438\u0441\u043B\u0430",
      withoutSpace: "\u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u0430",
      withSpace: "\u0441 \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u043C",
      notSpecified: "\u041D\u0435 \u0437\u0430\u0434\u0430\u043D\u043E",
      interfaceLanguage: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430",
      autoDetect: "\u0410\u0432\u0442\u043E\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435",
      sourceFileReceived: "\u0424\u0430\u0439\u043B \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D \xB7 \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F \u0432\u0442\u043E\u0440\u043E\u0439 \u0444\u0430\u0439\u043B",
      targetFileReceived: "\u0424\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D \xB7 \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F \u0432\u0442\u043E\u0440\u043E\u0439 \u0444\u0430\u0439\u043B",
      bothFilesLoaded: "\u041E\u0431\u0430 \u0444\u0430\u0439\u043B\u0430 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B",
      fileLoaded: "\u0424\u0430\u0439\u043B \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D",
      sourceFile: "\u0424\u0430\u0439\u043B \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430",
      targetFile: "\u0424\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430"
    }
  };
  var PROFILE_LABELS2 = Object.freeze({
    ru: {
      en: "\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439",
      ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
      es: "\u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439",
      "es-AR": "\u0410\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0441\u043A\u0438\u0439 \u0438\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439",
      "uz-Cyrl": "\u0423\u0437\u0431\u0435\u043A\u0441\u043A\u0438\u0439 (\u043A\u0438\u0440\u0438\u043B\u043B\u0438\u0446\u0430)",
      "uz-Latn": "\u0423\u0437\u0431\u0435\u043A\u0441\u043A\u0438\u0439 (\u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0430)",
      uk: "\u0423\u043A\u0440\u0430\u0438\u043D\u0441\u043A\u0438\u0439",
      mn: "\u041C\u043E\u043D\u0433\u043E\u043B\u044C\u0441\u043A\u0438\u0439",
      da: "\u0414\u0430\u0442\u0441\u043A\u0438\u0439",
      "pt-BR": "\u0411\u0440\u0430\u0437\u0438\u043B\u044C\u0441\u043A\u0438\u0439 \u043F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u044C\u0441\u043A\u0438\u0439",
      az: "\u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043D\u0441\u043A\u0438\u0439"
    }
  });
  var ISSUE_CATALOG2 = Object.freeze([
    { type: "GLOSSARY_TRANSLATION_MISSING", pool: "Terminology", severity: "Major", en: "A source term is present, but its listed glossary translation is missing from the matching target passage.", ru: "\u0422\u0435\u0440\u043C\u0438\u043D \u0435\u0441\u0442\u044C \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435, \u043D\u043E \u0435\u0433\u043E \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0438\u0437 \u0441\u043B\u043E\u0432\u0430\u0440\u044F \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u043C \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442\u0435." },
    { type: "GLOSSARY_CASE_MISMATCH", pool: "Terminology", severity: "Minor", en: "The glossary translation is present but its letter case differs.", ru: "\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u0438\u0437 \u0441\u043B\u043E\u0432\u0430\u0440\u044F \u043D\u0430\u0439\u0434\u0435\u043D, \u043D\u043E \u0440\u0435\u0433\u0438\u0441\u0442\u0440 \u0431\u0443\u043A\u0432 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F." },
    { type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", en: "Numeric values outside dates and times differ between source and target.", ru: "\u0427\u0438\u0441\u043B\u043E\u0432\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432\u043D\u0435 \u0434\u0430\u0442\u044B \u0438\u043B\u0438 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "NUMBER_WORD_JOINED", pool: "Numbers", severity: "Minor", en: "A number is attached to a word and may indicate a typo or a missing space.", ru: "\u0426\u0438\u0444\u0440\u0430 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0430 \u043A \u0441\u043B\u043E\u0432\u0443 \u2014 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u044D\u0442\u043E \u043E\u043F\u0435\u0447\u0430\u0442\u043A\u0430 \u0438\u043B\u0438 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "SPANISH_QUESTION_MARKS", pool: "Punctuation", severity: "Minor", en: "Spanish questions should use an opening \xBF and a closing ?.", ru: "\u0412 \u0438\u0441\u043F\u0430\u043D\u0441\u043A\u043E\u043C \u0432\u043E\u043F\u0440\u043E\u0441\u0435 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u0437\u043D\u0430\u043A \xBF \u0438 \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0439 ?." },
    { type: "NUMBER_FORMAT", pool: "Numbers", severity: "Minor", en: "Digit grouping does not follow the selected language profile.", ru: "\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u0438 \u0440\u0430\u0437\u0440\u044F\u0434\u043E\u0432 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u044F\u0437\u044B\u043A\u043E\u0432\u043E\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E." },
    { type: "CURRENCY_MISMATCH", pool: "Currency", severity: "Major", en: "Currency markers differ between source and target.", ru: "\u041E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0432\u0430\u043B\u044E\u0442\u044B \u043E\u0442\u043B\u0438\u0447\u0430\u044E\u0442\u0441\u044F \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", en: "Currency placement or spacing does not follow the selected profile.", ru: "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u0430\u043B\u044E\u0442\u044B \u0438\u043B\u0438 \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E." },
    { type: "PERCENTAGE_FORMAT", pool: "Percentage", severity: "Minor", en: "The percentage sign uses an incorrect position or spacing.", ru: "\u0417\u043D\u0430\u043A \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0430 \u0441\u0442\u043E\u0438\u0442 \u043D\u0435\u0432\u0435\u0440\u043D\u043E \u0438\u043B\u0438 \u043E\u0442\u0434\u0435\u043B\u0451\u043D \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u043C \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u043C." },
    { type: "PUNCTUATION_MISMATCH", pool: "Punctuation", severity: "Minor", en: "Terminal punctuation differs between source and target.", ru: "\u041A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u0437\u043D\u0430\u043A \u043F\u0440\u0435\u043F\u0438\u043D\u0430\u043D\u0438\u044F \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "QUOTATION_STYLE", pool: "Punctuation", severity: "Minor", en: "Quotation marks do not follow the selected language profile.", ru: "\u041A\u0430\u0432\u044B\u0447\u043A\u0438 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u044F\u0437\u044B\u043A\u043E\u0432\u043E\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E." },
    { type: "MULTIPLE_SPACES", pool: "Spacing", severity: "Minor", en: "Target contains consecutive spaces.", ru: "\u0412 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u044B \u0434\u0432\u043E\u0439\u043D\u044B\u0435 \u0438\u043B\u0438 \u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0431\u0435\u043B\u044B." },
    { type: "TRAILING_SPACE", pool: "Spacing", severity: "Minor", en: "Target contains a space at the end of a line.", ru: "\u0412 \u043A\u043E\u043D\u0446\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0441\u0442\u043E\u0438\u0442 \u043B\u0438\u0448\u043D\u0438\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "SPACE_BEFORE_PUNCTUATION", pool: "Spacing", severity: "Minor", en: "There is an unnecessary space before punctuation.", ru: "\u041F\u0435\u0440\u0435\u0434 \u0437\u043D\u0430\u043A\u043E\u043C \u043F\u0440\u0435\u043F\u0438\u043D\u0430\u043D\u0438\u044F \u0441\u0442\u043E\u0438\u0442 \u043B\u0438\u0448\u043D\u0438\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "NON_BREAKING_SPACE", pool: "Spacing", severity: "Minor", en: "Digit groups should use a non-breaking space in this language profile.", ru: "\u0412 \u044D\u0442\u043E\u043C \u044F\u0437\u044B\u043A\u043E\u0432\u043E\u043C \u043F\u0440\u043E\u0444\u0438\u043B\u0435 \u043C\u0435\u0436\u0434\u0443 \u0440\u0430\u0437\u0440\u044F\u0434\u0430\u043C\u0438 \u043D\u0443\u0436\u0435\u043D \u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B." },
    { type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", en: "A placeholder is missing or changed in the target.", ru: "\u041F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435." },
    { type: "TIMEZONE_MISSING", pool: "Dates & Time", severity: "Major", en: "Timezone is present in the source but missing in the target.", ru: "\u0412 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0435\u0441\u0442\u044C \u0447\u0430\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u044F\u0441, \u043D\u043E \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043E\u043D \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442." },
    { type: "TIMEZONE_EXTRA", pool: "Dates & Time", severity: "Minor", en: "Target adds a timezone that is not present in the source.", ru: "\u0412 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0447\u0430\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u044F\u0441, \u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E \u043D\u0435\u0442 \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435." },
    { type: "TIMEZONE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target uses an incorrect GMT offset for the selected locale or the local time was not converted.", ru: "\u0412 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 GMT \u0434\u043B\u044F \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u0438\u043B\u0438 \u043C\u0435\u0441\u0442\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043D\u0435 \u043F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043D\u043E." },
    { type: "TIMEZONE_OFFSET_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target timezone offset differs from the GMT table.", ru: "\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0447\u0430\u0441\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u044F\u0441\u0430 \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 GMT." },
    { type: "TIMEZONE_LABEL_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target timezone marker differs from the GMT table.", ru: "\u041C\u0430\u0440\u043A\u0435\u0440 \u0447\u0430\u0441\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u044F\u0441\u0430 \u0432 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 GMT." },
    { type: "TIMEZONE_FORMAT", pool: "Dates & Time", severity: "Minor", en: "The timezone marker contains a space or non-standard sign; use its exact spelling from the GMT table.", ru: "\u041C\u0430\u0440\u043A\u0435\u0440 \u0447\u0430\u0441\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u044F\u0441\u0430 \u043D\u0430\u043F\u0438\u0441\u0430\u043D \u0441 \u043B\u0438\u0448\u043D\u0438\u043C \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u043C \u0438\u043B\u0438 \u043D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C \u0437\u043D\u0430\u043A\u043E\u043C; \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u043E\u0447\u043D\u0443\u044E \u0437\u0430\u043F\u0438\u0441\u044C \u0438\u0437 \u0442\u0430\u0431\u043B\u0438\u0446\u044B GMT." },
    { type: "INVALID_DATE", pool: "Dates & Time", severity: "Major", en: "A calendar date, clock time, or GMT offset is invalid in the source or target.", ru: "\u0412 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u043D\u0430\u044F \u0434\u0430\u0442\u0430, \u0432\u0440\u0435\u043C\u044F \u0438\u043B\u0438 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 GMT." },
    { type: "DATE_FORMAT", pool: "Dates & Time", severity: "Minor", en: "Numeric date format does not follow the selected language profile.", ru: "\u0427\u0438\u0441\u043B\u043E\u0432\u0430\u044F \u0434\u0430\u0442\u0430 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0444\u043E\u0440\u043C\u0430\u0442\u0443 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u044F\u0437\u044B\u043A\u0430." },
    { type: "DATE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target contain different calendar dates.", ru: "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u043D\u044B\u0435 \u0434\u0430\u0442\u044B \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0440\u0430\u0437\u043B\u0438\u0447\u0430\u044E\u0442\u0441\u044F." },
    { type: "TIME_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target contain different clock times.", ru: "\u0412\u0440\u0435\u043C\u044F \u043D\u0430 \u0447\u0430\u0441\u0430\u0445 \u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0440\u0430\u0437\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F." },
    { type: "DATETIME_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target resolve to different moments after timezone normalization.", ru: "\u041F\u043E\u0441\u043B\u0435 \u043D\u043E\u0440\u043C\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0447\u0430\u0441\u043E\u0432\u044B\u0445 \u043F\u043E\u044F\u0441\u043E\u0432 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0443\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u043D\u0430 \u0440\u0430\u0437\u043D\u044B\u0435 \u043C\u043E\u043C\u0435\u043D\u0442\u044B." }
  ]);
  var POOL_LABELS = {
    ru: { Numbers: "\u0427\u0438\u0441\u043B\u0430", Currency: "\u0412\u0430\u043B\u044E\u0442\u0430", Percentage: "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B", Punctuation: "\u041F\u0443\u043D\u043A\u0442\u0443\u0430\u0446\u0438\u044F", Spacing: "\u041F\u0440\u043E\u0431\u0435\u043B\u044B", Capitalization: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440", Placeholders: "\u041F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440\u044B", Terminology: "\u0422\u0435\u0440\u043C\u0438\u043D\u043E\u043B\u043E\u0433\u0438\u044F", Formatting: "\u0424\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435", Transliteration: "\u0422\u0440\u0430\u043D\u0441\u043B\u0438\u0442\u0435\u0440\u0430\u0446\u0438\u044F", "Dates & Time": "\u0414\u0430\u0442\u044B \u0438 \u0432\u0440\u0435\u043C\u044F", "File structure": "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0444\u0430\u0439\u043B\u0430" }
  };
  var SEVERITY_LABELS = {
    en: { Critical: "CRITICAL", Major: "MAJOR", Minor: "MINOR", Info: "INFO" },
    ru: { Critical: "CRITICAL", Major: "MAJOR", Minor: "MINOR", Info: "INFO" }
  };
  function getLocale() {
    try {
      return localStorage.getItem("translation-qa-locale") === "ru" ? "ru" : "en";
    } catch {
      return "en";
    }
  }
  function setLocale(locale) {
    const next = INTERFACE_LOCALES2.includes(locale) ? locale : "en";
    try {
      localStorage.setItem("translation-qa-locale", next);
    } catch {
    }
    return next;
  }
  function t2(locale, key, variables = {}) {
    let value = UI2[locale]?.[key] ?? UI2.en[key] ?? key;
    for (const [name, replacement] of Object.entries(variables)) value = value.replace(`{${name}}`, replacement);
    return value;
  }
  function profileLabel2(locale, code, fallback) {
    return PROFILE_LABELS2[locale]?.[code] ?? fallback;
  }
  function poolLabel(locale, pool) {
    return POOL_LABELS[locale]?.[pool] ?? pool;
  }
  function severityLabel(locale, severity) {
    return SEVERITY_LABELS[locale]?.[severity] ?? severity;
  }
  function catalogEntry(errorType) {
    return ISSUE_CATALOG2.find((entry) => entry.type === errorType);
  }
  function issueDescription(locale, issue) {
    if (issue.format) {
      const { expected, actual } = issue.format;
      return locale === "ru" ? `\u0424\u043E\u0440\u043C\u0430\u0442 \u0434\u0430\u0442\u044B: \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F ${expected}, \u043D\u0430\u0439\u0434\u0435\u043D\u043E \xAB${actual}\xBB.` : `Date format: expected ${expected}; found \u201C${actual}\u201D.`;
    }
    if (issue.timezone) {
      const { expected, actual } = issue.timezone;
      const detail = locale === "ru" ? `\u041E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F \xAB${expected}\xBB, \u043D\u0430\u0439\u0434\u0435\u043D\u043E \xAB${actual}\xBB.` : `Expected \u201C${expected}\u201D; found \u201C${actual}\u201D.`;
      return `${catalogEntry(issue.error_type)?.[locale] ?? issue.explanation ?? ""} ${detail}`;
    }
    if (issue.error_type === "GLOSSARY_CASE_MISMATCH" && issue.glossary) {
      const expected = issue.glossary.expectedTerms.join(" / ");
      return locale === "ru" ? `\u0420\u0435\u0433\u0438\u0441\u0442\u0440 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F: \u043D\u0430\u0439\u0434\u0435\u043D\u043E \xAB${issue.glossary.actualTerm}\xBB, \u0432 \u0441\u043B\u043E\u0432\u0430\u0440\u0435 \xAB${expected}\xBB (\u0441\u0442\u0440\u043E\u043A\u0430 ${issue.glossary.rows.join(", ")}).` : `Translation case differs: found \u201C${issue.glossary.actualTerm}\u201D, glossary expects \u201C${expected}\u201D (row ${issue.glossary.rows.join(", ")}).`;
    }
    if (issue.glossary) {
      const expected = issue.glossary.expectedTerms.join(" / ");
      return locale === "ru" ? `\u0412 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0435 \xAB${issue.glossary.sourceTerm}\xBB. \u0412 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u043C \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F \xAB${expected}\xBB (\u0441\u0442\u0440\u043E\u043A\u0430 \u0441\u043B\u043E\u0432\u0430\u0440\u044F ${issue.glossary.rows.join(", ")}).` : `Source term \u201C${issue.glossary.sourceTerm}\u201D is present. Expected \u201C${expected}\u201D in the matching target passage (glossary row ${issue.glossary.rows.join(", ")}).`;
    }
    const entry = catalogEntry(issue.error_type);
    return entry?.[locale] ?? entry?.en ?? issue.explanation ?? "";
  }

  // src/main.js
  var $4 = (id) => document.getElementById(id);
  var sourceLanguage = $4("source-language");
  var targetLanguage = $4("target-language");
  var sourceText = $4("source-text");
  var targetText = $4("target-text");
  var issuesList = $4("issues-list");
  var fileInputs = {
    source: $4("source-file-input"),
    target: $4("target-file-input")
  };
  var exportPdfButton = $4("export-pdf");
  var pendingFileTexts = { source: null, target: null };
  var rawFileTexts = { source: null, target: null };
  var issuePreferences = /* @__PURE__ */ new Map();
  var filesCommitted = false;
  var currentIssues = [];
  var currentLocale = getLocale();
  var glossaryView;
  var gmtView;
  var languageRulesView;
  loadGlossaryEdits();
  loadTimezoneRules();
  function populateLanguageOptions() {
    const sourceValue = sourceLanguage.value || "auto";
    const targetValue = targetLanguage.value || "auto";
    sourceLanguage.replaceChildren();
    targetLanguage.replaceChildren();
    sourceLanguage.add(new Option(t2(currentLocale, "autoDetect"), "auto"));
    targetLanguage.add(new Option(t2(currentLocale, "autoDetect"), "auto"));
    for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
      const label = profileLabel2(currentLocale, code, profile.label);
      sourceLanguage.add(new Option(label, code));
      targetLanguage.add(new Option(label, code));
    }
    sourceLanguage.value = sourceValue;
    targetLanguage.value = targetValue;
  }
  function escapeHtml(value) {
    return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  }
  function issueKey(issue) {
    return `${issue.error_type}:${issue.pool}:${issue.location_in_target.start}:${issue.location_in_target.end}:${issue.location_in_source?.start ?? ""}:${issue.glossary?.sourceTerm ?? ""}`;
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
    if (currentLocale === "en") return `${count} ${count === 1 ? t2(currentLocale, "finding") : t2(currentLocale, "findings")}`;
    if (count % 10 === 1 && count % 100 !== 11) return `${count} \u043E\u0448\u0438\u0431\u043A\u0430`;
    return `${count} \u043E\u0448\u0438\u0431\u043E\u043A`;
  }
  function detectionReason(reason) {
    if (currentLocale === "ru") return { "No text": "\u041D\u0435\u0442 \u0442\u0435\u043A\u0441\u0442\u0430", "Script and lexical markers": "\u041F\u043E \u0430\u043B\u0444\u0430\u0432\u0438\u0442\u0443 \u0438 \u043B\u0435\u043A\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u0430\u043C", "Low-signal heuristic": "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u043E\u0432" }[reason] ?? reason;
    return reason;
  }
  function applyTranslations() {
    document.documentElement.lang = currentLocale;
    $4("eyebrow").textContent = t2(currentLocale, "eyebrow");
    $4("app-title").textContent = t2(currentLocale, "title");
    $4("app-subtitle").textContent = t2(currentLocale, "subtitle");
    $4("workspace-grid").setAttribute("aria-label", t2(currentLocale, "workspace"));
    $4("original-label").textContent = t2(currentLocale, "original");
    $4("source-heading").textContent = t2(currentLocale, "sourceLanguage");
    $4("target-language-heading").textContent = t2(currentLocale, "goalLanguage");
    $4("target-heading").textContent = t2(currentLocale, "goalLanguage");
    $4("source-language-label").textContent = t2(currentLocale, "sourceLanguage");
    $4("target-language-label").textContent = t2(currentLocale, "goalLanguage");
    $4("source-language").setAttribute("aria-label", t2(currentLocale, "sourceLanguage"));
    $4("target-language").setAttribute("aria-label", t2(currentLocale, "goalLanguage"));
    $4("source-open-file").textContent = t2(currentLocale, "openFile");
    $4("target-open-file").textContent = t2(currentLocale, "openFile");
    $4("source-drop-hint").textContent = t2(currentLocale, "dropOriginal");
    $4("goal-language-label").textContent = t2(currentLocale, "goalLanguage").toUpperCase();
    $4("target-review-label").textContent = t2(currentLocale, "targetReview");
    $4("profile-copy").textContent = t2(currentLocale, "chooseProfile");
    $4("goal-drop-copy").textContent = t2(currentLocale, "dropGoalCopy");
    $4("goal-drop-hint").textContent = t2(currentLocale, "dropGoal");
    $4("supported-profiles").textContent = t2(currentLocale, "supportedProfiles");
    $4("profiles-count").textContent = t2(currentLocale, "profilesCount");
    $4("issues-label").textContent = t2(currentLocale, "issues");
    $4("review-findings").textContent = t2(currentLocale, "reviewFindings");
    $4("export-pdf").textContent = t2(currentLocale, "exportPdf");
    $4("footer-copy").textContent = t2(currentLocale, "footer");
    $4("error-table-open").textContent = t2(currentLocale, "errorTable");
    $4("error-table-kicker").textContent = currentLocale === "ru" ? "\u0421\u041F\u0420\u0410\u0412\u041E\u0427\u041D\u0418\u041A \u041E\u0428\u0418\u0411\u041E\u041A" : "ERROR REFERENCE";
    $4("error-table-title").textContent = t2(currentLocale, "errorTableTitle");
    $4("error-table-description").textContent = t2(currentLocale, "errorTableDescription");
    $4("profile-rules-title").textContent = t2(currentLocale, "profileRulesTitle");
    $4("error-table-close").setAttribute("aria-label", t2(currentLocale, "close"));
    $4("error-type-heading").textContent = t2(currentLocale, "errorType");
    $4("pool-heading").textContent = t2(currentLocale, "pool");
    $4("severity-heading").textContent = t2(currentLocale, "severity");
    $4("description-heading").textContent = t2(currentLocale, "description");
    sourceText.placeholder = t2(currentLocale, "sourcePlaceholder");
    targetText.placeholder = t2(currentLocale, "targetPlaceholder");
    for (const button of document.querySelectorAll(".locale-button")) {
      const active = button.dataset.locale === currentLocale;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    populateLanguageOptions();
    glossaryView?.refresh();
    gmtView?.refresh();
    languageRulesView?.refresh();
    renderErrorTable();
  }
  function renderErrorTable() {
    const body = $4("error-table-body");
    if (!body) return;
    body.replaceChildren();
    for (const entry of ISSUE_CATALOG2) {
      const row = document.createElement("tr");
      const type = document.createElement("td");
      type.textContent = entry.type;
      const pool = document.createElement("td");
      pool.textContent = poolLabel(currentLocale, entry.pool);
      const severity = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `severity-badge ${entry.severity.toLowerCase()}`;
      badge.textContent = severityLabel(currentLocale, entry.severity);
      severity.append(badge);
      const description = document.createElement("td");
      description.textContent = entry[currentLocale] ?? entry.en;
      row.append(type, pool, severity, description);
      body.append(row);
    }
  }
  function updateProfileRulesVisibility() {
    const rules = document.querySelector(".profile-rules");
    const hasBothTexts = Boolean(sourceText.value.trim() && targetText.value.trim());
    if (rules) rules.hidden = !hasBothTexts;
    $4("header-main")?.classList.toggle("has-profile-rules", hasBothTexts);
  }
  function renderProfileRules(code) {
    const body = $4("profile-rules-body");
    if (!body) return;
    updateProfileRulesVisibility();
    const profile = LANGUAGE_PROFILES[code] ?? LANGUAGE_PROFILES.en;
    const timezoneRule = getTimezoneRule(code);
    const separatorLabel = (value) => value === "nbsp" ? currentLocale === "ru" ? "\u043D\u0435\u0440\u0430\u0437\u0440\u044B\u0432\u043D\u044B\u0439 \u043F\u0440\u043E\u0431\u0435\u043B (1\xA0000)" : "non-breaking space (1\xA0000)" : value;
    const currencySpace = profile.currencySpace === "nbsp" ? "\xA0" : profile.currencySpace ?? "";
    const currencyExample = profile.currencyPlacement === "prefix" ? `\u20AC${currencySpace}100` : `100${currencySpace}\u20AC`;
    const quoteExample2 = profile.quoteStyle === "guillemets" ? "\xAB\u2026\xBB" : profile.quoteStyle === "uk-single" ? "\u2018\u2026\u2019" : profile.quoteStyle === "double" ? "\u201C\u2026\u201D" : t2(currentLocale, "notSpecified");
    const rows = [
      [t2(currentLocale, "dateFormat"), profile.dateFormat ?? t2(currentLocale, "notSpecified")],
      [t2(currentLocale, "targetTimezone"), timezoneRule.mode === "source" ? t2(currentLocale, "gmtInherit") : timezoneRule.mode === "equivalent" ? t2(currentLocale, "gmtEquivalent") : formatTimezone(timezoneRule.label, timezoneRule.offsetMinutes)],
      [t2(currentLocale, "decimalSeparator"), profile.decimal],
      [t2(currentLocale, "thousandSeparator"), separatorLabel(profile.grouping)],
      [t2(currentLocale, "currencyFormat"), `${currencyExample} (${profile.currencyPlacement === "prefix" ? t2(currentLocale, "before") : t2(currentLocale, "after")})`],
      [t2(currentLocale, "percentageFormat"), `100${profile.percentSpace ? " " : ""}%`],
      [t2(currentLocale, "quotationMarks"), quoteExample2]
    ];
    body.replaceChildren();
    for (const [label, value] of rows) {
      const row = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = label;
      const valueCell = document.createElement("td");
      valueCell.textContent = value;
      row.append(labelCell, valueCell);
      body.append(row);
    }
  }
  function paragraphBreakPositions(text) {
    const positions = [...text.matchAll(/\r?\n(?:[ \t]*\r?\n)+/g)].map((match) => match.index ?? 0);
    if (text.trim()) positions.push(text.length);
    return positions;
  }
  function paragraphMarkerHtml(number) {
    return `<span class="paragraph-number" data-number="${number}" aria-hidden="true"></span>`;
  }
  function highlightedTextHtml(text, issues, locationKey = "location_in_target") {
    const ranges = issues.map((issue, index) => ({ ...issue[locationKey] ?? {}, severity: issue.severity, label: issue.error_type, number: index + 1 })).filter((range) => Number.isInteger(range.start) && Number.isInteger(range.end) && range.end > range.start).sort((a, b) => a.start - b.start);
    const mergedRanges = [];
    for (const range of ranges) {
      const previous = mergedRanges[mergedRanges.length - 1];
      if (previous && range.start <= previous.end) {
        previous.end = Math.max(previous.end, range.end);
        previous.number = `${previous.number}, ${range.number}`;
        previous.label = `${previous.label} \xB7 ${range.label}`;
      } else {
        mergedRanges.push({ ...range });
      }
    }
    const paragraphEnds = paragraphBreakPositions(text);
    let paragraphIndex = 0;
    const appendText = (start, end) => {
      let html2 = "";
      let cursor2 = start;
      while (paragraphIndex < paragraphEnds.length && paragraphEnds[paragraphIndex] <= end) {
        const paragraphEnd = paragraphEnds[paragraphIndex];
        if (paragraphEnd >= cursor2) html2 += escapeHtml(text.slice(cursor2, paragraphEnd));
        html2 += paragraphMarkerHtml(paragraphIndex + 1);
        cursor2 = Math.max(cursor2, paragraphEnd);
        paragraphIndex += 1;
      }
      return html2 + escapeHtml(text.slice(cursor2, end));
    };
    let cursor = 0;
    let html = "";
    for (const range of mergedRanges) {
      html += appendText(cursor, range.start);
      html += `<mark class="${range.severity.toLowerCase()}" data-number="${range.number}" title="${escapeHtml(range.label)}">${escapeHtml(text.slice(range.start, range.end))}</mark>`;
      cursor = range.end;
    }
    return html + appendText(cursor, text.length);
  }
  function renderTargetHighlights(text, issues) {
    const layer = $4("target-highlight-layer");
    layer.innerHTML = highlightedTextHtml(text, issues);
    layer.scrollTop = targetText.scrollTop;
    layer.scrollLeft = targetText.scrollLeft;
  }
  function renderSourceHighlights(text, issues) {
    const layer = $4("source-highlight-layer");
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
      const sourceLayer = $4("source-highlight-layer");
      sourceLayer.scrollTop = sourceText.scrollTop;
      sourceLayer.scrollLeft = sourceText.scrollLeft;
      const layer = $4("target-highlight-layer");
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
    glossaryView?.syncLanguage(targetCode);
    renderProfileRules(targetCode);
    $4("source-heading").textContent = t2(currentLocale, "sourceLanguage");
    $4("target-language-heading").textContent = t2(currentLocale, "goalLanguage");
    $4("target-heading").textContent = t2(currentLocale, "goalLanguage");
    $4("language-state").textContent = targetLanguage.value === "auto" ? targetText.value.trim() ? `${t2(currentLocale, "detected")} \xB7 ${detectionReason(targetDetection.reason)}` : t2(currentLocale, "waitingForGoal") : t2(currentLocale, "manualProfile");
    $4("source-count").textContent = `${sourceText.value.length} characters`;
    $4("target-count").textContent = `${targetText.value.length} characters`;
    const issues = runRuleEngine({ source: sourceText.value, target: targetText.value, sourceLanguage: sourceCode, targetLanguage: targetCode, glossaryRows: getGlossaryRows() });
    currentIssues = issues;
    const includedIssues = issues.filter((issue) => getIssuePreference(issue).included);
    renderTargetHighlights(targetText.value, includedIssues);
    renderSourceHighlights(sourceText.value, includedIssues);
    $4("issue-summary").textContent = includedIssues.length ? `${findingCount(includedIssues.length)}${includedIssues.length !== issues.length ? ` \xB7 ${issues.length - includedIssues.length} ${t2(currentLocale, "excluded")}` : ""}` : issues.length ? `${issues.length} ${t2(currentLocale, "excluded")}` : t2(currentLocale, "noFindings");
    exportPdfButton.disabled = includedIssues.length === 0;
    $4("checked-at").textContent = t2(currentLocale, "checked", { time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    issuesList.replaceChildren();
    if (!issues.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = t2(currentLocale, "noViolations");
      issuesList.append(empty);
      return;
    }
    for (const issue of issues) {
      const preference = getIssuePreference(issue);
      const row = document.createElement("div");
      row.className = `issue-row${preference.included ? "" : " excluded"}`;
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", t2(currentLocale, "goToIssue", { type: issue.error_type }));
      row.addEventListener("click", (event) => {
        if (!event.target.closest("button, input, textarea, label")) focusIssue(issue);
      });
      row.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button, input, textarea, label")) {
          event.preventDefault();
          focusIssue(issue);
        }
      });
      const dot = document.createElement("span");
      dot.className = `severity-dot ${issue.severity.toLowerCase()}`;
      dot.title = issue.severity;
      const type = document.createElement("div");
      type.className = "issue-type";
      const issueNumber = document.createElement("span");
      issueNumber.className = "issue-index";
      issueNumber.textContent = preference.included ? String(includedIssues.indexOf(issue) + 1) : "\u2014";
      type.append(issueNumber, document.createTextNode(issue.error_type));
      const meta = document.createElement("div");
      meta.className = "issue-meta";
      meta.textContent = `${poolLabel(currentLocale, issue.pool)} \xB7 ${severityLabel(currentLocale, issue.severity)}`;
      const explanation = document.createElement("div");
      explanation.className = "issue-explanation";
      explanation.textContent = issueExplanation(issue, preference);
      const controls = document.createElement("div");
      controls.className = "issue-controls";
      const toggleLabel = document.createElement("label");
      toggleLabel.className = "issue-toggle";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = preference.included;
      checkbox.setAttribute("aria-label", `${t2(currentLocale, "count")} ${issue.error_type}`);
      checkbox.addEventListener("change", () => {
        preference.included = checkbox.checked;
        render();
      });
      const toggleText = document.createElement("span");
      toggleText.textContent = t2(currentLocale, "count");
      toggleLabel.append(checkbox, toggleText);
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit-issue";
      editButton.textContent = preference.editing ? t2(currentLocale, "done") : t2(currentLocale, "edit");
      editButton.addEventListener("click", () => {
        preference.editing = !preference.editing;
        render();
      });
      controls.append(toggleLabel, editButton);
      row.append(dot, type, meta, explanation, controls);
      if (preference.editing) {
        const editor = document.createElement("div");
        editor.className = "issue-edit-panel";
        const editorLabel = document.createElement("label");
        editorLabel.textContent = t2(currentLocale, "explanation");
        const editorInput = document.createElement("textarea");
        editorInput.rows = 2;
        editorInput.value = issueExplanation(issue, preference);
        editorInput.addEventListener("input", () => {
          preference.explanation = editorInput.value;
          preference.edited = true;
        });
        editorLabel.append(editorInput);
        editor.append(editorLabel);
        row.append(editor);
      }
      issuesList.append(row);
    }
  }
  function exportPdf(issues) {
    const includedIssues = issues.filter((issue) => getIssuePreference(issue).included);
    if (!includedIssues.length) return;
    const sourceCode = sourceLanguage.value === "auto" ? detectLanguage(sourceText.value).code : sourceLanguage.value;
    const targetCode = targetLanguage.value === "auto" ? detectLanguage(targetText.value).code : targetLanguage.value;
    const sourceLabel = profileLabel2(currentLocale, sourceCode, LANGUAGE_PROFILES[sourceCode]?.label ?? t2(currentLocale, "sourceLanguage"));
    const targetLabel = profileLabel2(currentLocale, targetCode, LANGUAGE_PROFILES[targetCode]?.label ?? t2(currentLocale, "goalLanguage"));
    const issueItems = includedIssues.map((issue, index) => {
      const preference = getIssuePreference(issue);
      const fragment = targetText.value.slice(issue.location_in_target.start, issue.location_in_target.end);
      return `<li><div class="report-issue-title"><strong>${index + 1}. ${escapeHtml(issue.error_type)}</strong><span>${escapeHtml(poolLabel(currentLocale, issue.pool))} \xB7 ${escapeHtml(severityLabel(currentLocale, issue.severity))}</span></div><p>${escapeHtml(issueExplanation(issue, preference))}</p>${fragment ? `<code>${escapeHtml(currentLocale === "ru" ? "\u041F\u0435\u0440\u0435\u0432\u043E\u0434" : "Target")}: \u201C${escapeHtml(fragment)}\u201D</code>` : ""}</li>`;
    }).join("");
    const report = `<!doctype html><html lang="${currentLocale}"><head><meta charset="utf-8"><title>${escapeHtml(currentLocale === "ru" ? "\u041E\u0442\u0447\u0451\u0442 CHECKform" : "CHECKform Report")}</title><style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#20231f;font:13px Arial,sans-serif;line-height:1.45}h1{margin:0 0 4px;font-size:22px}h2{margin:22px 0 8px;font-size:15px}.muted{color:#666f64}.meta{margin:0 0 18px;color:#666f64}.text{white-space:pre-wrap;overflow-wrap:anywhere;padding:12px;border:1px solid #d7dcd2;border-radius:6px;background:#fff;font:12px Consolas,"Courier New",monospace}.text mark{position:relative;padding:1px 2px;border-radius:3px;background:#ffe0ad}.text mark::before{content:attr(data-number);position:absolute;left:0;top:-1.25em;min-width:14px;padding:1px 3px;border-radius:8px;background:#006739;color:#fff;font:10px Arial,sans-serif;text-align:center}.text mark.critical{background:#ffd0cc}.text mark.minor{background:#ccefd9}ol{margin:0;padding-left:22px}li{margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #d7dcd2}.report-issue-title{display:flex;justify-content:space-between;gap:16px}.report-issue-title span{color:#666f64}li p{margin:4px 0;color:#424740}code{font:12px Consolas,"Courier New",monospace;color:#006739}footer{margin-top:24px;color:#666f64;font-size:11px}@media print{.text{break-inside:auto}li{break-inside:avoid}}
  </style></head><body><h1>${escapeHtml(currentLocale === "ru" ? "\u041E\u0442\u0447\u0451\u0442 CHECKform" : "CHECKform Report")}</h1><p class="meta">${escapeHtml(sourceLabel)} \u2192 ${escapeHtml(targetLabel)} \xB7 ${escapeHtml(findingCount(includedIssues.length))}</p><h2>${escapeHtml(currentLocale === "ru" ? "\u0422\u0435\u043A\u0441\u0442 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430 \u0441 \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043D\u044B\u043C\u0438 \u043E\u0448\u0438\u0431\u043A\u0430\u043C\u0438" : "Target text with marked findings")}</h2><div class="text">${highlightedTextHtml(targetText.value, includedIssues)}</div><h2>${escapeHtml(currentLocale === "ru" ? "\u041E\u0448\u0438\u0431\u043A\u0438" : "Findings")}</h2><ol>${issueItems}</ol><footer>${escapeHtml(currentLocale === "ru" ? "\u0421\u043E\u0437\u0434\u0430\u043D\u043E CHECKform \xB7 \u041E\u0448\u0438\u0431\u043A\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u044B, \u0442\u0435\u043A\u0441\u0442 \u043D\u0435 \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u044F\u043B\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438." : "Generated by CHECKform \xB7 Findings are reported only; target text was not auto-corrected.")}</footer></body></html>`;
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      $4("issue-summary").textContent = t2(currentLocale, "noPopup");
      return;
    }
    reportWindow.document.open();
    reportWindow.document.write(report);
    reportWindow.document.close();
    reportWindow.focus();
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
    const dropZone = $4(`${kind}-drop-zone`);
    try {
      rawFileTexts[kind] = await readFile(file);
      pendingFileTexts[kind] = kind === "source" ? selectPrimaryLanguageBlock(rawFileTexts[kind], sourceLanguage.value) : rawFileTexts[kind];
      dropZone.dataset.fileName = file.name;
      const otherKind = kind === "source" ? "target" : "source";
      const otherDropZone = $4(`${otherKind}-drop-zone`);
      if (!filesCommitted && pendingFileTexts.source !== null && pendingFileTexts.target !== null) {
        setTextAreaValue("source", pendingFileTexts.source);
        setTextAreaValue("target", pendingFileTexts.target);
        filesCommitted = true;
        dropZone.dataset.fileStatus = t2(currentLocale, "bothFilesLoaded");
        otherDropZone.dataset.fileStatus = t2(currentLocale, "bothFilesLoaded");
      } else if (filesCommitted) {
        setTextAreaValue(kind, pendingFileTexts[kind]);
        dropZone.dataset.fileStatus = t2(currentLocale, "fileLoaded");
      } else {
        dropZone.dataset.fileStatus = t2(currentLocale, kind === "source" ? "sourceFileReceived" : "targetFileReceived");
      }
      setTimeout(() => {
        delete dropZone.dataset.fileStatus;
      }, 2200);
    } catch (error) {
      dropZone.dataset.fileError = error.message;
      setTimeout(() => delete dropZone.dataset.fileError, 3500);
    }
  }
  for (const kind of ["source", "target"]) {
    const input = fileInputs[kind];
    const zone = $4(`${kind}-drop-zone`);
    input.addEventListener("change", () => loadFile(kind, input.files[0]));
    zone.addEventListener("dragenter", (event) => {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!zone.contains(event.relatedTarget)) zone.classList.remove("drag-over");
    });
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.remove("drag-over");
      loadFile(kind, event.dataTransfer?.files?.[0]);
    });
  }
  document.addEventListener("dragover", (event) => event.preventDefault());
  document.addEventListener("drop", (event) => event.preventDefault());
  var timer;
  for (const element of [sourceText, targetText, sourceLanguage, targetLanguage]) {
    element.addEventListener("input", () => {
      updateProfileRulesVisibility();
      clearTimeout(timer);
      timer = setTimeout(render, 120);
    });
    element.addEventListener("change", render);
  }
  sourceLanguage.addEventListener("change", () => {
    if (rawFileTexts.source === null) return;
    pendingFileTexts.source = selectPrimaryLanguageBlock(rawFileTexts.source, sourceLanguage.value);
    setTextAreaValue("source", pendingFileTexts.source);
  });
  targetText.addEventListener("scroll", () => {
    $4("target-highlight-layer").scrollTop = targetText.scrollTop;
    $4("target-highlight-layer").scrollLeft = targetText.scrollLeft;
  });
  sourceText.addEventListener("scroll", () => {
    $4("source-highlight-layer").scrollTop = sourceText.scrollTop;
    $4("source-highlight-layer").scrollLeft = sourceText.scrollLeft;
  });
  exportPdfButton.addEventListener("click", () => exportPdf(currentIssues));
  for (const button of document.querySelectorAll(".locale-button")) {
    button.addEventListener("click", () => {
      currentLocale = setLocale(button.dataset.locale);
      applyTranslations();
      render();
    });
  }
  var errorTableDialog = $4("error-table-dialog");
  $4("error-table-open").addEventListener("click", () => {
    renderErrorTable();
    errorTableDialog.showModal();
  });
  $4("error-table-close").addEventListener("click", () => errorTableDialog.close());
  errorTableDialog.addEventListener("click", (event) => {
    if (event.target === errorTableDialog) errorTableDialog.close();
  });
  glossaryView = initGlossaryView({
    getLocale: () => currentLocale,
    getGoalLanguage: () => targetLanguage.value === "auto" ? detectLanguage(targetText.value).code : targetLanguage.value,
    onChange: render
  });
  gmtView = initGmtView({ getLocale: () => currentLocale, onChange: render });
  languageRulesView = initLanguageRulesView({ getLocale: () => currentLocale });
  for (const tab of document.querySelectorAll(".workspace-tab")) {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view;
      $4("qa-view").hidden = view !== "check";
      $4("glossary-view").hidden = view !== "glossary";
      $4("gmt-view").hidden = view !== "gmt";
      $4("language-rules-view").hidden = view !== "rules";
      for (const button of document.querySelectorAll(".workspace-tab")) {
        const active = button === tab;
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      }
      if (view === "glossary") glossaryView.refresh();
      if (view === "gmt") gmtView.refresh();
      if (view === "rules") languageRulesView.refresh();
    });
  }
  applyTranslations();
  render();
})();

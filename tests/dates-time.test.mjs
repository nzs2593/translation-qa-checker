import assert from "node:assert/strict";
import { checkDatesAndTime, parseTemporal, parseTemporals } from "../src/dates-time.js";
import { getProfile } from "../src/profiles.js";
import { getTimezoneRule } from "../src/timezone-rules.js";

const profile = { dateOrder: "YMD", language: "en" };

assert.equal(parseTemporal("20:59 GMT").timezone.offsetMinutes, 0);
assert.equal(parseTemporal("17:59 GMT-3").timezone.offsetMinutes, -180);
assert.equal(checkDatesAndTime("20:59 GMT", "17:59 GMT-3", { sourceProfile: profile, targetProfile: profile }).length, 0);
assert.equal(checkDatesAndTime("20:59 GMT", "17:59", { sourceProfile: profile, targetProfile: profile })[0].error_type, "TIMEZONE_MISSING");
assert.equal(checkDatesAndTime("20:59 GMT", "20:59 GMT-3", { sourceProfile: profile, targetProfile: profile })[0].error_type, "TIMEZONE_MISMATCH");
assert.equal(checkDatesAndTime("20:59 GMT", "21:00 GMT", { sourceProfile: profile, targetProfile: profile })[0].error_type, "DATETIME_MISMATCH");
assert.equal(checkDatesAndTime("2026-08-27 20:59 GMT", "27.08.2026 17:59 GMT-3", { sourceProfile: { dateOrder: "YMD", language: "en" }, targetProfile: { dateOrder: "DMY", language: "ru" } }).length, 0);
assert.equal(checkDatesAndTime("2026-08-27", "27.08.2026", { sourceProfile: { dateOrder: "YMD", language: "en" }, targetProfile: { dateOrder: "DMY", language: "ru" } }).length, 0);
assert.equal(checkDatesAndTime("2026-08-27", "28.08.2026", { sourceProfile: { dateOrder: "YMD", language: "en" }, targetProfile: { dateOrder: "DMY", language: "ru" } })[0].error_type, "DATE_MISMATCH");
assert.equal(checkDatesAndTime("00:01 GMT on 01/07/2026", "21:01 GMT-3 del 30/06/2026", { sourceProfile: { dateOrder: "DMY", language: "en" }, targetProfile: { dateOrder: "DMY", language: "es" } }).length, 0);
assert.equal(checkDatesAndTime("00:01 GMT on 01/07/2026", "21:01 GMT-3 del 31/06/2026", { sourceProfile: { dateOrder: "DMY", language: "en" }, targetProfile: { dateOrder: "DMY", language: "es" } })[0].error_type, "INVALID_DATE");

const english = { dateOrder: "DMY", language: "en" };
const spanish = { dateOrder: "DMY", language: "es" };
const sourceRange = "between 00:01 GMT on 01/07/2026 and 23:59 GMT on 30/06/2027";
const targetRange = "entre las 21:01 GMT-3 del 30/06/2026 y las 20:59 GMT-3 del 30/06/2027 (las 00:01 GMT del 01/07/2026 y las 23:59 GMT del 30/06/2027)";
assert.equal(parseTemporals(sourceRange, english).length, 2);
assert.equal(parseTemporals(targetRange, spanish).length, 4);
assert.deepEqual(checkDatesAndTime(sourceRange, targetRange, { sourceProfile: english, targetProfile: spanish }), []);
assert.equal(checkDatesAndTime(sourceRange, targetRange.replace("21:01 GMT-3", "21:02 GMT-3"), { sourceProfile: english, targetProfile: spanish })[0].error_type, "DATETIME_MISMATCH");
assert.equal(checkDatesAndTime(sourceRange, targetRange.replace("20:59 GMT-3", "20:58 GMT-3"), { sourceProfile: english, targetProfile: spanish })[0].error_type, "TIME_MISMATCH");
assert.equal(checkDatesAndTime("00:30 GMT on 01/01/2027", "21:30 GMT-3 del 31/12/2026", { sourceProfile: english, targetProfile: spanish }).length, 0);
assert.equal(checkDatesAndTime("00:30 GMT on 01/03/2028", "21:30 GMT-3 del 29/02/2028", { sourceProfile: english, targetProfile: spanish }).length, 0);
assert.equal(checkDatesAndTime("00:30 GMT on 01/03/2027", "21:30 GMT-3 del 29/02/2027", { sourceProfile: english, targetProfile: spanish })[0].error_type, "INVALID_DATE");
const arRule = getTimezoneRule("es-AR");
const ruRule = getTimezoneRule("ru");
const ukRule = getTimezoneRule("uk");
assert.deepEqual(checkDatesAndTime("20:59 GMT on 12/10/2026", "17:59 GMT-3 del 12/10/2026", { sourceProfile: english, targetProfile: spanish, targetTimezoneRule: arRule }), []);
assert.equal(checkDatesAndTime("20:59 GMT", "17:59 GMT -3", { sourceProfile: english, targetProfile: spanish, targetTimezoneRule: arRule })[0].error_type, "TIMEZONE_FORMAT");
assert.equal(checkDatesAndTime("20:59 GMT", "18:59 GMT-2", { sourceProfile: english, targetProfile: spanish, targetTimezoneRule: arRule })[0].error_type, "TIMEZONE_OFFSET_MISMATCH");
assert.equal(checkDatesAndTime("20:59 GMT", "17:59 UTC-3", { sourceProfile: english, targetProfile: spanish, targetTimezoneRule: arRule })[0].error_type, "TIMEZONE_LABEL_MISMATCH");
assert.deepEqual(checkDatesAndTime("09:00 GMT", "12:00 МСК", { sourceProfile: english, targetProfile: getProfile("ru"), targetTimezoneRule: ruRule }), []);
assert.deepEqual(checkDatesAndTime("12:00 МСК", "09:00 GMT", { sourceProfile: getProfile("ru"), targetProfile: getProfile("uk"), targetTimezoneRule: ukRule }), []);
assert.deepEqual(checkDatesAndTime("00:30 GMT on 01/03/2028", "21:30 GMT-3 del 29/02/2028", { sourceProfile: english, targetProfile: spanish, targetTimezoneRule: arRule }), []);
assert.equal(parseTemporal("1st July 2026", english).date.month, 7);
assert.equal(parseTemporal("30 de junio de 2027", spanish).date.day, 30);
const argentine = { ...getProfile("es-AR"), language: "es" };
assert.deepEqual(checkDatesAndTime(sourceRange, targetRange, { sourceProfile: english, targetProfile: argentine }), []);
assert.equal(checkDatesAndTime("00:01 GMT on 01/07/2026", "22:01 GMT-2 del 30/06/2026", { sourceProfile: english, targetProfile: argentine })[0].error_type, "TIMEZONE_MISMATCH");

console.log("Dates & Time tests passed");

import assert from "node:assert/strict";
import { checkDatesAndTime, parseTemporal } from "../src/dates-time.js";

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

console.log("Dates & Time tests passed");

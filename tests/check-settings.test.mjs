import assert from "node:assert/strict";
import { DEFAULT_CHECKS, enabledIssues, normalizeChecks } from "../src/extension/check-settings.js";

assert.equal(Object.values(DEFAULT_CHECKS).every(Boolean), true);
assert.equal(normalizeChecks(null, false).currencyComparison, false);
assert.equal(normalizeChecks({ glossary: false, dates: true, unknown: false }).glossary, false);
const issues = [
  { pool: "Currency", error_type: "CURRENCY_CONVERSION_REVIEW" },
  { pool: "Currency", error_type: "CURRENCY_FORMAT" },
  { pool: "Currency", error_type: "CURRENCY_NUMBER_FORMAT" },
  { pool: "Terminology", error_type: "GLOSSARY_TRANSLATION_MISSING" },
  { pool: "Dates & Time", error_type: "DATETIME_MISMATCH" }
];
assert.deepEqual(enabledIssues(issues, normalizeChecks({ currencyComparison: false, glossary: false })).map((issue) => issue.error_type),
  ["CURRENCY_FORMAT", "CURRENCY_NUMBER_FORMAT", "DATETIME_MISMATCH"]);
assert.deepEqual(enabledIssues(issues, normalizeChecks({ moneyFormat: false, dates: false })).map((issue) => issue.error_type),
  ["CURRENCY_CONVERSION_REVIEW", "GLOSSARY_TRANSLATION_MISSING"]);
console.log("Extension settings tests passed");

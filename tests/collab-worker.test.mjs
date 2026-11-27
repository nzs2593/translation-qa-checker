import assert from "node:assert/strict";
import { applyChange, applyTimezoneChange, codeHash } from "../collab-worker/index.js";

const base = { schema: "checkform-shared-glossary-v1", version: 1, updatedAt: null,
  overrides: {}, rootOverrides: {}, customRows: [] };
const replace = { mode: "replace", rowId: 7, language: "es-AR", sourceTerm: "account",
  previous: "cuenta", value: "cuenta personal", root: "cuent", baseVersion: 1 };
const first = applyChange(structuredClone(base), replace, "zakharov.n");
assert.equal(first.data.overrides[7]["es-AR"], "cuenta personal");
assert.equal(first.data.rootOverrides[7]["es-AR"], "cuent");
assert.equal(first.audit.actor, "zakharov.n");
assert.equal(first.data.version, 2);
assert.throws(() => applyChange(structuredClone(first.data), replace, "sitnikova.r"), /обновлён/u);
const addition = applyChange(structuredClone(first.data), { ...replace, mode: "add", baseVersion: 2,
  value: "otra cuenta", root: null }, "zyryanova.k");
assert.equal(addition.data.customRows[0].terms["es-AR"], "otra cuenta");
assert.equal(addition.data.customRows[0].terms["en-GB"], "account");
assert.equal(addition.data.version, 3);
const newTerm = applyChange(structuredClone(addition.data), { mode: "new", rowId: 0, language: "az",
  sourceTerm: "test phrase", previous: "", value: "sınaq ifadəsi", root: "sınaq ifad", baseVersion: 3 }, "sitnikova.r");
assert.equal(newTerm.data.customRows.at(-1).terms.az, "sınaq ifadəsi");
assert.equal(newTerm.data.customRows.at(-1).terms["en-GB"], "test phrase");
assert.equal(newTerm.audit.rowId, newTerm.data.customRows.at(-1).id);
const uzbekRoot = applyChange(structuredClone(base), { mode: "replace", rowId: 9, language: "uz",
  sourceTerm: "account details", previous: "hisob ma'lumotlari", value: "hisob ma’lumotlari",
  root: "hisob ma’lumot", baseVersion: 1 }, "zakharov.n");
assert.equal(uzbekRoot.data.rootOverrides[9].uz, "hisob ma’lumot");
assert.throws(() => applyChange(structuredClone(first.data), { ...replace, baseVersion: 2,
  sourceTerm: "wrong" }, "zakharov.n"), /Исходный/u);
assert.throws(() => applyChange(structuredClone(first.data), { ...replace, baseVersion: 2,
  previous: "wrong" }, "zakharov.n"), /Перевод/u);
assert.equal(await codeHash("ABCD-EFGH-1234-5678-90XX", "test-pepper"),
  await codeHash("abcdefgh1234567890xx", "test-pepper"));
const timezones = { schema: "checkform-shared-timezones-v1", version: 1, updatedAt: null, overrides: {} };
const timezoneEdit = { language: "az", rule: { mode: "fixed", label: "GMT", offsetMinutes: 240 }, baseVersion: 1 };
const changedTimezone = applyTimezoneChange(structuredClone(timezones), timezoneEdit, "zakharov.n");
assert.equal(changedTimezone.data.version, 2);
assert.equal(changedTimezone.data.overrides.az.offsetMinutes, 240);
assert.equal(changedTimezone.audit.actor, "zakharov.n");
assert.throws(() => applyTimezoneChange(structuredClone(changedTimezone.data), timezoneEdit, "sitnikova.r"), /обновлена/u);
assert.throws(() => applyTimezoneChange(structuredClone(timezones), { ...timezoneEdit, rule: { ...timezoneEdit.rule, offsetMinutes: 900 } }, "zakharov.n"), /Некорректное/u);
console.log("Collaboration worker tests passed");

import assert from "node:assert/strict";
import { checkGlossary, getGlossaryRows, loadGlossaryEdits, updateGlossaryRoot, updateGlossaryTerm } from "../src/glossary.js";
import { runRuleEngine } from "../src/engine.js";

const rows = [
  { id: 7, terms: { "en-GB": "account", es: "cuenta" } },
  { id: 8, terms: { "en-GB": "account balance", es: "saldo de la cuenta" } },
  { id: 100, terms: { "en-GB": "Cashback", es: "Devolución" } },
  { id: 734, terms: { "en-GB": "cashback", es: "Reembolso" } },
  { id: 286, terms: { "en-GB": "Marathonbet", es: "Marathonbet" } },
  { id: 10, terms: { ru: "История счёта", uk: "Історія рахунку" } }
];

assert.equal(checkGlossary("account balance", "saldo de la cuenta", "en", "es", rows).length, 0);
const setRows = [
  { id: 423, terms: { "en-GB": "set", es: "set deportivo" } },
  { id: 900, terms: { "en-GB": "set up", es: "configurar" } }
];
assert.deepEqual(checkGlossary("Set up the account", "Configurar la cuenta", "en", "es", setRows), []);
assert.deepEqual(checkGlossary("Set up the account", "Otra cosa", "en", "es", setRows).map((issue) => issue.glossary.sourceTerm), ["Set up"]);
assert.deepEqual(checkGlossary("A set ended", "Otra cosa", "en", "es", setRows).map((issue) => issue.glossary.sourceTerm), ["set"]);
assert.deepEqual(checkGlossary("Set up the account", "Otra cosa", "en", "es", setRows.slice(0, 1)), []);
const missing = checkGlossary("account balance", "saldo", "en", "es", rows);
assert.equal(missing.length, 1);
assert.equal(missing[0].glossary.sourceTerm, "account balance");
assert.deepEqual(missing[0].location_in_source, { start: 0, end: 15 });
assert.equal(checkGlossary("Cashback", "Devolución", "en", "es", rows).length, 0);
assert.equal(checkGlossary("cashback", "Reembolso", "en", "es", rows).length, 0);
assert.equal(checkGlossary("Cashback", "Reembolso", "en", "es", rows)[0].error_type, "GLOSSARY_TRANSLATION_MISSING");
assert.equal(checkGlossary("Cashback", "devolución", "en", "es", rows)[0].error_type, "GLOSSARY_CASE_MISMATCH");
assert.deepEqual(checkGlossary("Cashback", "devolución", "en", "es", rows)[0].location_in_target, { start: 0, end: 10 });
assert.equal(checkGlossary("Marathonbet", "marathonbet", "en", "es", rows)[0].error_type, "GLOSSARY_CASE_MISMATCH");
assert.equal(checkGlossary("account", "Cuenta", "en", "es", rows).length, 0);
assert.equal(checkGlossary("История счёта", "Історія рахунку", "ru", "uk", rows).length, 0);
assert.equal(checkGlossary("История счёта", "Історія облікового запису", "ru", "uk", rows).length, 1);
assert.equal(checkGlossary("История счёта", "Історія облікового запису", "en", "uk", rows).length, 0);
const azeriRows = [
  { id: 320, terms: { "en-GB": "odds", az: "əmsal" } },
  { id: 406, terms: { "en-GB": "run", az: "ran" } }
];
assert.equal(checkGlossary("minimum odds of 1.50", "minimum 1.50 əmsallı", "en", "az", azeriRows).length, 0);
assert.equal(checkGlossary("minimum odds of 1.50", "minimum 1.50 əmsal", "en", "az", azeriRows).length, 0);
assert.equal(checkGlossary("minimum odds of 1.50", "minimum 1.50 qəmsallı", "en", "az", azeriRows)[0].error_type, "GLOSSARY_TRANSLATION_MISSING");
assert.equal(checkGlossary("This promotion will run", "Bu kampaniya davam edəcək", "en", "az", azeriRows).length, 0);
const senseRows = [
  { id: 356, terms: { "en-GB": "place", az: "yer" } },
  { id: 177, terms: { "en-GB": "event", az: "tədbir" } },
  { id: 353, terms: { "en-GB": "period", az: "period" } },
  { id: 518, terms: { "en-GB": "void", az: "ləğv/etibarsız" } }
];
assert.equal(checkGlossary("Place accumulators", "Ekspres mərclər edin", "en", "az", senseRows).length, 0);
assert.equal(checkGlossary("place a $10 bet", "10 $ məbləğində mərc edin", "en", "az", senseRows).length, 0);
assert.equal(checkGlossary("1st place", "1-ci yer", "en", "az", senseRows).length, 0);
assert.equal(checkGlossary("In the event of any discrepancy", "Uyğunsuzluq yarandıqda", "en", "az", senseRows).length, 0);
assert.equal(checkGlossary("promotional period", "kampaniya müddəti", "en", "az", senseRows).length, 0);
assert.equal(checkGlossary("void bets", "etibarsız mərclər", "en", "az", senseRows).length, 0);
const approvedAzeriRows = getGlossaryRows();
const russianForms = approvedAzeriRows.filter((row) => [6, 7].includes(row.id));
for (const form of ["страховка на экспресс", "страховки на экспресс", "страховке на экспресс",
  "страховку на экспресс", "страховкой на экспресс", "страховки на экспрессы",
  "страховок на экспрессы", "страховкам на экспрессы", "страховками на экспрессы", "страховках на экспрессы"]) {
  assert.equal(checkGlossary("Acca Insurance", form, "en", "ru", russianForms).length, 0, form);
}
for (const form of ["учетная запись", "учетной записи", "учетную запись", "учетной записью",
  "учетные записи", "учетных записей", "учетным записям", "учетными записями", "учетных записях",
  "учётная запись", "учётную запись"]) {
  assert.equal(checkGlossary("account", form, "en", "ru", russianForms).length, 0, form);
}
for (const form of ["обліковий запис", "облікового запису", "облікові записи", "облікових записів"]) {
  assert.equal(checkGlossary("учетную запись", form, "ru", "uk", russianForms).length, 0, form);
}
assert.equal(checkGlossary("account", "счет", "en", "ru", russianForms)[0].error_type, "GLOSSARY_TRANSLATION_MISSING");
assert.equal(checkGlossary("Qualifying bets must be placed at minimum odds of 2.00.", "Seçim mərcləri minimum 2.00 əmsalla edilməlidir.", "en", "az", approvedAzeriRows).some((issue) => issue.glossary?.sourceTerm === "odds"), false);
assert.equal(checkGlossary("Mbet may change the Terms and Conditions", "Mbet Şərtlər və Qaydaları dəyişdirə bilər", "en", "az", approvedAzeriRows).some((issue) => issue.glossary?.sourceTerm === "Terms and Conditions"), false);
assert.equal(checkGlossary("banned from the Loyalty Program", "Loyallıq proqramından kənarlaşdırılmasına", "en", "az", approvedAzeriRows).some((issue) => issue.glossary?.sourceTerm === "Loyalty Program"), false);

const segmentIssues = runRuleEngine({
  source: "Account balance\n\nCashback",
  target: "Saldo de la cuenta\n\nSaldo",
  sourceLanguage: "en", targetLanguage: "es", glossaryRows: rows
}).filter((issue) => issue.pool === "Terminology");
assert.equal(segmentIssues.length, 1);
assert.equal(segmentIssues[0].glossary.sourceTerm, "Cashback");
assert.equal(segmentIssues[0].location_in_target.start >= "Saldo de la cuenta\n\n".length, true);

const memory = new Map();
const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
loadGlossaryEdits(storage);
assert.equal(updateGlossaryTerm(7, "es", "perfil", storage), true);
loadGlossaryEdits(storage);
assert.equal(getGlossaryRows().find((row) => row.id === 7).terms.es, "perfil");
assert.equal(getGlossaryRows().find((row) => row.id === 320).roots.az, "əmsal");
assert.equal(updateGlossaryRoot(320, "az", "", storage), true);
loadGlossaryEdits(storage);
const exactOnly = getGlossaryRows().find((row) => row.id === 320);
assert.equal(exactOnly.roots.az, "");
assert.equal(checkGlossary("odds", "əmsallı", "en", "az", [exactOnly]).length, 1);
assert.equal(updateGlossaryRoot(320, "az", null, storage), true);
loadGlossaryEdits(storage);
assert.equal(checkGlossary("odds", "əmsallı", "en", "az", [getGlossaryRows().find((row) => row.id === 320)]).length, 0);
assert.equal(updateGlossaryTerm(320, "az", "əmsallar", storage), true);
loadGlossaryEdits(storage);
assert.equal(getGlossaryRows().find((row) => row.id === 320).roots.az, "əmsallar");
assert.equal(getGlossaryRows().find((row) => row.id === 461).roots.az, "Şərtlər və Qaydalar");
assert.equal(updateGlossaryTerm(461, "az", "Yeni termin", storage), true);
loadGlossaryEdits(storage);
assert.equal(getGlossaryRows().find((row) => row.id === 461).roots.az, "");
assert.equal(updateGlossaryRoot(9, "uz", "hisob ma’lumot", storage), true);
loadGlossaryEdits(storage);
assert.equal(getGlossaryRows().find((row) => row.id === 9).roots.uz, "hisob ma’lumot");

console.log("Glossary tests passed");

import assert from "node:assert/strict";
import { checkGlossary, getGlossaryRows, loadGlossaryEdits, updateGlossaryTerm } from "../src/glossary.js";
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

console.log("Glossary tests passed");

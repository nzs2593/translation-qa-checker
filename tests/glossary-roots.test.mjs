import assert from "node:assert/strict";
import { deriveGlossaryRoot, glossaryRootPattern } from "../src/glossary-roots.js";
import { checkGlossary } from "../src/glossary.js";

const forms = [
  ["en-GB", "account", "accounts"],
  ["az", "əmsal", "əmsalla"],
  ["az", "kampaniya", "kampaniyasının"],
  ["az", "mükafat fondu", "mükafat fondundan"],
  ["az", "veb-sayt", "veb-saytında"],
  ["da", "konto", "kontoer"],
  ["mn", "тоглолт", "тоглолтын"],
  ["pt-BR", "aposta", "apostas"],
  ["ru", "ставка", "ставки"],
  ["es", "apuesta", "apuestas"],
  ["es-AR", "apuesta", "apuestas"],
  ["uk", "ставка", "ставки"],
  ["uz", "hisob", "hisoblar"],
  ["uzb", "ҳисоб", "ҳисоблар"]
];
for (const [language, term, form] of forms) {
  const root = deriveGlossaryRoot(term, language);
  assert.ok(root, `${language}: ${term}`);
  assert.ok(glossaryRootPattern(root, term, language)?.test(form), `${language}: ${form}`);
}
assert.equal(deriveGlossaryRoot("Marathonbet", "az"), "");
assert.equal(deriveGlossaryRoot("FB", "az"), "");
assert.equal(deriveGlossaryRoot("yer", "az"), "");
assert.equal(glossaryRootPattern("əmsal", "əmsal", "az").test("qəmsalla"), false);
assert.equal(glossaryRootPattern("əmsal", "əmsal", "az").test("əmsalx"), false);
assert.equal(glossaryRootPattern("apuesta combinada", "apuesta combinada", "es").test("apuestas combinadas"), true);
assert.equal(glossaryRootPattern("aposta combinada", "aposta combinada", "pt-BR").test("apostas combinadas"), true);
assert.equal(glossaryRootPattern("apuesta combinada", "apuesta combinada", "es").test("desapuestas combinadas"), false);
assert.equal(glossaryRootPattern("apuesta combinada", "apuesta combinada", "es").test("apuestaes combinadas"), false);
for (const [language, term, variants] of [
  ["ru", "угловой", ["углового", "угловым", "угловые"]],
  ["ru", "количество", ["количества", "количеству"]],
  ["uk", "гаманець", ["гаманця", "гаманців", "гаманцями"]],
  ["uk", "переможець", ["переможця", "переможців"]]
]) {
  const root = deriveGlossaryRoot(term, language);
  for (const form of variants) assert.ok(glossaryRootPattern(root, term, language)?.test(form), `${language}: ${term} → ${form}`);
}

const campaign = [{ id: 378, terms: { "en-GB": "promotion", az: "kampaniya" } }];
assert.equal(checkGlossary("This promotion", "Bu kampaniyasının", "en", "az", campaign).length, 0);
assert.equal(checkGlossary("These promotions", "Bu kampaniyalar", "en", "az", campaign).length, 0);
assert.equal(checkGlossary("These promotions", "Başqa söz", "en", "az", campaign).length, 1);
assert.equal(checkGlossary("This promotion", "Bu kampaniyax", "en", "az", campaign).length, 1);
const ukrainian = [{ id: 1, terms: { ru: "ставка", uk: "ставка" } }];
assert.equal(checkGlossary("ставки", "ставки", "ru", "uk", ukrainian).length, 0);
assert.equal(checkGlossary("ставки", "інше слово", "ru", "uk", ukrainian).length, 1);

console.log("Glossary root tests passed");

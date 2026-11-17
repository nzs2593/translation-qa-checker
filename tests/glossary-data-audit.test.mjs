import assert from "node:assert/strict";
import { checkGlossary, getGlossaryRows } from "../src/glossary.js";
import { glossaryRootPattern } from "../src/glossary-roots.js";

const rows = getGlossaryRows();
const columns = { "en-GB": "en", az: "az", da: "da", mn: "mn", "pt-BR": "pt-BR",
  ru: "ru", es: "es", "es-AR": "es-AR", uk: "uk", uz: "uz-Latn", uzb: "uz-Cyrl" };
let checkedRoots = 0;
let checkedPairs = 0;
for (const [column, language] of Object.entries(columns)) {
  for (const row of rows) {
    const term = row.terms[column];
    const root = row.roots?.[column];
    if (term && root) {
      assert.ok(glossaryRootPattern(root, term, column)?.test(term), `${column} row ${row.id}: ${term}`);
      checkedRoots++;
    }
    if (column === "en-GB" || !term) continue;
    const from = column === "uk" ? "ru" : "en-GB";
    const source = row.terms[from];
    if (!source) continue;
    assert.deepEqual(checkGlossary(source, term, from === "ru" ? "ru" : "en", language, [row]), [],
      `${column} row ${row.id}: ${source} → ${term}`);
    checkedPairs++;
  }
}
assert.ok(checkedRoots > 3000);
assert.ok(checkedPairs > 4000);
console.log(`Glossary data audit passed: ${checkedRoots} roots, ${checkedPairs} translation pairs`);

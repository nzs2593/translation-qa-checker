import assert from "node:assert/strict";
import { countCharacters, evaluateCharacterLimit, parseCharacterLimitHint } from "../src/extension/character-counter.js";

assert.equal(countCharacters("A B"), 3);
assert.equal(countCharacters("<0>US$9K</0>"), 5);
assert.equal(countCharacters("👨‍👩‍👧‍👦"), 1);
assert.deepEqual(parseCharacterLimitHint("Title (15+15 characters)"), { parts: [15, 15], total: 30 });
assert.deepEqual(parseCharacterLimitHint("Full description (80 characters)"), { parts: [80], total: 80 });
assert.equal(parseCharacterLimitHint("Title"), null);

const rows = [
  { id: "a", sourceRaw: "Winning", targetRaw: "Ganadora" },
  { id: "b", sourceRaw: "deals", targetRaw: "ofertas" }
];
assert.deepEqual(evaluateCharacterLimit(rows, 30), {
  counts: [{ id: "a", source: 7, target: 8 }, { id: "b", source: 5, target: 7 }],
  totalSource: 12, totalTarget: 15, exceeded: [], limit: 30
});
assert.deepEqual(evaluateCharacterLimit(rows, 14).exceeded, [{ index: 0, by: 1 }]);
assert.deepEqual(evaluateCharacterLimit(rows, 7, "each").exceeded, [{ index: 1, by: 1 }]);
assert.deepEqual(evaluateCharacterLimit(rows.slice(0, 1), 7).exceeded, [{ index: 0, by: 1 }]);

console.log("Character counter tests passed");

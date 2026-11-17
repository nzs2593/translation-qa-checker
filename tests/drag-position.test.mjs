import assert from "node:assert/strict";
import { clampTogglePosition, movedEnough } from "../src/extension/drag-position.js";

const size = { width: 128, height: 36 };
const viewport = { width: 800, height: 600 };
assert.deepEqual(clampTogglePosition({ x: 140, y: 300 }, size, viewport), { x: 140, y: 300 });
assert.deepEqual(clampTogglePosition({ x: -50, y: 900 }, size, viewport), { x: 8, y: 556 });
assert.deepEqual(clampTogglePosition({ x: 700, y: 500 }, size, { width: 320, height: 240 }), { x: 184, y: 196 });
assert.equal(movedEnough(3, 3), false);
assert.equal(movedEnough(3, 4), true);
console.log("Drag position tests passed");

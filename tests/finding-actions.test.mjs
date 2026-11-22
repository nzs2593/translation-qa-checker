import assert from "node:assert/strict";
import { findingKey, rawTargetRange } from "../src/extension/finding-actions.js";

assert.deepEqual(rawTargetRange("  Hello world  ", 6, 11), { start: 8, end: 13 });
assert.deepEqual(rawTargetRange("<0>Hello</0> world", 6, 11), { start: 13, end: 18 });
assert.deepEqual(rawTargetRange("ab<1>cd</1>ef", 2, 4), { start: 5, end: 7 });
const issue = { error_type: "NUMBER_MISMATCH", location_in_target: { start: 2, end: 4 } };
assert.equal(findingKey("/editor/1", "42", issue, "abc"), findingKey("/editor/1", "42", issue, "abc"));
assert.notEqual(findingKey("/editor/1", "42", issue, "abc"), findingKey("/editor/1", "42", issue, "abd"));
assert.notEqual(findingKey("/editor/1", "42", issue, "abc"), findingKey("/editor/2", "42", issue, "abc"));
console.log("Finding actions tests passed");

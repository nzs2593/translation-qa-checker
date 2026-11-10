import assert from "node:assert/strict";
import { cleanCrowdinMarkup, editorLanguages } from "../src/extension/crowdin-adapter.js";

assert.deepEqual(editorLanguages("/editor/39/3112/engb-esar/241"), { sourceLanguage: "en", targetLanguage: "es-AR" });
assert.deepEqual(editorLanguages("/editor/39/3112/ru-uk/241"), { sourceLanguage: "ru", targetLanguage: "uk" });
assert.equal(editorLanguages("/project/39/3112"), null);
assert.equal(cleanCrowdinMarkup("Get a <0>$20</0> <1>Free Bet</1>."), "Get a $20 Free Bet.");
assert.equal(cleanCrowdinMarkup("<0>18:00 GMT-3</0>"), "18:00 GMT-3");
console.log("Crowdin adapter tests passed");

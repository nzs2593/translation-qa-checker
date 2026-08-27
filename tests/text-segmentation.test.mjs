import assert from "node:assert/strict";
import { selectPrimaryLanguageBlock } from "../src/text-segmentation.js";

const bilingual = [
  "The Company reserves the right to restrict or close any account if it is established that:",
  "m) there was a failure to provide verification documents within 30 days.",
  "Компания оставляет за собой право ограничить или закрыть счет, если будет установлено, что:",
  "m) Участник не предоставил документы для верификации в течение 30 дней."
].join("\n");

const english = selectPrimaryLanguageBlock(bilingual, "auto");
assert.match(english, /The Company/);
assert.match(english, /within 30 days/);
assert.doesNotMatch(english, /Компания/);
assert.doesNotMatch(english, /Участник/);

console.log("Text segmentation tests passed");

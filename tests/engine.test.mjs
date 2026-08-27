import assert from "node:assert/strict";
import { runRuleEngine } from "../src/engine.js";

const localizedFormatting = runRuleEngine({
  source: "MAILER 26/08. There are 3,125 ways and a 2,048x multiplier,",
  target: "MAILER 26/08. Hay 3.125 formas y un multiplicador de x2.048.",
  sourceLanguage: "en",
  targetLanguage: "es"
});
assert.equal(localizedFormatting.some((issue) => issue.error_type === "NUMBER_MISMATCH"), false);

const mismatch = runRuleEngine({
  source: "The offer is 75%.",
  target: "La oferta es 70%.",
  sourceLanguage: "en",
  targetLanguage: "es"
}).find((issue) => issue.error_type === "NUMBER_MISMATCH");
assert.equal(mismatch.location_in_target.start, 13);
assert.equal(mismatch.location_in_target.end, 15);

const localizedCurrency = runRuleEngine({
  source: "Deposit at least AR$7,500.",
  target: "Deposite al menos AR$7.500.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(localizedCurrency.some((issue) => issue.error_type === "NUMBER_MISMATCH"), false);
assert.equal(localizedCurrency.some((issue) => issue.error_type === "CURRENCY_FORMAT"), false);

const spacing = runRuleEngine({
  source: "The payment is 20%.",
  target: "El pago es 20 %.  ",
  sourceLanguage: "en",
  targetLanguage: "ru"
});
assert.equal(spacing.some((issue) => issue.error_type === "MULTIPLE_SPACES"), true);
assert.equal(spacing.some((issue) => issue.error_type === "PERCENTAGE_FORMAT"), true);

const danishPercent = runRuleEngine({
  source: "The payment is 20%.",
  target: "Betalingen er 20 %.",
  sourceLanguage: "en",
  targetLanguage: "da"
});
assert.equal(danishPercent.some((issue) => issue.error_type === "PERCENTAGE_FORMAT"), false);

const structured = runRuleEngine({
  source: "Header:\nOffer\n\nText:\nDeposit 125 times.",
  target: "Header:\nOferta\n\nText:\nDeposite 5 veces.",
  sourceLanguage: "en",
  targetLanguage: "es"
});
assert.equal(structured.filter((issue) => issue.error_type === "NUMBER_MISMATCH").length, 1);
assert.equal(structured.find((issue) => issue.error_type === "NUMBER_MISMATCH").location_in_target.start > 20, true);

const currencyTypo = runRuleEngine({
  source: "Deposit AR$100.",
  target: "Deposite ARS$100.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(currencyTypo.some((issue) => issue.error_type === "CURRENCY_MISMATCH"), false);
assert.equal(currencyTypo.find((issue) => issue.error_type === "CURRENCY_FORMAT").location_in_target.end > 0, true);

const sourceCurrencyTypo = runRuleEngine({
  source: "Deposit ARS$100.",
  target: "Deposite AR$100.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(sourceCurrencyTypo.some((issue) => issue.error_type === "CURRENCY_MISMATCH"), false);

console.log("Engine tests passed");

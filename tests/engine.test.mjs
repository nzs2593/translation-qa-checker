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

const localizedMoney = runRuleEngine({
  source: "The total prize pool is €25,000,000.",
  target: "El bote total es de AR$37.500.000.000.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(localizedMoney.some((issue) => issue.error_type === "NUMBER_MISMATCH"), false);
assert.equal(localizedMoney.some((issue) => issue.error_type === "CURRENCY_MISMATCH"), true);

const localizedDate = runRuleEngine({
  source: "Runs from 1st July 2026 until 30th June 2027.",
  target: "Disponible entre el 1 de julio de 2026 y el 30 de junio de 2027.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(localizedDate.some((issue) => issue.error_type === "NUMBER_MISMATCH"), false);

const equivalentMinute = runRuleEngine({
  source: "A red card in the 30th minute can change the game.",
  target: "Una tarjeta roja al minuto 30 puede cambiar el partido.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(equivalentMinute.some((issue) => issue.error_type === "NUMBER_MISMATCH"), false);

const equivalentScore = runRuleEngine({
  source: "The score after the first half is 54:41 in favour of the Thunder.",
  target: "El marcador después de la primera mitad es 54-41 a favor de los Thunder.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(equivalentScore.some((issue) => issue.error_type === "NUMBER_MISMATCH"), false);

const paragraphLocalMismatch = runRuleEngine({
  source: "The campaign is live.\n\nAvailable for 30 days from 30/06/2027.",
  target: "La campaña está activa.\n\nDisponible durante 30 días desde el 30/06/20277.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
const paragraphIssue = paragraphLocalMismatch.find((issue) => issue.error_type === "NUMBER_MISMATCH");
assert.ok(paragraphIssue);
assert.ok(paragraphIssue.location_in_target.start > "La campaña está activa.\n\n".length);

const extraNumericToken = runRuleEngine({
  source: "The offer is valid for 30 days.",
  target: "La oferta es válida por 30 2 días.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
}).find((issue) => issue.error_type === "NUMBER_MISMATCH");
assert.equal("La oferta es válida por 30 2 días.".slice(extraNumericToken.location_in_target.start, extraNumericToken.location_in_target.end), "2");

const extraDateDigit = runRuleEngine({
  source: "Available on 30/06/2027.",
  target: "Disponible el 30/06/20277.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
}).find((issue) => issue.error_type === "NUMBER_MISMATCH");
assert.equal("Disponible el 30/06/20277.".slice(extraDateDigit.location_in_target.start, extraDateDigit.location_in_target.end), "30/06/20277");

const joinedNumberWord = runRuleEngine({
  source: "Ahora es el momento de descubrir por qué el básquetbol es emocionante.",
  target: "Ahora es el momento de descubrir por 1que el básquetbol es emocionante.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
}).find((issue) => issue.error_type === "NUMBER_WORD_JOINED");
assert.equal("Ahora es el momento de descubrir por 1que el básquetbol es emocionante.".slice(joinedNumberWord.location_in_target.start, joinedNumberWord.location_in_target.end), "1que");

const decimalMismatch = runRuleEngine({
  source: "The pre-match odds were 3.80.",
  target: "Las cuotas previas fueron 3.10.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
}).find((issue) => issue.error_type === "NUMBER_MISMATCH");
assert.equal("Las cuotas previas fueron 3.10.".slice(decimalMismatch.location_in_target.start, decimalMismatch.location_in_target.end), "3.10");

const mixedPlaceholder = runRuleEngine({
  source: "Deposit AR$Х,ХХХ.",
  target: "Depositá AR$X.ХХХ.",
  sourceLanguage: "en",
  targetLanguage: "es-AR"
});
assert.equal(mixedPlaceholder.some((issue) => issue.error_type === "PLACEHOLDER_MISMATCH"), true);

console.log("Engine tests passed");

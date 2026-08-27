import assert from "node:assert/strict";
import { detectLanguage } from "../src/language-detection.js";

assert.equal(detectLanguage("The payment must be settled by 20:59 GMT.").code, "en");
assert.equal(detectLanguage("Платёж должен быть рассчитан.").code, "ru");
assert.equal(detectLanguage("Платіж має бути зарахований.").code, "uk");
assert.equal(detectLanguage("Ödəniş bu tarixdə edilməlidir.").code, "az");
assert.equal(detectLanguage("O‘yin uchun to‘lov kerak.").code, "uz-Latn");
assert.equal(detectLanguage("Төлбөр 20:59 цагт хийгдэнэ.").code, "mn");
assert.equal(detectLanguage("Hola, gracias.").code, "es");
assert.equal(detectLanguage("Olá, obrigado.").code, "pt-BR");

console.log("Language detection tests passed");

import { LANGUAGE_PROFILES } from "./profiles.js";
import { profileLabel, t } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const GUIDE = {
  en: "English Language Style Guide", ru: "Russian Language Style Guide",
  es: "Spanish Language Style Guide", "es-AR": "Spanish Language Style Guide · Argentina terms",
  "uz-Cyrl": "Uzbek Language Style Guide Cyrillic", "uz-Latn": "Uzbek Language Style Guide Latin",
  uk: "Ukrainian Language Style Guide", mn: "Mongolian Language Style Guide",
  da: "Danish Language Style Guide", "pt-BR": "Brazilian Portuguese Language Style Guide",
  az: "Azerbaijani Language Style Guide"
};
const CURRENCY_EXAMPLES = {
  en: "$100", ru: "100 ₽", es: "100€ · US$20", "es-AR": "AR$100 · US$20",
  "uz-Cyrl": "100 USD", "uz-Latn": "100 USD", uk: "€100 · 100\u00a0UAH",
  mn: "€100 · 100MNT", da: "100 kr. · 100 DKK",
  "pt-BR": "R$\u00a0100 · 100\u00a0BRL", az: "100\u00a0₼"
};
const NOTES = {
  en: { en: "UK English conventions.", ru: "Правила британского английского." },
  ru: { en: "Promotion T&Cs use HH:mm МСК DD.MM.YYYY; grouping starts at five digits.", ru: "В условиях акции: ЧЧ:ММ МСК ДД.ММ.ГГГГ; группы цифр — от пяти знаков." },
  es: { en: "Symbols usually follow the amount; US$/AR$ precede it. ISO codes have separate rules.", ru: "Символ обычно после суммы; US$/AR$ перед ней. Для кодов ISO — отдельные правила." },
  "es-AR": { en: "Distinguish US$ and AR$; do not change the source currency or amount without instruction.", ru: "Различайте US$ и AR$; не меняйте валюту или сумму оригинала без указания." },
  "uz-Cyrl": { en: "24-hour time; numeric dates use dots; five-digit grouping uses NBSP.", ru: "24-часовое время; даты через точку; разряды от пяти цифр — неразрывный пробел." },
  "uz-Latn": { en: "24-hour time; numeric dates use dots; five-digit grouping uses NBSP.", ru: "24-часовое время; даты через точку; разряды от пяти цифр — неразрывный пробел." },
  uk: { en: "UAH uses a non-breaking space after the amount; €, $ and ₽ have no space before the amount.", ru: "UAH после суммы через неразрывный пробел; €, $ и ₽ перед суммой без пробела." },
  mn: { en: "MNT follows the number without a space; $, € and ₽ precede it.", ru: "MNT после числа без пробела; $, € и ₽ перед числом." },
  da: { en: "Dynamic content, markets and odds may retain English decimal conventions.", ru: "В динамическом контенте, рынках и коэффициентах может сохраняться английский формат дробей." },
  "pt-BR": { en: "Use NBSP for R$ and BRL; some odds and score formats have explicit exceptions.", ru: "Для R$ и BRL нужен неразрывный пробел; для коэффициентов и счёта есть исключения." },
  az: { en: "₼ follows the amount with a non-breaking space.", ru: "₼ после суммы через неразрывный пробел." }
};

function exampleDate(profile) {
  const separator = profile.dateSeparator ?? "/";
  return profile.dateOrder === "YMD" ? `2026${separator}03${separator}17` : `17${separator}03${separator}2026`;
}

function quoteExample(style) {
  return style === "guillemets" ? "«…»" : style === "uk-single" ? "‘…’" : style === "double" ? '"…"' : "—";
}

export function initLanguageRulesView({ getLocale }) {
  function refresh() {
    const locale = getLocale();
    for (const [id, key] of [
      ["language-rules-tab", "rulesTab"], ["language-rules-title", "rulesTitle"],
      ["language-rules-intro", "rulesIntro"], ["language-rules-note", "rulesNote"],
      ["rules-language-heading", "rulesLanguage"], ["rules-date-heading", "rulesDate"],
      ["rules-number-heading", "rulesNumber"], ["rules-currency-heading", "rulesCurrency"],
      ["rules-percent-heading", "rulesPercent"], ["rules-quotes-heading", "rulesQuotes"],
      ["rules-notes-heading", "rulesNotes"], ["language-rules-checks-title", "rulesChecksTitle"],
      ["language-rules-checks-copy", "rulesChecksCopy"]
    ]) $(id).textContent = t(locale, key);
    const body = $("language-rules-body"); body.replaceChildren();
    for (const [code, profile] of Object.entries(LANGUAGE_PROFILES)) {
      const row = document.createElement("tr");
      const numberExample = `12${profile.decimal}35 · 12${profile.grouping === "nbsp" ? "\u00a0" : profile.grouping}345`;
      const cells = [
        `${profileLabel(locale, code, profile.label)} (${code})`,
        `${profile.dateFormat}\n${exampleDate(profile)}`,
        numberExample,
        CURRENCY_EXAMPLES[code],
        `25${profile.percentSpace ? " " : ""}%`,
        quoteExample(profile.quoteStyle),
        `${NOTES[code][locale]}\n${GUIDE[code]}`
      ];
      for (const value of cells) {
        const cell = document.createElement("td"); cell.textContent = value; row.append(cell);
      }
      body.append(row);
    }
  }
  refresh();
  return { refresh };
}

export const LANGUAGE_PROFILES = Object.freeze({
  "en": {
    label: "English", dateOrder: "DMY", dateFormat: "DD/MM/YYYY", dateSeparator: "/", decimal: ".", grouping: ",", percentSpace: false,
    quoteStyle: "uk-single", currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null,
    currencyRules: { "MNT": { placement: "suffix", space: " " }, "UAH": { placement: "suffix", space: " " }, "UZS": { placement: "suffix", space: " " }, "BYN": { placement: "suffix", space: " " }, "KR.": { placement: "suffix", space: " " } }
  },
  "ru": {
    label: "Russian", dateOrder: "DMY", dateFormat: "DD.MM.YYYY", dateSeparator: ".", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: "guillemets", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null
  },
  "es": {
    label: "Spanish", dateOrder: "DMY", dateFormat: "DD/MM/YYYY", dateSeparator: "/", decimal: ",", grouping: ".", percentSpace: false,
    quoteStyle: null, currencyPlacement: "suffix", currencySpace: "", defaultTimezone: null,
    currencyRules: { "AR$": { placement: "suffix", space: "" }, "₼": { placement: "suffix", space: "" }, "US$": { placement: "prefix", space: "" }, "USD": { placement: "suffix", space: " " }, "EUR": { placement: "suffix", space: " " } }
  },
  "es-AR": {
    label: "Argentine Spanish", dateOrder: "DMY", dateFormat: "DD/MM/YYYY", dateSeparator: "/", decimal: ",", grouping: ".", percentSpace: false,
    quoteStyle: null, currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null, preferredTimezoneOffsetMinutes: -180,
    currencyRules: { "AR$": { placement: "prefix", space: "" }, "US$": { placement: "prefix", space: "" }, "$": { placement: "prefix", space: "" }, "€": { placement: "prefix", space: "" }, "EUR": { placement: "suffix", space: " " }, "USD": { placement: "prefix", space: " " }, "ARS": { placement: "prefix", space: " " }, "MNT": { placement: "prefix", space: " " }, "UAH": { placement: "prefix", space: " " }, "UZS": { placement: "prefix", space: " " } }
  },
  "uz-Cyrl": {
    label: "Uzbek Cyrillic", dateOrder: "DMY", dateFormat: "DD.MM.YYYY", dateSeparator: ".", decimal: ".", grouping: "nbsp", percentSpace: false,
    quoteStyle: "guillemets", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null,
    currencyRules: { "€": { placement: "suffix", space: "nbsp" }, "$": { placement: "suffix", space: "nbsp" }, "₽": { placement: "suffix", space: "nbsp" } }
  },
  "uz-Latn": {
    label: "Uzbek Latin", dateOrder: "DMY", dateFormat: "DD.MM.YYYY", dateSeparator: ".", decimal: ".", grouping: "nbsp", percentSpace: false,
    quoteStyle: "double", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null,
    currencyRules: { "€": { placement: "suffix", space: "nbsp" }, "$": { placement: "suffix", space: "nbsp" }, "₽": { placement: "suffix", space: "nbsp" } }
  },
  "uk": {
    label: "Ukrainian", dateOrder: "DMY", dateFormat: "DD.MM.YYYY", dateSeparator: ".", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: "guillemets", currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null,
    currencyRules: { "UAH": { placement: "suffix", space: " " } }
  },
  "mn": {
    label: "Mongolian", dateOrder: "YMD", dateFormat: "YYYY/MM/DD", dateSeparator: "/", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: null, currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null,
    currencyRules: { "MNT": { placement: "suffix", space: "" }, "UAH": { placement: "suffix", space: "" }, "UZS": { placement: "suffix", space: "" } }
  },
  "da": {
    label: "Danish", dateOrder: "DMY", dateFormat: "DD/MM/YYYY", dateSeparator: "/", decimal: ",", grouping: ".", percentSpace: true,
    quoteStyle: "double", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null
  },
  "pt-BR": {
    label: "Brazilian Portuguese", dateOrder: "DMY", dateFormat: "DD/MM/YYYY", dateSeparator: "/", decimal: ",", grouping: ".", percentSpace: false,
    quoteStyle: "double", currencyPlacement: "prefix", currencySpace: " ", defaultTimezone: null,
    currencyRules: { "BRL": { placement: "suffix", space: "nbsp" }, "MNT": { placement: "suffix", space: " " }, "UAH": { placement: "suffix", space: " " }, "UZS": { placement: "suffix", space: " " } }
  },
  "az": {
    label: "Azerbaijani", dateOrder: "DMY", dateFormat: "DD.MM.YYYY", dateSeparator: ".", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: "double", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null,
    currencyRules: { "€": { placement: "suffix", space: "nbsp" }, "$": { placement: "suffix", space: "nbsp" }, "₽": { placement: "suffix", space: "nbsp" } }
  }
});

export function getProfile(code) {
  return LANGUAGE_PROFILES[code] ?? LANGUAGE_PROFILES.en;
}

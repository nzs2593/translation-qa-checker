export const LANGUAGE_PROFILES = Object.freeze({
  "en": {
    label: "English", dateOrder: "DMY", decimal: ".", grouping: ",", percentSpace: false,
    quoteStyle: "uk-single", currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null
  },
  "ru": {
    label: "Russian", dateOrder: "DMY", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: "guillemets", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null
  },
  "es": {
    label: "Spanish", dateOrder: "DMY", decimal: ",", grouping: ".", percentSpace: false,
    quoteStyle: null, currencyPlacement: "suffix", currencySpace: "", defaultTimezone: null,
    currencyRules: { "AR$": { placement: "prefix", space: "" }, "$": { placement: "prefix", space: "" } }
  },
  "es-AR": {
    label: "Argentine Spanish", dateOrder: "DMY", decimal: ",", grouping: ".", percentSpace: false,
    quoteStyle: null, currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null,
    currencyRules: { "AR$": { placement: "prefix", space: "" }, "$": { placement: "prefix", space: "" } }
  },
  "uz-Cyrl": {
    label: "Uzbek Cyrillic", dateOrder: "DMY", decimal: ".", grouping: "nbsp", percentSpace: false,
    quoteStyle: "guillemets", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null
  },
  "uz-Latn": {
    label: "Uzbek Latin", dateOrder: "DMY", decimal: ".", grouping: "nbsp", percentSpace: false,
    quoteStyle: "double", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null
  },
  "uk": {
    label: "Ukrainian", dateOrder: "DMY", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: "guillemets", currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null
  },
  "mn": {
    label: "Mongolian", dateOrder: "YMD", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: null, currencyPlacement: "prefix", currencySpace: "", defaultTimezone: null
  },
  "da": {
    label: "Danish", dateOrder: "DMY", decimal: ",", grouping: ".", percentSpace: true,
    quoteStyle: "double", currencyPlacement: "suffix", currencySpace: " ", defaultTimezone: null
  },
  "pt-BR": {
    label: "Brazilian Portuguese", dateOrder: "DMY", decimal: ",", grouping: ".", percentSpace: false,
    quoteStyle: "double", currencyPlacement: "prefix", currencySpace: "nbsp", defaultTimezone: null
  },
  "az": {
    label: "Azerbaijani", dateOrder: "DMY", decimal: ",", grouping: "nbsp", percentSpace: false,
    quoteStyle: "double", currencyPlacement: "suffix", currencySpace: "nbsp", defaultTimezone: null
  }
});

export function getProfile(code) {
  return LANGUAGE_PROFILES[code] ?? LANGUAGE_PROFILES.en;
}

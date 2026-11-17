// Conservative inflection patterns for target-language glossary terms. A root
// is only generated for lowercase words; names, abbreviations and codes stay exact.
const SUFFIXES = Object.freeze({
  "en-GB": ["s", "es"],
  az: ["ı", "i", "u", "ü", "ın", "in", "un", "ün", "a", "ə", "da", "də", "dan", "dən", "la", "lə", "lı", "li", "lu", "lü", "lar", "lər", "ları", "ləri", "nın", "nin", "nun", "nün", "sı", "si", "su", "sü", "ya", "yə", "nda", "ndə", "ndan", "ndən"],
  da: ["s", "e", "er", "en", "et", "ene", "erne", "ens", "ets"],
  mn: ["ын", "ийн", "ы", "ий", "д", "т", "аар", "ээр", "аас", "ээс", "ууд", "үүд", "уудын", "үүдийн"],
  "pt-BR": ["s", "es"],
  ru: ["а", "я", "ы", "и", "е", "у", "ю", "ой", "ей", "ом", "ем", "ов", "ев", "ам", "ям", "ах", "ях", "ами", "ями", "ого", "ему", "ыми", "ими", "ый", "ий", "ая", "ое", "ые", "ых", "ую", "ть", "ет", "ют", "ут", "ла", "ли"],
  es: ["s", "es"],
  "es-AR": ["s", "es"],
  uk: ["а", "я", "и", "і", "е", "у", "ю", "ою", "ею", "ом", "ем", "ів", "ам", "ям", "ах", "ях", "ами", "ями", "ого", "ому", "ими", "ий", "ій", "ої", "ою", "іше", "ти", "є", "ють"],
  uz: ["lar", "ning", "ga", "da", "dan", "ni", "larining", "larga", "larda", "lardan", "si", "i", "li", "siz"],
  uzb: ["лар", "нинг", "га", "да", "дан", "ни", "ларнинг", "ларга", "ларда", "лардан", "си", "и", "ли", "сиз"]
});

const LOWERCASE_PHRASE = /^[\p{Ll}]+(?:[ \u00a0-][\p{Ll}]+){0,2}$/u;
const ROOT_PHRASE = /^[\p{L}]+(?:[ \u00a0-][\p{L}]+){0,3}$/u;
const CYRILLIC_ENDING = /[аяоеыийьії]$/u;

export const CURATED_GLOSSARY_ROOTS = Object.freeze({
  279: { az: "Loyallıq proqram" },
  318: { az: "say" },
  356: { az: "yer" },
  461: { az: "Şərtlər və Qaydalar" }
});

export function deriveGlossaryRoot(term, language) {
  if (!SUFFIXES[language] || !LOWERCASE_PHRASE.test(String(term ?? ""))) return "";
  const words = term.split(/[ \u00a0-]/u);
  const last = words.at(-1);
  if (last.length < (words.length > 1 ? 4 : 5)) return "";
  if ((language === "ru" || language === "uk") && last.length >= 6 && CYRILLIC_ENDING.test(last)) {
    words[words.length - 1] = last.slice(0, -1);
  }
  return term.slice(0, term.length - last.length) + words.at(-1);
}

export function glossaryRootPattern(root, term, language, matchCase = false) {
  if (!root || !SUFFIXES[language] || !ROOT_PHRASE.test(root) || root.split(/[ \u00a0-]/u).at(-1).length < 3) return null;
  const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[ \u00a0]+/g, "\\s+");
  const suffixes = [...SUFFIXES[language]].sort((a, b) => b.length - a.length).join("|");
  const maxSuffixes = ["az", "mn", "uz", "uzb"].includes(language) ? 3 : 1;
  const continuation = root === term ? `(?:${suffixes}){0,${maxSuffixes}}` : `(?:${suffixes}){1,${maxSuffixes}}`;
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}${continuation}(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
}

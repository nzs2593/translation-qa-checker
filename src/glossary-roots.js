// Conservative inflection patterns for target-language glossary terms. A root
// is only generated for lowercase words; names, abbreviations and codes stay exact.
const SUFFIXES = Object.freeze({
  "en-GB": ["s", "es"],
  az: ["ı", "i", "u", "ü", "ın", "in", "un", "ün", "a", "ə", "da", "də", "dan", "dən", "la", "lə", "lı", "li", "lu", "lü", "lar", "lər", "ları", "ləri", "nın", "nin", "nun", "nün", "sı", "si", "su", "sü", "ya", "yə", "nda", "ndə", "ndan", "ndən"],
  da: ["s", "e", "er", "en", "et", "ene", "erne", "ens", "ets"],
  mn: ["ын", "ийн", "ы", "ий", "д", "т", "аар", "ээр", "аас", "ээс", "ууд", "үүд", "уудын", "үүдийн"],
  "pt-BR": ["s", "es"],
  ru: ["а", "я", "ы", "и", "е", "у", "ю", "о", "й", "ь", "ью", "ок", "ой", "ей", "ом", "ем", "ов", "ев", "ам", "ям", "ах", "ях", "ами", "ями", "ого", "ому", "ему", "ыми", "ими", "ым", "им", "ый", "ий", "ая", "яя", "ое", "ее", "ые", "ие", "ых", "их", "ую", "юю", "ть", "ет", "ют", "ут", "ла", "ли"],
  es: ["s", "es"],
  "es-AR": ["s", "es"],
  uk: ["а", "я", "и", "і", "ї", "е", "о", "у", "ю", "й", "ь", "ець", "ця", "цю", "цем", "ців", "цям", "цями", "цях", "ою", "ею", "ом", "ем", "ів", "ам", "ям", "ах", "ях", "ами", "ями", "ого", "ому", "им", "их", "ими", "ий", "ій", "ої", "іше", "ти", "є", "ють"],
  uz: ["lar", "ning", "ga", "da", "dan", "ni", "larining", "larga", "larda", "lardan", "si", "i", "li", "siz"],
  uzb: ["лар", "нинг", "га", "да", "дан", "ни", "ларнинг", "ларга", "ларда", "лардан", "си", "и", "ли", "сиз"]
});

const LOWERCASE_PHRASE = /^[\p{Ll}]+(?:[ \u00a0-][\p{Ll}]+){0,3}$/u;
const ROOT_PHRASE = /^[\p{L}]+(?:[ \u00a0-][\p{L}]+){0,3}$/u;
const CYRILLIC_ENDING = /[аяоеыийьії]$/u;

export const CURATED_GLOSSARY_ROOTS = Object.freeze({
  6: { ru: "Страховк на экспресс" },
  7: { ru: "учетн запис" },
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
  if (language === "ru" || language === "uk") {
    return term.split(/([ \u00a0-]+)/u).map((word) => {
      if (word.length < 5 || !/^[\p{Ll}]+$/u.test(word)) return word;
      const ending = language === "uk" && word.endsWith("ець") ? 3
        : language === "ru" && /(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/u.test(word) ? 2
          : language === "uk" && /(?:ий|ій)$/u.test(word) ? 2
            : CYRILLIC_ENDING.test(word) || /[ьо]$/u.test(word) ? 1 : 0;
      return ending ? word.slice(0, -ending) : word;
    }).join("");
  }
  return term;
}

export function glossaryRootPattern(root, term, language, matchCase = false) {
  if (!root || !SUFFIXES[language] || !ROOT_PHRASE.test(root) || root.split(/[ \u00a0-]/u).at(-1).length < 3) return null;
  const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[ \u00a0]+/g, "\\s+");
  const suffixes = [...SUFFIXES[language]].sort((a, b) => b.length - a.length).join("|");
  if (["en-GB", "es", "es-AR", "pt-BR"].includes(language) && root === term) {
    const words = root.split(/\s+/u);
    const terms = term.split(/\s+/u);
    if (words.length === terms.length) {
      const pieces = words.map((word) => {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (word.length < 4 || /s$/iu.test(word)) return escapedWord;
        if (language === "en-GB" && /[^aeiou]y$/iu.test(word)) return `${escapedWord}|${escapedWord.slice(0, -1)}ies`;
        if ((language === "es" || language === "es-AR") && /z$/iu.test(word)) return `${escapedWord}|${escapedWord.slice(0, -1)}ces`;
        if (language === "pt-BR" && /m$/iu.test(word)) return `${escapedWord}|${escapedWord.slice(0, -1)}ns`;
        const ending = language === "en-GB" ? /(?:s|x|ch|sh)$/iu.test(word) ? "es" : "s"
          : /[aeiouáéíóúãõ]$/iu.test(word) ? "s" : "es";
        return `${escapedWord}(?:${ending})?`;
      });
      return new RegExp(`(?<![\\p{L}\\p{N}])(?:${pieces.map((piece) => `(?:${piece})`).join("\\s+")})(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
    }
  }
  if (["ru", "uk"].includes(language) && /[ \u00a0-]/u.test(root)) {
    const roots = root.split(/([ \u00a0-]+)/u);
    const terms = term.split(/([ \u00a0-]+)/u);
    if (roots.length === terms.length) {
      const escapeWord = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(language === "ru" ? /е/gu : /\uFFFF/gu, "[её]");
      const words = roots.map((word, index) => index % 2
        ? (word.includes("-") ? "-" : "\\s+")
        : word.length < 4 && word === terms[index] ? escapeWord(word)
          : `${escapeWord(word)}(?:${suffixes}){${word === terms[index] ? 0 : 1},1}`);
      return new RegExp(`(?<![\\p{L}\\p{N}])${words.join("")}(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
    }
  }
  const maxSuffixes = ["az", "mn", "uz", "uzb"].includes(language) ? 3 : 1;
  const continuation = root === term ? `(?:${suffixes}){0,${maxSuffixes}}` : `(?:${suffixes}){1,${maxSuffixes}}`;
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}${continuation}(?![\\p{L}\\p{N}])`, matchCase ? "gu" : "giu");
}

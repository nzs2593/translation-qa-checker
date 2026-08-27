import { LANGUAGE_PROFILES } from "./profiles.js";

const WORDS = {
  en: ["the", "and", "this", "with", "payment", "must", "your"],
  es: ["el", "la", "los", "las", "que", "para", "con", "pago", "hola", "gracias"],
  "pt-BR": ["o", "a", "os", "as", "que", "para", "com", "pagamento", "olá", "obrigado"],
  da: ["og", "det", "den", "til", "med", "ikke", "betaling", "hej", "tak"],
  az: ["və", "bu", "üçün", "ilə", "olan", "ödəniş", "salam", "təşəkkür"],
  "uz-Latn": ["va", "bu", "uchun", "bilan", "to'lov", "to‘lov", "salom", "rahmat"],
  ru: ["и", "это", "для", "с", "платёж", "оплата", "должен"],
  uk: ["і", "це", "для", "з", "платіж", "оплата", "повинен"],
  "uz-Cyrl": ["ва", "бу", "учун", "билан", "тўлов", "керак"],
  mn: ["ба", "энэ", "нь", "болон", "төлбөр", "ёстой", "сайн"]
};

const SPECIALS = {
  uk: /[іїєґ]/giu,
  ru: /[ёыэъ]/giu,
  "uz-Cyrl": /[қғўҳ]/giu,
  mn: /[өү]/giu,
  es: /[ñ¿¡]/giu,
  "pt-BR": /[ãõç]/giu,
  da: /[æøå]/giu,
  az: /[əğıöşü]/giu,
  "uz-Latn": /(?:[oOgG][ʻʼ‘’])/gu
};

function countMatches(text, pattern) {
  return text.match(pattern)?.length ?? 0;
}

function wordPattern(word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s|[,.!?])${escaped}(?:$|\\s|[,.!?])`, "iu");
}

export function detectLanguage(text) {
  const normalized = text.trim().toLocaleLowerCase();
  if (!normalized) return { code: "en", label: LANGUAGE_PROFILES.en.label, confidence: 0, reason: "No text" };
  const scores = Object.fromEntries(Object.keys(LANGUAGE_PROFILES).map((code) => [code, 0]));

  for (const [code, pattern] of Object.entries(SPECIALS)) scores[code] += countMatches(normalized, pattern) * 4;
  for (const [code, words] of Object.entries(WORDS)) {
    for (const word of words) if (wordPattern(word).test(normalized)) scores[code] += 2;
  }
  if (/[а-яё]/iu.test(normalized)) {
    scores.ru += 1; scores.uk += 1; scores["uz-Cyrl"] += 1; scores.mn += 1;
  }
  if (/[a-z]/iu.test(normalized)) {
    scores.en += 1; scores.es += 1; scores["pt-BR"] += 1; scores.da += 1; scores.az += 1; scores["uz-Latn"] += 1;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [code, score] = ranked[0];
  const secondScore = ranked[1]?.[1] ?? 0;
  const confidence = score === 0 ? 0 : Math.min(0.99, Math.max(0.45, 0.55 + (score - secondScore) * 0.08));
  return { code, label: LANGUAGE_PROFILES[code].label, confidence, reason: score > secondScore ? "Script and lexical markers" : "Low-signal heuristic" };
}

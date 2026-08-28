import { detectLanguage } from "./language-detection.js";

function scriptFamily(text) {
  if (/[а-яёіїєґқғўҳөү]/iu.test(text)) return "cyrillic";
  if (/[a-zа-яёіїєґқғўҳөү]/iu.test(text)) return "latin";
  return "neutral";
}

export function selectPrimaryLanguageBlock(text, preferredCode = "auto") {
  const separator = /\r?\n(?:[ \t]*\r?\n)+/;
  const paragraphs = (separator.test(text) ? text.split(separator) : text.split(/\r?\n/)).map((paragraph) => paragraph.trim()).filter(Boolean);
  if (paragraphs.length < 2) return text;

  const signals = paragraphs.map((paragraph) => detectLanguage(paragraph));
  const strongCodes = new Set(signals.filter((signal, index) => paragraphs[index].length >= 28 && signal.confidence >= 0.7).map((signal) => signal.code));
  if (strongCodes.size < 2 && preferredCode === "auto") return text;

  const primaryIndex = signals.findIndex((signal, index) => paragraphs[index].length >= 28 && signal.confidence >= 0.7 && (preferredCode === "auto" || signal.code === preferredCode));
  const primaryCode = preferredCode !== "auto" ? preferredCode : signals[primaryIndex]?.code;
  if (!primaryCode || (preferredCode !== "auto" && !strongCodes.has(primaryCode))) return text;

  const primaryScript = scriptFamily(paragraphs[primaryIndex >= 0 ? primaryIndex : 0]);
  return paragraphs.filter((paragraph, index) => scriptFamily(paragraph) === primaryScript || signals[index].confidence < 0.7).join("\n\n");
}

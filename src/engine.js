import { checkDatesAndTime } from "./dates-time.js?v=1.3";
import { createIssue, location } from "./domain.js?v=1.1";
import { getProfile } from "./profiles.js";
import { pairHeaderBlocks, pairLabeledSegments } from "./segments.js?v=1.1";

const NUMBER_RE = /(?<![\w.,])(?:\d{1,3}(?:[.,\u00a0 ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(?![\w]|[.,](?=\d))/g;
const PLACEHOLDER_RE = /\{[^{}]+\}|%\w+|\$\{[^}]+\}/g;
const MASKED_PLACEHOLDER_RE = /(?:(?:AR|ARS)\$)?[XХ](?:[.,][XХ]{3})+/gu;
const DATE_WORDS = "january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря";
const DAY = "(?:0?[1-9]|[12]\\d|3[01])";
const MONTH = "(?:0?[1-9]|1[0-2])";
const TEMPORAL_TOKEN_RE = new RegExp(`\\b\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}\\b|\\b${DAY}[/]${MONTH}(?:[/]\\d{2,4})?\\b|\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:(?:the|of|de)\\s+)?(?:${DATE_WORDS})(?:\\s+(?:de|of))?(?:\\s+\\d{4})?\\b|\\b(?:\\d{1,3}(?:st|nd|rd|th)?\\s+(?:minute|minutes)|(?:minute|minuto|minutos)\\s+\\d{1,3})\\b|\\b\\d{1,2}:\\d{2}(?::\\d{2})?\\s*(?:AM|PM)?\\s*(?:(?:(?:GMT|UTC)\\s*[+-]?\\s*\\d{0,2}(?::?\\d{2})?))?`, "giu");
const SCORE_RE = /\b\d{1,3}\s*[-:]\s*\d{1,3}\b/g;
const MALFORMED_DATE_RE = /\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{5,}|\d{4}[-/.]\d{1,2}[-/.]\d{3,})\b/g;
const DATE_SHAPE_RE = /\b\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/g;
const ATTACHED_NUMBER_WORD_RE = /(?:\b\d+(?:[.,]\d+)?[\p{Ll}][\p{L}]*\b|\b[\p{Ll}][\p{L}]*\d+(?:[.,]\d+)?\b)/gu;
const CURRENCY_RE = /ARS\$|AR\$|US\$|R\$|[€$£₽₮₼]|(?<![\w])(USD|EUR|GBP|RUB|UAH|KZT|MNT|AZN|UZS|BRL)(?![\w])/gi;

function compareTokens(source, target, regex, issue) {
  const sourceTokens = [...source.matchAll(regex)].map((m) => m[0]);
  const targetTokens = [...target.matchAll(regex)].map((m) => m[0]);
  if (sourceTokens.join("|") === targetTokens.join("|")) return [];
  const sourceMatch = source.matchAll(regex).next().value;
  const targetMatch = target.matchAll(regex).next().value;
  return [createIssue({ ...issue, location_in_source: sourceMatch ? location(sourceMatch.index, sourceMatch.index + sourceMatch[0].length) : location(0, 0), location_in_target: targetMatch ? location(targetMatch.index, targetMatch.index + targetMatch[0].length) : location(0, 0) })];
}

function canonicalNumber(value) {
  const [integer, fraction] = value.split(".");
  const normalizedInteger = integer.replace(/^0+(?=\d)/, "");
  const normalizedFraction = fraction?.replace(/0+$/, "");
  return normalizedFraction ? `${normalizedInteger}.${normalizedFraction}` : normalizedInteger;
}

function normalizeNumber(token, profile) {
  const value = token.replace(/[\s\u00a0]/g, "");
  const decimalSeparator = profile.decimal ?? ".";
  const alternateSeparator = decimalSeparator === "." ? "," : ".";
  const hasDecimal = value.includes(decimalSeparator);
  const hasAlternate = value.includes(alternateSeparator);
  if (hasDecimal && hasAlternate) {
    const lastSeparator = Math.max(value.lastIndexOf(decimalSeparator), value.lastIndexOf(alternateSeparator));
    return canonicalNumber(`${value.slice(0, lastSeparator).replace(/[.,]/g, "")}.${value.slice(lastSeparator + 1)}`);
  }
  if (hasAlternate) {
    const parts = value.split(alternateSeparator);
    const isGrouped = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
    if (isGrouped) return canonicalNumber(parts.join(""));
    const [integer, fraction] = parts;
    return canonicalNumber(`${integer}.${fraction}`);
  }
  return canonicalNumber(hasDecimal ? value.replace(decimalSeparator, ".") : value);
}

function numberTokens(text, profile) {
  const masked = text
    .replace(TEMPORAL_TOKEN_RE, (token) => " ".repeat(token.length))
    .replace(SCORE_RE, (token) => " ".repeat(token.length));
  return [...masked.matchAll(NUMBER_RE)].map((match) => ({
    raw: match[0], normalized: normalizeNumber(match[0], profile), index: match.index ?? 0
  })).filter((token) => {
    const before = text.slice(Math.max(0, token.index - 12), token.index).toLowerCase();
    return !/(?:\bdel|\bon the|\bthe)\s*$/.test(before);
  });
}

function shouldCompareTerminalPunctuation(source, target) {
  const sourceText = source.trim();
  const targetText = target.trim();
  const sourceTerminal = sourceText.match(/[.!?]$/)?.[0] ?? "";
  const targetTerminal = targetText.match(/[.!?]$/)?.[0] ?? "";
  if (Boolean(sourceTerminal) === Boolean(targetTerminal)) return false;

  // Short headings and FAQ labels are not sentence-level punctuation pairs.
  const headingLike = sourceText.length < 90 && targetText.length < 120 &&
    !/[.!?,;]/.test(sourceText.slice(0, -1)) && !/[.!?,;]/.test(targetText.slice(0, -1));
  if (headingLike) return false;

  // List entries commonly use a semicolon in the target while the source
  // uses a full stop. This is formatting, not a translation defect.
  if (sourceTerminal === "." && targetText.endsWith(";") && /^[a-záéíóúüñ]/u.test(sourceText) && /^[a-záéíóúüñ]/u.test(targetText)) return false;
  return true;
}

function spanishQuestionMarkChecks(target) {
  const issues = [];
  for (const match of target.matchAll(/\?/g)) {
    const sentenceStart = Math.max(target.lastIndexOf(".", match.index - 1), target.lastIndexOf("!", match.index - 1), target.lastIndexOf("?", match.index - 1), target.lastIndexOf("\\n", match.index - 1)) + 1;
    if (!target.slice(sentenceStart, match.index + 1).includes("¿")) {
      issues.push(createIssue({
        error_type: "SPANISH_QUESTION_MARKS", pool: "Punctuation", severity: "Minor",
        location_in_target: location(match.index, match.index + 1),
        explanation: "In Spanish, a question should open with ¿ and close with ?."
      }));
    }
  }
  for (const match of target.matchAll(/¿/g)) {
    const nextBoundary = target.slice(match.index + 1).search(/[.!?\\n]/);
    const end = nextBoundary < 0 ? target.length : match.index + 1 + nextBoundary;
    if (!target.slice(match.index + 1, end + 1).includes("?")) {
      issues.push(createIssue({
        error_type: "SPANISH_QUESTION_MARKS", pool: "Punctuation", severity: "Minor",
        location_in_target: location(match.index, match.index + 1),
        explanation: "In Spanish, a question should open with ¿ and close with ?."
      }));
    }
  }
  return issues;
}

function currencyForNumber(text, token) {
  for (const currency of text.matchAll(CURRENCY_RE)) {
    const start = currency.index ?? 0;
    const end = start + currency[0].length;
    const touches = (token.index >= end && /^[ \t\u00a0]*$/.test(text.slice(end, token.index))) ||
      (token.index + token.raw.length <= start && /^[ \t\u00a0]*$/.test(text.slice(token.index + token.raw.length, start)));
    if (touches) return canonicalCurrency(currency[0]);
  }
  return null;
}

function compareNumbersOutsideTemporalText(source, target, sourceProfile, targetProfile, compareCount = true) {
  MALFORMED_DATE_RE.lastIndex = 0;
  const malformedDate = MALFORMED_DATE_RE.exec(target);
  if (malformedDate) {
    DATE_SHAPE_RE.lastIndex = 0;
    const sourceDate = DATE_SHAPE_RE.exec(source);
    return [createIssue({
      error_type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major",
      location_in_source: sourceDate ? location(sourceDate.index, sourceDate.index + sourceDate[0].length) : location(0, 0),
      location_in_target: location(malformedDate.index, malformedDate.index + malformedDate[0].length),
      explanation: "A numeric date token contains an extra or malformed digit."
    })];
  }
  const sourceTokens = numberTokens(source, sourceProfile).map((token) => ({ ...token, currency: currencyForNumber(source, token) }));
  const targetTokens = numberTokens(target, targetProfile).map((token) => ({ ...token, currency: currencyForNumber(target, token) }));
  if (!compareCount && sourceTokens.length !== targetTokens.length) return [];
  const comparable = sourceTokens.map((sourceToken, index) => [sourceToken, targetTokens[index]])
    .filter(([sourceToken, targetToken]) => !(sourceToken?.currency && targetToken?.currency && sourceToken.currency !== targetToken.currency));
  const same = sourceTokens.length === targetTokens.length && comparable.every(([sourceToken, targetToken]) => sourceToken.normalized === targetToken?.normalized);
  if (same) return [];
  const mismatch = comparable.find(([sourceToken, targetToken]) => sourceToken.normalized !== targetToken?.normalized);
  let sourceToken = mismatch?.[0];
  let targetToken = mismatch?.[1];
  if (!mismatch && sourceTokens.length !== targetTokens.length) {
    const commonLength = Math.min(sourceTokens.length, targetTokens.length);
    const firstDifferent = Array.from({ length: commonLength }, (_, index) => index)
      .find((index) => sourceTokens[index].normalized !== targetTokens[index].normalized);
    const index = firstDifferent ?? commonLength;
    sourceToken = sourceTokens[index];
    targetToken = targetTokens[index];
  }
  sourceToken ??= sourceTokens[0];
  targetToken ??= targetTokens[0];
  return [createIssue({ error_type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", location_in_source: sourceToken ? location(sourceToken.index, sourceToken.index + sourceToken.raw.length) : location(0, 0), location_in_target: targetToken ? location(targetToken.index, targetToken.index + targetToken.raw.length) : location(0, 0), explanation: "Numeric values outside dates and times differ between source and target." })];
}

function compareAttachedNumberWords(source, target) {
  ATTACHED_NUMBER_WORD_RE.lastIndex = 0;
  const targetMatch = ATTACHED_NUMBER_WORD_RE.exec(target);
  if (!targetMatch) return [];
  ATTACHED_NUMBER_WORD_RE.lastIndex = 0;
  const sourceTokens = [...source.matchAll(ATTACHED_NUMBER_WORD_RE)].map((match) => match[0].toLowerCase());
  if (sourceTokens.includes(targetMatch[0].toLowerCase())) return [];
  return [createIssue({
    error_type: "NUMBER_WORD_JOINED", pool: "Numbers", severity: "Minor",
    location_in_source: location(0, 0),
    location_in_target: location(targetMatch.index, targetMatch.index + targetMatch[0].length),
    explanation: "A number is attached to a word; check whether a space or a missing letter is required."
  })];
}

function maskedPlaceholderTokens(text) {
  return [...text.matchAll(MASKED_PLACEHOLDER_RE)].map((match) => ({
    raw: match[0], index: match.index ?? 0,
    shape: match[0].replace(/[XХ]/gu, "X").replace(/[.,]/g, "")
  }));
}

function compareMaskedPlaceholders(source, target) {
  const sourceTokens = maskedPlaceholderTokens(source);
  const targetTokens = maskedPlaceholderTokens(target);
  for (const [index, targetToken] of targetTokens.entries()) {
    if (!/[XХ]/u.test(targetToken.raw) || !/[X]/u.test(targetToken.raw) || !/[Х]/u.test(targetToken.raw)) continue;
    const sourceToken = sourceTokens[index];
    return [createIssue({
      error_type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major",
      location_in_source: sourceToken ? location(sourceToken.index, sourceToken.index + sourceToken.raw.length) : location(0, 0),
      location_in_target: location(targetToken.index, targetToken.index + targetToken.raw.length),
      explanation: "A placeholder mixes Latin and Cyrillic characters in the target."
    })];
  }
  return [];
}

function offsetIssues(issues, targetOffset, sourceOffset = 0) {
  return issues.map((issue) => ({
    ...issue,
    location_in_source: issue.location_in_source ? location(issue.location_in_source.start + sourceOffset, issue.location_in_source.end + sourceOffset) : issue.location_in_source,
    location_in_target: location(issue.location_in_target.start + targetOffset, issue.location_in_target.end + targetOffset)
  }));
}

function splitParagraphs(text) {
  const paragraphs = [];
  const separator = /\r?\n(?:[ \t]*\r?\n)+/g;
  let start = 0;
  for (const match of text.matchAll(separator)) {
    const raw = text.slice(start, match.index);
    const leading = raw.search(/\S/);
    if (leading >= 0) paragraphs.push({ text: raw.trim(), start: start + leading });
    start = (match.index ?? 0) + match[0].length;
  }
  const raw = text.slice(start);
  const leading = raw.search(/\S/);
  if (leading >= 0) paragraphs.push({ text: raw.trim(), start: start + leading });
  return paragraphs;
}

function pairPlainParagraphs(source, target) {
  const sourceParagraphs = splitParagraphs(source);
  const targetParagraphs = splitParagraphs(target);
  if (sourceParagraphs.length < 2 || sourceParagraphs.length !== targetParagraphs.length) return [];
  return sourceParagraphs.map((sourceParagraph, index) => ({ source: sourceParagraph, target: targetParagraphs[index] }));
}

function pairPlainLines(source, target) {
  const sourceLines = source.split(/\r?\n/);
  const targetLines = target.split(/\r?\n/);
  if (sourceLines.length < 8 || sourceLines.length !== targetLines.length) return [];
  let sourceOffset = 0;
  let targetOffset = 0;
  const sourceNewlineLength = source.includes("\r\n") ? 2 : 1;
  const targetNewlineLength = target.includes("\r\n") ? 2 : 1;
  const pairs = sourceLines.map((sourceLine, index) => {
    const targetLine = targetLines[index];
    const pair = { source: { text: sourceLine, start: sourceOffset }, target: { text: targetLine, start: targetOffset } };
    sourceOffset += sourceLine.length + sourceNewlineLength;
    targetOffset += targetLine.length + targetNewlineLength;
    return pair;
  });
  return pairs.some((pair) => pair.source.text.trim() && pair.target.text.trim()) ? pairs : [];
}

function coreChecks(source, target, sourceProfile, targetProfile, includePunctuation = true, compareCount = true) {
  const issues = [];
  issues.push(...checkDatesAndTime(source, target, { sourceProfile, targetProfile }));
  issues.push(...compareNumbersOutsideTemporalText(source, target, sourceProfile, targetProfile, compareCount));
  issues.push(...compareAttachedNumberWords(source, target));
  const spanishQuestionIssues = targetProfile.language === "es" ? spanishQuestionMarkChecks(target) : [];
  issues.push(...spanishQuestionIssues);
  issues.push(...compareTokens(source, target, PLACEHOLDER_RE, { error_type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", explanation: "A placeholder is missing or changed in the target." }));
  issues.push(...compareMaskedPlaceholders(source, target));
  if (includePunctuation && shouldCompareTerminalPunctuation(source, target) && !spanishQuestionIssues.length) {
    issues.push(createIssue({ error_type: "PUNCTUATION_MISMATCH", pool: "Punctuation", severity: "Minor", location_in_source: location(Math.max(source.trim().length - 1, 0), source.trim().length), location_in_target: location(Math.max(target.length - 1, 0), target.length), explanation: "Terminal punctuation differs between source and target." }));
  }
  return issues;
}

function addSpacingChecks(target, targetProfile, issues) {
  const multiple = target.match(/ {2,}/);
  if (multiple) issues.push(createIssue({ error_type: "MULTIPLE_SPACES", pool: "Spacing", severity: "Minor", location_in_target: location(multiple.index, multiple.index + multiple[0].length), explanation: "Target contains consecutive spaces." }));
  const trailing = target.match(/[ \t]+(?=\r?\n|$)/);
  if (trailing) issues.push(createIssue({ error_type: "TRAILING_SPACE", pool: "Spacing", severity: "Minor", location_in_target: location(trailing.index, trailing.index + trailing[0].length), explanation: "Target contains a space at the end of a line." }));
  const beforePunctuation = target.match(/[ \t]+[,.!?;:]/);
  if (beforePunctuation) issues.push(createIssue({ error_type: "SPACE_BEFORE_PUNCTUATION", pool: "Spacing", severity: "Minor", location_in_target: location(beforePunctuation.index, beforePunctuation.index + beforePunctuation[0].length), explanation: "There is an unnecessary space before punctuation." }));
  if (targetProfile.grouping === "nbsp") {
    const regularGrouped = target.match(/\d \d{3}(?: \d{3})*/);
    if (regularGrouped) issues.push(createIssue({ error_type: "NON_BREAKING_SPACE", pool: "Spacing", severity: "Minor", location_in_target: location(regularGrouped.index, regularGrouped.index + regularGrouped[0].length), explanation: "Digit groups should use a non-breaking space in this language profile." }));
  }
}

function addNumberFormatChecks(target, targetProfile, issues) {
  for (const token of numberTokens(target, targetProfile)) {
    const separators = [...token.raw.matchAll(/[.,\u00a0 ](?=\d{3}(?:[.,\u00a0 ]|$))/g)].map((match) => match[0]);
    if (separators.length < 2) continue;
    const expected = targetProfile.grouping === "nbsp" ? "\u00a0" : targetProfile.grouping;
    if (separators.some((separator) => separator !== expected && !(expected === " " && separator === "\u00a0"))) {
      issues.push(createIssue({ error_type: "NUMBER_FORMAT", pool: "Numbers", severity: "Minor", location_in_target: location(token.index, token.index + token.raw.length), explanation: `Digit groups should use ${targetProfile.grouping === "nbsp" ? "non-breaking spaces" : `“${targetProfile.grouping}”`} in this language profile.` }));
      break;
    }
  }
}

function addPercentageChecks(target, targetProfile, issues) {
  const match = target.match(/\d(?:[\d.,\u00a0 ]*)[ \t]*%/);
  if (!match) return;
  const percentIndex = match[0].lastIndexOf("%");
  const actualSpace = match[0].slice(0, percentIndex).match(/[ \t]+$/)?.[0] ?? "";
  const expectedSpace = targetProfile.percentSpace ? " " : "";
  if (actualSpace !== expectedSpace) issues.push(createIssue({ error_type: "PERCENTAGE_FORMAT", pool: "Percentage", severity: "Minor", location_in_target: location(match.index, match.index + match[0].length), explanation: `The percentage sign should be placed ${targetProfile.percentSpace ? "after a space" : "without a space"}.` }));
}

function currencyRule(profile, marker) {
  return profile.currencyRules?.[marker.toUpperCase()] ?? { placement: profile.currencyPlacement, space: profile.currencySpace };
}

function canonicalCurrency(marker) {
  return marker.toUpperCase() === "ARS$" ? "AR$" : marker.toUpperCase();
}

function addCurrencyChecks(target, targetProfile, issues) {
  const numbers = numberTokens(target, targetProfile);
  for (const currency of target.matchAll(CURRENCY_RE)) {
    if (currency[0] === "$" && target[currency.index - 1] === "{") continue;
    const currencyStart = currency.index ?? 0;
    const currencyEnd = currencyStart + currency[0].length;
    const adjacent = numbers.find((number) =>
      (number.index >= currencyEnd && /^[ \t\u00a0]*$/.test(target.slice(currencyEnd, number.index))) ||
      (number.index + number.raw.length <= currencyStart && /^[ \t\u00a0]*$/.test(target.slice(number.index + number.raw.length, currencyStart)))
    );
    if (!adjacent) continue;
    if (currency[0].toUpperCase() === "ARS$" && targetProfile.currencyRules?.["AR$"]) {
      issues.push(createIssue({ error_type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", location_in_target: location(currencyStart, currencyEnd), explanation: "Use the Argentine peso marker AR$ in this language profile." }));
      break;
    }
    const rule = currencyRule(targetProfile, currency[0]);
    const numberBefore = adjacent.index + adjacent.raw.length <= currencyStart;
    const actualPlacement = numberBefore ? "suffix" : "prefix";
    const betweenStart = actualPlacement === "suffix" ? adjacent.index + adjacent.raw.length : currencyEnd;
    const betweenEnd = actualPlacement === "suffix" ? currencyStart : adjacent.index;
    const actualSpace = target.slice(betweenStart, betweenEnd);
    const expectedSpace = rule.space === "nbsp" ? "\u00a0" : rule.space ?? "";
    if (actualPlacement !== rule.placement || actualSpace !== expectedSpace) {
      issues.push(createIssue({ error_type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", location_in_target: location(Math.min(currencyStart, adjacent.index), Math.max(currencyEnd, adjacent.index + adjacent.raw.length)), explanation: `Currency should be ${rule.placement === "prefix" ? "before" : "after"} the amount${expectedSpace ? " with the profile’s required space" : " without a space"}.` }));
      break;
    }
  }
}

function addCurrencyMismatch(source, target, issues) {
  const sourceMatches = [...source.matchAll(CURRENCY_RE)];
  const targetMatches = [...target.matchAll(CURRENCY_RE)];
  const sourceCurrencies = sourceMatches.map((match) => canonicalCurrency(match[0]));
  const targetCurrencies = targetMatches.map((match) => canonicalCurrency(match[0]));
  if (sourceCurrencies.length !== targetCurrencies.length) return;
  if (sourceCurrencies.join("|") === targetCurrencies.join("|")) return;
  const mismatchIndex = sourceCurrencies.findIndex((currency, index) => currency !== targetCurrencies[index]);
  const sourceMatch = sourceMatches[mismatchIndex] ?? sourceMatches[0];
  const targetMatch = targetMatches[mismatchIndex] ?? targetMatches[0];
  issues.push(createIssue({ error_type: "CURRENCY_MISMATCH", pool: "Currency", severity: "Major", location_in_source: sourceMatch ? location(sourceMatch.index, sourceMatch.index + sourceMatch[0].length) : location(0, 0), location_in_target: targetMatch ? location(targetMatch.index, targetMatch.index + targetMatch[0].length) : location(0, 0), explanation: "Currency markers differ between source and target." }));
}

function addQuotationChecks(target, targetProfile, issues) {
  if (!targetProfile.quoteStyle) return;
  const invalid = targetProfile.quoteStyle === "guillemets" ? target.match(/["“”]/) : targetProfile.quoteStyle === "double" ? target.match(/[«»“”]/) : target.match(/"/);
  if (invalid) issues.push(createIssue({ error_type: "QUOTATION_STYLE", pool: "Punctuation", severity: "Minor", location_in_target: location(invalid.index, invalid.index + invalid[0].length), explanation: "Quotation marks do not follow the selected language profile." }));
}

function addLightChecks(source, target, targetProfile, issues) {
  addSpacingChecks(target, targetProfile, issues);
  addNumberFormatChecks(target, targetProfile, issues);
  addPercentageChecks(target, targetProfile, issues);
  addCurrencyChecks(target, targetProfile, issues);
  addCurrencyMismatch(source, target, issues);
  addQuotationChecks(target, targetProfile, issues);
}

export function runRuleEngine({ source, target, sourceLanguage = "en", targetLanguage = "ru" }) {
  if (!source.trim() || !target.trim()) return [];
  const sourceProfile = { ...getProfile(sourceLanguage), language: sourceLanguage.split("-")[0] };
  const targetProfile = { ...getProfile(targetLanguage), language: targetLanguage.split("-")[0] };
  const issues = [];
  const headerBlocks = pairHeaderBlocks(source, target);
  const pairs = pairLabeledSegments(source, target);
  const plainParagraphPairs = pairPlainParagraphs(source, target);
  const plainLinePairs = pairPlainLines(source, target);
  if (headerBlocks.length >= 2) {
    for (const pair of headerBlocks) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile, false, false), pair.target.start, pair.source.start));
  } else if (pairs.length >= 2) {
    for (const pair of pairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile), pair.target.start, pair.source.start));
  } else if (plainParagraphPairs.length >= 8) {
    for (const pair of plainParagraphPairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile), pair.target.start, pair.source.start));
  } else if (plainLinePairs.length >= 8) {
    for (const pair of plainLinePairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile), pair.target.start, pair.source.start));
  } else {
    issues.push(...coreChecks(source, target, sourceProfile, targetProfile));
  }
  addLightChecks(source, target, targetProfile, issues);
  return issues;
}

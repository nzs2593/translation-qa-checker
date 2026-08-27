import { checkDatesAndTime } from "./dates-time.js?v=1.1";
import { createIssue, location } from "./domain.js?v=1.1";
import { getProfile } from "./profiles.js";
import { pairHeaderBlocks, pairLabeledSegments } from "./segments.js?v=1.1";

const NUMBER_RE = /(?<![\w.,])(?:\d{1,3}(?:[.,\u00a0 ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(?![\w]|[.,](?=\d))/g;
const PLACEHOLDER_RE = /\{[^{}]+\}|%\w+|\$\{[^}]+\}/g;
const TEMPORAL_TOKEN_RE = /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b|\b\d{1,2}[-/.]\d{1,2}(?:[-/.]\d{2,4})?\b|\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\s*(?:(?:GMT|UTC)\s*[+-]?\s*\d{0,2}(?::?\d{2})?)?/gi;
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
    const [integer, fraction] = value.split(alternateSeparator);
    return canonicalNumber(fraction.length === 3 ? integer + fraction : `${integer}.${fraction}`);
  }
  return canonicalNumber(hasDecimal ? value.replace(decimalSeparator, ".") : value);
}

function numberTokens(text, profile) {
  return [...text.replace(TEMPORAL_TOKEN_RE, " ").matchAll(NUMBER_RE)].map((match) => ({
    raw: match[0], normalized: normalizeNumber(match[0], profile), index: match.index ?? 0
  }));
}

function compareNumbersOutsideTemporalText(source, target, sourceProfile, targetProfile, compareCount = true) {
  const sourceTokens = numberTokens(source, sourceProfile);
  const targetTokens = numberTokens(target, targetProfile);
  if (!compareCount && sourceTokens.length !== targetTokens.length) return [];
  const same = sourceTokens.length === targetTokens.length && sourceTokens.every((token, index) => token.normalized === targetTokens[index].normalized);
  if (same) return [];
  const mismatchIndex = targetTokens.findIndex((token, index) => token.normalized !== sourceTokens[index]?.normalized);
  const targetToken = targetTokens[mismatchIndex >= 0 ? mismatchIndex : 0];
  const sourceToken = sourceTokens[mismatchIndex >= 0 ? mismatchIndex : 0];
  return [createIssue({ error_type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", location_in_source: sourceToken ? location(sourceToken.index, sourceToken.index + sourceToken.raw.length) : location(0, 0), location_in_target: targetToken ? location(targetToken.index, targetToken.index + targetToken.raw.length) : location(0, 0), explanation: "Numeric values outside dates and times differ between source and target." })];
}

function offsetIssues(issues, offset) {
  return issues.map((issue) => ({ ...issue, location_in_target: location(issue.location_in_target.start + offset, issue.location_in_target.end + offset) }));
}

function coreChecks(source, target, sourceProfile, targetProfile, includePunctuation = true, compareCount = true) {
  const issues = [];
  issues.push(...checkDatesAndTime(source, target, { sourceProfile, targetProfile }));
  issues.push(...compareNumbersOutsideTemporalText(source, target, sourceProfile, targetProfile, compareCount));
  issues.push(...compareTokens(source, target, PLACEHOLDER_RE, { error_type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", explanation: "A placeholder is missing or changed in the target." }));
  if (includePunctuation && /[.!?]$/.test(source.trim()) !== /[.!?]$/.test(target.trim())) {
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
  const sourceCurrencies = [...source.matchAll(CURRENCY_RE)].map((match) => canonicalCurrency(match[0]));
  const targetCurrencies = [...target.matchAll(CURRENCY_RE)].map((match) => canonicalCurrency(match[0]));
  if (sourceCurrencies.length !== targetCurrencies.length) return;
  if (sourceCurrencies.join("|") === targetCurrencies.join("|")) return;
  const sourceMatch = source.matchAll(CURRENCY_RE).next().value;
  const targetMatch = target.matchAll(CURRENCY_RE).next().value;
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
  if (headerBlocks.length >= 2) {
    for (const pair of headerBlocks) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile, false, false), pair.target.start));
  } else if (pairs.length >= 2) {
    for (const pair of pairs) issues.push(...offsetIssues(coreChecks(pair.source.text, pair.target.text, sourceProfile, targetProfile), pair.target.start));
  } else {
    issues.push(...coreChecks(source, target, sourceProfile, targetProfile));
  }
  addLightChecks(source, target, targetProfile, issues);
  return issues;
}

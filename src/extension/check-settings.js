export const DEFAULT_CHECKS = Object.freeze({
  glossary: true,
  dates: true,
  numbers: true,
  currencyComparison: true,
  moneyFormat: true,
  spacing: true,
  punctuation: true,
  placeholders: true,
  other: true
});

export function normalizeChecks(saved, legacyCurrency = true) {
  const checks = { ...DEFAULT_CHECKS };
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    for (const key of Object.keys(checks)) if (typeof saved[key] === "boolean") checks[key] = saved[key];
  } else checks.currencyComparison = legacyCurrency !== false;
  return checks;
}

export function issueCheck(issue) {
  if (issue.pool === "Terminology") return "glossary";
  if (issue.pool === "Dates & Time") return "dates";
  if (issue.pool === "Numbers" || issue.pool === "Percentage") return "numbers";
  if (issue.pool === "Currency") return ["CURRENCY_FORMAT", "CURRENCY_NUMBER_FORMAT"].includes(issue.error_type)
    ? "moneyFormat" : "currencyComparison";
  if (issue.pool === "Spacing") return "spacing";
  if (issue.pool === "Punctuation" || issue.pool === "Capitalization") return "punctuation";
  if (issue.pool === "Placeholders") return "placeholders";
  return "other";
}

export function enabledIssues(issues, checks) {
  return issues.filter((issue) => checks[issueCheck(issue)] !== false);
}

export function countCharacters(text) {
  const visible = String(text ?? "").replace(/<\/?\d+\s*\/?>/gu, "");
  if (typeof Intl.Segmenter !== "function") return [...visible].length;
  return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(visible)].length;
}

export function parseCharacterLimitHint(label) {
  const match = String(label ?? "").match(/\b(\d+)\s*(?:\+\s*(\d+))?\s*characters?\b/iu);
  if (!match) return null;
  const parts = [Number(match[1]), ...(match[2] ? [Number(match[2])] : [])];
  if (parts.some((value) => !Number.isInteger(value) || value <= 0)) return null;
  return { parts, total: parts.reduce((sum, value) => sum + value, 0) };
}

export function evaluateCharacterLimit(rows, limit, scope = "total") {
  const counts = rows.map((row) => ({
    id: row.id,
    source: countCharacters(row.sourceRaw),
    target: countCharacters(row.targetRaw)
  }));
  const totalSource = counts.reduce((sum, row) => sum + row.source, 0);
  const totalTarget = counts.reduce((sum, row) => sum + row.target, 0);
  const threshold = Number.isInteger(limit) && limit > 0 ? limit : null;
  const exceeded = threshold == null ? [] : scope === "each"
    ? counts.map((row, index) => ({ index: index + 1, by: row.target - threshold })).filter((row) => row.by > 0)
    : totalTarget > threshold ? [{ index: 0, by: totalTarget - threshold }] : [];
  return { counts, totalSource, totalTarget, exceeded, limit: threshold };
}

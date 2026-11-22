// Crowdin stores markup tags in the textarea. The rule engine sees the visible
// text, so translate its offsets back to raw textarea offsets before selecting.
export function rawTargetRange(raw, start, end) {
  const source = String(raw ?? "");
  const visibleToRaw = [];
  const tag = /<\/?\d+\s*\/?>/gu;
  let match;
  let cursor = 0;
  while ((match = tag.exec(source))) {
    for (let i = cursor; i < match.index; i++) visibleToRaw.push(i);
    cursor = tag.lastIndex;
  }
  for (let i = cursor; i < source.length; i++) visibleToRaw.push(i);
  const visible = visibleToRaw.map((index) => source[index]).join("");
  const leading = visible.length - visible.trimStart().length;
  const length = visible.trim().length;
  const from = Math.min(length, Math.max(0, Number(start) || 0)) + leading;
  const to = Math.min(length, Math.max(from - leading, Number(end) || 0)) + leading;
  const rawStart = visibleToRaw[from] ?? source.length;
  const rawEnd = to > from ? (visibleToRaw[to - 1] ?? rawStart) + 1 : rawStart;
  return { start: rawStart, end: rawEnd };
}

export function findingKey(documentPath, segmentId, issue, targetText) {
  const input = JSON.stringify([documentPath, segmentId, issue.error_type,
    issue.location_in_target?.start, issue.location_in_target?.end,
    issue.glossary?.rows, targetText]);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${segmentId}:${(hash >>> 0).toString(16)}`;
}

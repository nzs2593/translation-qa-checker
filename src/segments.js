const LABEL_RE = /^(\p{L}[\p{L} ]{1,28}):[ \t]*$/gmu;

function normalizeLabel(label) {
  const plain = label.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return { texto: "text", boton: "button", encabezado: "header", preencabezado: "preheader" }[plain] ?? plain;
}

export function extractLabeledSegments(text) {
  const labels = [...text.matchAll(LABEL_RE)];
  return labels.map((match, index) => {
    const contentStart = match.index + match[0].length;
    const contentEnd = labels[index + 1]?.index ?? text.length;
    const raw = text.slice(contentStart, contentEnd);
    const leading = raw.search(/\S/);
    const trimmed = leading < 0 ? "" : raw.trim();
    const value = normalizeLabel(match[1]) === "button" ? (trimmed.split(/\r?\n/).find(Boolean) ?? "") : trimmed;
    const start = leading < 0 ? contentStart : contentStart + leading;
    return { label: normalizeLabel(match[1]), text: value, start, end: start + value.length, lineStart: match.index };
  }).filter((segment) => segment.text);
}

export function pairHeaderBlocks(source, target) {
  const sourceHeaders = extractLabeledSegments(source).filter((segment) => segment.label === "header");
  const targetHeaders = extractLabeledSegments(target).filter((segment) => segment.label === "header");
  if (sourceHeaders.length < 2 || targetHeaders.length < 2 || sourceHeaders.length !== targetHeaders.length) return [];
  return sourceHeaders.map((sourceHeader, index) => {
    const targetHeader = targetHeaders[index];
    const sourceEnd = sourceHeaders[index + 1]?.lineStart ?? source.length;
    const targetEnd = targetHeaders[index + 1]?.lineStart ?? target.length;
    return {
      source: { text: source.slice(sourceHeader.start, sourceEnd).trim(), start: sourceHeader.start },
      target: { text: target.slice(targetHeader.start, targetEnd).trim(), start: targetHeader.start }
    };
  });
}

export function pairLabeledSegments(source, target) {
  const sourceSegments = extractLabeledSegments(source);
  const targetSegments = extractLabeledSegments(target);
  if (sourceSegments.length < 2 || targetSegments.length < 2) return [];

  const targetByLabel = new Map();
  for (const segment of targetSegments) {
    const items = targetByLabel.get(segment.label) ?? [];
    items.push(segment);
    targetByLabel.set(segment.label, items);
  }
  const used = new Map();
  return sourceSegments.flatMap((sourceSegment) => {
    const items = targetByLabel.get(sourceSegment.label) ?? [];
    const index = used.get(sourceSegment.label) ?? 0;
    used.set(sourceSegment.label, index + 1);
    const targetSegment = items[index];
    return targetSegment ? [{ source: sourceSegment, target: targetSegment }] : [];
  });
}

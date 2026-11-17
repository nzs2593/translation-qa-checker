export function clampTogglePosition(position, size, viewport, margin = 8) {
  const maxX = Math.max(margin, viewport.width - size.width - margin);
  const maxY = Math.max(margin, viewport.height - size.height - margin);
  const coordinate = (value, max) => Math.min(max, Math.max(margin, Number.isFinite(value) ? value : margin));
  return { x: Math.round(coordinate(position.x, maxX)), y: Math.round(coordinate(position.y, maxY)) };
}

export function movedEnough(dx, dy) {
  return dx * dx + dy * dy >= 25;
}

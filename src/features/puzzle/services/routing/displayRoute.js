import { segments } from './geometry';

function crossingPoints(segment, earlier) {
  const { from, to } = segment,
    horizontal = from.y === to.y;
  const low = horizontal ? Math.min(from.x, to.x) : Math.min(from.y, to.y);
  const high = horizontal ? Math.max(from.x, to.x) : Math.max(from.y, to.y);
  const hits = [];
  for (const other of earlier) {
    if (horizontal === (other.from.y === other.to.y)) continue;
    const cross = horizontal ? other.from.x : other.from.y;
    const fixed = horizontal ? from.y : from.x;
    const otherLow = horizontal
      ? Math.min(other.from.y, other.to.y)
      : Math.min(other.from.x, other.to.x);
    const otherHigh = horizontal
      ? Math.max(other.from.y, other.to.y)
      : Math.max(other.from.x, other.to.x);
    if (cross > low + 8 && cross < high - 8 && fixed > otherLow + 1 && fixed < otherHigh - 1)
      hits.push(cross);
  }
  return [...new Set(hits)]
    .sort((a, b) => a - b)
    .filter((hit, i, all) => i === 0 || hit - all[i - 1] >= 12);
}

export function displayRoute(points, earlier) {
  const rendered = [points[0]];
  let label,
    longest = -1,
    bridges = 0;
  for (const segment of segments(points)) {
    const { from, to } = segment,
      horizontal = from.y === to.y;
    const length = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    if (length > longest) {
      longest = length;
      label = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    }
    const direction = horizontal ? Math.sign(to.x - from.x) : Math.sign(to.y - from.y);
    const hits = crossingPoints(segment, earlier);
    if (direction < 0) hits.reverse();
    for (const hit of hits) {
      const before = hit - direction * 5,
        after = hit + direction * 5;
      rendered.push(
        ...(horizontal
          ? [
              { x: before, y: from.y },
              { x: before, y: from.y - 6 },
              { x: after, y: from.y - 6 },
              { x: after, y: from.y },
            ]
          : [
              { x: from.x, y: before },
              { x: from.x + 6, y: before },
              { x: from.x + 6, y: after },
              { x: from.x, y: after },
            ]),
      );
      bridges += 1;
    }
    rendered.push(to);
  }
  return {
    points,
    bridges,
    label,
    path: rendered.map((point, i) => `${i ? 'L' : 'M'}${point.x},${point.y}`).join(' '),
  };
}

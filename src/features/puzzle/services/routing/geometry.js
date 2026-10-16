import { DIRECTIONS, STUB, LANE_GAP } from './constants';

export function endpoint(node, type, id, obstacles) {
  const handle = node?.handles?.[type]?.find((handle) => handle.id === id);
  if (!handle) return null;
  const direction = DIRECTIONS[handle.position];
  if (!direction) return null;
  const point = {
    x:
      node.x +
      handle.x +
      (direction.x === 1 ? handle.width : direction.x === 0 ? handle.width / 2 : 0),
    y:
      node.y +
      handle.y +
      (direction.y === 1 ? handle.height : direction.y === 0 ? handle.height / 2 : 0),
  };
  // Short mobile gaps cannot accommodate two fixed 32px terminal stubs.
  // Clip the escape to the nearest other module's clearance boundary.
  let stub = STUB;
  for (const rect of obstacles) {
    if (rect.id === node.id) continue;
    const across = direction.x
      ? point.y > rect.top && point.y < rect.bottom
      : point.x > rect.left && point.x < rect.right;
    if (!across) continue;
    const distance =
      direction.x === 1
        ? rect.left - point.x
        : direction.x === -1
          ? point.x - rect.right
          : direction.y === 1
            ? rect.top - point.y
            : point.y - rect.bottom;
    if (distance >= 0) stub = Math.min(stub, distance);
  }
  return {
    point,
    escape: { x: point.x + direction.x * stub, y: point.y + direction.y * stub },
  };
}

export function axisCoordinates(values, laneCount) {
  const base = [...new Set(values)].sort((a, b) => a - b);
  const result = [...base, base[0] - 64, base.at(-1) + 64];
  for (let i = 1; i < base.length; i += 1) {
    const low = base[i - 1],
      high = base[i];
    const count = Math.min(laneCount, Math.floor((high - low) / LANE_GAP) - 1);
    for (let lane = 0; lane < count; lane += 1) {
      result.push((low + high) / 2 + (lane - (count - 1) / 2) * LANE_GAP);
    }
  }
  return [...new Set(result)].sort((a, b) => a - b);
}

export function simplifyPoints(points) {
  const result = [];
  for (const point of points) {
    if (result.at(-1)?.x === point.x && result.at(-1)?.y === point.y) continue;
    while (result.length > 1) {
      const a = result.at(-2),
        b = result.at(-1);
      if ((a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y)) result.pop();
      else break;
    }
    result.push(point);
  }
  return result;
}

export function segments(points) {
  return points.slice(1).map((to, index) => ({ from: points[index], to }));
}

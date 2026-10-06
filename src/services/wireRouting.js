// Display geometry only. No routing metadata is written to circuit drafts.
const CLEARANCE = 16;
const STUB = 32;
const LANE_GAP = 16;
const DIRECTIONS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

export function selectWireGeometry(state) {
  return JSON.stringify(
    [...state.nodeLookup.values()].map((node) => ({
      id: node.id,
      ...node.internals.positionAbsolute,
      width: node.measured.width ?? 0,
      height: node.measured.height ?? 0,
      handles: node.internals.handleBounds,
    })),
  );
}

function endpoint(node, type, id, obstacles) {
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

function axisCoordinates(values, laneCount) {
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

class Queue {
  items = [];
  push(item) {
    const items = this.items;
    let index = items.push(item) - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (items[parent].score <= item.score) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = item;
  }
  pop() {
    const items = this.items,
      first = items[0],
      last = items.pop();
    if (items.length) {
      let index = 0;
      while (index * 2 + 1 < items.length) {
        let child = index * 2 + 1;
        if (child + 1 < items.length && items[child + 1].score < items[child].score)
          child += 1;
        if (last.score <= items[child].score) break;
        items[index] = items[child];
        index = child;
      }
      items[index] = last;
    }
    return first;
  }
}

function createGrid(xs, ys, obstacles) {
  const width = xs.length,
    height = ys.length,
    size = width * height;
  const grid = {
    xs,
    ys,
    width,
    height,
    blockedH: new Uint8Array(size),
    blockedV: new Uint8Array(size),
    usedH: new Uint16Array(size),
    usedV: new Uint16Array(size),
    nearH: new Uint16Array(size),
    nearV: new Uint16Array(size),
    vertexH: new Uint16Array(size),
    vertexV: new Uint16Array(size),
  };
  for (const rect of obstacles) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const key = y * width + x;
        if (
          ys[y] > rect.top &&
          ys[y] < rect.bottom &&
          x + 1 < width &&
          xs[x] < rect.right &&
          xs[x + 1] > rect.left
        )
          grid.blockedH[key] = 1;
        if (
          xs[x] > rect.left &&
          xs[x] < rect.right &&
          y + 1 < height &&
          ys[y] < rect.bottom &&
          ys[y + 1] > rect.top
        )
          grid.blockedV[key] = 1;
      }
    }
  }
  return grid;
}

function search(grid, start, end) {
  const { xs, ys, width, height } = grid;
  const startIndex = ys.indexOf(start.y) * width + xs.indexOf(start.x);
  const endIndex = ys.indexOf(end.y) * width + xs.indexOf(end.x);
  const costs = new Float64Array(width * height * 3).fill(Infinity);
  const previous = new Int32Array(costs.length).fill(-1);
  const queue = new Queue();
  const distance = (index) =>
    Math.abs(xs[index % width] - end.x) + Math.abs(ys[Math.floor(index / width)] - end.y);
  costs[startIndex * 3] = 0;
  queue.push({ key: startIndex * 3, cost: 0, score: distance(startIndex) });
  while (queue.items.length) {
    const current = queue.pop();
    if (current.cost !== costs[current.key]) continue;
    const index = Math.floor(current.key / 3),
      direction = current.key % 3;
    if (index === endIndex) {
      const path = [];
      for (let key = current.key; key !== -1; key = previous[key])
        path.push(Math.floor(key / 3));
      return path.reverse();
    }
    const x = index % width,
      y = Math.floor(index / width);
    const neighbors = [
      ...(x > 0 ? [[index - 1, 1, index - 1]] : []),
      ...(x + 1 < width ? [[index + 1, 1, index]] : []),
      ...(y > 0 ? [[index - width, 2, index - width]] : []),
      ...(y + 1 < height ? [[index + width, 2, index]] : []),
    ];
    for (const [next, axis, segment] of neighbors) {
      const horizontal = axis === 1;
      if ((horizontal ? grid.blockedH : grid.blockedV)[segment]) continue;
      const length = horizontal
        ? Math.abs(xs[next % width] - xs[x])
        : Math.abs(ys[Math.floor(next / width)] - ys[y]);
      const occupied = (horizontal ? grid.usedH : grid.usedV)[segment];
      const nearby = (horizontal ? grid.nearH : grid.nearV)[segment];
      const crossing = (horizontal ? grid.vertexV : grid.vertexH)[next];
      const cost =
        current.cost +
        length +
        (direction && direction !== axis ? 20 : 0) +
        (occupied ? 4000 + length * 80 : 0) +
        nearby * length * 4 +
        (crossing ? 32 : 0);
      const key = next * 3 + axis;
      if (cost >= costs[key]) continue;
      costs[key] = cost;
      previous[key] = current.key;
      queue.push({ key, cost, score: cost + distance(next) });
    }
  }
  return null;
}

function reserve(grid, path) {
  const { width, xs, ys } = grid;
  for (let i = 1; i < path.length; i += 1) {
    const from = path[i - 1],
      to = path[i],
      key = Math.min(from, to);
    const horizontal = Math.floor(from / width) === Math.floor(to / width);
    (horizontal ? grid.usedH : grid.usedV)[key] += 1;
    (horizontal ? grid.vertexH : grid.vertexV)[from] += 1;
    (horizontal ? grid.vertexH : grid.vertexV)[to] += 1;
    const x = key % width,
      y = Math.floor(key / width);
    if (horizontal) {
      for (let row = y - 1; row >= 0 && ys[y] - ys[row] < LANE_GAP; row -= 1)
        grid.nearH[row * width + x] += 1;
      for (let row = y + 1; row < ys.length && ys[row] - ys[y] < LANE_GAP; row += 1)
        grid.nearH[row * width + x] += 1;
    } else {
      for (let column = x - 1; column >= 0 && xs[x] - xs[column] < LANE_GAP; column -= 1)
        grid.nearV[y * width + column] += 1;
      for (
        let column = x + 1;
        column < xs.length && xs[column] - xs[x] < LANE_GAP;
        column += 1
      )
        grid.nearV[y * width + column] += 1;
    }
  }
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

function segments(points) {
  return points.slice(1).map((to, index) => ({ from: points[index], to }));
}

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

function displayRoute(points, earlier) {
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

export function routeWires(edges, nodes) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const obstacles = nodes
    .filter((node) => node.width && node.height)
    .map((node) => ({
      id: node.id,
      left: node.x - CLEARANCE,
      right: node.x + node.width + CLEARANCE,
      top: node.y - CLEARANCE,
      bottom: node.y + node.height + CLEARANCE,
    }));
  const connections = edges
    .map((edge) => ({
      edge,
      source: endpoint(nodeMap.get(edge.source), 'source', edge.sourceHandle, obstacles),
      target: endpoint(nodeMap.get(edge.target), 'target', edge.targetHandle, obstacles),
    }))
    .filter(({ source, target }) => source && target);
  if (!connections.length) return {};
  const points = connections.flatMap(({ source, target }) => [
    source.point,
    source.escape,
    target.point,
    target.escape,
  ]);
  const laneCount = Math.min(12, edges.length);
  const xs = axisCoordinates(
    [...points.map((p) => p.x), ...obstacles.flatMap((r) => [r.left, r.right])],
    laneCount,
  );
  const ys = axisCoordinates(
    [...points.map((p) => p.y), ...obstacles.flatMap((r) => [r.top, r.bottom])],
    laneCount,
  );
  const grid = createGrid(xs, ys, obstacles);
  const routes = {};
  // Stable topology order, independent of selection, signal values and edge insertion.
  const ordered = [...connections].sort((a, b) =>
    `${a.edge.source}/${a.edge.target}/${a.edge.targetHandle}/${a.edge.id}`.localeCompare(
      `${b.edge.source}/${b.edge.target}/${b.edge.targetHandle}/${b.edge.id}`,
    ),
  );
  for (const { edge, source, target } of ordered) {
    const path = search(grid, source.escape, target.escape);
    if (!path) continue; // Overlapping cards may leave a port with no escape corridor.
    reserve(grid, path);
    routes[edge.id] = simplifyPoints([
      source.point,
      source.escape,
      ...path.map((index) => ({
        x: xs[index % grid.width],
        y: ys[Math.floor(index / grid.width)],
      })),
      target.escape,
      target.point,
    ]);
  }
  // Later SVG edges bridge earlier edges at unavoidable crossings.
  const rendered = {},
    earlier = [];
  for (const { edge } of connections) {
    const points = routes[edge.id];
    if (!points) continue;
    rendered[edge.id] = displayRoute(points, earlier);
    earlier.push(...segments(points));
  }
  return rendered;
}

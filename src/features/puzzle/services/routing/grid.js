import { LANE_GAP } from './constants';

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

export function createGrid(xs, ys, obstacles) {
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

export function search(grid, start, end) {
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

export function reserve(grid, path) {
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

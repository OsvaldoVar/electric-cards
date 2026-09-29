export function topologicalSort(nodes, edges) {
  const degrees = new Map(nodes.map((node) => [node.id, 0]));
  const successors = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    if (!degrees.has(edge.source) || !degrees.has(edge.target)) return null;
    degrees.set(edge.target, degrees.get(edge.target) + 1);
    successors.get(edge.source).push(edge.target);
  }
  const queue = nodes.filter((node) => degrees.get(node.id) === 0).map((node) => node.id);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    for (const target of successors.get(queue[cursor])) {
      degrees.set(target, degrees.get(target) - 1);
      if (degrees.get(target) === 0) queue.push(target);
    }
  }
  return queue.length === nodes.length ? queue : null;
}

export function wouldCreateCycle(edges, source, target) {
  if (source === target) return true;
  const successors = new Map();
  for (const edge of edges) {
    if (!successors.has(edge.source)) successors.set(edge.source, []);
    successors.get(edge.source).push(edge.target);
  }
  const pending = [target];
  const visited = new Set();
  while (pending.length) {
    const current = pending.pop();
    if (current === source) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...(successors.get(current) ?? []));
  }
  return false;
}

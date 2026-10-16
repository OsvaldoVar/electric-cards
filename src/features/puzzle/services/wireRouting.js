// Display geometry only. Routing metadata never enters saved circuits.
import { CLEARANCE } from './routing/constants';
import { endpoint, axisCoordinates, simplifyPoints, segments } from './routing/geometry';
import { createGrid, search, reserve } from './routing/grid';
import { displayRoute } from './routing/displayRoute';

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

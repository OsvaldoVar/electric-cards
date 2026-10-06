import { describe, expect, it } from 'vitest';
import { routeWires } from '../src/services/wireRouting';

function node(id, x, y, inputs = []) {
  return {
    id,
    x,
    y,
    width: 136,
    height: 100,
    handles: {
      source: [{ id: 'out', x: 128, y: 42, width: 16, height: 16, position: 'right' }],
      target: inputs.map((id, index) => ({
        id,
        x: -8,
        y: 25 + index * 40,
        width: 16,
        height: 16,
        position: 'left',
      })),
    },
  };
}
const scene = () => ({
  nodes: [
    node('A', 40, 90),
    node('B', 40, 250),
    node('XOR', 330, 20, ['a', 'b']),
    node('XNOR', 330, 290, ['a', 'b']),
  ],
  edges: [
    { id: 'a-xor', source: 'A', sourceHandle: 'out', target: 'XOR', targetHandle: 'a' },
    { id: 'b-xor', source: 'B', sourceHandle: 'out', target: 'XOR', targetHandle: 'b' },
    { id: 'a-xnor', source: 'A', sourceHandle: 'out', target: 'XNOR', targetHandle: 'a' },
    { id: 'b-xnor', source: 'B', sourceHandle: 'out', target: 'XNOR', targetHandle: 'b' },
  ],
});
const segments = (points) => points.slice(1).map((point, index) => [points[index], point]);
function overlap(a, b) {
  const [p, q] = a,
    [r, s] = b;
  if (p.x === q.x && r.x === s.x && p.x === r.x)
    return Math.max(
      0,
      Math.min(Math.max(p.y, q.y), Math.max(r.y, s.y)) -
        Math.max(Math.min(p.y, q.y), Math.min(r.y, s.y)),
    );
  if (p.y === q.y && r.y === s.y && p.y === r.y)
    return Math.max(
      0,
      Math.min(Math.max(p.x, q.x), Math.max(r.x, s.x)) -
        Math.max(Math.min(p.x, q.x), Math.min(r.x, s.x)),
    );
  return 0;
}
function checkScene({ edges, nodes }) {
  const before = structuredClone({ edges, nodes });
  const routes = routeWires(edges, nodes);
  expect({ edges, nodes }).toEqual(before);
  expect(Object.keys(routes)).toHaveLength(edges.length);
  for (const edge of edges) {
    const route = routes[edge.id],
      source = nodes.find((n) => n.id === edge.source),
      target = nodes.find((n) => n.id === edge.target);
    const sh = source.handles.source.find((h) => h.id === edge.sourceHandle);
    const th = target.handles.target.find((h) => h.id === edge.targetHandle);
    const portPoint = (n, h) => ({
      x:
        n.x +
        h.x +
        (h.position === 'right'
          ? h.width
          : ['top', 'bottom'].includes(h.position)
            ? h.width / 2
            : 0),
      y:
        n.y +
        h.y +
        (h.position === 'bottom'
          ? h.height
          : ['left', 'right'].includes(h.position)
            ? h.height / 2
            : 0),
    });
    expect(route.points[0]).toEqual(portPoint(source, sh));
    expect(route.points.at(-1)).toEqual(portPoint(target, th));
    for (const [from, to] of segments(route.points)) {
      expect(from.x === to.x || from.y === to.y).toBe(true);
      for (const obstacle of nodes.filter(
        (n) => n.id !== edge.source && n.id !== edge.target,
      )) {
        const enters =
          from.x === to.x
            ? from.x > obstacle.x &&
              from.x < obstacle.x + obstacle.width &&
              Math.max(from.y, to.y) > obstacle.y &&
              Math.min(from.y, to.y) < obstacle.y + obstacle.height
            : from.y > obstacle.y &&
              from.y < obstacle.y + obstacle.height &&
              Math.max(from.x, to.x) > obstacle.x &&
              Math.min(from.x, to.x) < obstacle.x + obstacle.width;
        expect(enters).toBe(false);
      }
    }
  }
  for (let i = 0; i < edges.length; i += 1) {
    for (let j = i + 1; j < edges.length; j += 1) {
      const shared = segments(routes[edges[i].id].points).reduce(
        (total, a) =>
          total +
          segments(routes[edges[j].id].points).reduce((sum, b) => sum + overlap(a, b), 0),
        0,
      );
      // Only the short stem at a common source may be shared by a fan-out.
      expect(shared).toBeLessThanOrEqual(edges[i].source === edges[j].source ? 32 : 0);
    }
  }
  return routes;
}

describe('Wire display routing', () => {
  it('separates the two-input XOR/XNOR fan-out from the reported layout', () => {
    const routes = checkScene(scene());
    expect(
      Object.values(routes).reduce((sum, route) => sum + route.bridges, 0),
    ).toBeGreaterThan(0);
  });
  it('uses stable lanes when edges are reordered and signals change', () => {
    const { nodes, edges } = scene();
    const first = routeWires(edges, nodes);
    const second = routeWires(
      [...edges].reverse().map((edge) => ({ ...edge, data: { value: 1 } })),
      nodes,
    );
    for (const edge of edges) expect(second[edge.id].points).toEqual(first[edge.id].points);
  });
  it('routes around an intervening module instead of drawing across it', () => {
    const layout = scene();
    layout.nodes.splice(2, 0, node('blocker', 200, 165));
    layout.nodes
      .filter((n) => ['XOR', 'XNOR'].includes(n.id))
      .forEach((n) => {
        n.x = 530;
      });
    checkScene(layout);
  });
  it('keeps endpoints and distinct lanes after changing to top/bottom mobile ports', () => {
    const layout = scene();
    layout.nodes = layout.nodes.map((n) => ({
      ...n,
      x: n.y,
      y: n.x,
      width: n.height,
      height: n.width,
      handles: Object.fromEntries(
        Object.entries(n.handles).map(([type, handles]) => [
          type,
          handles.map((h) => ({
            ...h,
            x: h.y,
            y: h.x,
            width: h.height,
            height: h.width,
            position: h.position === 'right' ? 'bottom' : 'top',
          })),
        ]),
      ),
    }));
    checkScene(layout);
  });
  it('clips terminal escapes in the narrow gaps of the mobile organizer', () => {
    const source = node('A', 0, 0);
    source.handles.source = [
      { id: 'out', x: 60, y: 92, width: 16, height: 16, position: 'bottom' },
    ];
    const target = node('gate', 0, 150, ['a']);
    target.handles.target = [
      { id: 'a', x: 60, y: -8, width: 16, height: 16, position: 'top' },
    ];
    checkScene({
      nodes: [source, target],
      edges: [
        { id: 'wire', source: 'A', sourceHandle: 'out', target: 'gate', targetHandle: 'a' },
      ],
    });
  });
  it('handles gates dragged behind their sources and empty/unmeasured boards', () => {
    const layout = scene();
    layout.nodes
      .filter((n) => ['XOR', 'XNOR'].includes(n.id))
      .forEach((n) => {
        n.x = -180;
      });
    checkScene(layout);
    expect(routeWires([], [])).toEqual({});
    expect(
      routeWires(
        layout.edges,
        layout.nodes.map((n) => ({ ...n, handles: undefined })),
      ),
    ).toEqual({});
  });
});

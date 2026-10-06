import { test, expect } from '@playwright/test';
import { seedProgress } from './helpers';
import { createCircuit } from '../../src/engine/createCircuit';
import { getLevel } from '../../src/data/levels';

function draft() {
  const circuit = createCircuit(getLevel(12));
  circuit.nodes.forEach((node) => {
    node.position =
      node.id === 'input-A'
        ? { x: 40, y: 160 }
        : node.id === 'input-B'
          ? { x: 40, y: 320 }
          : { x: 650, y: 240 };
  });
  circuit.nodes.push(
    { id: 'xor', type: 'gate', data: { gateType: 'XOR' }, position: { x: 330, y: 60 } },
    { id: 'xnor', type: 'gate', data: { gateType: 'XNOR' }, position: { x: 330, y: 370 } },
  );
  circuit.edges = [
    ['a-xor', 'input-A', 'xor', 'a'],
    ['b-xor', 'input-B', 'xor', 'b'],
    ['a-xnor', 'input-A', 'xnor', 'a'],
    ['b-xnor', 'input-B', 'xnor', 'b'],
    ['out', 'xnor', 'output-LED', 'in'],
  ].map(([id, source, target, targetHandle]) => ({
    id,
    source,
    sourceHandle: 'out',
    target,
    targetHandle,
  }));
  return { circuit, inputs: { A: 1, B: 0 } };
}

async function checkGeometry(page) {
  await expect(page.locator('.react-flow__edge-path[data-routing="separated"]')).toHaveCount(
    5,
  );
  const geometry = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('electric-cards:v1'));
    const edges = state.drafts[12].circuit.edges;
    const paths = edges.map((edge) => {
      const element = document.querySelector(`[data-id="${edge.id}"] .react-flow__edge-path`);
      const points = [...element.getAttribute('d').matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(
        (match) => ({ x: Number(match[1]), y: Number(match[2]) }),
      );
      const portError = (side) => {
        const port = document.querySelector(
          `[data-testid="port-${edge[side]}-${edge[side + 'Handle']}"]`,
        );
        const rect = port.getBoundingClientRect();
        const direction = port.getAttribute('data-handlepos');
        const expected = {
          x:
            direction === 'right'
              ? rect.right
              : direction === 'left'
                ? rect.left
                : rect.x + rect.width / 2,
          y:
            direction === 'bottom'
              ? rect.bottom
              : direction === 'top'
                ? rect.top
                : rect.y + rect.height / 2,
        };
        const point = element.getPointAtLength(
          side === 'source' ? 0 : element.getTotalLength(),
        );
        const screen = new DOMPoint(point.x, point.y).matrixTransform(element.getScreenCTM());
        return Math.hypot(screen.x - expected.x, screen.y - expected.y);
      };
      return { edge, points, error: Math.max(portError('source'), portError('target')) };
    });
    const segments = (points) => points.slice(1).map((p, i) => [points[i], p]);
    let overlap = 0;
    for (let i = 0; i < paths.length; i += 1) {
      for (let j = i + 1; j < paths.length; j += 1) {
        if (paths[i].edge.source === paths[j].edge.source) continue;
        for (const [a, b] of segments(paths[i].points)) {
          for (const [c, d] of segments(paths[j].points)) {
            if (a.x === b.x && c.x === d.x && a.x === c.x)
              overlap += Math.max(
                0,
                Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) -
                  Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)),
              );
            if (a.y === b.y && c.y === d.y && a.y === c.y)
              overlap += Math.max(
                0,
                Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) -
                  Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)),
              );
          }
        }
      }
    }
    return {
      overlap,
      errors: paths.map((p) => p.error),
      finite: paths.every(
        (p) =>
          p.points.length >= 2 &&
          p.points.every((v) => Number.isFinite(v.x) && Number.isFinite(v.y)),
      ),
    };
  });
  expect(geometry.finite).toBe(true);
  expect(Math.max(...geometry.errors)).toBeLessThan(2);
  expect(geometry.overlap).toBeLessThan(0.01);
}

test('fan-out wires stay distinct through signal changes, reload, dragging and orientation changes', async ({
  page,
}, testInfo) => {
  await seedProgress(page, 11, { 12: draft() });
  await page.goto('/puzzle/12');
  // Reproduce the supplied left-to-right arrangement in both browser projects.
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole('button', { name: 'Ajustar tablero' }).click();
  await checkGeometry(page);
  const paths = await page
    .locator('.react-flow__edge-path')
    .evaluateAll((paths) => paths.map((p) => p.getAttribute('d')));
  await page.screenshot({ path: testInfo.outputPath('fan-out-desktop.png') });
  await page.getByRole('button', { name: 'Cambiar entrada A' }).click();
  await expect
    .poll(() =>
      page
        .locator('.react-flow__edge-path')
        .evaluateAll((paths) => paths.map((p) => p.getAttribute('d'))),
    )
    .toEqual(paths);
  await page.reload();
  await checkGeometry(page);

  const gate = page.locator('[data-id="xor"] .gate-node > svg');
  const box = await gate.boundingBox();
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  if (testInfo.project.name === 'touch') {
    const client = await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point],
    });
    for (let i = 1; i <= 8; i += 1)
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point.x + 8 * i, y: point.y + 4 * i }],
      });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await client.detach();
  } else {
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 64, point.y + 32, { steps: 8 });
    await page.mouse.up();
  }
  await checkGeometry(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('button', { name: 'Organizar tablero' }).click();
  await checkGeometry(page);
  await page.getByRole('button', { name: 'Ajustar tablero' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const canvas = document.querySelector('.circuit-canvas').getBoundingClientRect();
        return [...document.querySelectorAll('.react-flow__node')].every((node) => {
          const box = node.getBoundingClientRect();
          return (
            box.left >= canvas.left &&
            box.right <= canvas.right &&
            box.top >= canvas.top &&
            box.bottom <= canvas.bottom
          );
        });
      }),
    )
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath('fan-out-mobile.png') });
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('heading', { name: '¡Circuito correcto!' })).toBeVisible();
});

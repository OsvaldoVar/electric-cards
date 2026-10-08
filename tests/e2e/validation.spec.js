import { test, expect } from './returning-player';
import { referenceCircuit } from '../fixtures/solutions';
import { seedProgress } from './helpers';
import { createCircuit } from '../../src/engine/createCircuit';
import { getLevel } from '../../src/data/levels';

async function seed(page, circuit, levelId = 1, completedThrough = levelId - 1) {
  await seedProgress(page, completedThrough, {
    [levelId]: {
      circuit,
      inputs: Object.fromEntries(getLevel(levelId).inputs.map((input) => [input.id, 0])),
    },
  });
}
async function freeze(page) {
  await page.clock.install();
  await page.locator('.react-flow__edge-path').first().waitFor();
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
}

test('checks every truth row on the board before saving completion', async ({ page }) => {
  await seed(page, referenceCircuit(1));
  await page.goto('/puzzle/1');
  await freeze(page);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('heading', { name: 'Probando combinaciones…' })).toBeVisible();
  await expect(page.locator('.objective-table .case-checking')).toHaveCount(1);
  await expect(page.locator('.objective-table .case-pending')).toHaveCount(3);
  await expect(page.locator('.test-success-actions')).toHaveCount(0);
  await expect(page.locator('.puzzle-success-banner')).toHaveCount(0);
  await page.clock.runFor(360);
  await expect(page.locator('.objective-table .case-passed')).toHaveCount(1);
  await expect(page.locator('.board-panel')).toHaveAttribute('data-review', 'passed');
  await expect(page.locator('.output-node')).toHaveAttribute('data-review', 'passed');
  await page.clock.runFor(160);
  await expect(page.locator('.input-node.bit-1')).toHaveCount(1);
  await expect(page.locator('.board-review-status')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels,
    ),
  ).toEqual({});
  await page.clock.runFor(1560);
  await expect(page.getByRole('heading', { name: '¡Circuito correcto!' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(
    page.getByRole('complementary', { name: 'Optimización del circuito' }),
  ).toHaveCount(0);
  await expect(page.locator('.puzzle-success-banner')).toHaveCount(0);
  await expect(page.locator('.board-review-status')).toHaveCount(0);
  await expect(page.locator('.objective-table .case-passed')).toHaveCount(4);
  await expect(page.locator('.results-table .case-passed')).toHaveCount(4);
  await expect(page.locator('body')).not.toContainText(/estrellas/i);
  await page.clock.runFor(300);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).unlockedLevel,
    ),
  ).toBe(2);
  await page.getByRole('button', { name: 'Eliminar AND 1' }).click();
  await expect(page.locator('.puzzle-success-banner')).toHaveCount(0);
});

test('a correct circuit with extra gates shows advice only in the popup and unlocks the next level', async ({
  page,
}) => {
  const circuit = referenceCircuit(4);
  circuit.nodes.push({
    id: 'extra-not',
    type: 'gate',
    position: { x: 320, y: 240 },
    data: { gateType: 'NOT' },
  });
  circuit.edges.push({
    id: 'extra-a',
    source: 'input-A',
    sourceHandle: 'out',
    target: 'extra-not',
    targetHandle: 'a',
  });
  await seed(page, circuit, 4, 3);
  await page.goto('/puzzle/4');
  await freeze(page);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  const advice = page.getByRole('complementary', { name: 'Optimización del circuito' });
  await expect(advice).toHaveCount(0);
  await page.clock.runFor(4160);
  const popupAdvice = page.getByRole('dialog').locator('.completion-optimization');
  await expect(popupAdvice).toContainText('Puedes usar menos compuertas');
  await expect(popupAdvice).toContainText('tu circuito utiliza 3');
  await expect(popupAdvice).toHaveCSS('color', 'rgb(99, 221, 255)');
  await page.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(advice).toHaveCount(0);
  await expect(page.locator('.puzzle-success-banner')).toHaveCount(0);
  await page.clock.runFor(300);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels[4],
    ),
  ).toEqual({ completed: true, bestGateCount: 3 });
  await page.getByRole('button', { name: 'Eliminar NOT 3' }).click();
  await expect(advice).toHaveCount(0);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await page.clock.runFor(4160);
  await expect(page.getByRole('heading', { name: '¡Circuito correcto!' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(advice).toHaveCount(0);
  await page.clock.runFor(300);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels[4],
    ),
  ).toEqual({ completed: true, bestGateCount: 2 });
  await page.clock.resume();
  await page.getByRole('link', { name: 'Mapa de niveles' }).click();
  await expect(page.getByRole('link', { name: 'Nivel 5', exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/estrellas/i);
});

test('marks failed combinations red and finishes automatically without a skip button', async ({
  page,
}) => {
  const circuit = createCircuit(getLevel(1));
  circuit.edges.push({
    id: 'direct',
    source: 'input-A',
    sourceHandle: 'out',
    target: 'output-DOOR',
    targetHandle: 'in',
  });
  await seed(page, circuit);
  await page.goto('/puzzle/1');
  await freeze(page);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await page.clock.runFor(1400);
  await expect(page.locator('.objective-table .case-failed')).toHaveCount(1);
  await expect(page.locator('.objective-table')).not.toContainText('Obtenido');
  await expect(page.locator('.objective-table .case-failed td')).toHaveText(['1', '0', '0']);
  await expect(page.locator('.objective-table .case-passed')).toHaveCount(2);
  await expect(page.locator('.board-panel')).toHaveAttribute('data-review', 'failed');
  await expect(page.locator('.output-node')).toHaveAttribute('data-review', 'failed');
  const colors = await page.locator('.objective-table tbody').evaluate((body) => ({
    pass: getComputedStyle(body.querySelector('.case-passed td'), '::after').backgroundColor,
    fail: getComputedStyle(body.querySelector('.case-failed td'), '::after').backgroundColor,
  }));
  expect(colors).toEqual({ pass: 'rgb(16, 57, 45)', fail: 'rgb(64, 27, 48)' });
  await expect(page.getByRole('button', { name: 'Ver resultado', exact: true })).toHaveCount(
    0,
  );
  await page.clock.runFor(680);
  await expect(page.getByText('3 de 4 combinaciones correctas · 0 compuertas')).toBeVisible();
  await expect(page.locator('.objective-table .case-passed')).toHaveCount(3);
  await expect(page.locator('.results-table .case-failed')).toHaveCount(1);
  await expect(
    page.getByRole('complementary', { name: 'Optimización del circuito' }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels,
    ),
  ).toEqual({});
  await page.clock.runFor(300);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).unlockedLevel,
    ),
  ).toBe(1);
});

test('editing cancels playback and selected nodes have no large selection rectangle', async ({
  page,
}) => {
  await seed(page, referenceCircuit(1));
  await page.goto('/puzzle/1');
  await page.locator('.react-flow__node-gate').click();
  const node = page.locator('.react-flow__node-gate');
  await expect(node).toHaveClass(/selected/);
  expect(await node.evaluate((element) => getComputedStyle(element).boxShadow)).toBe('none');
  const selection = page.locator('.react-flow__nodesselection-rect');
  if (await selection.count()) {
    expect(await selection.evaluate((element) => getComputedStyle(element).borderStyle)).toBe(
      'none',
    );
  }
  await freeze(page);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await page.clock.runFor(360);
  await page.getByRole('button', { name: 'Eliminar AND 1' }).click();
  await expect(page.locator('.test-results')).toHaveCount(0);
  await expect(page.locator('.board-panel')).toHaveAttribute('data-review', 'idle');
  await page.clock.runFor(5000);
  await expect(
    page.getByRole('complementary', { name: 'Optimización del circuito' }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels,
    ),
  ).toEqual({});
  await expect(page.locator('.react-flow__edge')).toHaveCount(0);
});

test('a connected gate and its wires stay visible throughout dragging', async ({
  page,
}, testInfo) => {
  await seed(page, referenceCircuit(1));
  await page.goto('/puzzle/1');
  await page.locator('.react-flow__edge-path').first().waitFor();
  const gate = page.locator('.react-flow__node-gate');
  await gate.scrollIntoViewIfNeeded();
  const box = await gate.boundingBox();
  const point = { x: box.x + box.width * 0.55, y: box.y + box.height * 0.55 };
  const samples = [];
  const sample = () =>
    page.evaluate(() => ({
      edges: document.querySelectorAll('.react-flow__edge-path').length,
      visibility: getComputedStyle(document.querySelector('.react-flow__node-gate'))
        .visibility,
    }));
  if (testInfo.project.name === 'touch') {
    const client = await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point],
    });
    for (let step = 1; step <= 8; step += 1) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point.x + step * 8, y: point.y + step * 4 }],
      });
      samples.push(await sample());
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await client.detach();
  } else {
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    for (let step = 1; step <= 8; step += 1) {
      await page.mouse.move(point.x + step * 8, point.y + step * 4);
      samples.push(await sample());
    }
    await page.mouse.up();
  }
  expect(samples).toEqual(Array(8).fill({ edges: 3, visibility: 'visible' }));
  await expect(page.locator('.react-flow__edge-path')).toHaveCount(3);
});

test('formula hints cover multiple outputs and distractors in advanced levels', async ({
  page,
}) => {
  await seed(page, referenceCircuit(25), 25);
  await page.goto('/puzzle/25');
  await expect(page.locator('.puzzle-hint-content')).not.toBeVisible();
  await page.locator('.puzzle-hint summary').click();
  await expect(page.locator('.hint-formulas code')).toHaveText(['A ⊕ B ⊕ C', 'AB + C(A ⊕ B)']);
  await expect(page.getByRole('button', { name: 'Añadir NOT. 1 disponibles' })).toBeEnabled();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('heading', { name: '¡Circuito correcto!' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(page.locator('.objective-table .case-passed')).toHaveCount(8);
});

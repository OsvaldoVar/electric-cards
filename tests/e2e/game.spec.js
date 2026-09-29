import { test, expect } from '@playwright/test';

async function addAnd(page) {
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
}
async function wire(page, source, targetLabel) {
  const details = page.locator('.connection-details');
  if (!((await details.getAttribute('open')) !== null))
    await details.locator('summary').click();
  await page
    .getByRole('combobox', { name: 'Origen del cable' })
    .selectOption({ label: source });
  await page
    .getByRole('combobox', { name: 'Destino del cable' })
    .selectOption({ label: targetLabel });
  await page.getByRole('button', { name: 'Conectar', exact: true }).click();
}
async function solveAndWithSelectors(page) {
  await addAnd(page);
  await wire(page, 'Sensor A', 'AND 1 · entrada A');
  await wire(page, 'Sensor B', 'AND 1 · entrada B');
  await wire(page, 'AND 1', 'Puerta · entrada única');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('heading', { name: '¡Circuito resuelto!' })).toBeVisible();
}

test('puzzles work when randomUUID is unavailable on HTTP mobile development', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto('/puzzle/1');
  await solveAndWithSelectors(page);
});

test('complete a level, inspect all cases, persist progress and open next level', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/puzzle/1');
  await solveAndWithSelectors(page);
  await expect(page.getByText('4 de 4 combinaciones correctas · 1 compuerta')).toBeVisible();
  await page.getByText('Ver todas las pruebas', { exact: false }).click();
  await expect(page.locator('.results-table tbody tr')).toHaveCount(4);
  await page.getByRole('button', { name: 'Ver combinación 4' }).click();
  await expect(page.locator('.output-node .node-bit')).toHaveText('1');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('electric-cards:v1'))?.completedLevels?.[1]?.stars,
      ),
    )
    .toBe(3);
  await page.reload();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await page.getByRole('link', { name: 'Siguiente nivel' }).click();
  await expect(page.getByRole('heading', { name: 'Cualquier señal' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile/native tap wiring completes a level', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'touch', 'Requires touch emulation');
  await page.goto('/puzzle/1');
  await addAnd(page);
  const gate = page.locator('.react-flow__node-gate');
  await page.getByTestId('port-input-A-out').tap();
  await gate.locator('[data-handleid="a"]').tap();
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await page.getByTestId('port-input-B-out').tap();
  await gate.locator('[data-handleid="b"]').tap();
  await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  await gate.locator('[data-handleid="out"]').tap();
  await page.getByTestId('port-output-DOOR-in').tap();
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await page.getByRole('button', { name: 'Probar circuito' }).tap();
  await expect(page.getByRole('heading', { name: '¡Circuito resuelto!' })).toBeVisible();
});

test('inventory cannot go negative, deletion removes wires and returns a card', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  await addAnd(page);
  await expect(page.getByRole('button', { name: 'Añadir AND. 0 disponibles' })).toBeDisabled();
  await wire(page, 'Sensor A', 'AND 1 · entrada A');
  await page.getByRole('button', { name: 'Eliminar AND 1' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(0);
  await expect(page.locator('.react-flow__edge')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Añadir AND. 1 disponibles' })).toBeEnabled();
  await addAnd(page);
});

test('validation reports a hidden failing combination and edits clear stale results', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  await wire(page, 'Sensor A', 'Puerta · entrada única');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByText('3 de 4 combinaciones correctas · 0 compuertas')).toBeVisible();
  await expect(page.locator('.case-failed')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ver combinación 3' }).click();
  await expect(page.locator('.output-node .node-bit')).toHaveText('1');
  await page.getByRole('button', { name: 'Desconectar Entrada de Puerta' }).click();
  await expect(page.locator('.test-results')).toHaveCount(0);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(
    page.getByText('Faltan entradas por conectar. Revisa los puertos marcados.', {
      exact: false,
    }),
  ).toBeVisible();
});

test('reset clears draft without removing earned stars', async ({ page }) => {
  await page.goto('/puzzle/1');
  await solveAndWithSelectors(page);
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await page.getByRole('button', { name: 'Vaciar tablero' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(0);
  await expect(page.locator('.puzzle-topbar .stars')).toHaveAttribute(
    'aria-label',
    '3 de 3 estrellas',
  );
  await expect(page.locator('.output-node .node-bit')).toHaveText('?');
});

test('locked routes stay locked and educational simulator works', async ({ page }) => {
  await page.goto('/puzzle/20');
  await expect(page.getByRole('heading', { name: 'Una señal a la vez.' })).toBeVisible();
  await page.goto('/learn/xnor');
  await expect(page.getByText('Y = 1')).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar entrada A' }).click();
  await expect(page.getByText('Y = 0')).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar entrada B' }).click();
  await expect(page.getByText('Y = 1')).toBeVisible();
});

for (const [width, height] of [
  [360, 800],
  [768, 1024],
  [1366, 768],
  [1920, 1080],
]) {
  test(`responsive layout ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const path of ['/', '/levels', '/learn', '/learn/and', '/puzzle/1']) {
      await page.goto(path);
      await page.locator('main').waitFor();
      await expect
        .poll(() =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        )
        .toBe(true);
    }
    await expect(page.getByTestId('circuit-board')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ajustar tablero' })).toBeVisible();
  });
}

test('connection form rejects cycles and self-links before adding a wire', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  await addAnd(page);
  await page.getByRole('button', { name: 'Añadir OR. 1 disponibles' }).click();
  await wire(page, 'AND 1', 'OR 2 · entrada A');
  await wire(page, 'OR 2', 'AND 1 · entrada A');
  await expect(page.getByRole('alert')).toContainText('crea un ciclo');
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await wire(page, 'AND 1', 'AND 1 · entrada B');
  await expect(page.getByRole('alert')).toContainText('conectarse a sí misma');
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
});

test('nodes move with mouse or touch and fit view recovers the board', async ({
  page,
}, testInfo) => {
  await page.goto('/puzzle/1');
  await addAnd(page);
  const gate = page.locator('.react-flow__node-gate');
  await gate.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const draft = JSON.parse(localStorage.getItem('electric-cards:v1'))?.drafts?.[1];
        return Number.isFinite(
          draft?.circuit.nodes.find((node) => node.type === 'gate')?.position.x,
        );
      }),
    )
    .toBe(true);
  const savedStart = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('electric-cards:v1')).drafts[1].circuit.nodes.find(
        (node) => node.type === 'gate',
      ).position.x,
  );
  const start = await gate.boundingBox();
  const point = { x: start.x + start.width * 0.55, y: start.y + start.height * 0.55 };
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
  await expect
    .poll(async () => Math.abs((await gate.boundingBox()).x - start.x))
    .toBeGreaterThan(20);
  await page.getByRole('button', { name: 'Ajustar tablero' }).click();
  await expect(gate).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const draft = JSON.parse(localStorage.getItem('electric-cards:v1'))?.drafts?.[1];
        return draft?.circuit.nodes.find((node) => node.type === 'gate')?.position.x;
      }),
    )
    .toBeGreaterThan(savedStart + 20);
  await page.getByRole('button', { name: 'Organizar tablero' }).click();
  await expect(gate).toBeVisible();
});

test('changing screen layout keeps wires attached to their ports', async ({
  page,
}, testInfo) => {
  await page.goto('/puzzle/1');
  await solveAndWithSelectors(page);
  await page.setViewportSize(
    testInfo.project.name === 'touch'
      ? { width: 1366, height: 768 }
      : { width: 360, height: 800 },
  );
  await page.getByRole('button', { name: 'Organizar tablero' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const port = document.querySelector('[data-testid="port-input-A-out"]');
        const path = document.querySelector('.react-flow__edge-path');
        const box = port.getBoundingClientRect();
        const start = path.getPointAtLength(0);
        const point = new DOMPoint(start.x, start.y).matrixTransform(path.getScreenCTM());
        const vertical = window.matchMedia('(max-width: 600px)').matches;
        const expected = vertical
          ? { x: box.x + box.width / 2, y: box.bottom }
          : { x: box.right, y: box.y + box.height / 2 };
        return Math.hypot(point.x - expected.x, point.y - expected.y);
      }),
    )
    .toBeLessThan(2);
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('heading', { name: '¡Circuito resuelto!' })).toBeVisible();
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
});

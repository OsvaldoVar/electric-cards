import { test, expect } from './returning-player';
import { wire, selectWire, seedProgress } from './helpers';
import { sanitizeGame } from '../../src/services/storage';

test('disconnect controls belong only to the selected wire and clear on deselection', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await wire(page, 'Sensor A', 'AND 1 · entrada A');
  await wire(page, 'Sensor B', 'AND 1 · entrada B');
  await wire(page, 'AND 1', 'Puerta · entrada única');
  await expect(page.locator('.port-clear')).toHaveCount(0);
  await expect(page.locator('.wire-remove')).toHaveCount(0);

  await selectWire(page, 0);
  await expect(
    page.getByRole('button', { name: 'Desconectar Entrada A de AND 1', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.port-clear')).toHaveCount(1);
  await expect(page.locator('.wire-remove')).toHaveCount(1);
  await page.locator('.gate-node > svg').click();
  await expect(page.locator('.port-clear')).toHaveCount(0);
  await expect(page.locator('.wire-remove')).toHaveCount(0);

  await selectWire(page, 1);
  await expect(
    page.getByRole('button', { name: 'Desconectar Entrada B de AND 1', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.port-clear')).toHaveCount(1);
  await page.locator('.react-flow__pane').click({ position: { x: 8, y: 8 } });
  await expect(page.locator('.port-clear')).toHaveCount(0);

  await selectWire(page, 2);
  await page
    .getByRole('button', { name: 'Desconectar Entrada de Puerta', exact: true })
    .click();
  await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  await expect(page.locator('.port-clear')).toHaveCount(0);
  await expect(page.locator('.wire-remove')).toHaveCount(0);
  // Keyboard selection must expose the same disconnect actions.
  await page.locator('.react-flow__edge').first().focus();
  await page.locator('.react-flow__edge').first().press('Enter');
  await expect(page.locator('.port-clear')).toHaveCount(1);
  const remove = page.getByRole('button', { name: 'Eliminar cable seleccionado' });
  await remove.focus();
  await remove.press('Enter');
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
});

test('learning detour preserves the active level and draft through collection and reload', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await wire(page, 'Sensor A', 'AND 1 · entrada A');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('electric-cards:v1'))?.drafts?.[1]?.circuit.edges
            .length,
      ),
    )
    .toBe(1);
  const draft = await page.evaluate(
    () => JSON.parse(localStorage.getItem('electric-cards:v1')).drafts[1],
  );
  await page.getByRole('link', { name: 'Aprender AND', exact: true }).click();
  await expect(page).toHaveURL(/\/learn\/and\?from=1$/);
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Volver al nivel 1' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Volver a la colección' }).click();
  await expect(page).toHaveURL(/\/learn\?from=1$/);
  await page.locator('.gate-card').first().click();
  await page.reload();
  await page
    .locator('.detail-actions')
    .getByRole('link', { name: 'Volver al nivel 1' })
    .click();
  await expect(page).toHaveURL(/\/puzzle\/1$/);
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('electric-cards:v1')).drafts[1]),
  ).toEqual(sanitizeGame({ version: 1, drafts: { 1: draft } }).drafts[1]);

  await page.getByRole('navigation').getByRole('link', { name: 'Compuertas' }).click();
  await expect(page).toHaveURL(/\/learn\?from=1$/);
  await page.getByRole('banner').getByRole('link', { name: 'Volver al nivel 1' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 1', exact: true })).toBeVisible();
});

test('direct learning visits do not invent a return level or accept an invalid origin', async ({
  page,
}) => {
  for (const path of [
    '/learn',
    '/learn/and',
    '/learn/and?from=999',
    '/learn/and?from=https://example.com',
  ]) {
    await page.goto(path);
    await page.locator('main').waitFor();
    await expect(page.getByRole('link', { name: /Volver al nivel/ })).toHaveCount(0);
  }
  await expect(page.getByRole('link', { name: 'Llévala al tablero' })).toHaveAttribute(
    'href',
    '/levels',
  );
});

for (const [width, height] of [
  [360, 800],
  [768, 1024],
  [1366, 768],
  [1920, 1080],
]) {
  test(`learning return fits ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const path of ['/learn?from=1', '/learn/and?from=1']) {
      await page.goto(path);
      await expect(
        page.getByRole('banner').getByRole('link', { name: 'Volver al nivel 1' }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
  });
}

test('return navigation follows the current level rather than defaulting to the first', async ({
  page,
}) => {
  await seedProgress(page, 2);
  await page.goto('/puzzle/3');
  await page.getByRole('navigation').getByRole('link', { name: 'Compuertas' }).click();
  await expect(page).toHaveURL(/\/learn\?from=3$/);
  await page.getByRole('banner').getByRole('link', { name: 'Volver al nivel 3' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 3', exact: true })).toBeVisible();
});

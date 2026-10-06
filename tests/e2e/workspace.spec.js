import { test, expect } from '@playwright/test';
import { seedProgress } from './helpers';
import { referenceCircuit } from '../fixtures/solutions';

async function geometry(page) {
  return page.evaluate(() =>
    ['.board-heading', '.puzzle-sidebar', '.board-panel', '.circuit-canvas'].map(
      (selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height].map(Math.round);
      },
    ),
  );
}

test('testing, dismissing success and continuing preserve workspace geometry', async ({
  page,
}) => {
  await seedProgress(page, 2, { 3: { circuit: referenceCircuit(3), inputs: { A: 0 } } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/puzzle/3');
  await page.locator('.react-flow__edge-path').first().waitFor();
  await expect(page.getByText('Tu circuito', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Listo para probar', { exact: true })).toHaveCount(0);
  await expect(page.locator('.connection-details')).toHaveCount(0);
  await expect(page.locator('.objective-table thead th')).toHaveText(['A', 'Bandera']);
  const heading = page.locator('.board-heading');
  await expect(heading.getByRole('heading', { name: 'Nivel 3', exact: true })).toBeVisible();
  await expect(heading.getByRole('button', { name: 'Organizar tablero' })).toBeVisible();
  const testButton = heading.getByRole('button', { name: 'Probar circuito' });
  await expect(testButton).toHaveCSS('background-color', 'rgb(255, 211, 78)');
  await expect(testButton).toHaveCSS('color', 'rgb(9, 13, 31)');
  await expect(heading.getByRole('button', { name: 'Reiniciar', exact: true })).toBeVisible();
  const initial = await geometry(page);
  const viewportTransform = await page.locator('.react-flow__viewport').getAttribute('style');
  const controls = await page.locator('.puzzle-controls').boundingBox();
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  const dialog = page.getByRole('dialog', { name: '¡Circuito correcto!' });
  await expect(dialog).toBeVisible();
  expect(await geometry(page)).toEqual(initial);
  await dialog.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(dialog).not.toBeVisible();
  expect(await geometry(page)).toEqual(initial);
  expect(await page.locator('.react-flow__viewport').getAttribute('style')).toBe(
    viewportTransform,
  );
  expect(await page.locator('.puzzle-controls').boundingBox()).toEqual(controls);
  await expect(page.getByRole('button', { name: 'Probar circuito' })).toBeFocused();
  await expect(page.locator('.puzzle-success-banner')).toHaveCount(0);
  await expect(page.locator('.test-success-actions')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver resultado', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await dialog.getByRole('button', { name: 'Siguiente nivel' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 4', exact: true })).toBeVisible();
  expect(await geometry(page)).toEqual(initial);
});

test('the map stays at upper left and navigation precedes the brand at upper right', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  const map = page.getByRole('link', { name: 'Mapa de niveles', exact: true });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(9, 13, 31)');
  await expect(map).toHaveCSS('background-color', 'rgb(255, 211, 78)');
  await expect(map).toHaveCSS('color', 'rgb(9, 13, 31)');
  const mapBox = await map.boundingBox();
  const settings = await page
    .getByRole('button', { name: 'Configuraciones', exact: true })
    .boundingBox();
  expect(settings.x + settings.width).toBeLessThanOrEqual(mapBox.x);
  const nav = await page.getByRole('navigation').boundingBox();
  const brand = await page.getByRole('link', { name: 'Electric Cards, inicio' }).boundingBox();
  expect(mapBox.x).toBeLessThan(nav.x);
  expect(nav.x + nav.width).toBeLessThanOrEqual(brand.x);
  expect(brand.x + brand.width).toBeGreaterThan(page.viewportSize().width - 32);
  expect(mapBox.y).toBeLessThan(24);
  await map.click();
  await expect(page.getByRole('link', { name: 'Nivel 1', exact: true })).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Nivel 2. Bloqueado', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Acceso doble', { exact: true })).toHaveCount(0);
});

for (const [width, height] of [
  [360, 800],
  [640, 800],
  [768, 1024],
  [844, 390],
  [1280, 720],
  [1366, 768],
  [1600, 900],
  [1920, 1080],
]) {
  test(`board and tools fit the viewport at ${width}×${height}, including expanded tools`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await seedProgress(page, 34);
    for (const id of [1, 25, 28, 35]) {
      await page.goto(`/puzzle/${id}`);
      await expect(page.getByTestId('circuit-board')).toBeVisible();
      const initial = await geometry(page);
      await page.locator('.puzzle-hint summary').click();
      expect(await geometry(page)).toEqual(initial);
      const bounds = await page.evaluate(() => {
        const elements = ['.board-panel', '.puzzle-sidebar'].map((selector) => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
        });
        return {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          elements,
        };
      });
      expect(bounds.width).toBeLessThanOrEqual(width);
      expect(bounds.height).toBeLessThanOrEqual(height);
      for (const rect of bounds.elements) {
        expect(rect.top).toBeGreaterThanOrEqual(0);
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.bottom).toBeLessThanOrEqual(height);
        expect(rect.right).toBeLessThanOrEqual(width);
      }
      if (width > 700) {
        expect(bounds.elements[1].right).toBeLessThan(bounds.elements[0].left);
      }
    }
  });
}

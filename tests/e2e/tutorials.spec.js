import { test, expect } from '@playwright/test';
import { referenceCircuit } from '../fixtures/solutions';

const tutorial = (page) => page.getByRole('dialog', { name: /Cómo funciona/ });

test('first component simulates, persists, replays and returns to the same circuit', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  const dialog = tutorial(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Cómo funciona AND' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cambiar entrada A' }).click();
  await expect(dialog.getByText('Y = 0')).toBeVisible();
  await dialog.getByRole('button', { name: 'Cambiar entrada B' }).click();
  await expect(dialog.getByText('Y = 1')).toBeVisible();
  await dialog.getByRole('button', { name: 'Volver al circuito' }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await expect(dialog).not.toBeVisible();
  await page.getByText('Mini tutoriales de este nivel', { exact: true }).click();
  await page.getByRole('button', { name: 'Repasar AND', exact: true }).click();
  await expect(dialog.getByText('Y = 0')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Repasar AND', exact: true })).toBeFocused();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('electric-cards:v1')),
  );
  expect(saved.seenTutorials).toEqual({ AND: true });
  expect(saved.completedLevels).toEqual({});
});

test('a skipped-stage memory challenge introduces every unfamiliar component in sequence', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'electric-cards:v1',
      JSON.stringify({
        version: 1,
        completedLevels: Object.fromEntries(
          [38, 42, 43].map((id) => [id, { completed: true, bestGateCount: 3 }]),
        ),
        drafts: {},
      }),
    ),
  );
  await page.goto('/puzzle/44');
  const dialog = tutorial(page);
  await expect(dialog).toBeVisible();
  const found = [];
  while (await dialog.isVisible()) {
    const title = await dialog.getByRole('heading').innerText();
    found.push(title.replace('Cómo funciona ', ''));
    if (title.endsWith('DFF')) {
      await dialog.getByRole('button', { name: 'Cambiar entrada D' }).click();
      await dialog.getByRole('button', { name: 'Avanzar reloj' }).click();
      await expect(dialog.locator('output')).toHaveText('CLK = 1 · Q = 1');
      await dialog.getByRole('button', { name: 'Cambiar entrada D' }).click();
      await expect(dialog.locator('output')).toHaveText('CLK = 1 · Q = 1');
    }
    if (title.endsWith('CLOCK')) {
      await dialog.getByRole('button', { name: 'Avanzar reloj' }).click();
      await expect(dialog.locator('output')).toHaveText('CLK = 1');
    }
    if (title.endsWith('TFF')) {
      await dialog.getByRole('button', { name: 'Cambiar entrada T' }).click();
      await dialog.getByRole('button', { name: 'Avanzar reloj' }).click();
      await expect(dialog.locator('output')).toHaveText('CLK = 1 · Q = 1');
      await dialog.getByRole('button', { name: 'Avanzar reloj' }).click();
      await expect(dialog.locator('output')).toHaveText('CLK = 0 · Q = 1');
      await dialog.getByRole('button', { name: 'Avanzar reloj' }).click();
      await expect(dialog.locator('output')).toHaveText('CLK = 1 · Q = 0');
    }
    await dialog
      .getByRole('button', { name: /Siguiente componente|Volver al circuito/ })
      .click();
  }
  expect(found).toEqual(expect.arrayContaining(['CLOCK', 'DFF', 'TFF', 'NOT']));
  expect(new Set(found).size).toBe(found.length);
  await page.waitForTimeout(350);
  await page.reload();
  await expect(dialog).not.toBeVisible();
});

for (const [width, height] of [
  [360, 800],
  [768, 1024],
  [1366, 768],
  [1920, 1080],
]) {
  test(`tutorial is bounded and keyboard accessible at ${width}x${height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto('/puzzle/1');
    await expect(tutorial(page)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('tutorial.png') });
    const bounds = await tutorial(page).boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height);
    const overflow = await tutorial(page).evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflow).toBe(false);
    await page.keyboard.press('Tab');
    expect(await tutorial(page).evaluate((el) => el.contains(document.activeElement))).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(tutorial(page)).not.toBeVisible();
  });
}

test('a legacy draft keeps its circuit while introducing a new tutorial', async ({ page }) => {
  const circuit = referenceCircuit(1);
  await page.addInitScript(
    (circuit) =>
      localStorage.setItem(
        'electric-cards:v1',
        JSON.stringify({
          version: 1,
          completedLevels: {},
          drafts: { 1: { circuit, inputs: { A: 0, B: 0 } } },
        }),
      ),
    circuit,
  );
  await page.goto('/puzzle/1');
  await expect(tutorial(page)).toBeVisible();
  await tutorial(page).getByRole('button', { name: 'Volver al circuito' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
});

test('unavailable storage keeps tutorials and circuit usable during the session', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage unavailable');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable');
    };
  });
  await page.goto('/puzzle/1');
  await expect(tutorial(page)).toBeVisible();
  await tutorial(page).getByRole('button', { name: 'Volver al circuito' }).click();
  await expect(tutorial(page)).not.toBeVisible();
  await expect(
    page.getByText('El guardado no está disponible en este navegador.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
});

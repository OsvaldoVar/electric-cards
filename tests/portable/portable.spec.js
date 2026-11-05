import { test, expect } from '@playwright/test';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { wire } from '../e2e/helpers';

// A regression to external assets or BrowserRouter must break these real file:// tests.
// Each test receives just one renamed HTML in an otherwise empty directory, with no server.
const artifact = resolve(process.env.PORTABLE_HTML ?? 'dist-portable/Electric-Cards.html');
const failures = new WeakMap();

async function openRoute(page, route) {
  const url = new URL(page.url());
  url.hash = route;
  await page.goto(url.href);
}

test.beforeEach(async ({ context, page }, testInfo) => {
  const destination = testInfo.outputPath('archivo compartido', 'Juego de mi amigo.html');
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(artifact, destination);
  const url = pathToFileURL(destination).href;
  const errors = [];
  failures.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    const requested = request.url();
    if (!requested.startsWith('data:') && !requested.startsWith('blob:')) {
      if (requested.split('#')[0] !== url) errors.push(`Recurso externo: ${requested}`);
    }
  });
  page.on('requestfailed', (request) => errors.push(`No cargó: ${request.url()}`));
  await context.setOffline(true);
  await page.goto(url);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Construye circuitos');
});

test.afterEach(async ({ page }) => {
  expect(failures.get(page)).toEqual([]);
});

test('one copied HTML opens offline with fonts, tutorial art and a complete persisted puzzle', async ({
  page,
}, testInfo) => {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      [...document.fonts].some(
        (font) => font.family.includes('Pixelify') && font.status === 'loaded',
      ),
    ),
  ).toBe(true);
  await page.getByRole('link', { name: 'Empezar a jugar' }).click();
  await expect(page).toHaveURL(/#\/puzzle\/1$/);
  const tutorial = page.getByRole('dialog', { name: 'Cómo funciona AND' });
  await expect(tutorial).toBeVisible();
  const image = tutorial.locator('.tutorial-guide');
  await expect(image).toHaveJSProperty('complete', true);
  expect(await image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  await tutorial.getByRole('button', { name: 'Volver al circuito' }).click();
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  if (testInfo.project.name === 'touch') {
    const gate = page.locator('.react-flow__node-gate');
    await page.getByTestId('port-input-A-out').tap();
    await gate.locator('[data-handleid="a"]').tap();
    await page.getByTestId('port-input-B-out').tap();
    await gate.locator('[data-handleid="b"]').tap();
    await gate.locator('[data-handleid="out"]').tap();
    await page.getByTestId('port-output-DOOR-in').tap();
  } else {
    await wire(page, 'Sensor A', 'AND 1 · entrada A');
    await wire(page, 'Sensor B', 'AND 1 · entrada B');
    await wire(page, 'AND 1', 'Puerta · entrada única');
  }
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('heading', { name: '¡Circuito correcto!' })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('electric-cards:v1'))?.completedLevels?.[1]
            ?.completed,
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nivel 1', exact: true })).toBeVisible();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await expect(tutorial).not.toBeVisible();
  await page.getByRole('link', { name: 'Mapa de niveles' }).click();
  await expect(page.getByRole('link', { name: 'Nivel 1', exact: true })).toContainText(
    'Completado',
  );
});

test('hash navigation, history, reload and learning simulators stay inside the local file', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Compuertas', exact: true }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await openRoute(page, '/learn/and');
  await expect(page.getByText('Y = 0', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar entrada A' }).click();
  await page.getByRole('button', { name: 'Cambiar entrada B' }).click();
  await expect(page.getByText('Y = 1', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.gate-simulator')).toBeVisible();
  const routeBeforeSkip = page.url();
  await page.getByRole('link', { name: 'Saltar al contenido' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(routeBeforeSkip);
  await expect(page.locator('#main-content')).toBeFocused();
  await page.getByRole('link', { name: 'Volver a la colección' }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/learn\/and$/);
  await page.getByRole('button', { name: 'Configuraciones', exact: true }).click();
  const toggle = page.getByRole('switch', { name: 'Modo oscuro' });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('reduced motion portrait and storage failure remain usable offline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage disabled', 'SecurityError');
    };
  });
  await page.reload();
  await openRoute(page, '/puzzle/1');
  const tutorial = page.getByRole('dialog', { name: 'Cómo funciona AND' });
  await expect(tutorial).toBeVisible();
  await expect
    .poll(() => tutorial.locator('.tutorial-guide').evaluate((image) => image.currentSrc))
    .toMatch(/^data:image\/png/);
  expect(
    await tutorial.locator('.tutorial-guide').evaluate((image) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await tutorial.getByRole('button', { name: 'Volver al circuito' }).click();
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await expect(page.getByRole('status')).toContainText(/guardado|guardar/i);
});

test('clock and memory simulators preserve rising-edge behavior offline', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'electric-cards:v1',
      JSON.stringify({
        version: 1,
        completedLevels: Object.fromEntries(
          [38, 42, 43].map((id) => [id, { completed: true, bestGateCount: 3 }]),
        ),
        drafts: {},
      }),
    );
  });
  await page.reload();
  await openRoute(page, '/learn/CLOCK');
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('.gate-simulator output')).toHaveText('CLK = 1');
  await openRoute(page, '/learn/DFF');
  await page.getByRole('button', { name: 'Cambiar entrada D' }).click();
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('.gate-simulator output')).toHaveText('CLK = 1 · Q = 1');
  await page.getByRole('button', { name: 'Cambiar entrada D' }).click();
  await expect(page.locator('.gate-simulator output')).toHaveText('CLK = 1 · Q = 1');
  await openRoute(page, '/learn/TFF');
  await page.getByRole('button', { name: 'Cambiar entrada T' }).click();
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('.gate-simulator output')).toHaveText('CLK = 1 · Q = 1');
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('.gate-simulator output')).toHaveText('CLK = 0 · Q = 1');
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('.gate-simulator output')).toHaveText('CLK = 1 · Q = 0');
});

for (const [width, height] of [
  [360, 800],
  [768, 1024],
  [1366, 768],
  [1920, 1080],
]) {
  test(`offline layout remains usable at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const route of ['/levels', '/learn', '/learn/and', '/puzzle/1']) {
      await openRoute(page, route);
      await expect(page.locator('main')).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        )
        .toBe(true);
    }
    await expect(page.getByRole('dialog', { name: 'Cómo funciona AND' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Volver al circuito' }).click();
    await expect(page.getByTestId('circuit-board')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ajustar tablero' })).toBeVisible();
  });
}

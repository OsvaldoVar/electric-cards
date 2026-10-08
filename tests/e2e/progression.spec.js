import { test, expect } from './returning-player';
import { seedProgress, wire } from './helpers';
import { referenceCircuit } from '../fixtures/solutions';

test('completion opens a focused dialog and continues to the next lesson', async ({
  page,
}) => {
  await page.goto('/puzzle/1');
  await expect(page.getByRole('button', { name: 'Añadir OR. 1 disponibles' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Añadir AND. 1 disponibles' })).toBeVisible();
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await wire(page, 'Sensor A', 'AND 1 · entrada A');
  await wire(page, 'Sensor B', 'AND 1 · entrada B');
  await wire(page, 'AND 1', 'Puerta · entrada única');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  const dialog = page.getByRole('dialog', { name: '¡Circuito correcto!' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.completion-unlock')).toHaveCount(0);
  const next = dialog.getByRole('button', { name: 'Siguiente nivel' });
  await expect(next).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Seguir explorando' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(next).toBeFocused();
  await next.click();
  await expect(page.getByRole('heading', { name: 'Nivel 2', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Añadir OR. 1 disponibles' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Añadir OR. 1 disponibles' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Compuertas' }).click();
  await expect(page.getByRole('link', { name: /^Compuerta OR:/ })).toBeVisible();
  await expect(
    page.getByRole('article', { name: /Compuerta CLOCK. Bloqueada/ }),
  ).toBeVisible();
  await page.goto('/learn/clock');
  await expect(page.getByRole('heading', { name: 'CLOCK está bloqueado' })).toBeVisible();
});

test('success dialog closes with Escape and last level returns to the map', async ({
  page,
}) => {
  await seedProgress(page, 40, {
    41: { circuit: referenceCircuit(41), inputs: { A: 0, B: 0, C: 0 } },
  });
  await page.goto('/puzzle/41');
  const testButton = page.getByRole('button', { name: 'Probar circuito' });
  await testButton.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(testButton).toBeFocused();
  await testButton.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Ver recorrido' }).click();
  await expect(page.getByRole('heading', { name: 'Mapa de niveles' })).toBeVisible();
  await expect(page.locator('.progress-summary-count')).toContainText('40');
});

test('build a D flip-flop, hold between edges, run and pause the clock, then complete the level', async ({
  page,
}) => {
  await seedProgress(page, 27);
  await page.goto('/puzzle/28');
  await page.getByRole('button', { name: 'Añadir CLOCK. 1 disponibles' }).click();
  await page.getByRole('button', { name: 'Añadir DFF. 1 disponibles' }).click();
  await wire(page, 'Sensor A', 'DFF 2 · entrada D');
  await wire(page, 'CLOCK 1', 'DFF 2 · entrada CLK');
  await wire(page, 'DFF 2', 'Bit guardado · entrada única');
  const input = page.getByRole('button', { name: 'Cambiar entrada A', exact: true });
  const q = page.locator('.output-node .node-bit');
  await expect(q).toHaveText('0');
  await input.click();
  await expect(q).toHaveText('0');
  await page.getByRole('button', { name: 'Avanzar reloj', exact: true }).click();
  await expect(q).toHaveText('1');
  await input.click();
  await expect(q).toHaveText('1');
  await page.getByRole('button', { name: 'Avanzar reloj', exact: true }).click();
  await expect(q).toHaveText('1');
  await page.getByRole('button', { name: 'Avanzar reloj', exact: true }).click();
  await expect(q).toHaveText('0');
  await page.clock.install();
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await page.getByRole('button', { name: 'Iniciar reloj' }).click();
  await page.clock.runFor(1000);
  await expect(page.locator('.clock-controls')).toContainText('CLK = 0');
  await page.getByRole('button', { name: 'Pausar reloj' }).click();
  await page.clock.runFor(2000);
  await expect(page.locator('.clock-controls')).toContainText('CLK = 0');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('dialog')).toContainText('Todas las secuencias');
  await page.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(page.locator('.puzzle-success-banner')).toHaveCount(0);
  await expect(page.locator('.board-review-status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reiniciar memoria' }).click();
  await expect(q).toHaveText('0');
  await expect(page.locator('.clock-controls')).toContainText('CLK = 0');
});

test('learning simulator for T holds on falling edges and alternates on enabled rising edges', async ({
  page,
}) => {
  await seedProgress(page, 31);
  await page.goto('/learn/tff');
  await page.getByRole('button', { name: 'Cambiar entrada T' }).click();
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('output')).toHaveText('CLK = 1 · Q = 1');
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('output')).toHaveText('CLK = 0 · Q = 1');
  await page.getByRole('button', { name: 'Avanzar reloj' }).click();
  await expect(page.locator('output')).toHaveText('CLK = 1 · Q = 0');
});

test('failed sequential wiring never opens a success popup', async ({ page }) => {
  const circuit = referenceCircuit(28);
  circuit.edges.find((edge) => edge.target === 'output-LED').source = 'input-A';
  await seedProgress(page, 27, { 28: { circuit, inputs: { A: 0 } } });
  await page.goto('/puzzle/28');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(
    page.getByRole('heading', { name: 'Todavía hay una señal que ajustar' }),
  ).toBeVisible();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.results-table .case-failed').first()).toBeVisible();
  await page.getByRole('button', { name: 'Ver paso 3 de secuencia 1', exact: true }).click();
  await expect(page.locator('.output-node .node-bit')).toHaveText('1');
});

import { test, expect } from './returning-player';
import { seedProgress } from './helpers';
import { referenceCircuit } from '../fixtures/solutions';

test('settings apply a persistent dark theme to every page and restore light appearance', async ({
  page,
}) => {
  // An explicit saved light preference must survive the new dark default.
  await page.addInitScript(() => {
    if (!localStorage.getItem('electric-cards:theme'))
      localStorage.setItem('electric-cards:theme', 'light');
  });
  await seedProgress(page, 34, {
    1: { circuit: referenceCircuit(1), inputs: { A: 0, B: 0 } },
  });
  await page.goto('/puzzle/1');
  const settings = page.getByRole('button', { name: 'Configuraciones', exact: true });
  await settings.click();
  const dialog = page.getByRole('dialog', { name: 'Configuraciones', exact: true });
  await expect(dialog.getByRole('switch', { name: 'Modo oscuro' })).not.toBeChecked();
  await dialog.getByRole('switch', { name: 'Modo oscuro' }).click();
  await expect(dialog).toHaveCSS('background-color', 'rgb(17, 22, 43)');
  await dialog.getByRole('button', { name: 'Cerrar configuraciones' }).click();
  await expect(settings).toBeFocused();
  await expect(page.locator('.board-panel')).toHaveCSS('background-color', 'rgb(17, 22, 43)');
  await expect(page.locator('.react-flow')).toHaveCSS('background-color', 'rgb(12, 17, 37)');
  await expect(page.locator('.puzzle-sidebar')).toHaveCSS('color', 'rgb(244, 242, 255)');
  await page.getByRole('button', { name: 'Probar circuito' }).press('Enter');
  const completion = page.getByRole('dialog', { name: '¡Circuito correcto!' });
  await expect(completion).toHaveCSS('background-color', 'rgb(17, 22, 43)');
  await completion.getByRole('button', { name: 'Seguir explorando' }).click();
  for (const [route, surface] of [
    ['/', '.home-lab-card'],
    ['/levels', '.world-section'],
    ['/learn', '.gate-card'],
    ['/learn/and', '.gate-description'],
  ]) {
    await page.goto(route);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(9, 13, 31)');
    await expect(page.locator(surface).first()).toHaveCSS(
      'background-color',
      'rgb(17, 22, 43)',
    );
    await expect(page.getByRole('button', { name: 'Configuraciones', exact: true })).toHaveCSS(
      'background-color',
      'rgb(255, 211, 78)',
    );
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await settings.click();
  await dialog.getByRole('switch', { name: 'Modo oscuro' }).click();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(settings).toBeFocused();
  await page.reload();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(238, 237, 247)');
});

for (const verdict of ['success', 'failure', 'incomplete']) {
  test(`every animation frame stays within the viewport during ${verdict} validation`, async ({
    page,
  }) => {
    const circuit = referenceCircuit(1);
    if (verdict === 'failure')
      circuit.edges.find((edge) => edge.targetHandle === 'b').source = 'input-A';
    if (verdict === 'incomplete') circuit.edges = [];
    await seedProgress(page, 1, { 1: { circuit, inputs: { A: 0, B: 0 } } });
    await page.goto('/puzzle/1');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByTestId('circuit-board').waitFor();
    await page.evaluate(() => {
      const rect = document.querySelector('.board-panel').getBoundingClientRect();
      const baseline = [rect.x, rect.y, rect.width, rect.height];
      window.frameAudit = { running: true, count: 0, failures: [] };
      function sample() {
        const root = document.documentElement;
        const current = document.querySelector('.board-panel').getBoundingClientRect();
        const bounds = [current.x, current.y, current.width, current.height];
        const overflow = root.scrollHeight > innerHeight || root.scrollWidth > innerWidth;
        const drift = bounds.some((value, index) => Math.abs(value - baseline[index]) > 0.5);
        window.frameAudit.count++;
        if (overflow || drift)
          window.frameAudit.failures.push({
            overflow,
            drift,
            bounds,
            height: root.scrollHeight,
          });
        if (window.frameAudit.running) requestAnimationFrame(sample);
      }
      sample();
    });
    await page.getByRole('button', { name: 'Probar circuito' }).click();
    if (verdict === 'success') {
      const popup = page.getByRole('dialog', { name: '¡Circuito correcto!' });
      await expect(popup).toBeVisible();
      await popup.getByRole('button', { name: 'Seguir explorando' }).click();
    } else {
      await expect(
        page.getByRole('heading', {
          name:
            verdict === 'failure'
              ? 'Todavía hay una señal que ajustar'
              : 'Completa las conexiones',
        }),
      ).toBeVisible();
    }
    const audit = await page.evaluate(() => {
      window.frameAudit.running = false;
      return window.frameAudit;
    });
    expect(audit.count).toBeGreaterThan(1);
    expect(audit.failures).toEqual([]);
  });
}

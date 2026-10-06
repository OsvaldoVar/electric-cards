const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const folder = '.impeccable/review/pixel';
  fs.mkdirSync(folder, { recursive: true });
  const demo = JSON.parse(fs.readFileSync('.impeccable/review/demo-progress.json', 'utf8'));
  const referenceDraft = JSON.parse(
    JSON.stringify(demo.drafts[1]).replaceAll('output-DOOR', 'output-LED'),
  );
  Object.assign(referenceDraft.circuit.nodes.find((n) => n.type === 'output').data, {
    outputId: 'LED',
    label: 'Luz de señal',
    visualType: 'led',
  });
  referenceDraft.inputs = { A: 0, B: 1 };
  const state = {
    ...demo,
    drafts: { ...demo.drafts, 2: referenceDraft },
    completedLevels: Object.fromEntries(
      Array.from({ length: 34 }, (_, i) => [i + 1, { completed: true, bestGateCount: 1 }]),
    ),
    unlockedLevel: 35,
  };
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const checks = [],
    errors = [];
  for (const [width, height] of [
    [1920, 1080],
    [1600, 900],
    [1366, 768],
    [1280, 720],
    [768, 1024],
    [844, 390],
    [640, 360],
    [360, 800],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    await context.addInitScript(
      (state) => localStorage.setItem('electric-cards:v1', JSON.stringify(state)),
      state,
    );
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    for (const [name, route] of [
      ['puzzle', '/puzzle/1'],
      ['reference', '/puzzle/2'],
      ['advanced', '/puzzle/25'],
      ['memory', '/puzzle/28'],
      ['map', '/levels'],
      ['home', '/'],
      ['collection', '/learn'],
      ['gate', '/learn/and'],
    ]) {
      await page.goto(`http://127.0.0.1:4173${route}`);
      await page.locator('main h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (route.startsWith('/puzzle/')) {
        await page.locator('.react-flow__node').first().waitFor();
        await page.getByRole('button', { name: 'Ajustar tablero', exact: true }).click();
      }
      if (name === 'reference') {
        await page.getByRole('button', { name: 'Probar circuito', exact: true }).click();
        if (width <= 600)
          await page.getByRole('button', { name: 'Organizar tablero' }).click();
        await page.locator('.react-flow__node-gate').click();
      }
      await page.waitForTimeout(120);
      await page.screenshot({ path: `${folder}/${name}-${width}.png` });
      checks.push(
        await page.evaluate(
          ({ name, width, height }) => {
            const selectors = [
              '.circuit-canvas',
              '.board-heading',
              '.board-actions',
              '.puzzle-sidebar',
              '.nav-inner',
            ];
            return {
              name,
              width,
              height,
              overflowX: document.documentElement.scrollWidth > innerWidth,
              overflowY:
                !!document.querySelector('.puzzle-page') &&
                document.documentElement.scrollHeight > innerHeight,
              bounds: Object.fromEntries(
                selectors.map((s) => [
                  s,
                  document.querySelector(s)?.getBoundingClientRect().toJSON(),
                ]),
              ),
            };
          },
          { name, width, height },
        ),
      );
      if (name === 'puzzle') {
        await page.getByRole('button', { name: 'Probar circuito', exact: true }).click();
        await page.getByRole('dialog', { name: '¡Circuito correcto!' }).waitFor();
        await page.screenshot({ path: `${folder}/completion-${width}.png` });
        await page.getByRole('button', { name: 'Seguir explorando' }).click();
        await page.getByRole('button', { name: 'Configuraciones', exact: true }).click();
        await page.screenshot({ path: `${folder}/settings-${width}.png` });
        await page.getByRole('switch', { name: 'Modo oscuro' }).click();
        await page.getByRole('button', { name: 'Cerrar configuraciones' }).click();
        await page.screenshot({ path: `${folder}/light-${width}.png` });
        await page.getByRole('button', { name: 'Configuraciones', exact: true }).click();
        await page.getByRole('switch', { name: 'Modo oscuro' }).click();
        await page.getByRole('button', { name: 'Cerrar configuraciones' }).click();
      }
    }
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(`${folder}/checks.json`, JSON.stringify({ checks, errors }, null, 2));
  console.log(
    JSON.stringify({
      checked: checks.length,
      failures: checks.filter((c) => c.overflowX || c.overflowY),
      errors,
    }),
  );
  if (errors.length || checks.some((c) => c.overflowX || c.overflowY)) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

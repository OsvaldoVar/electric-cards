const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const folder = '.impeccable/review/light-dark';
  fs.mkdirSync(folder, { recursive: true });
  const demo = JSON.parse(fs.readFileSync('.impeccable/review/demo-progress.json', 'utf8'));
  const state = {
    ...demo,
    completedLevels: Object.fromEntries(
      Array.from({ length: 34 }, (_, i) => [i + 1, { completed: true, bestGateCount: 1 }]),
    ),
    unlockedLevel: 35,
  };
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const errors = [],
    checks = [];
  for (const theme of ['light', 'dark']) {
    for (const [width, height] of [
      [360, 800],
      [640, 800],
      [768, 1024],
      [1366, 768],
      [1920, 1080],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: 'reduce',
      });
      await context.addInitScript(
        ({ state, theme }) => {
          localStorage.setItem('electric-cards:v1', JSON.stringify(state));
          localStorage.setItem('electric-cards:theme', theme);
        },
        { state, theme },
      );
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      for (const [name, route] of [
        ['puzzle', '/puzzle/1'],
        ['advanced', '/puzzle/25'],
        ['memory', '/puzzle/28'],
        ['map', '/levels'],
        ['home', '/'],
        ['collection', '/learn'],
        ['gate', '/learn/and'],
      ]) {
        await page.goto(`http://127.0.0.1:4173${route}`);
        await page.locator('main h1').waitFor();
        if (route.startsWith('/puzzle/'))
          await page.locator('.react-flow__node').first().waitFor();
        await page.waitForTimeout(250);
        await page.screenshot({ path: `${folder}/${theme}-${name}-${width}.png` });
        checks.push(
          await page.evaluate(
            ({ name, width, height }) => ({
              name,
              width,
              height,
              overflowX: document.documentElement.scrollWidth > innerWidth,
              overflowY:
                !!document.querySelector('.puzzle-page') &&
                document.documentElement.scrollHeight > innerHeight,
              board: document
                .querySelector('.circuit-canvas')
                ?.getBoundingClientRect()
                .toJSON(),
            }),
            { name, width, height },
          ),
        );
        if (name === 'puzzle') {
          await page.getByRole('button', { name: 'Configuraciones', exact: true }).click();
          await page.getByRole('dialog', { name: 'Configuraciones', exact: true }).waitFor();
          await page.screenshot({ path: `${folder}/${theme}-settings-${width}.png` });
          await page.getByRole('button', { name: 'Cerrar configuraciones' }).click();
          await page.getByRole('button', { name: 'Probar circuito' }).click();
          await page.getByRole('dialog').waitFor();
          await page.screenshot({ path: `${folder}/${theme}-popup-${width}.png` });
          await page.getByRole('button', { name: 'Seguir explorando' }).click();
          await page.screenshot({ path: `${folder}/${theme}-completed-${width}.png` });
        }
      }
      await context.close();
    }
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
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

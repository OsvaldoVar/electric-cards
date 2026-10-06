const { chromium } = require('@playwright/test');
const fs = require('node:fs');

(async () => {
  fs.mkdirSync('.impeccable/review/apple', { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const checks = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [width, height] of [[360, 800], [768, 1024], [1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    for (const [name, path] of [['home', '/'], ['levels', '/levels'], ['learn', '/learn'], ['gate', '/learn/xnor'], ['puzzle', '/puzzle/1'], ['not-found', '/missing']]) {
      await page.goto(`http://127.0.0.1:4173${path}`);
      await page.locator('main h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      checks.push({ name, width, height, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
      if (width === 360 || width === 1366) {
        await page.screenshot({ path: `.impeccable/review/apple/${name}-${width}.png` });
      }
    }
  }
  await context.close();
  const demo = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await demo.addInitScript((state) => localStorage.setItem('electric-cards:v1', state), fs.readFileSync('.impeccable/review/demo-progress.json', 'utf8'));
  const puzzle = await demo.newPage();
  puzzle.on('pageerror', (error) => errors.push(error.message));
  await puzzle.goto('http://127.0.0.1:4173/puzzle/1');
  await puzzle.getByRole('button', { name: 'Eliminar AND 1' }).waitFor();
  await puzzle.waitForTimeout(500);
  await puzzle.screenshot({ path: '.impeccable/review/apple/puzzle-connected.png' });
  await puzzle.getByRole('button', { name: 'Probar circuito' }).click();
  await puzzle.getByRole('heading', { name: '¡Circuito resuelto!' }).waitFor();
  await puzzle.locator('.test-results').scrollIntoViewIfNeeded();
  await puzzle.waitForTimeout(500);
  await puzzle.screenshot({ path: '.impeccable/review/apple/puzzle-success.png' });
  await demo.close();
  const seed = JSON.parse(fs.readFileSync('.impeccable/review/demo-progress.json', 'utf8'));
  for (const width of [360, 768, 1366, 1920]) {
    for (const correct of [true, false]) {
      const state = structuredClone(seed);
      if (!correct) {
        state.drafts[1].circuit.nodes = state.drafts[1].circuit.nodes.filter((node) => node.type !== 'gate');
        state.drafts[1].circuit.edges = [{ id: 'direct', source: 'input-A', sourceHandle: 'out', target: 'output-DOOR', targetHandle: 'in' }];
      }
      const review = await browser.newContext({ viewport: { width, height: width === 360 ? 800 : 900 } });
      await review.addInitScript((state) => localStorage.setItem('electric-cards:v1', JSON.stringify(state)), state);
      const screen = await review.newPage();
      screen.on('pageerror', (error) => errors.push(error.message));
      await screen.goto('http://127.0.0.1:4173/puzzle/1');
      await screen.locator('.react-flow__edge-path').first().waitFor();
      await screen.waitForTimeout(500);
      await screen.clock.install();
      await screen.clock.pauseAt((await screen.evaluate(() => Date.now())) + 1000);
      await screen.getByRole('button', { name: 'Probar circuito' }).click();
      await screen.clock.runFor(1400);
      const grade = correct ? 'passed' : 'failed';
      await screen.waitForFunction((grade) => document.querySelector('.board-panel').dataset.review === grade, grade);
      checks.push({ name: `review-${grade}`, width, height: 900, overflow: await screen.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
      if (width === 360 || width === 1366) {
        await screen.locator('.board-panel').scrollIntoViewIfNeeded();
        await screen.screenshot({ path: `.impeccable/review/apple/review-${grade}-${width}.png` });
        await screen.getByRole('button', { name: 'Ver resultado', exact: true }).click();
        await screen.locator('.puzzle-hint summary').click();
        await screen.locator('.puzzle-sidebar').screenshot({ path: `.impeccable/review/apple/hint-${grade}-${width}.png` });
      }
      await review.close();
    }
  }
  const result = { checks, errors };
  fs.writeFileSync('.impeccable/review/apple/checks.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ checks: checks.length, overflow: checks.filter((check) => check.overflow), errors }));
  await browser.close();
  if (errors.length || checks.some((check) => check.overflow)) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });

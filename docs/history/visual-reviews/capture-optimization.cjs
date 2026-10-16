const { chromium } = require('@playwright/test');
const fs = require('node:fs');

(async () => {
  const folder = '.impeccable/review/optimization';
  fs.mkdirSync(folder, { recursive: true });
  const state = JSON.parse(fs.readFileSync('.impeccable/review/demo-progress.json', 'utf8'));
  const circuit = state.drafts[1].circuit;
  circuit.nodes.push({ id: 'extra-or', type: 'gate', position: { x: 300, y: 250 }, data: { gateType: 'OR' } });
  for (const [source, targetHandle] of [['input-A', 'a'], ['input-B', 'b']]) {
    circuit.edges.push({ id: `extra-${targetHandle}`, source, sourceHandle: 'out', target: 'extra-or', targetHandle });
  }
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const checks = [];
  const errors = [];
  for (const [width, height] of [[360, 800], [768, 1024], [1366, 768], [1920, 1080]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    await context.addInitScript((state) => localStorage.setItem('electric-cards:v1', JSON.stringify(state)), state);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4174/puzzle/1');
    await page.getByRole('button', { name: 'Probar circuito' }).click();
    const note = page.getByRole('complementary', { name: 'Optimización del circuito' });
    await note.waitFor();
    await note.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${folder}/puzzle-${width}.png` });
    await note.screenshot({ path: `${folder}/note-${width}.png` });
    checks.push(await page.evaluate(({ width, height }) => ({
      width, height,
      overflow: document.documentElement.scrollWidth > innerWidth,
      color: getComputedStyle(document.querySelector('.puzzle-optimization-note')).color,
      background: getComputedStyle(document.querySelector('.puzzle-optimization-note')).backgroundColor,
      stars: /estrellas/i.test(document.body.innerText),
    }), { width, height }));
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(`${folder}/checks.json`, JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checks, errors }));
  if (errors.length || checks.some(check => check.overflow || check.stars || check.color !== 'rgb(0, 102, 204)')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

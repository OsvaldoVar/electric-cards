const { chromium } = require('@playwright/test');
const fs = require('node:fs');

(async () => {
  const folder = '.impeccable/review/progression';
  fs.mkdirSync(folder, { recursive: true });
  const demo = JSON.parse(fs.readFileSync('.impeccable/review/demo-progress.json', 'utf8'));
  const register = structuredClone(demo.drafts[1].circuit);
  register.nodes = register.nodes.filter(node => node.id !== 'input-B');
  const ff = register.nodes.find(node => node.type === 'gate');
  ff.data.gateType = 'DFF';
  const output = register.nodes.find(node => node.type === 'output');
  output.id = 'output-LED';
  output.data = { outputId: 'LED', label: 'Bit guardado', visualType: 'led' };
  register.nodes.push({ id: 'clock', type: 'gate', position: { x: 300, y: 240 }, data: { gateType: 'CLOCK' } });
  register.edges.forEach(edge => {
    if (edge.targetHandle === 'a') edge.targetHandle = 'd';
    else if (edge.targetHandle === 'b') { edge.source = 'clock'; edge.targetHandle = 'clk'; }
    else edge.target = 'output-LED';
  });
  const advanced = { ...demo, completedLevels: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [i + 1, { completed: true, bestGateCount: 1 }])), unlockedLevel: 28, drafts: { 28: { circuit: register, inputs: { A: 0 } } } };
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const errors = [];
  const checks = [];
  for (const [width, height] of [[360, 800], [768, 1024], [1366, 768], [1920, 1080]]) {
    for (const [name, route, state, popup] of [
      ['collection', '/learn', demo, false],
      ['map', '/levels', advanced, false],
      ['memory', '/puzzle/28', advanced, false],
      ['success', '/puzzle/1', demo, true],
      ['dff-simulator', '/learn/dff', advanced, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      await context.addInitScript(state => localStorage.setItem('electric-cards:v1', JSON.stringify(state)), state);
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:4174${route}`);
      await page.locator('main h1').waitFor();
      if (popup) {
        await page.getByRole('button', { name: 'Probar circuito' }).click();
        await page.getByRole('dialog').waitFor();
      }
      await page.waitForTimeout(150);
      const check = await page.evaluate(({ name, width, height }) => ({ name, width, height, overflow: document.documentElement.scrollWidth > innerWidth, dialogOverflow: !!document.querySelector('dialog[open]') && document.querySelector('dialog[open]').scrollWidth > document.querySelector('dialog[open]').clientWidth }), { name, width, height });
      checks.push(check);
      if (width === 360 || width === 1366) await page.screenshot({ path: `${folder}/${name}-${width}.png` });
      await context.close();
    }
  }
  await browser.close();
  fs.writeFileSync(`${folder}/checks.json`, JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checked: checks.length, failures: checks.filter(check => check.overflow || check.dialogOverflow), errors }));
  if (errors.length || checks.some(check => check.overflow || check.dialogOverflow)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

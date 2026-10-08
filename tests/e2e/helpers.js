import { stages } from '../../src/data/stages';

export async function seedProgress(page, through = 0, drafts = {}) {
  const order = stages.flatMap((stage) => stage.levelIds);
  const nextIndex = order.indexOf(through + 1);
  const completedIds = [
    ...new Set([
      ...Array.from({ length: through }, (_, i) => i + 1).filter((id) => order.includes(id)),
      ...order.slice(0, Math.max(0, nextIndex)),
    ]),
  ];
  await page.addInitScript(
    ({ completedIds, through, drafts }) => {
      const existing = JSON.parse(localStorage.getItem('electric-cards:v1') || 'null');
      if (
        Object.keys(existing?.completedLevels ?? {}).length ||
        Object.keys(existing?.drafts ?? {}).length
      )
        return;
      localStorage.setItem(
        'electric-cards:v1',
        JSON.stringify({
          version: 1,
          seenTutorials: existing?.seenTutorials ?? {},
          completedLevels: Object.fromEntries(
            completedIds.map((id) => [id, { completed: true, bestGateCount: 1 }]),
          ),
          unlockedLevel: through + 1,
          drafts,
        }),
      );
    },
    { completedIds, through, drafts },
  );
}

export async function wire(page, source, target, { drag = false } = {}) {
  const [node, port] = target.split(' · entrada ');
  const from = page.getByLabel(`Salida de ${source}`, { exact: true });
  const to = page.getByLabel(
    port === 'única' ? `Entrada de ${node}` : `Entrada ${port.toUpperCase()} de ${node}`,
    { exact: true },
  );
  if (drag) {
    const start = await from.boundingBox();
    const end = await to.boundingBox();
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
    await page.mouse.up();
  } else {
    await from.click();
    await to.click();
  }
}

export async function selectWire(page, index = 0) {
  const point = await page
    .locator('.react-flow__edge-path')
    .nth(index)
    .evaluate((path) => {
      const middle = path.getPointAtLength(path.getTotalLength() / 2);
      const screen = new DOMPoint(middle.x, middle.y).matrixTransform(path.getScreenCTM());
      return { x: screen.x, y: screen.y };
    });
  if (await page.evaluate(() => navigator.maxTouchPoints > 0))
    await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

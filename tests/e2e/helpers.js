export async function seedProgress(page, through = 0, drafts = {}) {
  await page.addInitScript(
    ({ through, drafts }) => {
      if (localStorage.getItem('electric-cards:v1')) return;
      localStorage.setItem(
        'electric-cards:v1',
        JSON.stringify({
          version: 1,
          completedLevels: Object.fromEntries(
            Array.from({ length: through }, (_, index) => [
              index + 1,
              { completed: true, bestGateCount: 1 },
            ]),
          ),
          unlockedLevel: through + 1,
          drafts,
        }),
      );
    },
    { through, drafts },
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

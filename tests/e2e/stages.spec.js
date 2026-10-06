import { test, expect } from '@playwright/test';
import { stages } from '../../src/data/stages';
import { getLevel } from '../../src/data/levels';
import { referenceCircuit } from '../fixtures/solutions';
import { wire } from './helpers';

async function seedChallenges(page, ids, draftIds) {
  const drafts = Object.fromEntries(
    draftIds.map((id) => [
      id,
      {
        circuit: referenceCircuit(id),
        inputs: Object.fromEntries(getLevel(id).inputs.map((input) => [input.id, 0])),
      },
    ]),
  );
  await page.addInitScript(
    ({ ids, drafts }) => {
      if (localStorage.getItem('electric-cards:v1')) return;
      localStorage.setItem(
        'electric-cards:v1',
        JSON.stringify({
          version: 1,
          completedLevels: Object.fromEntries(
            ids.map((id) => [id, { completed: true, bestGateCount: 8 }]),
          ),
          drafts,
        }),
      );
    },
    { ids, drafts },
  );
}

test('map exposes five stages and solving the three-gate entry challenge skips stage one', async ({
  page,
}, testInfo) => {
  await page.goto('/levels');
  await expect(page.locator('.world-section')).toHaveCount(5);
  await expect(
    page.getByRole('link', { name: 'Reto de salto de la etapa 1', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Reto de salto de la etapa 2. Bloqueado' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Reto de salto de la etapa 1', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reto de la etapa 1' })).toBeVisible();
  for (const remaining of [3, 2, 1]) {
    await page.getByRole('button', { name: `Añadir AND. ${remaining} disponibles` }).click();
  }
  await wire(page, 'Sensor A', 'AND 1 · entrada A');
  await wire(page, 'Sensor B', 'AND 1 · entrada B');
  await wire(page, 'Sensor C', 'AND 2 · entrada A');
  await wire(page, 'Sensor D', 'AND 2 · entrada B');
  await wire(page, 'AND 1', 'AND 3 · entrada A');
  await wire(page, 'AND 2', 'AND 3 · entrada B');
  await wire(page, 'AND 3', 'Puerta · entrada única');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('dialog')).toContainText('Etapa 1 acreditada', {
    timeout: 12000,
  });
  await page.getByRole('button', { name: 'Continuar a la etapa 2' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 4', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nivel 4', exact: true })).toBeVisible();
  await page.goto('/levels');
  await expect(page.locator('.page-heading-copy')).toContainText('1 de 5 etapas acreditadas');
  await expect(page.getByRole('link', { name: 'Nivel 2', exact: true })).toContainText(
    'Practicar',
  );
  await expect(
    page.getByRole('link', { name: 'Reto de salto de la etapa 2', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Reto de salto de la etapa 3. Bloqueado' }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels),
      ),
    )
    .toEqual(['38']);
  await page.screenshot({ path: testInfo.outputPath('stages-map.png'), fullPage: true });
  await page.goto('/');
  await page.getByRole('link', { name: 'Continuar jugando' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 4', exact: true })).toBeVisible();
});

test('incomplete and incorrect challenge circuits cannot unlock the next stage', async ({
  page,
}) => {
  await page.goto('/puzzle/38');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await wire(page, 'Sensor A', 'Puerta · entrada única');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(
    page.getByRole('heading', { name: 'Todavía hay una señal que ajustar' }),
  ).toBeVisible({ timeout: 12000 });
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/puzzle/42');
  await expect(page.getByRole('heading', { name: 'Una señal a la vez.' })).toBeVisible();
  await page.goto('/levels');
  await expect(page.locator('.page-heading-copy')).toContainText('0 de 5 etapas acreditadas');
});

test('successive mixed and optimization challenges unlock stage four and its memory components', async ({
  page,
}) => {
  await seedChallenges(page, [38], [42, 43]);
  await page.goto('/puzzle/42');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await page.getByRole('button', { name: 'Continuar a la etapa 3' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 21', exact: true })).toBeVisible();
  await page.goto('/levels');
  await page.getByRole('link', { name: 'Reto de salto de la etapa 3', exact: true }).click();
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Etapa 3 acreditada');
  await expect(dialog.locator('.completion-unlock')).toHaveCount(3);
  for (const type of ['CLOCK', 'DFF', 'TFF']) await expect(dialog).toContainText(type);
  await dialog.getByRole('button', { name: 'Continuar a la etapa 4' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 26', exact: true })).toBeVisible();
  await page.reload();
  await page.goto('/learn/tff');
  await expect(page.locator('.sequential-simulator')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(JSON.parse(localStorage.getItem('electric-cards:v1')).completedLevels),
      ),
    )
    .toEqual(['38', '42', '43']);
});

test('memory and final challenges credit the whole course with only five completions', async ({
  page,
}) => {
  await seedChallenges(page, [38, 42, 43], [44, 45]);
  await page.goto('/puzzle/44');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('dialog')).toContainText('Todas las secuencias');
  await page.getByRole('button', { name: 'Continuar a la etapa 5' }).click();
  await expect(page.getByRole('heading', { name: 'Nivel 39', exact: true })).toBeVisible();
  await page.goto('/puzzle/45');
  await page.getByRole('button', { name: 'Probar circuito' }).click();
  await expect(page.getByRole('dialog')).toContainText('Has acreditado las cinco etapas');
  await page.getByRole('button', { name: 'Ver recorrido' }).click();
  await expect(page.locator('.page-heading-copy')).toContainText('5 de 5 etapas acreditadas');
  await expect(page.locator('.progress-summary-count')).toContainText('5 / 45');
  for (const stage of stages) {
    await expect(
      page.getByRole('link', { name: `Nivel ${stage.levelIds.at(-1)}`, exact: true }),
    ).toContainText('Practicar');
  }
  await page.reload();
  await expect(page.locator('.page-heading-copy')).toContainText('5 de 5 etapas acreditadas');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ver recorrido' })).toHaveAttribute(
    'href',
    '/levels',
  );
});

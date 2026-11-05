import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const artifact = resolve(process.env.PORTABLE_HTML ?? 'dist-portable/Electric-Cards.html');

// Intercept only the document: the browser receives a genuine HTTP origin/path,
// while no server or external resource is available to rescue the portable build.
test('the same single HTML also navigates and reloads at an HTTP filename', async ({
  context,
  page,
}) => {
  const documentUrl = 'http://portable.test/archivo%20compartido/Juego.html';
  const html = await readFile(artifact);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.setOffline(true);
  await page.route('**/*', async (route) => {
    if (route.request().url().split('#')[0] === documentUrl) {
      await route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    } else {
      errors.push(`Recurso externo: ${route.request().url()}`);
      await route.abort();
    }
  });
  await page.goto(documentUrl);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Construye circuitos');
  await page.getByRole('link', { name: 'Compuertas', exact: true }).click();
  await expect(page).toHaveURL(`${documentUrl}#/learn`);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/compuertas/i);
  await page.goto(`${documentUrl}#/learn/and`);
  await expect(page.getByText('Y = 0', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar entrada A' }).click();
  await page.getByRole('button', { name: 'Cambiar entrada B' }).click();
  await expect(page.getByText('Y = 1', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

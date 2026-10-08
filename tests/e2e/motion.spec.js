import { test, expect } from './returning-player';

test('rapid signal changes keep the simulator responsive during motion', async ({ page }) => {
  await page.goto('/');
  const a = page.getByRole('button', { name: 'Cambiar entrada A' });
  const b = page.getByRole('button', { name: 'Cambiar entrada B' });
  await a.click();
  await expect(a).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Y = 0')).toBeVisible();
  await b.click();
  await expect(page.getByText('Y = 1')).toBeVisible();
  await a.click();
  await a.click();
  await b.click();
  await expect(a).toHaveAttribute('aria-pressed', 'true');
  await expect(b).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Y = 0')).toBeVisible();
});

test('keyboard navigation and toggles commit immediately with visible focus', async ({
  page,
}) => {
  await page.goto('/');
  const play = page.getByRole('navigation').getByRole('link', { name: 'Jugar', exact: true });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Mapa de niveles' })).toBeVisible();
  await expect(play).toHaveAttribute('aria-current', 'page');
  const learn = page.getByRole('navigation').getByRole('link', { name: 'Compuertas' });
  await learn.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Colección de compuertas' })).toBeVisible();
  const card = page.locator('.gate-card').first();
  await card.focus();
  await page.keyboard.press('Enter');
  const input = page.getByRole('button', { name: 'Cambiar entrada A' });
  await input.focus();
  await page.keyboard.press('Space');
  await expect(input).toHaveAttribute('aria-pressed', 'true');
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
    'solid',
  );
  expect(
    await input.locator('.switch-indicator').evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return { duration: style.transitionDuration, x: new DOMMatrix(style.transform).m41 };
    }),
  ).toEqual({ duration: '0s', x: 14 });
});

test('reduced motion preserves signal feedback without positional animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const a = page.getByRole('button', { name: 'Cambiar entrada A' });
  const b = page.getByRole('button', { name: 'Cambiar entrada B' });
  await a.click();
  await b.click();
  await expect(page.getByText('Y = 1')).toBeVisible();
  expect(
    await page
      .locator('.sim-output > svg')
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none');
  expect(
    await b
      .locator('.switch-indicator')
      .evaluate(
        (element) => new DOMMatrix(getComputedStyle(element, '::before').transform).m41,
      ),
  ).toBe(14);
  await page.getByRole('link', { name: 'Empezar a jugar' }).click();
  await expect(page.getByTestId('circuit-board')).toBeVisible();
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Jugar', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Añadir AND. 1 disponibles' }).click();
  await expect(page.locator('.react-flow__node-gate')).toHaveCount(1);
  await page.locator('.puzzle-hint summary').click();
  await expect(page.locator('.puzzle-hint-content')).toBeVisible();
  expect(
    await page
      .locator('.puzzle-hint-content')
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none');
});

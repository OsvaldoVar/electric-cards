import { test as base, expect } from '@playwright/test';
import { gates } from '../../src/data/gates';

// Editor regressions model a returning player; tutorials.spec.js covers first use.
export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript((ids) => {
      const key = 'electric-cards:v1';
      if (localStorage.getItem(key)) return;
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          completedLevels: {},
          drafts: {},
          seenTutorials: Object.fromEntries(ids.map((id) => [id, true])),
        }),
      );
    }, Object.keys(gates));
    await run(page);
  },
});
export { expect };

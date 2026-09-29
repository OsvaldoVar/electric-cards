import { expect, it, vi } from 'vitest';
import { createId } from '../src/services/ids';

it('generates distinct IDs without randomUUID, even within the same millisecond', () => {
  vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(undefined);
  vi.spyOn(Date, 'now').mockReturnValue(1000);
  const first = createId('gate');
  const second = createId('gate');
  expect(first).not.toBe(second);
  expect(first).toMatch(/^gate-/);
});

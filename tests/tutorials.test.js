import { describe, expect, it } from 'vitest';
import { emptyGame, sanitizeGame, loadGame, saveGame } from '../src/services/storage';
import { gameReducer } from '../src/context/gameReducer';

describe('tutorial persistence', () => {
  it('loads old v1 saves without erasing progress and only accepts known true flags', () => {
    const saved = {
      ...emptyGame(),
      completedLevels: { 1: { completed: true, bestGateCount: 1 } },
    };
    delete saved.seenTutorials;
    expect(sanitizeGame(saved).completedLevels).toEqual(saved.completedLevels);
    expect(sanitizeGame(saved).seenTutorials).toEqual({});
    expect(
      sanitizeGame({ ...saved, seenTutorials: { AND: true, OR: 'true', INVALID: true } })
        .seenTutorials,
    ).toEqual({ AND: true });
  });
  it('acknowledges only usable components in accessible levels without completing them', () => {
    const state = gameReducer(emptyGame(), { type: 'OPEN_PUZZLE', levelId: 1 });
    const next = gameReducer(state, {
      type: 'ACKNOWLEDGE_TUTORIAL',
      levelId: 1,
      gateType: 'AND',
    });
    expect(next.seenTutorials).toEqual({ AND: true });
    expect(next.drafts).toBe(state.drafts);
    expect(next.completedLevels).toBe(state.completedLevels);
    for (const [levelId, gateType] of [
      [1, 'OR'],
      [1, 'INVALID'],
      [26, 'CLOCK'],
      [2, 'OR'],
    ]) {
      expect(gameReducer(state, { type: 'ACKNOWLEDGE_TUTORIAL', levelId, gateType })).toBe(
        state,
      );
    }
    expect(gameReducer(next, { type: 'RESET_PUZZLE', levelId: 1 }).seenTutorials).toEqual({
      AND: true,
    });
    expect(saveGame(next)).toBe(true);
    expect(loadGame().state.seenTutorials).toEqual({ AND: true });
  });
});

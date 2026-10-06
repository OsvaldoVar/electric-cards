import { expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { unlockedGateIds, gateUnlocks } from '../src/data/unlocks';
import { emptyGame, sanitizeGame } from '../src/services/storage';
import { gameReducer } from '../src/context/gameReducer';
import { referenceCircuit } from './fixtures/solutions';
import { validateLevel } from '../src/engine/validateLevel';

it('starts with AND, rejects locked gates and unlocks OR on completion', () => {
  let state = emptyGame();
  expect(unlockedGateIds(state.completedLevels)).toEqual(['AND']);
  expect(
    gameReducer(state, { type: 'ADD_GATE', levelId: 1, gateType: 'OR', nodeId: 'locked' }),
  ).toBe(state);
  state = {
    ...state,
    drafts: { 1: { circuit: referenceCircuit(1), inputs: { A: 0, B: 0 } } },
  };
  state = gameReducer(state, { type: 'COMPLETE_LEVEL', levelId: 1 });
  expect(unlockedGateIds(state.completedLevels)).toEqual(['AND', 'OR']);
  const reloaded = sanitizeGame(state);
  expect(unlockedGateIds(reloaded.completedLevels)).toEqual(['AND', 'OR']);
});

it('has a playable reference solution at every stage and unlocks every component in order', () => {
  let state = emptyGame();
  for (const level of levels) {
    const circuit = referenceCircuit(level.id);
    expect(
      validateLevel(level, circuit, { unlockedGates: unlockedGateIds(state.completedLevels) })
        .success,
    ).toBe(true);
    state = {
      ...state,
      drafts: {
        [level.id]: {
          circuit,
          inputs: Object.fromEntries(level.inputs.map((input) => [input.id, 0])),
        },
      },
    };
    state = gameReducer(state, { type: 'COMPLETE_LEVEL', levelId: level.id });
    expect(state.completedLevels[level.id]?.completed).toBe(true);
  }
  expect(Object.keys(state.completedLevels)).toHaveLength(35);
  expect(unlockedGateIds(state.completedLevels)).toEqual(Object.keys(gateUnlocks));
});

it('keeps older completions, unlocks and sequential drafts without trusting saved scores', () => {
  const old = {
    ...emptyGame(),
    completedLevels: Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [
        i + 1,
        { completed: true, stars: 3, bestGateCount: 5 },
      ]),
    ),
  };
  const loaded = sanitizeGame(old);
  expect(loaded.unlockedLevel).toBe(26);
  expect(unlockedGateIds(loaded.completedLevels)).toContain('CLOCK');
  expect(unlockedGateIds(loaded.completedLevels)).not.toContain('DFF');
  loaded.drafts[28] = { circuit: referenceCircuit(28), inputs: { A: 1 } };
  expect(sanitizeGame(loaded).drafts[28].circuit.edges).toHaveLength(3);
});

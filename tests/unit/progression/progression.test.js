import { expect, it } from 'vitest';
import { levels, getLevel } from '../../../src/data/levels';
import {
  stages,
  stagePassed,
  stageAvailable,
  canAccessLevel,
  nextRegularLevel,
  nextLevelAfter,
} from '../../../src/data/stages';
import { unlockedGateIds, gateUnlocks } from '../../../src/data/unlocks';
import { emptyGame, sanitizeGame } from '../../../src/state/storage';
import { gameReducer } from '../../../src/state/gameReducer';
import { referenceCircuit } from '../../fixtures/solutions';
import { validateLevel } from '../../../src/engine/validateLevel';

function solve(state, id) {
  const level = getLevel(id);
  return gameReducer(
    {
      ...state,
      drafts: {
        ...state.drafts,
        [id]: {
          circuit: referenceCircuit(id),
          inputs: Object.fromEntries(level.inputs.map((input) => [input.id, 0])),
        },
      },
    },
    { type: 'COMPLETE_LEVEL', levelId: id },
  );
}
it('defines five complete stages and slightly harder challenges, with stable unique IDs', () => {
  expect(stages).toHaveLength(5);
  expect(new Set(levels.map((level) => level.id)).size).toBe(levels.length);
  expect(levels).toHaveLength(45);
  for (const stage of stages) {
    const regular = stage.levelIds.map(getLevel);
    expect(getLevel(stage.challengeId).optimizationGateCount).toBeGreaterThan(
      Math.max(...regular.map((level) => level.optimizationGateCount)),
    );
    expect(getLevel(stage.challengeId).challenge).toBe(true);
    expect(regular.every((level) => !level.challenge && level.stage === stage.id)).toBe(true);
  }
  for (const id of stages[0].levelIds) {
    const level = getLevel(id);
    expect(Object.keys(level.inventory)).toHaveLength(1);
    expect(level.optimizationGateCount).toBeGreaterThanOrEqual(1);
    expect(level.optimizationGateCount).toBeLessThanOrEqual(2);
  }
  for (const id of stages[1].levelIds) {
    const gates = referenceCircuit(id).nodes.filter((node) => node.type === 'gate');
    expect(gates.length).toBeGreaterThanOrEqual(2);
    expect(gates.length).toBeLessThanOrEqual(4);
    expect(new Set(gates.map((node) => node.data.gateType)).size).toBeGreaterThan(1);
  }
});
it('starts with basic gates and an accessible challenge, while later stages and memory remain locked', () => {
  const state = emptyGame();
  expect(unlockedGateIds(state.completedLevels)).toEqual([
    'AND',
    'OR',
    'NOT',
    'NAND',
    'NOR',
    'XOR',
    'XNOR',
  ]);
  expect(canAccessLevel(38, state.completedLevels)).toBe(true);
  expect(canAccessLevel(2, state.completedLevels)).toBe(false);
  expect(canAccessLevel(42, state.completedLevels)).toBe(false);
  expect(canAccessLevel(26, state.completedLevels)).toBe(false);
  expect(
    gameReducer(state, { type: 'ADD_GATE', levelId: 26, gateType: 'CLOCK', nodeId: 'locked' }),
  ).toBe(state);
  expect(
    gameReducer(state, { type: 'ADD_GATE', levelId: 38, gateType: 'DFF', nodeId: 'locked' }),
  ).toBe(state);
});
it('every regular lesson is playable in teaching order and normal progression clears all stages', () => {
  let state = emptyGame();
  for (const stage of stages) {
    for (const id of stage.levelIds) {
      expect(nextRegularLevel(state.completedLevels)).toBe(id);
      expect(canAccessLevel(id, state.completedLevels)).toBe(true);
      const result = validateLevel(getLevel(id), referenceCircuit(id), {
        unlockedGates: unlockedGateIds(state.completedLevels),
      });
      expect(result.success).toBe(true);
      state = solve(state, id);
      expect(state.completedLevels[id]?.completed).toBe(true);
    }
    expect(stagePassed(stage, state.completedLevels)).toBe(true);
  }
  expect(Object.keys(state.completedLevels)).toHaveLength(40);
  expect(nextRegularLevel(state.completedLevels)).toBe(null);
  expect(nextLevelAfter(41, state.completedLevels)).toBe(null);
  expect(unlockedGateIds(state.completedLevels)).toEqual(Object.keys(gateUnlocks));
});
it('can skip every stage by solving only its challenge, retaining unsolved lessons as practice after reload', () => {
  let state = emptyGame();
  for (const stage of stages) {
    expect(stageAvailable(stage, state.completedLevels)).toBe(true);
    expect(canAccessLevel(stage.challengeId, state.completedLevels)).toBe(true);
    state = solve(state, stage.challengeId);
    state = sanitizeGame(state);
    expect(stagePassed(stage, state.completedLevels)).toBe(true);
    for (const id of stage.levelIds) {
      expect(state.completedLevels[id]).toBeUndefined();
      expect(canAccessLevel(id, state.completedLevels)).toBe(true);
    }
    expect(nextRegularLevel(state.completedLevels)).toBe(
      stages.find((item) => item.id === stage.id + 1)?.levelIds[0] ?? null,
    );
    expect(nextLevelAfter(stage.challengeId, state.completedLevels)).toBe(
      nextRegularLevel(state.completedLevels),
    );
  }
  expect(Object.keys(state.completedLevels)).toHaveLength(5);
  expect(unlockedGateIds(state.completedLevels)).toContain('TFF');
});
it('does not unlock a stage for incomplete, incorrect or inaccessible challenge circuits, or a forged unlockedLevel', () => {
  expect(
    gameReducer(emptyGame(), { type: 'COMPLETE_LEVEL', levelId: 38 }).completedLevels,
  ).toEqual({});
  const wrong = referenceCircuit(38);
  wrong.edges.find((edge) => edge.target === 'output-DOOR').source = 'input-A';
  const failed = gameReducer(
    { ...emptyGame(), drafts: { 38: { circuit: wrong, inputs: { A: 0, B: 0, C: 0, D: 0 } } } },
    { type: 'COMPLETE_LEVEL', levelId: 38 },
  );
  expect(stagePassed(stages[0], failed.completedLevels)).toBe(false);
  expect(solve({ ...emptyGame(), unlockedLevel: 45 }, 45).completedLevels).toEqual({});
  expect(sanitizeGame({ ...emptyGame(), unlockedLevel: 45 }).unlockedLevel).toBe(1);
});
it('keeps earned legacy completions and memory drafts, crediting already solved original stages', () => {
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
  expect(stages.slice(0, 3).every((stage) => stagePassed(stage, loaded.completedLevels))).toBe(
    true,
  );
  expect(unlockedGateIds(loaded.completedLevels)).toEqual(Object.keys(gateUnlocks));
  expect(loaded.completedLevels[36]).toBeUndefined();
  loaded.drafts[28] = { circuit: referenceCircuit(28), inputs: { A: 1 } };
  expect(sanitizeGame(loaded).drafts[28].circuit.edges).toHaveLength(3);
  expect(sanitizeGame(loaded).completedLevels[1]).not.toHaveProperty('stars');
});

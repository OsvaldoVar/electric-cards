import { describe, expect, it } from 'vitest';
import {
  emptyGame,
  loadGame,
  saveGame,
  STORAGE_KEY,
  sanitizeGame,
} from '../../../src/state/storage';
import { gameReducer } from '../../../src/state/gameReducer';
import { referenceCircuit } from '../../fixtures/solutions';

describe('Reducer and local persistence', () => {
  it('loads legacy star progress and saves completions without stars', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...emptyGame(),
        completedLevels: { 1: { completed: true, stars: 3, bestGateCount: 1 } },
        drafts: { 1: { circuit: referenceCircuit(1), inputs: { A: 0, B: 0 } } },
      }),
    );
    const { state } = loadGame();
    expect(state.completedLevels[1]).toEqual({ completed: true, bestGateCount: 1 });
    expect(state.unlockedLevel).toBe(2);
    expect(state.drafts[1].circuit.edges).toHaveLength(3);
    expect(saveGame(state)).toBe(true);
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)).completedLevels[1],
    ).not.toHaveProperty('stars');
  });
  it('never exceeds inventory and refunds deletion including wires', () => {
    let state = gameReducer(emptyGame(), {
      type: 'ADD_GATE',
      levelId: 1,
      gateType: 'AND',
      nodeId: 'g1',
    });
    const unchanged = gameReducer(state, {
      type: 'ADD_GATE',
      levelId: 1,
      gateType: 'AND',
      nodeId: 'g2',
    });
    expect(unchanged).toBe(state);
    state = gameReducer(state, {
      type: 'CONNECT',
      levelId: 1,
      edgeId: 'e1',
      connection: { source: 'input-A', sourceHandle: 'out', target: 'g1', targetHandle: 'a' },
    });
    state = gameReducer(state, { type: 'DELETE_GATE', levelId: 1, nodeId: 'g1' });
    expect(state.drafts[1].circuit.edges).toEqual([]);
    state = gameReducer(state, {
      type: 'ADD_GATE',
      levelId: 1,
      gateType: 'AND',
      nodeId: 'g2',
    });
    expect(state.drafts[1].circuit.nodes.filter((node) => node.type === 'gate')).toHaveLength(
      1,
    );
    expect(gameReducer(state, { type: 'DELETE_GATE', levelId: 1, nodeId: 'input-A' })).toBe(
      state,
    );
  });
  it('completes only validated circuits and preserves the best gate count', () => {
    expect(
      gameReducer(emptyGame(), { type: 'COMPLETE_LEVEL', levelId: 1 }).completedLevels,
    ).toEqual({});
    let state = {
      ...emptyGame(),
      drafts: { 1: { circuit: referenceCircuit(1), inputs: { A: 0, B: 0 } } },
    };
    state = gameReducer(state, { type: 'COMPLETE_LEVEL', levelId: 1 });
    expect(state.completedLevels[1]).toEqual({ completed: true, bestGateCount: 1 });
    expect(state.unlockedLevel).toBe(2);
    state = gameReducer(state, { type: 'RESET_PUZZLE', levelId: 1 });
    expect(state.completedLevels[1].bestGateCount).toBe(1);
    expect(state.drafts[1].circuit.edges).toEqual([]);
  });
  it('rejects reducer wire conflicts', () => {
    const state = {
      ...emptyGame(),
      drafts: { 1: { circuit: referenceCircuit(1), inputs: { A: 0, B: 0 } } },
    };
    expect(
      gameReducer(state, {
        type: 'CONNECT',
        levelId: 1,
        edgeId: 'new',
        connection: {
          source: 'input-B',
          sourceHandle: 'out',
          target: 'gate-g1',
          targetHandle: 'a',
        },
      }),
    ).toBe(state);
  });
  it('round-trips progress and drafts, recovering from malformed or unavailable storage', () => {
    const state = {
      ...emptyGame(),
      completedLevels: { 1: { completed: true, bestGateCount: 1 } },
      drafts: { 1: { circuit: referenceCircuit(1), inputs: { A: 1, B: 0 } } },
    };
    expect(saveGame(state)).toBe(true);
    const loaded = loadGame();
    expect(loaded.state.unlockedLevel).toBe(2);
    expect(loaded.state.drafts[1].inputs).toEqual({ A: 1, B: 0 });
    localStorage.setItem(STORAGE_KEY, '{not-json');
    expect(loadGame().state).toEqual(emptyGame());
    const blocked = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(loadGame(blocked).available).toBe(false);
    expect(saveGame(state, blocked)).toBe(false);
  });
  it('sanitizes tampered progress, unsupported versions and invalid draft circuits', () => {
    expect(sanitizeGame({ version: 99, unlockedLevel: 100 })).toEqual(emptyGame());
    const circuit = referenceCircuit(1);
    circuit.edges[0].targetHandle = 'invalid';
    const saved = {
      version: 1,
      completedLevels: { 1: { completed: true, bestGateCount: -1 } },
      unlockedLevel: 25,
      drafts: { 1: { circuit } },
    };
    expect(sanitizeGame(saved)).toEqual(emptyGame());
  });
});

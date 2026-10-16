import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useValidationPlayback } from '../../../src/features/puzzle/hooks/useValidationPlayback';
import { usePuzzle } from '../../../src/features/puzzle/hooks/usePuzzle';
import { useGame } from '../../../src/state/useGame';
import { GameProvider } from '../../../src/state/GameProvider';
import { getLevel } from '../../../src/data/levels';
import { validateLevel } from '../../../src/engine/validateLevel';
import { createCircuit } from '../../../src/engine/createCircuit';
import { referenceCircuit } from '../../fixtures/solutions';
import { emptyGame, STORAGE_KEY } from '../../../src/state/storage';
import { caseStatus } from '../../../src/features/puzzle/services/validationPresentation';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const correct = () => validateLevel(getLevel(1), referenceCircuit(1));
function wrongCircuit() {
  const circuit = createCircuit(getLevel(1));
  circuit.edges.push({
    id: 'direct',
    source: 'input-A',
    sourceHandle: 'out',
    target: 'output-DOOR',
    targetHandle: 'in',
  });
  return circuit;
}
const advance = (milliseconds) => act(() => vi.advanceTimersByTime(milliseconds));

describe('Truth table playback', () => {
  it('previews each case before revealing its real verdict and completing once', () => {
    const complete = vi.fn();
    const { result } = renderHook(() => useValidationPlayback(complete));
    act(() => result.current.start(correct()));
    expect(caseStatus(result.current.playback, 0)).toBe('checking');
    expect(caseStatus(result.current.playback, 1)).toBe('pending');
    advance(360);
    expect(caseStatus(result.current.playback, 0)).toBe('passed');
    expect(complete).not.toHaveBeenCalled();
    advance(160);
    expect(result.current.playback.currentIndex).toBe(1);
    advance(1560);
    expect(result.current.playback.running).toBe(false);
    expect(result.current.playback.revealedCount).toBe(4);
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it('reveals an actual failing row without marking other combinations incorrect', () => {
    const { result } = renderHook(() => useValidationPlayback(vi.fn()));
    act(() => result.current.start(validateLevel(getLevel(1), wrongCircuit())));
    advance(1400);
    expect(caseStatus(result.current.playback, 0)).toBe('passed');
    expect(caseStatus(result.current.playback, 2)).toBe('failed');
    expect(caseStatus(result.current.playback, 3)).toBe('pending');
    act(() => result.current.finish());
    expect(result.current.playback.result.success).toBe(false);
    expect(result.current.playback.revealedCount).toBe(4);
  });
  it('cancels old runs on restart, cancellation and unmount', () => {
    const complete = vi.fn();
    const { result, unmount } = renderHook(() => useValidationPlayback(complete));
    act(() => result.current.start(correct()));
    advance(400);
    const failure = validateLevel(getLevel(1), wrongCircuit());
    act(() => result.current.start(failure));
    advance(2080);
    expect(complete).toHaveBeenCalledExactlyOnceWith(failure);
    act(() => result.current.start(correct()));
    act(() => result.current.cancel());
    advance(3000);
    expect(result.current.playback).toBeNull();
    expect(complete).toHaveBeenCalledTimes(1);
    act(() => result.current.start(correct()));
    unmount();
    advance(3000);
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it('finishes instantly when requested and skips replay for incomplete circuits', () => {
    const complete = vi.fn();
    const { result } = renderHook(() => useValidationPlayback(complete));
    act(() => result.current.start(correct(), true));
    expect(result.current.playback.running).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.start(validateLevel(getLevel(1), createCircuit(getLevel(1)))));
    expect(result.current.playback.running).toBe(false);
    expect(result.current.playback.result.errors.length).toBeGreaterThan(0);
    expect(complete).toHaveBeenCalledTimes(2);
  });
});

function puzzleHook(circuit) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...emptyGame(), drafts: { 1: { circuit, inputs: { A: 0, B: 0 } } } }),
  );
  return renderHook(() => ({ puzzle: usePuzzle(getLevel(1)), state: useGame().state }), {
    wrapper: GameProvider,
  });
}

describe('Playback and real game progress', () => {
  it('keeps preview inputs transient and never awards progress after an edit cancels review', () => {
    const { result } = puzzleHook(referenceCircuit(1));
    act(() => result.current.puzzle.test({ detail: 1 }));
    advance(1040);
    expect(result.current.puzzle.inputs).toEqual({ A: 1, B: 0 });
    expect(result.current.state.drafts[1].inputs).toEqual({ A: 0, B: 0 });
    expect(result.current.state.completedLevels).toEqual({});
    act(() => result.current.puzzle.deleteGate('gate-g1'));
    advance(3000);
    expect(result.current.puzzle.result).toBeNull();
    expect(result.current.state.completedLevels).toEqual({});
  });
  it('awards progress automatically only after the last reviewed combination', () => {
    const { result } = puzzleHook(referenceCircuit(1));
    act(() => result.current.puzzle.test({ detail: 1 }));
    expect(result.current.state.unlockedLevel).toBe(1);
    advance(2079);
    expect(result.current.state.unlockedLevel).toBe(1);
    advance(1);
    expect(result.current.state.unlockedLevel).toBe(2);
    expect(result.current.state.completedLevels[1].completed).toBe(true);
    expect(result.current.puzzle.review.status).toBe('passed');
    advance(3000);
    expect(result.current.puzzle.playback.running).toBe(false);
  });
  it('shows the first failure after replay and never unlocks an incorrect circuit', () => {
    const { result } = puzzleHook(wrongCircuit());
    act(() => result.current.puzzle.test({ detail: 1 }));
    advance(2080);
    expect(result.current.puzzle.inputs).toEqual({ A: 1, B: 0 });
    expect(result.current.puzzle.review.status).toBe('failed');
    expect(result.current.state.unlockedLevel).toBe(1);
    expect(result.current.state.completedLevels).toEqual({});
  });
});

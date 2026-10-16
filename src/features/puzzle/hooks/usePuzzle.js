import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGame } from '../../../state/useGame';
import { createDraft } from '../../../state/gameReducer';
import { remainingInventory } from '../../../engine/createCircuit';
import { evaluateCircuit } from '../../../engine/evaluateCircuit';
import { validateConnection } from '../../../engine/validateCircuit';
import { validateLevel } from '../../../engine/validateLevel';
import { createId } from '../../../shared/lib/ids';
import { useMobileLayout } from '../../../shared/hooks/useMobileLayout';
import { useValidationPlayback } from './useValidationPlayback';
import { caseStatus, observedCase } from '../services/validationPresentation';
import { initialSimulation, stepSequentialCircuit } from '../../../engine/sequential';
import { unlockedGateIds } from '../../../data/unlocks';

export function usePuzzle(level) {
  const { state, dispatch } = useGame();
  const vertical = useMobileLayout();
  const draft = useMemo(
    () => state.drafts[level.id] ?? createDraft(level, vertical),
    [state.drafts, level, vertical],
  );
  const { circuit } = draft;
  const [message, setMessage] = useState('');
  const [hintCount, setHintCount] = useState(0);
  const [simulation, setSimulation] = useState(initialSimulation);
  const [clockRunning, setClockRunning] = useState(false);
  const [completion, setCompletion] = useState(null);
  const [inspectedIndex, setInspectedIndex] = useState(null);
  const unlockedGates = unlockedGateIds(state.completedLevels);
  const lockedGates = Object.keys(level.inventory).filter(
    (type) => !unlockedGates.includes(type),
  );
  const inventory = useMemo(() => remainingInventory(level, circuit), [level, circuit]);
  const send = useCallback(
    (action) => dispatch({ ...action, levelId: level.id, vertical }),
    [dispatch, level.id, vertical],
  );
  const completeReview = useCallback(
    (next) => {
      const observed = next.failures[0] ?? next.cases.at(-1);
      if (observed) send({ type: 'SET_INPUTS', inputs: observed.inputs });
      if (observed?.simulation) setSimulation(observed.simulation);
      setInspectedIndex(observed ? next.cases.indexOf(observed) : null);
      if (next.success) {
        const after = unlockedGateIds({
          ...state.completedLevels,
          [level.id]: { completed: true },
        });
        setCompletion({
          result: next,
          unlocked: after.filter((id) => !unlockedGateIds(state.completedLevels).includes(id)),
        });
        send({ type: 'COMPLETE_LEVEL' });
      }
    },
    [send, state.completedLevels, level.id],
  );
  const { playback, start, cancel } = useValidationPlayback(completeReview);
  const result = playback?.result ?? null;
  const inputs = playback?.running ? result.cases[playback.currentIndex].inputs : draft.inputs;
  const preview = useMemo(
    () => evaluateCircuit(circuit, inputs, { allowIncomplete: true, simulation }),
    [circuit, inputs, simulation],
  );
  const row =
    level.kind === 'sequential'
      ? result?.cases[inspectedIndex ?? result.cases.length - 1]
      : observedCase(level, playback, inputs);
  const reviewIndex = row ? result.cases.indexOf(row) : -1;
  const reviewStatus = !result
    ? 'idle'
    : result.errors.length
      ? 'invalid'
      : caseStatus(playback, reviewIndex);
  const modify = useCallback(
    (action) => {
      cancel();
      setCompletion(null);
      setClockRunning(false);
      setSimulation(initialSimulation());
      setInspectedIndex(null);
      setMessage('');
      send(action);
    },
    [send, cancel],
  );
  const addGate = useCallback(
    (gateType) => modify({ type: 'ADD_GATE', gateType, nodeId: createId('gate') }),
    [modify],
  );
  const deleteGate = useCallback(
    (nodeId) => modify({ type: 'DELETE_GATE', nodeId }),
    [modify],
  );
  const disconnect = useCallback((edgeId) => modify({ type: 'DISCONNECT', edgeId }), [modify]);
  const connect = useCallback(
    (connection) => {
      const validation = validateConnection(circuit, connection);
      if (!validation.valid) {
        setMessage(validation.error.message);
        return false;
      }
      modify({ type: 'CONNECT', connection, edgeId: createId('wire') });
      return true;
    },
    [circuit, modify],
  );
  const setInputs = useCallback(
    (values) => {
      if (playback?.running || level.kind === 'sequential') cancel();
      if (level.kind === 'sequential') {
        const next = stepSequentialCircuit(circuit, values, simulation, {
          allowIncomplete: true,
        });
        if (next.valid) setSimulation(next.simulation);
      }
      send({ type: 'SET_INPUTS', inputs: values });
    },
    [send, playback?.running, cancel, level.kind, circuit, simulation],
  );
  const advanceClock = useCallback(() => {
    cancel();
    const next = stepSequentialCircuit(circuit, draft.inputs, simulation, {
      clock: 1 - simulation.clock,
      allowIncomplete: true,
    });
    if (next.valid) setSimulation(next.simulation);
    else {
      setClockRunning(false);
      setMessage(next.errors[0].message);
    }
  }, [cancel, circuit, draft.inputs, simulation]);
  useEffect(() => {
    if (!clockRunning) return;
    const timer = window.setInterval(advanceClock, 1000);
    return () => window.clearInterval(timer);
  }, [clockRunning, advanceClock]);
  const moveNodes = useCallback(
    (positions) => send({ type: 'MOVE_NODES', positions }),
    [send],
  );
  const test = (event) => {
    const next = validateLevel(level, circuit, { unlockedGates });
    setClockRunning(false);
    setCompletion(null);
    setMessage('');
    const instant =
      level.kind === 'sequential' ||
      event?.detail === 0 ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    start(next, instant);
  };
  const reset = () => {
    modify({ type: 'RESET_PUZZLE' });
    setHintCount(0);
  };
  return {
    circuit,
    inputs,
    inventory: Object.fromEntries(
      Object.entries(inventory).filter(([id]) => unlockedGates.includes(id)),
    ),
    lockedGates,
    simulation,
    clockRunning,
    advanceClock,
    toggleClock: () => setClockRunning((running) => !running),
    resetSimulation: () => {
      cancel();
      setClockRunning(false);
      setSimulation(initialSimulation());
    },
    completion,
    dismissCompletion: () => setCompletion(null),
    inspectCase: (test) => {
      send({ type: 'SET_INPUTS', inputs: test.inputs });
      if (test.simulation) setSimulation(test.simulation);
      setInspectedIndex(result.cases.indexOf(test));
    },
    preview,
    result,
    playback,
    review: { status: reviewStatus, index: reviewIndex, row },
    sequential: level.kind === 'sequential',
    message,
    hintCount,
    addGate,
    deleteGate,
    disconnect,
    connect,
    setInputs,
    moveNodes,
    vertical,
    arrange: () => send({ type: 'ARRANGE_BOARD' }),
    test,
    reset,
    showHint: () => setHintCount((count) => Math.min(count + 1, level.hints.length - 1)),
  };
}

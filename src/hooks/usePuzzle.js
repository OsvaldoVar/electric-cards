import { useCallback, useMemo, useState } from 'react';
import { useGame } from './useGame';
import { createDraft } from '../context/gameReducer';
import { remainingInventory } from '../engine/createCircuit';
import { evaluateCircuit } from '../engine/evaluateCircuit';
import { validateConnection } from '../engine/validateCircuit';
import { validateLevel } from '../engine/validateLevel';
import { createId } from '../services/ids';
import { useMobileLayout } from './useMobileLayout';

export function usePuzzle(level) {
  const { state, dispatch } = useGame();
  const vertical = useMobileLayout();
  const draft = useMemo(
    () => state.drafts[level.id] ?? createDraft(level, vertical),
    [state.drafts, level, vertical],
  );
  const { circuit, inputs } = draft;
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [hintCount, setHintCount] = useState(0);
  const inventory = useMemo(() => remainingInventory(level, circuit), [level, circuit]);
  const preview = useMemo(
    () => evaluateCircuit(circuit, inputs, { allowIncomplete: true }),
    [circuit, inputs],
  );
  const send = useCallback(
    (action) => dispatch({ ...action, levelId: level.id, vertical }),
    [dispatch, level.id, vertical],
  );
  const modify = useCallback(
    (action) => {
      setResult(null);
      setMessage('');
      send(action);
    },
    [send],
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
    (values) => send({ type: 'SET_INPUTS', inputs: values }),
    [send],
  );
  const moveNodes = useCallback(
    (positions) => send({ type: 'MOVE_NODES', positions }),
    [send],
  );
  const test = () => {
    const next = validateLevel(level, circuit);
    setResult(next);
    setMessage('');
    if (next.success) send({ type: 'COMPLETE_LEVEL' });
  };
  const reset = () => {
    modify({ type: 'RESET_PUZZLE' });
    setHintCount(0);
  };
  return {
    circuit,
    inputs,
    inventory,
    preview,
    result,
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
    showHint: () => setHintCount((count) => Math.min(count + 1, level.hints.length)),
  };
}

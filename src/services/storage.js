import { levels, getLevel } from '../data/levels';
import { validateCircuit } from '../engine/validateCircuit';
import { isBinary } from '../engine/operations';

export const STORAGE_KEY = 'electric-cards:v1';
export const emptyGame = () => ({
  version: 1,
  completedLevels: {},
  unlockedLevel: 1,
  drafts: {},
});

export function sanitizeGame(value) {
  const state = emptyGame();
  if (!value || value.version !== 1) return state;
  for (const level of levels) {
    const saved = value.completedLevels?.[level.id];
    if (
      saved?.completed === true &&
      Number.isInteger(saved.stars) &&
      saved.stars >= 1 &&
      saved.stars <= 3 &&
      Number.isInteger(saved.bestGateCount) &&
      saved.bestGateCount >= 0 &&
      saved.bestGateCount <= 40
    ) {
      state.completedLevels[level.id] = {
        completed: true,
        stars: saved.stars,
        bestGateCount: saved.bestGateCount,
      };
    }
    const draft = value.drafts?.[level.id];
    const circuit = draft?.circuit;
    if (
      !circuit ||
      !Array.isArray(circuit.nodes) ||
      !Array.isArray(circuit.edges) ||
      circuit.nodes.length > 100 ||
      circuit.edges.length > 300
    )
      continue;
    if (!validateCircuit(circuit, { level, allowIncomplete: true }).valid) continue;
    if (
      circuit.nodes.some(
        (node) => !Number.isFinite(node.position?.x) || !Number.isFinite(node.position?.y),
      )
    )
      continue;
    const clean = {
      nodes: circuit.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: {
          x: Math.max(-2000, Math.min(4000, node.position.x)),
          y: Math.max(-2000, Math.min(4000, node.position.y)),
        },
        deletable: node.type === 'gate',
        data:
          node.type === 'gate'
            ? { gateType: node.data.gateType }
            : node.type === 'input'
              ? {
                  inputId: node.data.inputId,
                  label: level.inputs.find((input) => input.id === node.data.inputId).label,
                }
              : {
                  outputId: node.data.outputId,
                  ...(() => {
                    const output = level.outputs.find(
                      (item) => item.id === node.data.outputId,
                    );
                    return { label: output.label, visualType: output.type };
                  })(),
                },
      })),
      edges: circuit.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: 'out',
        target: edge.target,
        targetHandle: edge.targetHandle,
      })),
    };
    state.drafts[level.id] = {
      circuit: clean,
      inputs: Object.fromEntries(
        level.inputs.map((input) => [
          input.id,
          isBinary(draft.inputs?.[input.id]) ? draft.inputs[input.id] : 0,
        ]),
      ),
    };
  }
  while (state.unlockedLevel < levels.length && state.completedLevels[state.unlockedLevel])
    state.unlockedLevel += 1;
  return state;
}

export function loadGame(storage) {
  try {
    const target = storage ?? window.localStorage;
    const raw = target.getItem(STORAGE_KEY);
    if (!raw || raw.length > 500_000) return { state: emptyGame(), available: true };
    return { state: sanitizeGame(JSON.parse(raw)), available: true };
  } catch {
    return { state: emptyGame(), available: false };
  }
}

export function saveGame(state, storage) {
  try {
    (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function getSavedDraft(state, levelId) {
  return getLevel(levelId) ? state.drafts[levelId] : undefined;
}

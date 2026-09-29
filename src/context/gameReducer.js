import { getLevel, levels } from '../data/levels';
import { createCircuit, remainingInventory } from '../engine/createCircuit';
import { validateConnection } from '../engine/validateCircuit';
import { validateLevel } from '../engine/validateLevel';
import { isBinary } from '../engine/operations';
import { arrangeNodes } from '../services/boardLayout';

export function createDraft(level, vertical = false) {
  const circuit = createCircuit(level);
  if (vertical) circuit.nodes = arrangeNodes(circuit.nodes, true);
  return {
    circuit,
    inputs: Object.fromEntries(level.inputs.map((input) => [input.id, 0])),
  };
}

export function gameReducer(state, action) {
  const level = getLevel(action.levelId);
  if (!level) return state;
  const draft = state.drafts[level.id] ?? createDraft(level, action.vertical);
  const circuit = draft.circuit;
  const update = (next) => ({ ...state, drafts: { ...state.drafts, [level.id]: next } });
  switch (action.type) {
    case 'OPEN_PUZZLE':
      return state.drafts[level.id] ? state : update(draft);
    case 'ADD_GATE': {
      if (
        !(remainingInventory(level, circuit)[action.gateType] > 0) ||
        circuit.nodes.some((node) => node.id === action.nodeId)
      )
        return state;
      const index = circuit.nodes.filter((node) => node.type === 'gate').length;
      const position = action.position ?? {
        x: 285 + (index % 2) * 150,
        y: 75 + Math.floor(index / 2) * 160,
      };
      let nodes = [
        ...circuit.nodes,
        {
          id: action.nodeId,
          type: 'gate',
          position,
          data: { gateType: action.gateType },
        },
      ];
      if (action.vertical) {
        const arranged = new Map(arrangeNodes(nodes, true).map((node) => [node.id, node]));
        // Existing cards retain their positions; outputs move below new rows.
        nodes = nodes.map((node) =>
          node.id === action.nodeId || node.type === 'output' ? arranged.get(node.id) : node,
        );
      }
      return update({
        ...draft,
        circuit: {
          ...circuit,
          nodes,
        },
      });
    }
    case 'DELETE_GATE': {
      if (!circuit.nodes.some((node) => node.id === action.nodeId && node.type === 'gate'))
        return state;
      return update({
        ...draft,
        circuit: {
          nodes: circuit.nodes.filter((node) => node.id !== action.nodeId),
          edges: circuit.edges.filter(
            (edge) => edge.source !== action.nodeId && edge.target !== action.nodeId,
          ),
        },
      });
    }
    case 'CONNECT': {
      if (
        !validateConnection(circuit, action.connection).valid ||
        circuit.edges.some((edge) => edge.id === action.edgeId)
      )
        return state;
      return update({
        ...draft,
        circuit: {
          ...circuit,
          edges: [...circuit.edges, { id: action.edgeId, ...action.connection }],
        },
      });
    }
    case 'DISCONNECT':
      return update({
        ...draft,
        circuit: {
          ...circuit,
          edges: circuit.edges.filter((edge) => edge.id !== action.edgeId),
        },
      });
    case 'MOVE_NODES': {
      const positions = new Map(action.positions.map(({ id, position }) => [id, position]));
      return update({
        ...draft,
        circuit: {
          ...circuit,
          nodes: circuit.nodes.map((node) => {
            const position = positions.get(node.id);
            if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y))
              return node;
            return {
              ...node,
              position: {
                x: Math.max(-2000, Math.min(4000, position.x)),
                y: Math.max(-2000, Math.min(4000, position.y)),
              },
            };
          }),
        },
      });
    }
    case 'SET_INPUTS':
      return update({
        ...draft,
        inputs: Object.fromEntries(
          level.inputs.map((input) => [
            input.id,
            isBinary(action.inputs[input.id])
              ? action.inputs[input.id]
              : draft.inputs[input.id],
          ]),
        ),
      });
    case 'RESET_PUZZLE':
      return update(createDraft(level, action.vertical));
    case 'ARRANGE_BOARD':
      return update({
        ...draft,
        circuit: { ...circuit, nodes: arrangeNodes(circuit.nodes, action.vertical) },
      });
    case 'COMPLETE_LEVEL': {
      const result = validateLevel(level, circuit);
      if (!result.success || level.id > state.unlockedLevel) return state;
      const previous = state.completedLevels[level.id];
      return {
        ...state,
        completedLevels: {
          ...state.completedLevels,
          [level.id]: {
            completed: true,
            stars: Math.max(previous?.stars ?? 0, result.stars),
            bestGateCount: Math.min(previous?.bestGateCount ?? Infinity, result.gateCount),
          },
        },
        unlockedLevel: Math.max(state.unlockedLevel, Math.min(levels.length, level.id + 1)),
      };
    }
    default:
      return state;
  }
}

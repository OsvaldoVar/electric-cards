import { evaluateCircuit } from './evaluateCircuit';
import { isBinary, isFlipFlop } from './operations';
import { circuitError } from './validateCircuit';

export const initialSimulation = () => ({ clock: 0, memory: {} });

export function nextFlipFlopValue(type, q, data, previousClock, clock) {
  if (!isFlipFlop(type)) throw new Error('UNKNOWN_GATE');
  if (![q, data, previousClock, clock].every(isBinary)) throw new Error('INVALID_SIGNAL');
  if (previousClock !== 0 || clock !== 1) return q;
  return type === 'DFF' ? data : data === 1 ? 1 - q : q;
}

// Sample every register from the same snapshot, then commit all Q values together.
export function stepSequentialCircuit(
  circuit,
  inputs,
  simulation = initialSimulation(),
  options = {},
) {
  const clock = options.clock ?? simulation.clock;
  if (!isBinary(clock))
    return { valid: false, error: 'INVALID_SIGNAL', errors: [circuitError('INVALID_SIGNAL')] };
  const before = evaluateCircuit(circuit, inputs, {
    ...options,
    simulation: { ...simulation, clock },
  });
  if (!before.valid) return before;
  const memory = {};
  for (const node of circuit.nodes) {
    const type = node.data?.gateType;
    if (node.type !== 'gate' || !isFlipFlop(type)) continue;
    const previous = simulation.memory?.[node.id] ?? { q: 0, clock: 0 };
    if (!isBinary(previous.q) || (previous.clock != null && !isBinary(previous.clock)))
      return {
        valid: false,
        error: 'INVALID_SIGNAL',
        errors: [circuitError('INVALID_SIGNAL')],
      };
    const read = (port) => {
      const wire = circuit.edges.find(
        (edge) => edge.target === node.id && edge.targetHandle === port,
      );
      return before.nodeValues[wire?.source] ?? null;
    };
    const currentClock = read('clk');
    const data = read(type === 'DFF' ? 'd' : 't');
    const q =
      data === null || currentClock === null
        ? previous.q
        : nextFlipFlopValue(type, previous.q, data, previous.clock ?? 0, currentClock);
    memory[node.id] = { q, clock: currentClock };
  }
  const next = { clock, memory };
  const after = evaluateCircuit(circuit, inputs, { ...options, simulation: next });
  return { ...after, simulation: next };
}

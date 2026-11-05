import { isBinary, isFlipFlop } from './operations';
import { circuitError, validateCircuit } from './validateCircuit';
import { evaluatePreparedCircuit, prepareCircuit } from './prepareCircuit';

export const initialSimulation = () => ({ clock: 0, memory: {} });

const invalidSignal = () => ({
  valid: false,
  error: 'INVALID_SIGNAL',
  errors: [circuitError('INVALID_SIGNAL')],
});

export function nextFlipFlopValue(type, q, data, previousClock, clock) {
  if (!isFlipFlop(type)) throw new Error('UNKNOWN_GATE');
  if (![q, data, previousClock, clock].every(isBinary)) throw new Error('INVALID_SIGNAL');
  if (previousClock !== 0 || clock !== 1) return q;
  return type === 'DFF' ? data : data === 1 ? 1 - q : q;
}

// Sample every register from the same snapshot, then commit all Q values together.
export function stepPreparedCircuit(
  plan,
  inputs,
  simulation = initialSimulation(),
  options = {},
) {
  const clock = options.clock ?? simulation.clock;
  if (!isBinary(clock)) return invalidSignal();
  const before = evaluatePreparedCircuit(plan, inputs, {
    ...options,
    simulation: { ...simulation, clock },
  });
  if (!before.valid) return before;
  const memory = {};
  for (const id of plan.order) {
    const node = plan.nodesById.get(id);
    const type = node.data?.gateType;
    if (node.type !== 'gate' || !isFlipFlop(type)) continue;
    const previous = simulation.memory?.[id] ?? { q: 0, clock: 0 };
    if (!isBinary(previous.q) || (previous.clock != null && !isBinary(previous.clock)))
      return invalidSignal();
    const read = (port) => before.nodeValues[plan.wires.get(`${id}|${port}`)] ?? null;
    const currentClock = read('clk');
    const data = read(type === 'DFF' ? 'd' : 't');
    const q =
      data === null || currentClock === null
        ? previous.q
        : nextFlipFlopValue(type, previous.q, data, previous.clock ?? 0, currentClock);
    memory[id] = { q, clock: currentClock };
  }
  const next = { clock, memory };
  const after = evaluatePreparedCircuit(plan, inputs, { ...options, simulation: next });
  return { ...after, simulation: next };
}

export function stepSequentialCircuit(
  circuit,
  inputs,
  simulation = initialSimulation(),
  options = {},
) {
  const clock = options.clock ?? simulation.clock;
  if (!isBinary(clock)) return invalidSignal();
  const validation = validateCircuit(circuit, options);
  if (!validation.valid)
    return { valid: false, error: validation.errors[0].code, errors: validation.errors };
  return stepPreparedCircuit(
    prepareCircuit(circuit, validation.order),
    inputs,
    simulation,
    options,
  );
}

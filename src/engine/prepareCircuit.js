import { evaluateGate } from './evaluateGate';
import { isBinary, isFlipFlop, targetPorts } from './operations';
import { circuitError } from './validateCircuit';

const invalidSignal = () => ({
  valid: false,
  error: 'INVALID_SIGNAL',
  errors: [circuitError('INVALID_SIGNAL')],
});

// Internal engine helper: build the node/wire index once for an already
// validated circuit. Callers must pass the `order` from validateCircuit.
export function prepareCircuit(circuit, order) {
  return {
    order,
    nodesById: new Map(circuit.nodes.map((node) => [node.id, node])),
    wires: new Map(
      circuit.edges.map((edge) => [`${edge.target}|${edge.targetHandle}`, edge.source]),
    ),
    inputNodes: circuit.nodes.filter((node) => node.type === 'input'),
  };
}

export function evaluatePreparedCircuit(plan, inputs, options = {}) {
  const { order, nodesById, wires, inputNodes } = plan;
  if (!inputs || inputNodes.some((node) => !isBinary(inputs[node.data.inputId])))
    return invalidSignal();
  const nodeValues = Object.create(null);
  const outputs = Object.create(null);
  for (const id of order) {
    const node = nodesById.get(id);
    if (node.type === 'input') {
      nodeValues[id] = inputs[node.data.inputId];
      continue;
    }
    if (node.type === 'gate' && node.data.gateType === 'CLOCK') {
      nodeValues[id] = options.simulation?.clock ?? 0;
      if (!isBinary(nodeValues[id])) return invalidSignal();
      continue;
    }
    if (node.type === 'gate' && isFlipFlop(node.data.gateType)) {
      nodeValues[id] = options.simulation?.memory?.[id]?.q ?? 0;
      if (!isBinary(nodeValues[id])) return invalidSignal();
      continue;
    }
    const values = targetPorts(node).map(
      (port) => nodeValues[wires.get(`${id}|${port}`)] ?? null,
    );
    const value = values.includes(null)
      ? null
      : node.type === 'gate'
        ? evaluateGate(node.data.gateType, values)
        : values[0];
    nodeValues[id] = value;
    if (node.type === 'output') outputs[node.data.outputId] = value;
  }
  return { valid: true, outputs, nodeValues };
}

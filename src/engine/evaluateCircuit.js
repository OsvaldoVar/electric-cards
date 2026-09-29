import { evaluateGate } from './evaluateGate';
import { isBinary, targetPorts } from './operations';
import { circuitError, validateCircuit } from './validateCircuit';

export function evaluateCircuit(circuit, inputs, options = {}) {
  const validation = validateCircuit(circuit, options);
  if (!validation.valid)
    return { valid: false, error: validation.errors[0].code, errors: validation.errors };
  if (
    !inputs ||
    circuit.nodes.some((node) => node.type === 'input' && !isBinary(inputs[node.data.inputId]))
  ) {
    return { valid: false, error: 'INVALID_SIGNAL', errors: [circuitError('INVALID_SIGNAL')] };
  }
  const nodes = new Map(circuit.nodes.map((node) => [node.id, node]));
  const wires = new Map(
    circuit.edges.map((edge) => [`${edge.target}|${edge.targetHandle}`, edge.source]),
  );
  const nodeValues = Object.create(null);
  const outputs = Object.create(null);
  for (const id of validation.order) {
    const node = nodes.get(id);
    if (node.type === 'input') {
      nodeValues[id] = inputs[node.data.inputId];
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

import { createCircuit } from '../../src/engine/createCircuit';
import { getLevel } from '../../src/data/levels';

// Independent reference constructions, not copied from objective expressions.
const solutions = {
  1: { gates: [['AND', 'A', 'B']], outputs: { DOOR: 'g1' } },
  2: { gates: [['OR', 'A', 'B']], outputs: { LED: 'g1' } },
  3: { gates: [['NOT', 'A']], outputs: { FLAG: 'g1' } },
  4: {
    gates: [
      ['AND', 'A', 'B'],
      ['OR', 'g1', 'C'],
    ],
    outputs: { DOOR: 'g2' },
  },
  5: {
    gates: [
      ['OR', 'A', 'B'],
      ['AND', 'g1', 'C'],
    ],
    outputs: { MOTOR: 'g2' },
  },
  6: { gates: [['NAND', 'A', 'B']], outputs: { ALARM: 'g1' } },
  7: { gates: [['NOR', 'A', 'B']], outputs: { LED: 'g1' } },
  8: {
    gates: [
      ['NOT', 'B'],
      ['AND', 'A', 'g1'],
    ],
    outputs: { DOOR: 'g2' },
  },
  9: {
    gates: [
      ['NOT', 'B'],
      ['OR', 'A', 'g1'],
    ],
    outputs: { FLAG: 'g2' },
  },
  10: {
    gates: [
      ['NOT', 'A'],
      ['NOT', 'B'],
      ['AND', 'g1', 'g2'],
    ],
    outputs: { LED: 'g3' },
  },
  11: { gates: [['XOR', 'A', 'B']], outputs: { ALARM: 'g1' } },
  12: { gates: [['XNOR', 'A', 'B']], outputs: { LED: 'g1' } },
  13: {
    gates: [
      ['XOR', 'A', 'B'],
      ['AND', 'g1', 'C'],
    ],
    outputs: { MOTOR: 'g2' },
  },
  14: {
    gates: [
      ['XNOR', 'A', 'B'],
      ['OR', 'g1', 'C'],
    ],
    outputs: { DOOR: 'g2' },
  },
  15: {
    gates: [
      ['XOR', 'A', 'B'],
      ['NOT', 'g1'],
    ],
    outputs: { DIF: 'g1', IGUAL: 'g2' },
  },
  16: {
    gates: [
      ['AND', 'A', 'B'],
      ['OR', 'A', 'B'],
      ['AND', 'C', 'g2'],
      ['OR', 'g1', 'g3'],
    ],
    outputs: { FLAG: 'g4' },
  },
  17: {
    gates: [
      ['AND', 'A', 'B'],
      ['OR', 'C', 'D'],
      ['NOT', 'g2'],
      ['AND', 'g1', 'g3'],
    ],
    outputs: { DOOR: 'g4' },
  },
  18: {
    gates: [
      ['OR', 'A', 'B'],
      ['NOT', 'C'],
      ['AND', 'g1', 'g2'],
    ],
    outputs: { ALARM: 'g3' },
  },
  19: {
    gates: [
      ['XOR', 'A', 'B'],
      ['XOR', 'g1', 'C'],
    ],
    outputs: { LED: 'g2' },
  },
  20: {
    gates: [
      ['XOR', 'A', 'B'],
      ['AND', 'A', 'B'],
    ],
    outputs: { SUMA: 'g1', ACARREO: 'g2' },
  },
  21: {
    gates: [
      ['NAND', 'A', 'B'],
      ['NAND', 'g1', 'g1'],
    ],
    outputs: { DOOR: 'g2' },
  },
  22: {
    gates: [
      ['NAND', 'A', 'A'],
      ['NAND', 'B', 'B'],
      ['NAND', 'g1', 'g2'],
    ],
    outputs: { LED: 'g3' },
  },
  23: {
    gates: [
      ['NAND', 'A', 'B'],
      ['NAND', 'A', 'g1'],
      ['NAND', 'B', 'g1'],
      ['NAND', 'g2', 'g3'],
    ],
    outputs: { ALARM: 'g4' },
  },
  24: {
    gates: [
      ['NOT', 'S'],
      ['AND', 'A', 'g1'],
      ['AND', 'B', 'S'],
      ['OR', 'g2', 'g3'],
    ],
    outputs: { LED: 'g4' },
  },
  25: {
    gates: [
      ['XOR', 'A', 'B'],
      ['XOR', 'g1', 'C'],
      ['AND', 'A', 'B'],
      ['AND', 'g1', 'C'],
      ['OR', 'g3', 'g4'],
    ],
    outputs: { SUMA: 'g2', ACARREO: 'g5' },
  },
};

export function referenceCircuit(id) {
  const circuit = createCircuit(getLevel(id));
  const solution = solutions[id];
  const sourceId = (name) => (name.startsWith('g') ? `gate-${name}` : `input-${name}`);
  const connect = (source, target, targetHandle) => {
    circuit.edges.push({
      id: `wire-${circuit.edges.length}`,
      source: sourceId(source),
      sourceHandle: 'out',
      target,
      targetHandle,
    });
  };
  solution.gates.forEach(([gateType, ...inputs], index) => {
    const nodeId = `gate-g${index + 1}`;
    circuit.nodes.push({
      id: nodeId,
      type: 'gate',
      position: { x: 230 + index * 50, y: 80 },
      data: { gateType },
    });
    inputs.forEach((source, port) => connect(source, nodeId, port === 0 ? 'a' : 'b'));
  });
  Object.entries(solution.outputs).forEach(([output, source]) =>
    connect(source, `output-${output}`, 'in'),
  );
  return circuit;
}

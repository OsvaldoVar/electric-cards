import { createCircuit } from '../../src/engine/createCircuit';
import { getLevel } from '../../src/data/levels';
import { targetPorts } from '../../src/engine/operations';

// Independent reference constructions, not copied from objective expressions.
const solutions = {
  36: {
    gates: [
      ['AND', 'A', 'B'],
      ['AND', 'g1', 'C'],
    ],
    outputs: { DOOR: 'g2' },
  },
  37: {
    gates: [
      ['OR', 'A', 'B'],
      ['OR', 'g1', 'C'],
    ],
    outputs: { LED: 'g2' },
  },
  38: {
    gates: [
      ['AND', 'A', 'B'],
      ['AND', 'C', 'D'],
      ['AND', 'g1', 'g2'],
    ],
    outputs: { DOOR: 'g3' },
  },
  42: {
    gates: [
      ['AND', 'A', 'B'],
      ['OR', 'A', 'B'],
      ['AND', 'C', 'g2'],
      ['OR', 'g1', 'g3'],
      ['NOT', 'g4'],
    ],
    outputs: { MAYORIA: 'g4', OPUESTO: 'g5' },
  },
  43: {
    gates: [
      ['NAND', 'A', 'B'],
      ['NAND', 'A', 'g1'],
      ['NAND', 'B', 'g1'],
      ['NAND', 'g2', 'g3'],
      ['NAND', 'g4', 'g4'],
      ['NAND', 'g1', 'g1'],
    ],
    outputs: { DIF: 'g4', IGUAL: 'g5', ACARREO: 'g6' },
  },
  39: {
    gates: [
      ['CLOCK'],
      ['OR', 'A', 'B'],
      ['NOT', 'C'],
      ['AND', 'g2', 'g3'],
      ['DFF', 'g4', 'g1'],
    ],
    outputs: { LED: 'g5' },
  },
  40: {
    gates: [
      ['CLOCK'],
      ['XOR', 'A', 'B'],
      ['AND', 'A', 'B'],
      ['DFF', 'g2', 'g1'],
      ['TFF', 'g3', 'g1'],
    ],
    outputs: { DATO: 'g4', CAMBIO: 'g5' },
  },
  41: {
    gates: [
      ['CLOCK'],
      ['AND', 'A', 'B'],
      ['NOT', 'C'],
      ['OR', 'g2', 'g3'],
      ['DFF', 'g4', 'g1'],
      ['DFF', 'g5', 'g1'],
      ['TFF', 'g4', 'g1'],
    ],
    outputs: { DATO: 'g5', RETRASO: 'g6', CAMBIO: 'g7' },
  },
  44: {
    gates: [
      ['CLOCK'],
      ['NOT', 'A'],
      ['DFF', 'g2', 'g1'],
      ['DFF', 'g3', 'g1'],
      ['TFF', 'g2', 'g1'],
    ],
    outputs: { DATO: 'g3', RETRASO: 'g4', CAMBIO: 'g5' },
  },
  45: {
    gates: [
      ['CLOCK'],
      ['NOT', 'C'],
      ['AND', 'A', 'g2'],
      ['AND', 'B', 'C'],
      ['OR', 'g3', 'g4'],
      ['DFF', 'g5', 'g1'],
      ['DFF', 'g6', 'g1'],
      ['TFF', 'g5', 'g1'],
    ],
    outputs: { DATO: 'g6', RETRASO: 'g7', CAMBIO: 'g8' },
  },
  26: { gates: [['CLOCK']], outputs: { LED: 'g1' } },
  27: { gates: [['CLOCK'], ['NOT', 'g1']], outputs: { PULSO: 'g1', REPOSO: 'g2' } },
  28: { gates: [['CLOCK'], ['DFF', 'A', 'g1']], outputs: { LED: 'g2' } },
  29: { gates: [['CLOCK'], ['NOT', 'A'], ['DFF', 'g2', 'g1']], outputs: { LED: 'g3' } },
  30: { gates: [['CLOCK'], ['AND', 'A', 'B'], ['DFF', 'g2', 'g1']], outputs: { LED: 'g3' } },
  31: {
    gates: [['CLOCK'], ['DFF', 'A', 'g1'], ['DFF', 'g2', 'g1']],
    outputs: { PRIMERO: 'g2', SEGUNDO: 'g3' },
  },
  32: { gates: [['CLOCK'], ['TFF', 'A', 'g1']], outputs: { LED: 'g2' } },
  33: { gates: [['CLOCK'], ['NOT', 'A'], ['TFF', 'g2', 'g1']], outputs: { LED: 'g3' } },
  34: { gates: [['CLOCK'], ['XOR', 'A', 'B'], ['TFF', 'g2', 'g1']], outputs: { LED: 'g3' } },
  35: {
    gates: [['CLOCK'], ['DFF', 'A', 'g1'], ['TFF', 'A', 'g1']],
    outputs: { DATO: 'g2', CAMBIO: 'g3' },
  },
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
    const ports = targetPorts({ type: 'gate', data: { gateType } });
    inputs.forEach((source, port) => connect(source, nodeId, ports[port]));
  });
  Object.entries(solution.outputs).forEach(([output, source]) =>
    connect(source, `output-${output}`, 'in'),
  );
  return circuit;
}

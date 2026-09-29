import { describe, expect, it } from 'vitest';
import { evaluateCircuit } from '../../src/engine/evaluateCircuit';
import { validateCircuit, validateConnection } from '../../src/engine/validateCircuit';
import { topologicalSort, wouldCreateCycle } from '../../src/engine/graph';
import { createCircuit, remainingInventory } from '../../src/engine/createCircuit';
import { getLevel } from '../../src/data/levels';
import { referenceCircuit } from '../fixtures/solutions';

describe('Circuit engine', () => {
  it('sorts and evaluates without mutating the circuit', () => {
    const circuit = referenceCircuit(4);
    circuit.nodes.reverse();
    const saved = JSON.stringify(circuit);
    expect(evaluateCircuit(circuit, { A: 1, B: 1, C: 0 }).outputs).toEqual({ DOOR: 1 });
    expect(evaluateCircuit(circuit, { A: 1, B: 0, C: 0 }).outputs).toEqual({ DOOR: 0 });
    expect(JSON.stringify(circuit)).toBe(saved);
  });
  it('supports fan-out, shared intermediates and multiple outputs', () => {
    const circuit = referenceCircuit(25);
    expect(evaluateCircuit(circuit, { A: 1, B: 1, C: 1 }).outputs).toEqual({
      SUMA: 1,
      ACARREO: 1,
    });
    expect(evaluateCircuit(circuit, { A: 1, B: 1, C: 0 }).outputs).toEqual({
      SUMA: 0,
      ACARREO: 1,
    });
  });
  it('allows a source to feed both ports of a gate', () => {
    expect(evaluateCircuit(referenceCircuit(21), { A: 1, B: 1 }).outputs.DOOR).toBe(1);
  });
  it('marks an incomplete preview as unknown and refuses completion', () => {
    const circuit = createCircuit(getLevel(1));
    expect(evaluateCircuit(circuit, { A: 0, B: 0 }).error).toBe('MISSING_CONNECTION');
    expect(
      evaluateCircuit(circuit, { A: 0, B: 0 }, { allowIncomplete: true }).outputs,
    ).toEqual({ DOOR: null });
  });
  it('rejects missing signals', () => {
    expect(evaluateCircuit(referenceCircuit(1), { A: 1 }).error).toBe('INVALID_SIGNAL');
    expect(evaluateCircuit(referenceCircuit(1), { A: 1, B: 2 }).error).toBe('INVALID_SIGNAL');
  });
  it('rejects duplicate incoming wires and reversed/invalid ports', () => {
    const circuit = referenceCircuit(1);
    const first = circuit.edges[0];
    expect(validateConnection(circuit, { ...first, source: 'input-B' }).error.code).toBe(
      'PORT_OCCUPIED',
    );
    circuit.edges.push({ ...first, id: 'duplicate' });
    expect(
      validateCircuit(circuit).errors.some((error) => error.code === 'PORT_OCCUPIED'),
    ).toBe(true);
    circuit.edges.pop();
    circuit.edges[0].source = 'output-DOOR';
    expect(validateCircuit(circuit).errors[0].code).toBe('INVALID_EDGE');
    circuit.edges[0].source = 'input-A';
    circuit.edges[0].targetHandle = 'c';
    expect(validateCircuit(circuit).errors[0].code).toBe('INVALID_EDGE');
  });
  it('rejects cycles before adding wires and detects imported cycles', () => {
    const circuit = referenceCircuit(21);
    circuit.edges = circuit.edges.filter((edge) => edge.target !== 'gate-g1');
    expect(
      validateConnection(circuit, {
        source: 'gate-g2',
        sourceHandle: 'out',
        target: 'gate-g1',
        targetHandle: 'a',
      }).error.code,
    ).toBe('CYCLE_DETECTED');
    expect(
      validateConnection(circuit, {
        source: 'gate-g1',
        sourceHandle: 'out',
        target: 'gate-g1',
        targetHandle: 'a',
      }).error.code,
    ).toBe('SELF_CONNECTION');
    circuit.edges.push({
      id: 'cycle',
      source: 'gate-g2',
      sourceHandle: 'out',
      target: 'gate-g1',
      targetHandle: 'a',
    });
    expect(topologicalSort(circuit.nodes, circuit.edges)).toBe(null);
    expect(validateCircuit(circuit, { allowIncomplete: true }).errors[0].code).toBe(
      'CYCLE_DETECTED',
    );
    expect(wouldCreateCycle(circuit.edges, 'gate-g2', 'gate-g1')).toBe(true);
  });
  it('defends malformed nodes, missing endpoints and duplicate IDs', () => {
    expect(validateCircuit(null).valid).toBe(false);
    expect(validateCircuit({ nodes: [null], edges: [] }).valid).toBe(false);
    const circuit = referenceCircuit(1);
    circuit.nodes.push(circuit.nodes[0]);
    expect(validateCircuit(circuit).errors[0].code).toBe('DUPLICATE_NODE');
    circuit.nodes.pop();
    circuit.edges[0].target = 'nonexistent';
    expect(validateCircuit(circuit).valid).toBe(false);
  });
  it('derives the finite inventory from nodes', () => {
    expect(remainingInventory(getLevel(1), referenceCircuit(1))).toEqual({ AND: 0, OR: 1 });
  });
});

import { describe, expect, it } from 'vitest';
import {
  initialSimulation,
  nextFlipFlopValue,
  stepSequentialCircuit,
} from '../../src/engine/sequential';
import { evaluateCircuit } from '../../src/engine/evaluateCircuit';
import { validateLevel } from '../../src/engine/validateLevel';
import { getLevel } from '../../src/data/levels';
import { referenceCircuit } from '../fixtures/solutions';

describe('Clocked memory', () => {
  for (const type of ['DFF', 'TFF']) {
    it(`${type} updates on rising edges and holds on all other transitions`, () => {
      for (const q of [0, 1])
        for (const data of [0, 1]) {
          for (const [before, after] of [
            [0, 0],
            [1, 1],
            [1, 0],
          ]) {
            expect(nextFlipFlopValue(type, q, data, before, after)).toBe(q);
          }
          expect(nextFlipFlopValue(type, q, data, 0, 1)).toBe(
            type === 'DFF' ? data : (q + data) % 2,
          );
        }
      expect(() => nextFlipFlopValue(type, 0, 2, 0, 1)).toThrow('INVALID_SIGNAL');
    });
  }
  it('two D registers sample the old state simultaneously, and a held clock never recaptures', () => {
    const circuit = referenceCircuit(31);
    const state = initialSimulation();
    const rising = stepSequentialCircuit(circuit, { A: 1 }, state, { clock: 1 });
    expect(rising.outputs).toEqual({ PRIMERO: 1, SEGUNDO: 0 });
    const held = stepSequentialCircuit(circuit, { A: 0 }, rising.simulation, { clock: 1 });
    expect(held.outputs).toEqual({ PRIMERO: 1, SEGUNDO: 0 });
    const falling = stepSequentialCircuit(circuit, { A: 0 }, held.simulation, { clock: 0 });
    expect(falling.outputs).toEqual({ PRIMERO: 1, SEGUNDO: 0 });
    const second = stepSequentialCircuit(circuit, { A: 0 }, falling.simulation, { clock: 1 });
    expect(second.outputs).toEqual({ PRIMERO: 0, SEGUNDO: 1 });
    expect(state).toEqual(initialSimulation());
  });
  it('keeps clocks and independent memories deterministic and rejects invalid signals', () => {
    const circuit = referenceCircuit(35);
    let result = stepSequentialCircuit(circuit, { A: 1 }, initialSimulation(), { clock: 1 });
    expect(result.outputs).toEqual({ DATO: 1, CAMBIO: 1 });
    result = stepSequentialCircuit(circuit, { A: 1 }, result.simulation, { clock: 0 });
    result = stepSequentialCircuit(circuit, { A: 1 }, result.simulation, { clock: 1 });
    expect(result.outputs).toEqual({ DATO: 1, CAMBIO: 0 });
    expect(
      stepSequentialCircuit(circuit, { A: 1 }, initialSimulation(), { clock: 2 }).error,
    ).toBe('INVALID_SIGNAL');
    expect(
      evaluateCircuit(
        circuit,
        { A: 1 },
        { simulation: { clock: 0, memory: { 'gate-g2': { q: 2 } } } },
      ).error,
    ).toBe('INVALID_SIGNAL');
  });
  it('fails a wire that matches a sample but loses the required memory, and rejects missing clock wiring', () => {
    const level = getLevel(28);
    const circuit = referenceCircuit(28);
    circuit.edges.find((edge) => edge.target === 'output-LED').source = 'input-A';
    const result = validateLevel(level, circuit);
    expect(result.success).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
    circuit.edges = circuit.edges.filter((edge) => edge.targetHandle !== 'clk');
    expect(
      validateLevel(level, circuit).errors.some(
        (error) => error.code === 'MISSING_CONNECTION',
      ),
    ).toBe(true);
  });
});

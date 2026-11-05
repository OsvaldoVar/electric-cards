import { describe, expect, it } from 'vitest';
import { levels } from '../../../src/data/levels';
import { evaluateCircuit } from '../../../src/engine/evaluateCircuit';
import { evaluatePreparedCircuit, prepareCircuit } from '../../../src/engine/prepareCircuit';
import {
  initialSimulation,
  stepPreparedCircuit,
  stepSequentialCircuit,
} from '../../../src/engine/sequential';
import { validateCircuit } from '../../../src/engine/validateCircuit';
import { referenceCircuit } from '../../fixtures/solutions';

const prepare = (circuit) => {
  const validation = validateCircuit(circuit);
  expect(validation.valid).toBe(true);
  return prepareCircuit(circuit, validation.order);
};

describe('Prepared circuit evaluation', () => {
  it('matches the public combinational evaluator for every reference case', () => {
    const combinational = levels.filter((level) => level.kind !== 'sequential');
    expect(combinational.length).toBeGreaterThan(0);
    for (const level of combinational) {
      const circuit = referenceCircuit(level.id);
      const plan = prepare(circuit);
      for (const test of level.tests) {
        const publicResult = evaluateCircuit(circuit, test.inputs);
        const preparedResult = evaluatePreparedCircuit(plan, test.inputs);
        expect(preparedResult).toEqual(publicResult);
        expect(preparedResult.outputs).toEqual(test.outputs);
      }
    }
  });

  it('matches the public sequential evaluator while sampling previous Q values', () => {
    const sequential = levels.filter((level) => level.kind === 'sequential');
    expect(sequential.length).toBeGreaterThan(0);
    for (const level of sequential) {
      const circuit = referenceCircuit(level.id);
      const plan = prepare(circuit);
      let publicSimulation = initialSimulation();
      let preparedSimulation = initialSimulation();
      let scenario;
      for (const test of level.tests) {
        if (scenario !== test.scenario) {
          publicSimulation = initialSimulation();
          preparedSimulation = initialSimulation();
          scenario = test.scenario;
        }
        const publicResult = stepSequentialCircuit(circuit, test.inputs, publicSimulation, {
          clock: test.clock,
        });
        const preparedResult = stepPreparedCircuit(plan, test.inputs, preparedSimulation, {
          clock: test.clock,
        });
        expect(preparedResult).toEqual(publicResult);
        for (const output of level.outputs)
          expect(preparedResult.outputs?.[output.id]).toBe(test.outputs[output.id]);
        publicSimulation = publicResult.simulation;
        preparedSimulation = preparedResult.simulation;
      }
    }
  });

  it('rejects invalid input signals from a prepared plan', () => {
    const plan = prepare(referenceCircuit(1));
    expect(evaluatePreparedCircuit(plan, { A: 1 }).error).toBe('INVALID_SIGNAL');
    expect(evaluatePreparedCircuit(plan, { A: 1, B: 2 }).error).toBe('INVALID_SIGNAL');
    expect(evaluatePreparedCircuit(plan, null).error).toBe('INVALID_SIGNAL');
  });

  it('accepts only binary clocks in a prepared sequential step', () => {
    const plan = prepare(referenceCircuit(28));
    expect(stepPreparedCircuit(plan, { A: 1 }, initialSimulation(), { clock: 2 }).error).toBe(
      'INVALID_SIGNAL',
    );
  });
});

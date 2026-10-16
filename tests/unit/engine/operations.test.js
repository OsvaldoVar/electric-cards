import { describe, expect, it } from 'vitest';
import { evaluateExpression, evaluateGate } from '../../../src/engine/evaluateGate';

const expected = {
  AND: [0, 0, 0, 1],
  OR: [0, 1, 1, 1],
  NAND: [1, 1, 1, 0],
  NOR: [1, 0, 0, 0],
  XOR: [0, 1, 1, 0],
  XNOR: [1, 0, 0, 1],
};
describe('Boolean primitives', () => {
  for (const [gate, table] of Object.entries(expected)) {
    it(`${gate}: complete truth table`, () => {
      expect(
        [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ].map((inputs) => evaluateGate(gate, inputs)),
      ).toEqual(table);
    });
  }
  it('NOT inverts both values', () => {
    expect(evaluateGate('NOT', [0])).toBe(1);
    expect(evaluateGate('NOT', [1])).toBe(0);
  });
  it('rejects unsupported gates, wrong arity and non-binary values', () => {
    expect(() => evaluateGate('BUFF', [1])).toThrow('UNKNOWN_GATE');
    expect(() => evaluateGate('AND', [1])).toThrow('WRONG_INPUT_COUNT');
    for (const value of [true, '1', 2, null, undefined])
      expect(() => evaluateGate('NOT', [value])).toThrow('INVALID_SIGNAL');
  });
  it('evaluates nested declarative objectives without eval', () => {
    expect(evaluateExpression(['OR', ['AND', 'A', 'B'], 'C'], { A: 1, B: 0, C: 1 })).toBe(1);
  });
});

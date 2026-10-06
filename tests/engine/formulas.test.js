import { describe, expect, it } from 'vitest';
import { formatExpression } from '../../src/engine/formatExpression';
import { levels, getLevel } from '../../src/data/levels';
import { gateOperations } from '../../src/engine/operations';
import { referenceCircuit } from '../fixtures/solutions';
import { validateLevel } from '../../src/engine/validateLevel';

describe('Formula hints and distracting inventory', () => {
  it('preserves grouping and negation in familiar algebraic notation', () => {
    expect(formatExpression(['OR', 'A', ['AND', 'B', 'C']])).toBe('A + BC');
    expect(formatExpression(['AND', ['OR', 'A', 'B'], 'C'])).toBe('(A + B)C');
    expect(formatExpression(['AND', 'A', ['NOT', ['OR', 'B', 'C']]])).toBe('A¬(B + C)');
    expect(formatExpression(['NAND', 'A', 'B'])).toBe('¬(AB)');
    expect(formatExpression(['NOR', 'A', 'B'])).toBe('¬(A + B)');
    expect(formatExpression(['XNOR', 'A', 'B'])).toBe('¬(A ⊕ B)');
    expect(formatExpression(['XOR', ['OR', 'A', 'B'], 'C'])).toBe('(A + B) ⊕ C');
  });
  it('shows the authored goal rather than the currently built circuit', () => {
    expect(getLevel(1).outputs[0].formula).toBe('AB');
    expect(getLevel(4).outputs[0].formula).toBe('AB + C');
    expect(getLevel(10).outputs[0].formula).toBe('¬(A + B)');
    expect(getLevel(24).outputs[0].formula).toBe('A¬S + BS');
    expect(getLevel(25).outputs.map((output) => output.formula)).toEqual([
      'A ⊕ B ⊕ C',
      'AB + C(A ⊕ B)',
    ]);
  });
  it('keeps distractors in advanced lessons and formulas correct across all combinational levels', () => {
    for (const level of levels.filter((item) => item.kind !== 'sequential')) {
      if (level.distractor) {
        expect(level.inventory[level.distractor]).toBe(1);
        expect(Object.hasOwn(gateOperations, level.distractor)).toBe(true);
      }
      const circuit = referenceCircuit(level.id);
      if (level.distractor) {
        expect(circuit.nodes.some((node) => node.data.gateType === level.distractor)).toBe(
          false,
        );
      }
      expect(validateLevel(level, circuit).success).toBe(true);
      expect(level.outputs.every((output) => output.formula.length > 0)).toBe(true);
    }
  });
});

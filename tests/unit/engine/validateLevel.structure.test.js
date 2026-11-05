import { describe, expect, it, vi } from 'vitest';
import { getLevel } from '../../../src/data/levels';
import { referenceCircuit } from '../../fixtures/solutions';

vi.mock('../../../src/engine/validateCircuit', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, validateCircuit: vi.fn(actual.validateCircuit) };
});

const { validateCircuit } = await import('../../../src/engine/validateCircuit');
const { validateLevel } = await import('../../../src/engine/validateLevel');

describe('Exhaustive level validation cost', () => {
  it('performs the structural validation once for 512 sequential steps', () => {
    const level = getLevel(45);
    expect(level.tests).toHaveLength(512);
    validateCircuit.mockClear();
    const result = validateLevel(level, referenceCircuit(45));
    expect(result.success).toBe(true);
    expect(validateCircuit).toHaveBeenCalledTimes(1);
  });

  it('performs the structural validation once for a combinational level', () => {
    const level = getLevel(16);
    expect(level.tests).toHaveLength(8);
    validateCircuit.mockClear();
    expect(validateLevel(level, referenceCircuit(16)).success).toBe(true);
    expect(validateCircuit).toHaveBeenCalledTimes(1);
  });

  it('stops after the single structural validation when the circuit is invalid', () => {
    const level = getLevel(1);
    const circuit = referenceCircuit(1);
    circuit.edges = [];
    validateCircuit.mockClear();
    const result = validateLevel(level, circuit);
    expect(result.errors.some((error) => error.code === 'MISSING_CONNECTION')).toBe(true);
    expect(validateCircuit).toHaveBeenCalledTimes(1);
  });
});

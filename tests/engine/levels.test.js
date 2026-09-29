import { describe, expect, it } from 'vitest';
import { levels, getLevel } from '../../src/data/levels';
import { validateLevel } from '../../src/engine/validateLevel';
import { createCircuit } from '../../src/engine/createCircuit';
import { referenceCircuit } from '../fixtures/solutions';

describe('All-case level validation', () => {
  for (const level of levels) {
    it(`level ${level.id}: reference solution passes every combination with 3 stars`, () => {
      expect(level.tests).toHaveLength(2 ** level.inputs.length);
      expect(new Set(level.tests.map((test) => JSON.stringify(test.inputs))).size).toBe(
        level.tests.length,
      );
      const result = validateLevel(level, referenceCircuit(level.id));
      expect(result.errors).toEqual([]);
      expect(result.failures).toEqual([]);
      expect(result.success).toBe(true);
      expect(result.testsPassed).toBe(level.tests.length);
      expect(result.stars).toBe(3);
    });
  }
  it('fails a circuit that looks correct for the visible input but fails another row', () => {
    const level = getLevel(1);
    const circuit = createCircuit(level);
    circuit.edges.push({
      id: 'direct',
      source: 'input-A',
      sourceHandle: 'out',
      target: 'output-DOOR',
      targetHandle: 'in',
    });
    const result = validateLevel(level, circuit);
    expect(result.success).toBe(false);
    expect(result.testsPassed).toBe(3);
    expect(result.failures).toEqual([
      { inputs: { A: 1, B: 0 }, expected: { DOOR: 0 }, received: { DOOR: 1 }, passed: false },
    ]);
  });
  it('cannot bypass gate inventories or replace fixed terminals', () => {
    const circuit = referenceCircuit(1);
    circuit.nodes.find((node) => node.type === 'gate').data.gateType = 'NAND';
    expect(
      validateLevel(getLevel(1), circuit).errors.some(
        (error) => error.code === 'INVENTORY_EXCEEDED',
      ),
    ).toBe(true);
    circuit.nodes[0].data.inputId = 'EVIL';
    expect(
      validateLevel(getLevel(1), circuit).errors.some(
        (error) => error.code === 'LEVEL_TERMINALS',
      ),
    ).toBe(true);
  });
  it('awards stars based on all placed gates, including connected unused nodes', () => {
    const level = getLevel(16);
    const circuit = referenceCircuit(16);
    const addUnused = (id, type, sources) => {
      circuit.nodes.push({
        id,
        type: 'gate',
        data: { gateType: type },
        position: { x: 0, y: 0 },
      });
      sources.forEach((source, index) =>
        circuit.edges.push({
          id: `${id}-${index}`,
          source,
          sourceHandle: 'out',
          target: id,
          targetHandle: index === 0 ? 'a' : 'b',
        }),
      );
    };
    expect(validateLevel(level, circuit).stars).toBe(3);
    addUnused('unused-not', 'NOT', ['input-A']);
    expect(validateLevel(level, circuit).stars).toBe(2);
    addUnused('unused-and', 'AND', ['input-A', 'input-B']);
    expect(validateLevel(level, circuit).stars).toBe(1);
  });
});

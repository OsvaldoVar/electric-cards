import { evaluateExpression } from '../../engine/evaluateGate';
import { formatExpression } from '../../engine/formatExpression';

// Advanced lessons retain their optional distractor.
// Introductory lessons restrict inventory to a single gate type in the registry.
const distractors = {
  1: 'OR',
  2: 'AND',
  3: 'OR',
  4: 'NOT',
  5: 'NOT',
  6: 'OR',
  7: 'AND',
  8: 'OR',
  9: 'AND',
  10: 'XOR',
  11: 'OR',
  12: 'AND',
  13: 'OR',
  14: 'AND',
  15: 'AND',
  16: 'NOT',
  17: 'XOR',
  18: 'XOR',
  19: 'OR',
  20: 'OR',
  21: 'OR',
  22: 'AND',
  23: 'OR',
  24: 'NAND',
  25: 'NOT',
};

export function createLevel(record) {
  const { inputIds, goals, ...rest } = record;
  const inputs = inputIds.map((id) => ({
    id,
    label: id === 'S' ? 'Selector S' : `Sensor ${id}`,
  }));
  const outputs = Object.entries(goals).map(([id, value]) => ({
    id,
    label: value[0],
    type: value[1],
    formula: formatExpression(value[2]),
  }));
  const tests = Array.from({ length: 2 ** inputs.length }, (_, index) => {
    const values = Object.fromEntries(
      inputIds.map((id, bit) => [id, (index >> (inputIds.length - bit - 1)) & 1]),
    );
    return {
      inputs: values,
      outputs: Object.fromEntries(
        Object.entries(goals).map(([id, value]) => [id, evaluateExpression(value[2], values)]),
      ),
    };
  });
  return {
    ...rest,
    distractor: distractors[rest.id],
    inventory: {
      ...rest.inventory,
      ...(distractors[rest.id]
        ? { [distractors[rest.id]]: rest.inventory[distractors[rest.id]] ?? 1 }
        : {}),
    },
    difficulty: rest.world,
    inputs,
    outputs,
    tests,
  };
}

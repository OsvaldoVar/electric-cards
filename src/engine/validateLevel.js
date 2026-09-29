import { evaluateCircuit } from './evaluateCircuit';
import { validateCircuit } from './validateCircuit';

export function validateLevel(level, circuit) {
  const gateCount = Array.isArray(circuit?.nodes)
    ? circuit.nodes.filter((node) => node?.type === 'gate').length
    : 0;
  const validation = validateCircuit(circuit, { level });
  if (!validation.valid) {
    return {
      success: false,
      testsPassed: 0,
      totalTests: level.tests.length,
      failures: [],
      cases: [],
      errors: validation.errors,
      gateCount,
      stars: 0,
    };
  }
  const cases = level.tests.map(({ inputs, outputs: expected }) => {
    const result = evaluateCircuit(circuit, inputs);
    const received = result.outputs ?? {};
    const passed =
      result.valid &&
      level.outputs.every((output) => received[output.id] === expected[output.id]);
    return { inputs, expected, received, passed };
  });
  const failures = cases.filter((test) => !test.passed);
  const success = failures.length === 0 && cases.length > 0;
  const stars = !success
    ? 0
    : gateCount <= level.stars.maxGates3
      ? 3
      : gateCount <= level.stars.maxGates2
        ? 2
        : 1;
  return {
    success,
    testsPassed: cases.length - failures.length,
    totalTests: cases.length,
    failures,
    cases,
    errors: [],
    gateCount,
    stars,
  };
}

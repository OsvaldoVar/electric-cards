import { evaluateCircuit } from './evaluateCircuit';
import { validateCircuit } from './validateCircuit';
import { initialSimulation, stepSequentialCircuit } from './sequential';

export function validateLevel(level, circuit, options = {}) {
  const gateCount = Array.isArray(circuit?.nodes)
    ? circuit.nodes.filter((node) => node?.type === 'gate').length
    : 0;
  const validation = validateCircuit(circuit, { ...options, level });
  if (!validation.valid) {
    return {
      success: false,
      testsPassed: 0,
      totalTests: level.tests.length,
      failures: [],
      cases: [],
      errors: validation.errors,
      gateCount,
      canOptimize: false,
    };
  }
  let simulation = initialSimulation();
  let scenario;
  const cases = level.tests.map(
    ({ inputs, outputs: expected, clock, scenario: sequence, step }) => {
      if (level.kind === 'sequential' && scenario !== sequence) {
        simulation = initialSimulation();
        scenario = sequence;
      }
      const result =
        level.kind === 'sequential'
          ? stepSequentialCircuit(circuit, inputs, simulation, { clock })
          : evaluateCircuit(circuit, inputs);
      if (result.simulation) simulation = result.simulation;
      const received = result.outputs ?? {};
      const passed =
        result.valid &&
        level.outputs.every((output) => received[output.id] === expected[output.id]);
      return {
        inputs,
        expected,
        received,
        passed,
        ...(level.kind === 'sequential'
          ? { clock, scenario: sequence, step, simulation }
          : {}),
      };
    },
  );
  const failures = cases.filter((test) => !test.passed);
  const success = failures.length === 0 && cases.length > 0;
  return {
    success,
    testsPassed: cases.length - failures.length,
    totalTests: cases.length,
    failures,
    cases,
    errors: [],
    gateCount,
    canOptimize: success && gateCount > level.optimizationGateCount,
  };
}

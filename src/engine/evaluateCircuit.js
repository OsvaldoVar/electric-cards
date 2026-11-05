import { validateCircuit } from './validateCircuit';
import { evaluatePreparedCircuit, prepareCircuit } from './prepareCircuit';

export function evaluateCircuit(circuit, inputs, options = {}) {
  const validation = validateCircuit(circuit, options);
  if (!validation.valid)
    return { valid: false, error: validation.errors[0].code, errors: validation.errors };
  return evaluatePreparedCircuit(prepareCircuit(circuit, validation.order), inputs, options);
}

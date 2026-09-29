import { gateInputCounts, gateOperations, isBinary } from './operations';

export function evaluateGate(type, inputs) {
  if (!Object.hasOwn(gateOperations, type)) throw new Error('UNKNOWN_GATE');
  if (!Array.isArray(inputs) || inputs.length !== gateInputCounts[type]) {
    throw new Error('WRONG_INPUT_COUNT');
  }
  if (!inputs.every(isBinary)) throw new Error('INVALID_SIGNAL');
  return gateOperations[type](...inputs);
}

// Declarative objectives share the engine primitive; no eval or UI gate logic.
export function evaluateExpression(expression, inputs) {
  if (typeof expression === 'string') {
    if (!isBinary(inputs[expression])) throw new Error('INVALID_SIGNAL');
    return inputs[expression];
  }
  const [type, ...children] = expression;
  return evaluateGate(
    type,
    children.map((child) => evaluateExpression(child, inputs)),
  );
}

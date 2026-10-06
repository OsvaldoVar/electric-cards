import { evaluateExpression } from './evaluateGate';

// Objective models describe required behavior independently of the player's graph.
export function sequentialObjectiveTests({ inputIds, mode, expression = inputIds[0] }) {
  const samples = inputIds.length > 1 ? 2 : 3;
  const sequenceCount = 2 ** (inputIds.length * samples);
  const tests = [];
  for (let scenario = 1; scenario <= sequenceCount; scenario += 1) {
    let q = 0;
    let delayed = 0;
    let toggled = 0;
    let previousClock = 0;
    let step = 0;
    for (let sample = 0; sample < samples; sample += 1) {
      const inputs = Object.fromEntries(
        inputIds.map((id, bit) => [
          id,
          ((scenario - 1) >> (sample * inputIds.length + bit)) & 1,
        ]),
      );
      const changed = Object.fromEntries(inputIds.map((id) => [id, 1 - inputs[id]]));
      for (const [clock, values] of [
        [0, inputs],
        [1, inputs],
        [1, changed],
        [0, changed],
      ]) {
        if (previousClock === 0 && clock === 1 && inputIds.length) {
          const data = evaluateExpression(expression, values);
          delayed = q;
          q = data;
          toggled = Number(toggled !== data);
        }
        previousClock = clock;
        const outputs =
          mode === 'clock'
            ? { LED: clock }
            : mode === 'clockPair'
              ? { PULSO: clock, REPOSO: 1 - clock }
              : mode === 'registerPair'
                ? { PRIMERO: q, SEGUNDO: delayed }
                : mode === 'dual'
                  ? { DATO: q, CAMBIO: toggled }
                  : { LED: mode === 'toggle' ? toggled : q };
        tests.push({ scenario, step: ++step, clock, inputs: { ...values }, outputs });
      }
    }
  }
  return tests;
}

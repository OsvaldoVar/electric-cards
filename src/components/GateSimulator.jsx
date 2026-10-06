import { useState } from 'react';
import { evaluateGate } from '../engine/evaluateGate';
import { GateSymbol } from './GateSymbol';
import { Icon } from './Icon';
import { TruthTable } from './TruthTable/TruthTable';
import { SequentialSimulator } from './SequentialSimulator';

export function GateSimulator({ gate, withTable = true }) {
  return gate.sequential ? (
    <SequentialSimulator gate={gate} />
  ) : (
    <CombinationalSimulator gate={gate} withTable={withTable} />
  );
}

function CombinationalSimulator({ gate, withTable }) {
  const [inputs, setInputs] = useState(Array(gate.inputs).fill(0));
  const output = evaluateGate(gate.id, inputs);
  return (
    <div className={`gate-simulator family-${gate.family}`}>
      <div className="simulator-circuit">
        <div className="sim-inputs">
          {inputs.map((value, index) => (
            <button
              key={index}
              className={`binary-switch bit-${value}`}
              aria-label={`Cambiar entrada ${index === 0 ? 'A' : 'B'}`}
              aria-pressed={value === 1}
              onClick={() =>
                setInputs((current) => current.map((bit, i) => (i === index ? 1 - bit : bit)))
              }
            >
              <span>{index === 0 ? 'A' : 'B'}</span>
              <strong>{value}</strong>
              <span className="switch-indicator" />
            </button>
          ))}
        </div>
        <div className="sim-gate">
          <GateSymbol type={gate.id} />
          <span className="mono">{gate.id}</span>
        </div>
        <div className={`sim-output bit-${output}`} aria-live="polite">
          <Icon name="led" size={37} />
          <strong>Y = {output}</strong>
          <small>{output === 1 ? 'Encendido' : 'Apagado'}</small>
        </div>
      </div>
      <p className="muted small">Toca las entradas para cambiar sus valores.</p>
      {withTable && <TruthTable gate={gate} activeInputs={inputs} />}
    </div>
  );
}

import { useState } from 'react';
import { nextFlipFlopValue } from '../engine/sequential';
import { GateSymbol } from './GateSymbol';
import { TruthTable } from './TruthTable/TruthTable';

export function SequentialSimulator({ gate }) {
  const [data, setData] = useState(0);
  const [memory, setMemory] = useState({ q: 0, clock: 0 });
  const isClock = gate.id === 'CLOCK';
  const label = gate.id === 'DFF' ? 'D' : 'T';
  const advance = () =>
    setMemory((previous) => ({
      clock: 1 - previous.clock,
      q: isClock
        ? 0
        : nextFlipFlopValue(gate.id, previous.q, data, previous.clock, 1 - previous.clock),
    }));
  return (
    <div className={`gate-simulator family-${gate.family}`}>
      <div className="sequential-simulator">
        <GateSymbol type={gate.id} />
        {!isClock && (
          <button
            className={`binary-switch bit-${data}`}
            aria-label={`Cambiar entrada ${label}`}
            aria-pressed={data === 1}
            onClick={() => setData((value) => 1 - value)}
          >
            <span>{label}</span>
            <strong>{data}</strong>
            <span className="switch-indicator" />
          </button>
        )}
        <button className="button button-secondary" onClick={advance}>
          Avanzar reloj
        </button>
        <output className="mono" aria-live="polite">
          {isClock ? `CLK = ${memory.clock}` : `CLK = ${memory.clock} · Q = ${memory.q}`}
        </output>
        <button className="button button-quiet" onClick={() => setMemory({ q: 0, clock: 0 })}>
          Reiniciar memoria
        </button>
      </div>
      <p className="small muted">
        {isClock
          ? 'Cada paso alterna CLK entre 0 y 1.'
          : 'Cambia el dato y avanza el reloj. Q se actualiza solo cuando CLK pasa de 0 a 1.'}
      </p>
      <TruthTable gate={gate} activeInputs={isClock ? [memory.clock] : [data, memory.q]} />
    </div>
  );
}

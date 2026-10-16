import { useLayoutEffect, useRef, useState } from 'react';
import { gates } from '../../../data/gates';
import { unlockedGateIds } from '../../../data/unlocks';
import { tutorialGuide } from '../data/tutorialGuide';
import { useGame } from '../../../state/useGame';
import { GateSimulator } from './GateSimulator';

export function GateTutorials({ level }) {
  const { state, dispatch } = useGame();
  const [replay, setReplay] = useState(null);
  const dialog = useRef(null);
  const unlocked = unlockedGateIds(state.completedLevels);
  const available = Object.keys(level.inventory).filter(
    (id) => level.inventory[id] > 0 && unlocked.includes(id),
  );
  const pending = available.filter((id) => !state.seenTutorials?.[id]);
  const id = replay ?? pending[0];
  const gate = gates[id];
  const dismiss = () => {
    if (!id) return;
    dispatch({ type: 'ACKNOWLEDGE_TUTORIAL', levelId: level.id, gateType: id });
    setReplay(null);
  };
  useLayoutEffect(() => {
    const element = dialog.current;
    if (id && !element.open) element.showModal();
    if (!id && element.open) element.close();
  }, [id]);
  return (
    <>
      <details className="tutorial-library">
        <summary>Mini tutoriales de este nivel</summary>
        <div className="tutorial-library-actions">
          {available.map((type) => (
            <button key={type} className="button button-quiet" onClick={() => setReplay(type)}>
              Repasar {type}
            </button>
          ))}
        </div>
      </details>
      <dialog
        ref={dialog}
        className="completion-dialog gate-tutorial-dialog"
        aria-labelledby="gate-tutorial-title"
        aria-describedby="gate-tutorial-description"
        onCancel={(event) => {
          event.preventDefault();
          dismiss();
        }}
      >
        {gate && (
          <>
            <div className="tutorial-introduction">
              <img
                className="tutorial-guide"
                src={tutorialGuide[id]}
                alt=""
                aria-hidden="true"
                width="112"
                height="112"
                decoding="async"
              />
              <div>
                <p className="muted small">
                  {replay ? 'Repaso' : 'Nuevo componente'} · Nivel {level.id}
                </p>
                <h2 id="gate-tutorial-title">Cómo funciona {gate.name}</h2>
              </div>
            </div>
            <p id="gate-tutorial-description">{gate.description}</p>
            <p className="mono">{gate.expression}</p>
            <p>
              <strong>Ejemplo:</strong> {gate.example}
            </p>
            <GateSimulator key={id} gate={gate} />
            <p className="muted small">
              {gate.sequential
                ? 'Prueba el reloj y observa el estado. Esta demostración no modifica la memoria de tu circuito.'
                : '0 significa apagado y 1 encendido. Cambia las entradas y observa la salida y la fila de la tabla.'}
            </p>
            <div className="completion-actions">
              <button className="button button-primary" onClick={dismiss}>
                {!replay && pending.length > 1 ? 'Siguiente componente' : 'Volver al circuito'}
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { nextLevelAfter, stageForLevel } from '../data/stages';
import { useProgress } from '../hooks/useProgress';
import { gates } from '../data/gates';
import { Icon } from './Icon';
import { GateSymbol } from './GateSymbol';

export function CompletionDialog({ completion, level, onDismiss }) {
  const dialog = useRef(null);
  const navigate = useNavigate();
  const { completedLevels } = useProgress();
  const nextLevel = nextLevelAfter(level.id, completedLevels);
  useLayoutEffect(() => {
    if (completion && !dialog.current.open) dialog.current.showModal();
    if (!completion && dialog.current.open) dialog.current.close();
  }, [completion]);
  return (
    <dialog
      ref={dialog}
      className="completion-dialog"
      aria-labelledby="completion-title"
      aria-describedby="completion-description"
      onCancel={onDismiss}
      onClose={onDismiss}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = [...dialog.current.querySelectorAll('button:not([disabled])')];
        const first = buttons[0];
        const last = buttons.at(-1);
        if (
          (!event.shiftKey && document.activeElement === last) ||
          (event.shiftKey && document.activeElement === first)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }}
    >
      {completion && (
        <>
          <span className="completion-check" aria-hidden="true">
            <Icon name="check" size={30} />
          </span>
          <h2 id="completion-title">¡Circuito correcto!</h2>
          <p id="completion-description">
            {level.kind === 'sequential'
              ? 'Todas las secuencias de prueba funcionan. Tu circuito recuerda y cambia en los pasos correctos.'
              : 'Todas las combinaciones son correctas. Has completado este nivel.'}
          </p>
          {level.challenge && (
            <p className="completion-stage">
              Etapa {level.stage} acreditada.{' '}
              {nextLevel
                ? 'Puedes continuar a la siguiente etapa y volver a practicar los niveles omitidos.'
                : 'Has acreditado las cinco etapas. Puedes volver al mapa para practicar.'}
            </p>
          )}
          {completion.unlocked.length > 0 && (
            <div className="completion-unlocks">
              <h3>Has desbloqueado</h3>
              {completion.unlocked.map((id) => (
                <div className="completion-unlock" key={id}>
                  <GateSymbol type={id} />
                  <div>
                    <strong>{gates[id].name}</strong>
                    <span>{gates[id].character.ability}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {completion.result.canOptimize && (
            <p className="completion-optimization">
              Puedes usar menos compuertas: tu circuito utiliza {completion.result.gateCount};
              este nivel se puede resolver con {level.optimizationGateCount}.
            </p>
          )}
          <div className="completion-actions">
            <button
              className="button button-primary"
              autoFocus
              onClick={() => {
                onDismiss();
                navigate(nextLevel ? `/puzzle/${nextLevel}` : '/levels');
              }}
            >
              {nextLevel
                ? level.challenge
                  ? `Continuar a la etapa ${stageForLevel(nextLevel).id}`
                  : 'Siguiente nivel'
                : 'Ver recorrido'}
              <Icon name="arrow" size={18} />
            </button>
            <button className="button button-quiet" onClick={onDismiss}>
              Seguir explorando
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}

import { useState } from 'react';
import { Icon } from '../../../shared/ui/Icon';

export function PuzzleControls({ game }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <div className="puzzle-controls">
        <button className="button button-quiet" onClick={() => setConfirming(true)}>
          <Icon name="reset" size={17} />
          Reiniciar
        </button>
        <div className="controls-right">
          <button
            className="button button-accent"
            aria-label="Probar circuito"
            onClick={game.test}
          >
            <Icon name="play" size={17} />
            <span className="control-label-full">Probar circuito</span>
            <span className="control-label-short" aria-hidden="true">
              Probar
            </span>
          </button>
        </div>
      </div>
      {confirming && (
        <div className="reset-confirmation" role="alert">
          <p>¿Vaciar el tablero? Los niveles completados se conservan.</p>
          <button className="button button-secondary" onClick={() => setConfirming(false)}>
            Cancelar
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              game.reset();
              setConfirming(false);
            }}
          >
            Vaciar tablero
          </button>
        </div>
      )}
    </>
  );
}

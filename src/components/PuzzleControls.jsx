import { useState } from 'react';
import { Icon } from './Icon';

export function PuzzleControls({ game, level }) {
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
            className="button button-secondary"
            onClick={game.showHint}
            disabled={game.hintCount >= level.hints.length}
          >
            <Icon name="help" size={17} />
            Pista
          </button>
          <button className="button button-primary" onClick={game.test}>
            <Icon name="play" size={17} />
            Probar circuito
          </button>
        </div>
      </div>
      {confirming && (
        <div className="reset-confirmation" role="alert">
          <p>¿Vaciar el tablero? Las estrellas obtenidas se conservan.</p>
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
      {game.hintCount > 0 && (
        <div className="hint-panel" role="status">
          <Icon name="help" />
          <div>
            <strong>Una idea para avanzar</strong>
            <p>{level.hints[game.hintCount - 1]}</p>
          </div>
        </div>
      )}
    </>
  );
}

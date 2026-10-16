import { stageForLevel } from '../../../data/stages';
import { useGame } from '../../../state/useGame';
import { GateTutorials } from '../../learning';
import { Icon } from '../../../shared/ui/Icon';
import { GateInventory } from './GateInventory';
import { LevelObjective } from './LevelObjective/LevelObjective';
import { PuzzleHint } from './PuzzleHint';
import { TestResults } from './TestResults';
import { ClockControls } from './ClockControls';

export function PuzzleSidebar({ level, game }) {
  const { storageAvailable } = useGame();
  return (
    <div className="puzzle-sidebar-frame pixel-frame">
      <aside className="puzzle-sidebar" aria-label="Objetivo y compuertas" tabIndex={0}>
        <p className="stage-context">
          Etapa {level.stage} ·{' '}
          {level.challenge ? 'Reto para acreditar la etapa' : stageForLevel(level.id).title}
        </p>
        <LevelObjective level={level} game={game} />
        <GateTutorials level={level} />
        <GateInventory
          inventory={game.inventory}
          lockedGates={game.lockedGates}
          onAdd={game.addGate}
        />
        {level.kind === 'sequential' && <ClockControls game={game} />}
        <PuzzleHint level={level} game={game} />
        <details className="objective-test-inputs">
          <summary>
            Entradas de prueba <Icon name="play" size={15} />
          </summary>
          <div className="input-switches">
            {level.inputs.map((input) => (
              <button
                key={input.id}
                className={`binary-switch bit-${game.inputs[input.id]}`}
                aria-label={`Cambiar sensor ${input.id}`}
                aria-pressed={game.inputs[input.id] === 1}
                onClick={() =>
                  game.setInputs({ ...game.inputs, [input.id]: 1 - game.inputs[input.id] })
                }
              >
                <span>{input.id}</span>
                <strong>{game.inputs[input.id]}</strong>
                <span className="switch-indicator" />
              </button>
            ))}
          </div>
          <p className="muted small">
            También puedes cambiar cada entrada directamente en el tablero.
          </p>
        </details>
        <div className="puzzle-bottom">
          {game.message && (
            <p className="connection-error" role="alert">
              {game.message}
            </p>
          )}
          <TestResults
            result={game.result}
            playback={game.playback}
            level={level}
            onCase={game.inspectCase}
          />
        </div>
        <p className="save-caption">
          <Icon name={storageAvailable ? 'check' : 'help'} size={17} />
          {storageAvailable
            ? 'Tu progreso se guarda en este navegador.'
            : 'El guardado no está disponible en este navegador.'}
        </p>
      </aside>
    </div>
  );
}

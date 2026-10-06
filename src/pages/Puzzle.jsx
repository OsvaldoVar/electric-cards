import { Link, useParams } from 'react-router-dom';
import { canAccessLevel, stageForLevel } from '../data/stages';
import { getLevel } from '../data/levels';
import { useProgress } from '../hooks/useProgress';
import { usePuzzle } from '../hooks/usePuzzle';
import { useGame } from '../hooks/useGame';
import { CircuitBoard } from '../components/CircuitBoard/CircuitBoard';
import { GateInventory } from '../components/GateInventory/GateInventory';
import { LevelObjective } from '../components/LevelObjective/LevelObjective';
import { PuzzleHint } from '../components/PuzzleHint';
import { TestResults } from '../components/TestResults/TestResults';
import { Icon } from '../components/Icon';
import NotFound from './NotFound';
import { CompletionDialog } from '../components/CompletionDialog';
import { ClockControls } from '../components/ClockControls';

function ActivePuzzle({ level }) {
  const game = usePuzzle(level);
  const { storageAvailable } = useGame();
  return (
    <main className="puzzle-page">
      <CompletionDialog
        completion={game.completion}
        level={level}
        onDismiss={game.dismissCompletion}
      />
      <div className="puzzle-workspace">
        <div className="puzzle-sidebar-frame pixel-frame">
          <aside className="puzzle-sidebar" aria-label="Objetivo y compuertas" tabIndex={0}>
            <p className="stage-context">
              Etapa {level.stage} ·{' '}
              {level.challenge
                ? 'Reto para acreditar la etapa'
                : stageForLevel(level.id).title}
            </p>
            <LevelObjective level={level} game={game} />
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
        <div className="puzzle-center">
          <CircuitBoard game={game} level={level} />
        </div>
      </div>
    </main>
  );
}

export default function Puzzle() {
  const { id } = useParams();
  const level = getLevel(id);
  const { unlockedLevel, completedLevels } = useProgress();
  if (!level) return <NotFound />;
  if (!canAccessLevel(level.id, completedLevels))
    return (
      <main className="page empty-page">
        <Icon name="lock" size={38} />
        <h1>Una señal a la vez.</h1>
        <p>
          Completa el nivel {unlockedLevel} o supera el reto de la etapa{' '}
          {stageForLevel(unlockedLevel).id} para continuar.
        </p>
        <Link to={`/puzzle/${unlockedLevel}`} className="button button-primary">
          Continuar jugando
          <Icon name="arrow" />
        </Link>
      </main>
    );
  return <ActivePuzzle key={level.id} level={level} />;
}

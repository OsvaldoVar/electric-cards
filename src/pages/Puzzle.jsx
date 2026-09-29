import { Link, useParams } from 'react-router-dom';
import { getLevel, worlds } from '../data/levels';
import { useProgress } from '../hooks/useProgress';
import { usePuzzle } from '../hooks/usePuzzle';
import { CircuitBoard } from '../components/CircuitBoard/CircuitBoard';
import { GateInventory } from '../components/GateInventory/GateInventory';
import { LevelObjective } from '../components/LevelObjective/LevelObjective';
import { PuzzleControls } from '../components/PuzzleControls';
import { TestResults } from '../components/TestResults/TestResults';
import { Icon } from '../components/Icon';
import { Stars } from '../components/Stars';
import NotFound from './NotFound';

function ActivePuzzle({ level, bestStars }) {
  const game = usePuzzle(level);
  const world = worlds.find((item) => item.id === level.world);
  return (
    <main className="puzzle-page">
      <div className="puzzle-topbar">
        <Link className="back-link" to="/levels">
          <Icon name="back" size={17} />
          <span>Mapa de niveles</span>
        </Link>
        <span className="puzzle-breadcrumb">
          {world.title}
          <span>/</span>
          <strong>Nivel {String(level.id).padStart(2, '0')}</strong>
        </span>
        <Stars count={bestStars} />
      </div>
      <div className="puzzle-workspace">
        <LevelObjective level={level} game={game} />
        <div className="puzzle-center">
          <CircuitBoard game={game} />
        </div>
        <GateInventory inventory={game.inventory} onAdd={game.addGate} />
      </div>
      <div className="puzzle-bottom">
        <PuzzleControls game={game} level={level} />
        {game.message && (
          <p className="connection-error" role="alert">
            {game.message}
          </p>
        )}
        <TestResults result={game.result} level={level} onCase={game.setInputs} />
      </div>
    </main>
  );
}

export default function Puzzle() {
  const { id } = useParams();
  const level = getLevel(id);
  const { unlockedLevel, completedLevels } = useProgress();
  if (!level) return <NotFound />;
  if (level.id > unlockedLevel)
    return (
      <main className="page empty-page">
        <Icon name="lock" size={38} />
        <h1>Una señal a la vez.</h1>
        <p>Completa el nivel {unlockedLevel} para continuar tu recorrido.</p>
        <Link to={`/puzzle/${unlockedLevel}`} className="button button-primary">
          Continuar jugando
          <Icon name="arrow" />
        </Link>
      </main>
    );
  return (
    <ActivePuzzle
      key={level.id}
      level={level}
      bestStars={completedLevels[level.id]?.stars ?? 0}
    />
  );
}

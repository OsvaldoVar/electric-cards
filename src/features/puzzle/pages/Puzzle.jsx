import { PuzzleSidebar } from '../components/PuzzleSidebar';
import { Link, useParams } from 'react-router-dom';
import { canAccessLevel, stageForLevel } from '../../../data/stages';
import { getLevel } from '../../../data/levels';
import { useProgress } from '../../progression';
import { usePuzzle } from '../hooks/usePuzzle';
import { CircuitBoard } from '../components/CircuitBoard/CircuitBoard';
import { Icon } from '../../../shared/ui/Icon';
import NotFound from '../../../shared/ui/NotFound';
import { CompletionDialog } from '../components/CompletionDialog';

function ActivePuzzle({ level }) {
  const game = usePuzzle(level);
  return (
    <main className="puzzle-page">
      <CompletionDialog
        completion={game.completion}
        level={level}
        onDismiss={game.dismissCompletion}
      />
      <div className="puzzle-workspace">
        <PuzzleSidebar level={level} game={game} />
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

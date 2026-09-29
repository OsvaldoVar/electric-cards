import { levels } from '../data/levels';
import { useGame } from './useGame';

export function useProgress() {
  const { state } = useGame();
  const completed = Object.values(state.completedLevels);
  return {
    completedLevels: state.completedLevels,
    unlockedLevel: state.unlockedLevel,
    completedCount: completed.length,
    totalLevels: levels.length,
    stars: completed.reduce((total, level) => total + level.stars, 0),
    maxStars: levels.length * 3,
  };
}

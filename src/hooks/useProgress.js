import { levels } from '../data/levels';
import { useGame } from './useGame';
import { unlockedGateIds } from '../data/unlocks';

export function useProgress() {
  const { state } = useGame();
  const completed = Object.values(state.completedLevels);
  return {
    completedLevels: state.completedLevels,
    unlockedLevel: state.unlockedLevel,
    completedCount: completed.length,
    totalLevels: levels.length,
    unlockedGates: unlockedGateIds(state.completedLevels),
  };
}

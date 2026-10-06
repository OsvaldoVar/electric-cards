import { useLocation } from 'react-router-dom';
import { getLevel } from '../data/levels';

export function useLearningContext() {
  const { pathname, search } = useLocation();
  const puzzleId = pathname.match(/^\/puzzle\/(\d+)$/)?.[1];
  const from = pathname.startsWith('/learn') ? new URLSearchParams(search).get('from') : null;
  const level = getLevel(puzzleId ?? from);
  return { level, learningSearch: level ? `?from=${level.id}` : '' };
}

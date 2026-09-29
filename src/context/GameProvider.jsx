import { useEffect, useMemo, useReducer, useState } from 'react';
import { GameContext } from './GameContext';
import { gameReducer } from './gameReducer';
import { loadGame, saveGame } from '../services/storage';

export function GameProvider({ children }) {
  const [initial] = useState(loadGame);
  const [state, dispatch] = useReducer(gameReducer, initial.state);
  const [storageAvailable, setStorageAvailable] = useState(initial.available);
  useEffect(() => {
    const timer = window.setTimeout(() => setStorageAvailable(saveGame(state)), 250);
    const flush = () => saveGame(state);
    window.addEventListener('pagehide', flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', flush);
    };
  }, [state]);
  const value = useMemo(
    () => ({ state, dispatch, storageAvailable }),
    [state, storageAvailable],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

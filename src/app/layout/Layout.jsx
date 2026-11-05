import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Navbar } from './Navbar';
import { useGame } from '../../state/useGame';
import { usesHashRouting } from '../routerMode';

export function Layout() {
  const { storageAvailable } = useGame();
  const { pathname } = useLocation();
  const mainContentRef = useRef(null);
  const puzzleRoute = pathname.startsWith('/puzzle/');
  const handleSkipLink = (event) => {
    if (!usesHashRouting) return;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    mainContentRef.current?.focus();
  };
  useEffect(() => {
    const root = document.documentElement;
    const onPointer = () => {
      root.dataset.input = 'pointer';
    };
    const onKey = (event) => {
      if (
        event.key === 'Tab' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key.startsWith('Arrow')
      ) {
        root.dataset.input = 'keyboard';
      }
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey, true);
      delete root.dataset.input;
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={`app-shell${puzzleRoute ? ' puzzle-shell' : ''}`}>
      <a className="skip-link" href="#main-content" onClick={handleSkipLink}>
        Saltar al contenido
      </a>
      <Navbar />
      {!storageAvailable && (
        <p role="status" className="storage-notice">
          El navegador no permite guardar. Puedes jugar, pero el progreso podría perderse al
          cerrar.
        </p>
      )}
      <div id="main-content" ref={mainContentRef} tabIndex={usesHashRouting ? -1 : undefined}>
        <Outlet />
      </div>
      {!puzzleRoute && (
        <footer className="site-footer">
          <span>Electric Cards</span>
          <span>Construye. Prueba. Comprende.</span>
          <span>0 y 1. Infinitas ideas.</span>
        </footer>
      )}
    </div>
  );
}

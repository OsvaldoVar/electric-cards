import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { useGame } from '../../hooks/useGame';

export function Layout() {
  const { storageAvailable } = useGame();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <Navbar />
      {!storageAvailable && (
        <p role="status" className="storage-notice">
          El navegador no permite guardar. Puedes jugar, pero el progreso podría perderse al
          cerrar.
        </p>
      )}
      <div id="main-content">
        <Outlet />
      </div>
      <footer className="site-footer">
        <span>Electric Cards</span>
        <span>Construye. Prueba. Comprende.</span>
        <span>0 y 1. Infinitas ideas.</span>
      </footer>
    </>
  );
}

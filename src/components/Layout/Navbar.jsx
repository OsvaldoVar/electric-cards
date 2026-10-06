import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '../Icon';
import { SettingsDialog } from '../SettingsDialog';
import { useLearningContext } from '../../hooks/useLearningContext';

export function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { pathname } = useLocation();
  const { level, learningSearch } = useLearningContext();
  const section = pathname.startsWith('/learn')
    ? 'learn'
    : pathname === '/levels' || pathname.startsWith('/puzzle/')
      ? 'play'
      : 'home';
  return (
    <>
      <header className="site-header">
        <div className="nav-inner">
          <div className="nav-start">
            <button
              className="button button-quiet settings-button"
              aria-label="Configuraciones"
              aria-haspopup="dialog"
              onClick={() => setSettingsOpen(true)}
            >
              <Icon name="settings" />
            </button>
            {pathname.startsWith('/puzzle/') && (
              <Link className="button button-primary level-map-button" to="/levels">
                <Icon name="back" size={17} />
                <span>Mapa de niveles</span>
              </Link>
            )}
            {pathname.startsWith('/learn') && level && (
              <Link
                className="button button-primary level-map-button"
                to={`/puzzle/${level.id}`}
              >
                <Icon name="back" size={17} />
                <span>Volver al nivel {level.id}</span>
              </Link>
            )}
          </div>
          <nav aria-label="Navegación principal" data-section={section}>
            <Link
              to="/levels"
              aria-current={section === 'play' ? 'page' : undefined}
              className={section === 'play' ? 'active' : ''}
            >
              Jugar
            </Link>
            <NavLink to={`/learn${learningSearch}`}>Compuertas</NavLink>
          </nav>
          <NavLink to="/" className="brand" aria-label="Electric Cards, inicio">
            <Icon name="bolt" size={31} />
            <span>Electric Cards</span>
          </NavLink>
        </div>
      </header>
      <SettingsDialog open={settingsOpen} onDismiss={() => setSettingsOpen(false)} />
    </>
  );
}

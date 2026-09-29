import { NavLink } from 'react-router-dom';
import { Icon } from '../Icon';
import { useProgress } from '../../hooks/useProgress';

export function Navbar() {
  const { stars, maxStars } = useProgress();
  return (
    <header className="site-header">
      <div className="nav-inner">
        <NavLink to="/" className="brand" aria-label="Electric Cards, inicio">
          <span className="brand-mark">
            <Icon name="bolt" size={24} />
          </span>
          <span>
            Electric <strong>Cards</strong>
            <small>LABORATORIO DE LÓGICA</small>
          </span>
        </NavLink>
        <nav aria-label="Navegación principal">
          <NavLink to="/levels">
            <Icon name="grid" size={17} />
            <span>Jugar</span>
          </NavLink>
          <NavLink to="/learn">
            <Icon name="book" size={17} />
            <span>Compuertas</span>
          </NavLink>
        </nav>
        <span className="nav-score" aria-label={`${stars} de ${maxStars} estrellas`}>
          <Icon name="star" size={17} />
          {stars}
          <span className="score-total"> / {maxStars}</span>
        </span>
      </div>
    </header>
  );
}

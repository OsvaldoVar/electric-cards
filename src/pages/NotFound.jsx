import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export default function NotFound() {
  return (
    <main className="page empty-page">
      <span className="eyebrow">SEÑAL NO ENCONTRADA</span>
      <h1>Este camino no está conectado.</h1>
      <p>El nivel o la compuerta que buscas no existe.</p>
      <Link to="/levels" className="button button-primary">
        Volver a los niveles
        <Icon name="arrow" />
      </Link>
    </main>
  );
}

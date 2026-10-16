import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export default function NotFound() {
  return (
    <main className="page empty-page">
      <h1>Este camino no está conectado</h1>
      <p>El nivel o la compuerta que buscas no existe o ha cambiado de dirección.</p>
      <Link to="/levels" className="button button-primary">
        Volver a los niveles
        <Icon name="arrow" />
      </Link>
    </main>
  );
}

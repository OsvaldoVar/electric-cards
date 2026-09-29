import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { GateSimulator } from '../components/GateSimulator';
import { gates } from '../data/gates';
import { useProgress } from '../hooks/useProgress';

export default function Home() {
  const progress = useProgress();
  return (
    <main className="page home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" /> TU PRÓXIMA IDEA EMPIEZA CON UN BIT
          </div>
          <h1>
            La lógica está
            <br />
            en tus <span>manos.</span>
          </h1>
          <p className="hero-description">
            Un puñado de compuertas. Un circuito por resolver. Conecta tus ideas y descubre
            cómo piensan los sistemas digitales.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to={`/puzzle/${progress.unlockedLevel}`}>
              {progress.completedCount ? 'Continuar jugando' : 'Empezar a jugar'}
              <Icon name="arrow" />
            </Link>
            <Link className="button button-quiet" to="/learn">
              <Icon name="book" />
              Explorar compuertas
            </Link>
          </div>
          <div className="hero-facts">
            <span>
              <strong>25</strong> puzzles
            </span>
            <span>
              <strong>7</strong> compuertas
            </span>
            <span>
              <strong>0</strong> requisitos previos
            </span>
          </div>
        </div>
        <div className="hero-lab">
          <div className="lab-topline">
            <span className="mono">CIRCUITO 001</span>
            <span>
              <span className="status-dot" /> EN VIVO
            </span>
          </div>
          <div className="hero-lab-title">
            <span className="eyebrow">CONOCE A AND</span>
            <h2>Dos señales. Una decisión.</h2>
          </div>
          <GateSimulator gate={gates.AND} withTable={false} />
          <div className="lab-bottomline">
            <Icon name="shield" />
            <span>La salida se activa cuando ambas entradas valen 1.</span>
          </div>
        </div>
      </section>
      {progress.completedCount > 0 && (
        <section className="resume-strip">
          <div>
            <span className="eyebrow">TU RECORRIDO</span>
            <p>{progress.completedCount} de 25 niveles completados</p>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Niveles completados"
            aria-valuenow={progress.completedCount}
            aria-valuemin={0}
            aria-valuemax={25}
          >
            <progress max="25" value={progress.completedCount} />
          </div>
          <Link to="/levels">
            Ver mapa <Icon name="arrow" size={17} />
          </Link>
        </section>
      )}
      <section className="how-section">
        <div className="section-intro">
          <span className="eyebrow">APRENDE CONSTRUYENDO</span>
          <h2>De una señal a una solución.</h2>
          <p>
            No necesitas memorizar antes de empezar. Cada puzzle te enseña mientras juegas.
          </p>
        </div>
        <div className="how-grid">
          {[
            [
              '01',
              'grid',
              'Elige tus cartas',
              'Tienes un inventario limitado. Cada compuerta es una pieza con una habilidad.',
            ],
            [
              '02',
              'link',
              'Conecta las señales',
              'Construye un circuito. Mueve, conecta y cambia entradas para observar qué pasa.',
            ],
            [
              '03',
              'check',
              'Ponlo a prueba',
              'Tu solución debe funcionar con todas las combinaciones. Mejora y gana hasta tres estrellas.',
            ],
          ].map(([number, icon, title, text]) => (
            <article key={number} className="how-card">
              <div>
                <span className="mono">{number}</span>
                <Icon name={icon} size={24} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="collection-banner">
        <div>
          <span className="eyebrow">SIETE HABILIDADES, UN MISMO UNIVERSO</span>
          <h2>Conoce a tu equipo lógico.</h2>
          <p>AND, OR, NOT y compañía tienen mucho que enseñarte.</p>
        </div>
        <Link to="/learn" className="button button-secondary">
          Ver colección
          <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}

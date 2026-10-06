import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { GateSimulator } from '../components/GateSimulator';
import { gates } from '../data/gates';
import { useProgress } from '../hooks/useProgress';

export default function Home() {
  const progress = useProgress();
  const hasProgress = progress.completedCount > 0;

  return (
    <main className="page home-page">
      <section className="home-cover" aria-labelledby="home-heading">
        <div className="home-cover-header">
          <p className="home-eyebrow">Pequeñas señales. Grandes ideas.</p>
          <h1 id="home-heading" className="home-title">
            <span>Construye circuitos.</span> <span>Enciende tus ideas.</span>
          </h1>
          <p className="home-lead">
            Tu laboratorio de lógica. Combina compuertas, prueba tus ideas y descubre lo que
            puedes construir con un 0 y un 1.
          </p>
          <div className="home-cta-row">
            <Link className="button button-primary" to={`/puzzle/${progress.unlockedLevel}`}>
              {hasProgress ? 'Continuar jugando' : 'Empezar a jugar'}
              <Icon name="arrow" />
            </Link>
            <Link className="button button-secondary" to="/learn">
              <Icon name="book" />
              Explorar compuertas
            </Link>
          </div>
          <p className="home-facts-statement">
            {progress.totalLevels} niveles progresivos · 10 componentes · 0 requisitos previos.
          </p>
        </div>

        <div className="home-lab-card" aria-label="Demostración interactiva de compuerta AND">
          <div className="home-lab-header">
            <span className="home-lab-tag">PRUÉBALO AQUÍ</span>
            <h2 className="home-lab-title">Dos señales. Una sola condición.</h2>
          </div>
          <div className="home-lab-body">
            <GateSimulator gate={gates.AND} withTable={false} />
          </div>
          <div className="home-lab-footer">
            <Icon name="shield" size={20} />
            <p>Activa A y B. La salida se enciende cuando ambas señales valen 1.</p>
          </div>
        </div>
      </section>

      {/* Franja de progreso cuando hay niveles completados */}
      {hasProgress && (
        <section className="home-resume-strip" aria-label="Progreso guardado">
          <div className="home-resume-text">
            <h2>Tu recorrido actual</h2>
            <p>
              {progress.completedCount} de {progress.totalLevels} niveles completados · Nivel{' '}
              {progress.unlockedLevel} listo
            </p>
          </div>
          <div
            className="home-resume-progress"
            role="progressbar"
            aria-label="Niveles completados"
            aria-valuenow={progress.completedCount}
            aria-valuemin={0}
            aria-valuemax={progress.totalLevels}
          >
            <progress max={progress.totalLevels} value={progress.completedCount} />
          </div>
          <Link to="/levels" className="button button-secondary">
            Ver mapa de niveles
            <Icon name="arrow" size={17} />
          </Link>
        </section>
      )}

      {/* Sección siguientes pasos asimétrica con líneas / editorial list */}
      <section className="home-path-section" aria-labelledby="home-path-title">
        <div className="home-path-header">
          <h2 id="home-path-title">Cómo aprender con Electric Cards</h2>
          <p>
            Sin fórmulas que memorizar. La lógica digital se entiende mejor manipulando
            entradas, cables y salidas directamente.
          </p>
        </div>

        <ol className="home-editorial-list">
          <li className="home-editorial-item">
            <div className="editorial-step mono" aria-hidden="true">
              01
            </div>
            <div className="editorial-body">
              <h3>Inventario limitado</h3>
              <p>
                Cada nivel te entrega un número exacto de compuertas. Analiza el objetivo del
                circuito y decide qué combinaciones lógicas necesitas.
              </p>
            </div>
          </li>
          <li className="home-editorial-item">
            <div className="editorial-step mono" aria-hidden="true">
              02
            </div>
            <div className="editorial-body">
              <h3>Conexión inmediata</h3>
              <p>
                Traza cables arrastrando o con dos toques. Observa cómo fluyen las señales 0 y
                1 en tiempo real para verificar cada etapa de tu diseño.
              </p>
            </div>
          </li>
          <li className="home-editorial-item">
            <div className="editorial-step mono" aria-hidden="true">
              03
            </div>
            <div className="editorial-body">
              <h3>Comprobación total</h3>
              <p>
                Tu solución debe responder correctamente a todas las combinaciones de entrada.
                Si puedes usar menos compuertas, verás un aviso para optimizar tu circuito.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Acceso a colección */}
      <section className="home-collection-banner" aria-labelledby="home-collection-title">
        <div className="home-collection-info">
          <h2 id="home-collection-title">De las compuertas a la memoria</h2>
          <p>
            Desbloquea siete compuertas lógicas, el reloj y los flip-flops D y T. Cada ficha
            incluye su regla, símbolo, tabla y simulador interactivo.
          </p>
        </div>
        <Link to="/learn" className="button button-primary">
          Ver la colección
          <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}

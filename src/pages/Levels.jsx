import { Link } from 'react-router-dom';
import { levels, worlds } from '../data/levels';
import { useProgress } from '../hooks/useProgress';
import { Icon } from '../components/Icon';
import { Stars } from '../components/Stars';

export default function Levels() {
  const { completedLevels, unlockedLevel, completedCount, stars, maxStars } = useProgress();
  return (
    <main className="page levels-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">EL MAPA DE TUS IDEAS</span>
          <h1>Un circuito a la vez.</h1>
          <p>Resuelve cada reto para abrir el siguiente. Siempre puedes regresar y mejorar.</p>
        </div>
        <div className="progress-summary">
          <strong>
            {completedCount}
            <small> / 25</small>
          </strong>
          <span>niveles completados</span>
          <span className="summary-stars">
            <Icon name="star" size={16} />
            {stars} / {maxStars}
          </span>
        </div>
      </div>
      {worlds.map((world) => (
        <section key={world.id} className={`world-section family-${world.family}`}>
          <div className="world-heading">
            <span className="world-number mono">0{world.id}</span>
            <div>
              <h2>{world.title}</h2>
              <p>{world.subtitle}</p>
            </div>
          </div>
          <div className="level-grid">
            {levels
              .filter((level) => level.world === world.id)
              .map((level) => {
                const completed = completedLevels[level.id];
                const locked = level.id > unlockedLevel;
                const content = (
                  <>
                    <div className="level-card-top">
                      <span className="level-number mono">
                        {String(level.id).padStart(2, '0')}
                      </span>
                      {locked ? (
                        <Icon name="lock" size={18} />
                      ) : completed ? (
                        <Icon name="check" size={18} />
                      ) : (
                        <span className="level-ready">Disponible</span>
                      )}
                    </div>
                    <h3>{level.title}</h3>
                    <p>
                      {level.inputs.length} entradas · {level.outputs.length}{' '}
                      {level.outputs.length === 1 ? 'salida' : 'salidas'}
                    </p>
                    <div className="level-card-bottom">
                      <Stars count={completed?.stars ?? 0} />
                      {!locked && <Icon name="arrow" size={17} />}
                    </div>
                  </>
                );
                return locked ? (
                  <article
                    key={level.id}
                    className="level-card is-locked"
                    aria-label={`Nivel ${level.id}: ${level.title}. Bloqueado`}
                  >
                    {content}
                  </article>
                ) : (
                  <Link
                    key={level.id}
                    to={`/puzzle/${level.id}`}
                    className={`level-card ${level.id === unlockedLevel && !completed ? 'is-current' : ''}`}
                    aria-label={`Nivel ${level.id}: ${level.title}`}
                  >
                    {content}
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </main>
  );
}

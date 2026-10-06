import { Link } from 'react-router-dom';
import { levels, worlds } from '../data/levels';
import { useProgress } from '../hooks/useProgress';
import { Icon } from '../components/Icon';
import { gatesUnlockedBy } from '../data/unlocks';

export default function Levels() {
  const { completedLevels, unlockedLevel, completedCount, totalLevels } = useProgress();

  return (
    <main className="page levels-page">
      <header className="page-heading">
        <div className="page-heading-copy">
          <h1>Mapa de niveles</h1>
          <p>
            Siete mundos de lógica y memoria. Resuelve cada circuito para desbloquear el
            siguiente reto. Siempre puedes regresar a cualquier nivel completado para reducir
            la cantidad de compuertas.
          </p>
        </div>
        <div className="progress-summary">
          <div className="progress-summary-count">
            <strong>
              {completedCount}
              <small> / {totalLevels}</small>
            </strong>
            <span>niveles resueltos</span>
          </div>
        </div>
      </header>

      <div className="worlds-container">
        {worlds.map((world) => {
          const worldLevels = levels.filter((lvl) => lvl.world === world.id);
          const worldCompleted = worldLevels.filter((lvl) => completedLevels[lvl.id]).length;

          return (
            <section
              key={world.id}
              className={`world-section family-${world.family}`}
              aria-labelledby={`world-title-${world.id}`}
            >
              <div className="world-heading">
                <span className="world-number mono" aria-hidden="true">
                  0{world.id}
                </span>
                <div className="world-heading-text">
                  <div className="world-title-row">
                    <h2 id={`world-title-${world.id}`}>{world.title}</h2>
                    <span className="world-progress-badge">
                      {worldCompleted} / {worldLevels.length} completados
                    </span>
                  </div>
                  <p>{world.subtitle}</p>
                </div>
              </div>

              <div className="level-grid">
                {worldLevels.map((level) => {
                  const completed = completedLevels[level.id];
                  const locked = level.id > unlockedLevel;
                  const isCurrent = level.id === unlockedLevel && !completed;

                  const content = (
                    <>
                      <div className="level-card-top">
                        <h3 className="level-number">Nivel {level.id}</h3>
                        {locked ? (
                          <span className="level-badge is-locked-badge">
                            <Icon name="lock" size={16} />
                            <span>Bloqueado</span>
                          </span>
                        ) : completed ? (
                          <span className="level-badge is-completed-badge">
                            <Icon name="check" size={16} />
                            <span>Completado</span>
                          </span>
                        ) : (
                          <span className="level-badge is-current-badge">
                            <span className="level-ready">Disponible</span>
                          </span>
                        )}
                      </div>

                      <p className="level-signals">
                        {level.inputs.length}{' '}
                        {level.inputs.length === 1 ? 'entrada' : 'entradas'} ·{' '}
                        {level.outputs.length}{' '}
                        {level.outputs.length === 1 ? 'salida' : 'salidas'}
                      </p>
                      {gatesUnlockedBy(level.id).length > 0 && (
                        <p className="level-unlock">
                          Desbloquea {gatesUnlockedBy(level.id).join(', ')}
                        </p>
                      )}

                      <div className="level-card-bottom">
                        {!locked && <Icon name="arrow" size={16} />}
                      </div>
                    </>
                  );

                  return locked ? (
                    <article
                      key={level.id}
                      className="level-card is-locked"
                      aria-label={`Nivel ${level.id}. Bloqueado`}
                    >
                      {content}
                    </article>
                  ) : (
                    <Link
                      key={level.id}
                      to={`/puzzle/${level.id}`}
                      className={`level-card ${isCurrent ? 'is-current' : ''}`}
                      aria-label={`Nivel ${level.id}`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

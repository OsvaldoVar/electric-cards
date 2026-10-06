import { Link } from 'react-router-dom';
import { getLevel } from '../data/levels';
import { stages, canAccessLevel, stagePassed, stageAvailable } from '../data/stages';
import { useProgress } from '../hooks/useProgress';
import { Icon } from '../components/Icon';

export default function Levels() {
  const { completedLevels, nextLevel, completedCount, totalLevels, clearedStages } =
    useProgress();
  return (
    <main className="page levels-page">
      <header className="page-heading">
        <div className="page-heading-copy">
          <h1>Mapa de niveles</h1>
          <p>
            Cinco etapas, de las compuertas básicas a la lógica con memoria. Avanza nivel a
            nivel o demuestra lo que sabes en el reto de salto de cada etapa. Los niveles
            omitidos quedan disponibles para practicar.
          </p>
          <p>{clearedStages} de 5 etapas acreditadas</p>
        </div>
        <div className="progress-summary">
          <div className="progress-summary-count">
            <strong>
              {completedCount}
              <small> / {totalLevels}</small>
            </strong>
            <span>circuitos resueltos</span>
          </div>
        </div>
      </header>
      <div className="worlds-container">
        {stages.map((stage) => {
          const passed = stagePassed(stage, completedLevels);
          const available = stageAvailable(stage, completedLevels);
          const count = stage.levelIds.filter((id) => completedLevels[id]?.completed).length;
          const challengeDone = completedLevels[stage.challengeId]?.completed;
          const ChallengeContainer = available ? Link : 'article';
          return (
            <section
              key={stage.id}
              className={`world-section family-${stage.family}`}
              aria-labelledby={`stage-title-${stage.id}`}
            >
              <div className="world-heading">
                <span className="world-number mono" aria-hidden="true">
                  0{stage.id}
                </span>
                <div className="world-heading-text">
                  <div className="world-title-row">
                    <h2 id={`stage-title-${stage.id}`}>
                      Etapa {stage.id}: {stage.title}
                    </h2>
                    <span className="world-progress-badge">
                      {passed ? 'Acreditada' : available ? 'Disponible' : 'Bloqueada'} ·{' '}
                      {count} / {stage.levelIds.length} niveles resueltos
                    </span>
                  </div>
                  <p>{stage.subtitle}</p>
                  {stage.id === 4 && (
                    <p className="level-unlock">
                      Al llegar aquí desbloqueas CLOCK, DFF y TFF.
                    </p>
                  )}
                </div>
              </div>
              <ChallengeContainer
                to={available ? `/puzzle/${stage.challengeId}` : undefined}
                className={`stage-challenge ${available ? '' : 'is-locked'}`}
                aria-label={`Reto de salto de la etapa ${stage.id}${available ? '' : '. Bloqueado'}`}
              >
                <div>
                  <h3>Reto de salto · Etapa {stage.id}</h3>
                  <p>{stage.challengeSummary}</p>
                  <p>
                    {challengeDone
                      ? 'Reto superado. Etapa acreditada.'
                      : stage.id === 5
                        ? 'Apruébalo para acreditar todo el recorrido.'
                        : `Apruébalo para pasar directamente a la etapa ${stage.id + 1}.`}
                  </p>
                  {!available && <p>Primero acredita la etapa {stage.id - 1}.</p>}
                </div>
                <Icon
                  name={challengeDone ? 'check' : available ? 'arrow' : 'lock'}
                  size={22}
                />
              </ChallengeContainer>
              <div className="level-grid">
                {stage.levelIds.map((id) => {
                  const level = getLevel(id);
                  const done = completedLevels[id]?.completed;
                  const locked = !canAccessLevel(id, completedLevels);
                  const Container = locked ? 'article' : Link;
                  return (
                    <Container
                      key={id}
                      to={locked ? undefined : `/puzzle/${id}`}
                      className={`level-card ${locked ? 'is-locked' : id === nextLevel && !done ? 'is-current' : ''}`}
                      aria-label={`Nivel ${id}${locked ? '. Bloqueado' : ''}`}
                    >
                      <div className="level-card-top">
                        <h3 className="level-number">Nivel {id}</h3>
                        <span
                          className={`level-badge ${locked ? 'is-locked-badge' : done ? 'is-completed-badge' : 'is-current-badge'}`}
                        >
                          <Icon name={locked ? 'lock' : done ? 'check' : 'arrow'} size={16} />
                          <span>
                            {locked
                              ? 'Bloqueado'
                              : done
                                ? 'Completado'
                                : passed
                                  ? 'Practicar'
                                  : 'Disponible'}
                          </span>
                        </span>
                      </div>
                      <p className="level-signals">
                        {level.optimizationGateCount}{' '}
                        {level.kind === 'sequential'
                          ? level.optimizationGateCount === 1
                            ? 'componente'
                            : 'componentes'
                          : level.optimizationGateCount === 1
                            ? 'compuerta'
                            : 'compuertas'}{' '}
                        · {level.outputs.length}{' '}
                        {level.outputs.length === 1 ? 'salida' : 'salidas'}
                      </p>
                      <div className="level-card-bottom">
                        {!locked && <Icon name="arrow" size={16} />}
                      </div>
                    </Container>
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

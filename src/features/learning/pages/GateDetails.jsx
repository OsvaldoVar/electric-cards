import { Link, useParams } from 'react-router-dom';
import { gates } from '../../../data/gates';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { GateSimulator } from '../components/GateSimulator';
import { GateSymbol } from '../../../shared/ui/GateSymbol';
import { Icon } from '../../../shared/ui/Icon';
import NotFound from '../../../shared/ui/NotFound';
import { useProgress } from '../../progression';
import { gateUnlocks } from '../../../data/unlocks';
import { useLearningContext } from '../../../shared/hooks/useLearningContext';

export default function GateDetails() {
  const { gate: gateId } = useParams();
  const gate = gates[gateId?.toUpperCase()];
  const { unlockedGates } = useProgress();
  const { level, learningSearch } = useLearningContext();
  if (!gate) return <NotFound />;
  if (!unlockedGates.includes(gate.id))
    return (
      <main className="page empty-page">
        <Icon name="lock" size={36} />
        <h1>{gate.name} está bloqueado</h1>
        <p>
          Llega a la etapa {gateUnlocks[gate.id]} para desbloquear este componente y su
          simulador.
        </p>
        <Link to="/levels" className="button button-primary">
          Ver niveles
        </Link>
      </main>
    );

  return (
    <main className={`page gate-details gate-details-page family-${gate.family}`}>
      <Link className="back-link" to={`/learn${learningSearch}`}>
        <Icon name="back" size={17} />
        Volver a la colección
      </Link>

      <div className="gate-detail-grid">
        <aside className="detail-character">
          <CharacterPortrait gate={gate} />
          <div className="detail-character-info">
            <span className="detail-badge">{gate.character.ability}</span>
            <h1>{gate.character.name}</h1>
            <p className="detail-character-role">«{gate.character.role}»</p>
          </div>
        </aside>

        <article className="gate-description">
          <div className="gate-detail-title">
            <h2>Compuerta {gate.name}</h2>
            <GateSymbol type={gate.id} />
          </div>

          <p className="description-large">{gate.description}</p>

          <div className="expression-box">
            <div className="expression-main">
              <span className="expression-label">
                {gate.sequential ? 'Regla de transición' : 'Expresión booleana'}
              </span>
              <strong className="mono expression-value">
                {gate.sequential ? '' : 'Y = '}
                {gate.expression}
              </strong>
            </div>
            <span className="expression-meta">
              {gate.inputs} {gate.inputs === 1 ? 'entrada' : 'entradas'} · 1 salida
            </span>
          </div>

          <div className="detail-example">
            <h3>En la vida real</h3>
            <p>{gate.example}</p>
          </div>

          <div className="detail-actions">
            <Link
              className="button button-primary"
              to={level ? `/puzzle/${level.id}` : '/levels'}
            >
              {level ? `Volver al nivel ${level.id}` : 'Llévala al tablero'}
              <Icon name="arrow" />
            </Link>
          </div>
        </article>

        <section className="detail-simulator" aria-labelledby="sim-heading">
          <h2 id="sim-heading">
            Simulador interactivo y tabla de {gate.sequential ? 'transición' : 'verdad'}
          </h2>
          <p className="detail-sim-help">
            {gate.sequential
              ? 'Avanza el reloj y observa cómo se conserva o cambia el estado. ↑CLK indica un flanco de 0 a 1; Q⁺ indica el siguiente estado.'
              : 'Cambia las entradas para observar el comportamiento de la compuerta y la fila activa en la tabla de verdad.'}
          </p>
          <GateSimulator key={gate.id} gate={gate} />
        </section>
      </div>
    </main>
  );
}

import { Link, useParams } from 'react-router-dom';
import { gates } from '../data/gates';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { GateSimulator } from '../components/GateSimulator';
import { GateSymbol } from '../components/GateSymbol';
import { Icon } from '../components/Icon';
import NotFound from './NotFound';

export default function GateDetails() {
  const { gate: gateId } = useParams();
  const gate = gates[gateId?.toUpperCase()];
  if (!gate) return <NotFound />;
  return (
    <main className={`page gate-details family-${gate.family}`}>
      <Link className="back-link" to="/learn">
        <Icon name="back" size={17} />
        Volver a la colección
      </Link>
      <div className="gate-detail-grid">
        <section className="detail-character">
          <CharacterPortrait gate={gate} />
          <span className="eyebrow">{gate.character.ability}</span>
          <h1>{gate.character.name}</h1>
          <p>«{gate.character.role}»</p>
        </section>
        <section className="gate-description">
          <span className="eyebrow">COMPUERTA {gate.name}</span>
          <div className="gate-detail-title">
            <h2>{gate.name}</h2>
            <GateSymbol type={gate.id} />
          </div>
          <p className="description-large">{gate.description}</p>
          <div className="expression-box">
            <span>Expresión booleana</span>
            <strong className="mono">Y = {gate.expression}</strong>
            <small>
              {gate.inputs} {gate.inputs === 1 ? 'entrada' : 'entradas'} · 1 salida
            </small>
          </div>
          <h3>En la vida real</h3>
          <p className="muted">{gate.example}</p>
          <Link className="button button-secondary" to="/levels">
            Llévala al tablero
            <Icon name="arrow" />
          </Link>
        </section>
        <section className="detail-simulator">
          <span className="eyebrow">EXPERIMENTA</span>
          <h2>Cambia un bit. Observa la salida.</h2>
          <GateSimulator key={gate.id} gate={gate} />
        </section>
      </div>
    </main>
  );
}

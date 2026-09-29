import { Link } from 'react-router-dom';
import { CharacterPortrait } from '../CharacterPortrait';
import { Icon } from '../Icon';

export function GateCard({ gate }) {
  return (
    <Link to={`/learn/${gate.id.toLowerCase()}`} className={`gate-card family-${gate.family}`}>
      <div className="gate-card-top">
        <span className="mono">{gate.name}</span>
        <span className="card-expression">{gate.expression}</span>
      </div>
      <CharacterPortrait gate={gate} />
      <div className="gate-card-body">
        <h2>{gate.character.name}</h2>
        <p>{gate.character.role}</p>
        <span className="gate-card-action">
          Conocer compuerta <Icon name="arrow" size={16} />
        </span>
      </div>
    </Link>
  );
}

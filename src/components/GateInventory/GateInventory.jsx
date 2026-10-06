import { Link } from 'react-router-dom';
import { gates } from '../../data/gates';
import { GateSymbol } from '../GateSymbol';
import { Icon } from '../Icon';
import { gateUnlocks } from '../../data/unlocks';
import { useLearningContext } from '../../hooks/useLearningContext';

export function GateInventory({ inventory, lockedGates = [], onAdd }) {
  const { learningSearch } = useLearningContext();
  return (
    <section className="inventory-panel">
      <h2>Tus compuertas</h2>
      <p className="muted small">Toca una carta para añadirla al tablero.</p>
      <div className="inventory-list">
        {Object.entries(inventory).map(([type, remaining]) => (
          <div className="inventory-entry" key={type}>
            <button
              className={`inventory-card family-${gates[type].family}`}
              onClick={() => onAdd(type)}
              disabled={remaining <= 0}
              aria-label={`Añadir ${type}. ${remaining} disponibles`}
            >
              <GateSymbol type={type} />
              <span className="inventory-name">
                <strong>{type}</strong>
                <small>
                  Añadir · {remaining} {remaining === 1 ? 'disponible' : 'disponibles'}
                </small>
              </span>
              <Icon name="plus" size={16} />
            </button>
            <Link
              to={`/learn/${type.toLowerCase()}${learningSearch}`}
              className="inventory-learn"
              aria-label={`Aprender ${type}`}
            >
              <Icon name="help" size={16} />
            </Link>
          </div>
        ))}
      </div>
      {lockedGates.map((type) => (
        <p className="inventory-locked" key={type}>
          <Icon name="lock" size={16} />
          {type}: llega a la etapa {gateUnlocks[type]} para desbloquearlo.
        </p>
      ))}
      <div className="inventory-note">
        <Icon name="reset" size={16} />
        <p>Al eliminar una carta, regresa a tu inventario.</p>
      </div>
    </section>
  );
}

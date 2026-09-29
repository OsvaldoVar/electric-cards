import { Link } from 'react-router-dom';
import { gates } from '../../data/gates';
import { GateSymbol } from '../GateSymbol';
import { Icon } from '../Icon';

export function GateInventory({ inventory, onAdd }) {
  return (
    <section className="inventory-panel">
      <span className="eyebrow">TUS CARTAS</span>
      <h2>Inventario</h2>
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
              <strong className="mono">{type}</strong>
              <span className="inventory-count">×{remaining}</span>
              <Icon name="plus" size={16} />
            </button>
            <Link
              to={`/learn/${type.toLowerCase()}`}
              className="inventory-learn"
              aria-label={`Aprender ${type}`}
            >
              <Icon name="help" size={16} />
            </Link>
          </div>
        ))}
      </div>
      <div className="inventory-note">
        <Icon name="reset" size={16} />
        <p>Al eliminar una carta, regresa a tu inventario.</p>
      </div>
    </section>
  );
}

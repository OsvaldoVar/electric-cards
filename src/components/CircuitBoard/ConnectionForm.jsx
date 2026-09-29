import { useState } from 'react';
import { targetPorts } from '../../engine/operations';
import { Icon } from '../Icon';

export function ConnectionForm({ circuit, onConnect }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  let index = 0;
  const named = circuit.nodes.map((node) => ({
    ...node,
    name: node.type === 'gate' ? `${node.data.gateType} ${++index}` : node.data.label,
  }));
  const sources = named.filter((node) => node.type !== 'output');
  const targets = named.flatMap((node) =>
    targetPorts(node).map((port) => ({
      key: JSON.stringify([node.id, port]),
      label: `${node.name} · entrada ${port === 'in' ? 'única' : port.toUpperCase()}`,
      occupied: circuit.edges.some(
        (edge) => edge.target === node.id && edge.targetHandle === port,
      ),
    })),
  );
  const validSource = sources.some((node) => node.id === source) ? source : '';
  const validDestination = targets.some(
    (target) => target.key === destination && !target.occupied,
  )
    ? destination
    : '';
  const submit = (event) => {
    event.preventDefault();
    if (!validSource || !validDestination) return;
    const [target, targetHandle] = JSON.parse(validDestination);
    if (onConnect({ source: validSource, sourceHandle: 'out', target, targetHandle }))
      setDestination('');
  };
  return (
    <details className="connection-details">
      <summary>
        <Icon name="link" size={17} />
        Conectar con selectores<span className="muted">Alternativa a tocar los puertos</span>
      </summary>
      <form className="connection-form" onSubmit={submit}>
        <label>
          Origen
          <select
            aria-label="Origen del cable"
            value={validSource}
            onChange={(event) => setSource(event.target.value)}
          >
            <option value="">Elegir salida…</option>
            {sources.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Destino
          <select
            aria-label="Destino del cable"
            value={validDestination}
            onChange={(event) => setDestination(event.target.value)}
          >
            <option value="">Elegir entrada…</option>
            {targets.map((target) => (
              <option key={target.key} value={target.key} disabled={target.occupied}>
                {target.label}
                {target.occupied ? ' (ocupada)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button button-secondary"
          type="submit"
          disabled={!validSource || !validDestination}
        >
          <Icon name="link" size={16} />
          Conectar
        </button>
      </form>
    </details>
  );
}

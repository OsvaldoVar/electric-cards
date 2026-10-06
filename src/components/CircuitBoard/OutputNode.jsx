import { Port } from './Port';
import { Icon } from '../Icon';

export function OutputNode({ id, data }) {
  return (
    <div
      className={`circuit-node pixel-frame output-node bit-${data.value ?? 'unknown'}`}
      data-review={data.checkStatus ?? 'idle'}
    >
      <span className="node-kicker">SALIDA</span>
      <div className="output-indicator">
        <Icon name={data.visualType ?? 'led'} size={28} />
        <span className="node-bit">{data.value ?? '?'}</span>
      </div>
      <strong>{data.label}</strong>
      <small>
        {data.value === 1 ? 'Activado' : data.value === 0 ? 'Desactivado' : 'Por conectar'}
      </small>
      <Port
        vertical={data.vertical}
        nodeId={id}
        port="in"
        type="target"
        label={`Entrada de ${data.label}`}
        edgeId={data.ports.in?.id}
        value={data.ports.in?.value}
        onDisconnect={data.onDisconnect}
      />
    </div>
  );
}

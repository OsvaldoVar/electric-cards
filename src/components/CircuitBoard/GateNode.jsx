import { gates } from '../../data/gates';
import { GateSymbol } from '../GateSymbol';
import { Icon } from '../Icon';
import { Port } from './Port';

export function GateNode({ id, data }) {
  const gate = gates[data.gateType];
  return (
    <div className={`circuit-node gate-node family-${gate.family}`}>
      <div className="gate-node-heading">
        <strong className="mono">{gate.name}</strong>
        <button
          className="node-delete nodrag nopan"
          onClick={() => data.onDelete(id)}
          aria-label={`Eliminar ${gate.name} ${data.instance}`}
          title="Eliminar compuerta"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      <GateSymbol type={gate.id} />
      <div className="gate-node-bottom">
        <span className="mono">CARTA {String(data.instance).padStart(2, '0')}</span>
        <span className={`node-signal bit-${data.value ?? 'unknown'}`}>
          {data.value ?? '?'}
        </span>
      </div>
      {Array.from({ length: gate.inputs }, (_, index) => {
        const port = index === 0 ? 'a' : 'b';
        return (
          <Port
            vertical={data.vertical}
            key={port}
            nodeId={id}
            port={port}
            type="target"
            label={`Entrada ${port.toUpperCase()} de ${gate.name} ${data.instance}`}
            top={gate.inputs === 1 ? 50 : index === 0 ? 33 : 70}
            edgeId={data.ports[port]?.id}
            value={data.ports[port]?.value}
            onDisconnect={data.onDisconnect}
          />
        );
      })}
      <Port
        vertical={data.vertical}
        nodeId={id}
        port="out"
        type="source"
        label={`Salida de ${gate.name} ${data.instance}`}
        value={data.value}
      />
    </div>
  );
}

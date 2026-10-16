import { gates } from '../../../../data/gates';
import { GateSymbol } from '../../../../shared/ui/GateSymbol';
import { Icon } from '../../../../shared/ui/Icon';
import { Port } from './Port';
import { targetPorts } from '../../../../engine/operations';

export function GateNode({ id, data }) {
  const gate = gates[data.gateType];
  return (
    <div className={`circuit-node pixel-frame gate-node family-${gate.family}`}>
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
      {gate.sequential && (
        <p className="gate-port-labels mono">
          {gate.id === 'CLOCK' ? 'CLK →' : `${gate.id === 'DFF' ? 'D' : 'T'} · CLK → Q`}
        </p>
      )}
      <div className="gate-node-bottom">
        <span className="mono">CARTA {String(data.instance).padStart(2, '0')}</span>
        <span className={`node-signal bit-${data.value ?? 'unknown'}`}>
          {data.value ?? '?'}
        </span>
      </div>
      {targetPorts({ type: 'gate', data }).map((port, index) => {
        return (
          <Port
            vertical={data.vertical}
            key={port}
            nodeId={id}
            port={port}
            type="target"
            label={`Entrada ${port.toUpperCase()} de ${gate.name} ${data.instance}`}
            top={gate.inputs === 1 ? 50 : index === 0 ? 33 : 70}
            selected={data.ports[port]?.selected}
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

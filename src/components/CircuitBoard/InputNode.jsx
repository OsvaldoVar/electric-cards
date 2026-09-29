import { Port } from './Port';

export function InputNode({ id, data }) {
  return (
    <div className={`circuit-node input-node bit-${data.value}`}>
      <span className="node-kicker">ENTRADA</span>
      <button
        className="input-node-toggle nodrag nopan"
        aria-label={`Cambiar entrada ${data.inputId}`}
        aria-pressed={data.value === 1}
        onClick={data.onToggle}
      >
        <strong>{data.inputId}</strong>
        <span className="node-bit">{data.value}</span>
      </button>
      <small>{data.label}</small>
      <Port
        vertical={data.vertical}
        nodeId={id}
        port="out"
        type="source"
        label={`Salida de ${data.label}`}
        value={data.value}
      />
    </div>
  );
}

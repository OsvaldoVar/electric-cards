import { Handle, Position } from '@xyflow/react';
import { Icon } from '../Icon';

export function Port({
  nodeId,
  port,
  type,
  label,
  top = 50,
  value,
  edgeId,
  selected = false,
  onDisconnect,
  vertical = false,
}) {
  return (
    <>
      <Handle
        type={type}
        id={port}
        position={
          vertical
            ? type === 'source'
              ? Position.Bottom
              : Position.Top
            : type === 'source'
              ? Position.Right
              : Position.Left
        }
        className={`circuit-port bit-${value ?? 'unknown'}`}
        style={vertical ? { left: `${type === 'source' ? 50 : top}%` } : { top: `${top}%` }}
        isConnectableStart={type === 'source'}
        isConnectableEnd={type === 'target'}
        aria-label={label}
        data-testid={`port-${nodeId}-${port}`}
      >
        <span className="port-dot" />
      </Handle>
      {edgeId && selected && (
        <button
          className={`port-clear nodrag nopan port-clear-${port} ${vertical ? 'port-clear-vertical' : ''}`}
          style={vertical ? { left: `${top}%` } : { top: `${top}%` }}
          onClick={() => onDisconnect(edgeId)}
          aria-label={`Desconectar ${label}`}
          title={`Desconectar ${label}`}
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </>
  );
}

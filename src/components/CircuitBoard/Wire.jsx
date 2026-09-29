import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { Icon } from '../Icon';

export function Wire({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) {
  const [path, x, y] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        className={`wire-path bit-${data.value ?? 'unknown'} ${selected ? 'wire-selected' : ''}`}
        interactionWidth={24}
      />
      {selected && (
        <EdgeLabelRenderer>
          <button
            className="wire-remove nodrag nopan"
            style={{ transform: `translate(-50%, -50%) translate(${x}px,${y}px)` }}
            onClick={() => data.onDisconnect(id)}
            aria-label="Eliminar cable seleccionado"
          >
            <Icon name="close" size={15} />
            Quitar
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

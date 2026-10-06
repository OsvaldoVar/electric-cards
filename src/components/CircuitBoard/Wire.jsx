import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
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
  const [path, x, y] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
    offset: 24,
  });
  return (
    <>
      <path
        d={path}
        className={`wire-underlay bit-${data.value ?? 'unknown'}`}
        aria-hidden="true"
      />
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

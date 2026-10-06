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
  const [fallbackPath, fallbackX, fallbackY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
    offset: 24,
  });
  const route = data.route;
  const attached =
    route &&
    Math.abs(route.points[0].x - sourceX) < 1 &&
    Math.abs(route.points[0].y - sourceY) < 1 &&
    Math.abs(route.points.at(-1).x - targetX) < 1 &&
    Math.abs(route.points.at(-1).y - targetY) < 1;
  const path = attached ? route.path : fallbackPath;
  const { x, y } = attached ? route.label : { x: fallbackX, y: fallbackY };
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
        data-routing={attached ? 'separated' : 'pending'}
        data-bridges={attached ? route.bridges : 0}
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

import { useMemo } from 'react';
import { useStore } from '@xyflow/react';
import { routeWires } from '../services/wireRouting';
import { selectWireGeometry } from '../services/routing/selectWireGeometry';

export function useBoardEdges({ circuit, preview, disconnect }, selectedEdge) {
  const wireGeometry = useStore(selectWireGeometry);
  const wireRoutes = useMemo(
    () => routeWires(circuit.edges, JSON.parse(wireGeometry)),
    [circuit.edges, wireGeometry],
  );
  return useMemo(
    () =>
      circuit.edges.map((edge) => ({
        ...edge,
        type: 'wire',
        selected: edge.id === selectedEdge,
        data: {
          value: preview.nodeValues?.[edge.source],
          onDisconnect: disconnect,
          route: wireRoutes[edge.id],
        },
      })),
    [circuit.edges, preview, disconnect, selectedEdge, wireRoutes],
  );
}

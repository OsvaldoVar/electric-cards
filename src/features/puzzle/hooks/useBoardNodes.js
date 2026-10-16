import { useEffect, useMemo, useState } from 'react';
import { useNodesInitialized, useUpdateNodeInternals } from '@xyflow/react';

// React Flow measurement and selection stay local; drafts contain only circuit data.
export function useBoardNodes(game, selectedEdge) {
  const { circuit, preview, inputs, setInputs, moveNodes, deleteGate, disconnect } = game;
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [measuredNodes, setMeasuredNodes] = useState({});
  const updateNodeInternals = useUpdateNodeInternals();
  const nodesInitialized = useNodesInitialized();
  const nodeIds = circuit.nodes.map((node) => node.id).join('|');
  const nodes = useMemo(() => {
    let index = 0;
    return circuit.nodes.map((node) => {
      const ports = Object.fromEntries(
        circuit.edges
          .filter((edge) => edge.target === node.id)
          .map((edge) => [
            edge.targetHandle,
            {
              id: edge.id,
              value: preview.nodeValues?.[edge.source],
              selected: edge.id === selectedEdge,
            },
          ]),
      );
      return {
        ...node,
        // React Flow hides unmeasured controlled nodes and their wires on every
        // position update. Keep dimensions locally; the saved circuit stays pure.
        measured: measuredNodes[node.id],
        selected: selectedNodes.includes(node.id),
        deletable: node.type === 'gate',
        ariaLabel: node.type === 'gate' ? `Compuerta ${node.data.gateType}` : node.data.label,
        data: {
          ...node.data,
          vertical: game.vertical,
          ports,
          value: preview.nodeValues?.[node.id],
          instance: node.type === 'gate' ? ++index : undefined,
          onDelete: deleteGate,
          onDisconnect: disconnect,
          checkStatus:
            node.type === 'output' &&
            game.review?.row &&
            ['passed', 'failed'].includes(game.review.status)
              ? game.review.row.expected[node.data.outputId] ===
                game.review.row.received[node.data.outputId]
                ? 'passed'
                : 'failed'
              : game.review?.status === 'invalid'
                ? 'failed'
                : 'idle',
          onToggle: () =>
            setInputs({ ...inputs, [node.data.inputId]: 1 - inputs[node.data.inputId] }),
        },
      };
    });
  }, [
    circuit,
    preview,
    inputs,
    setInputs,
    deleteGate,
    disconnect,
    selectedNodes,
    selectedEdge,
    measuredNodes,
    game.vertical,
    game.review,
  ]);
  useEffect(() => {
    if (!nodesInitialized) return;
    let cancelled = false;
    let frame;
    // Handle layout changes when nodes or port orientation change, not on drag frames.
    // Repeated measurement while dragging makes connected nodes and wires flicker.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          if (!cancelled) updateNodeInternals(nodeIds.split('|'));
        });
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [nodeIds, nodesInitialized, game.vertical, updateNodeInternals]);
  const changeNodes = (changes) => {
    const dimensions = changes.filter(
      (change) => change.type === 'dimensions' && change.dimensions,
    );
    if (dimensions.length) {
      setMeasuredNodes((previous) => {
        let next = previous;
        for (const change of dimensions) {
          const old = previous[change.id];
          if (
            old?.width !== change.dimensions.width ||
            old?.height !== change.dimensions.height
          ) {
            if (next === previous) next = { ...previous };
            next[change.id] = change.dimensions;
          }
        }
        return next;
      });
    }
    const selections = changes.filter((change) => change.type === 'select');
    if (selections.length) {
      setSelectedNodes((previous) => {
        const next = new Set(previous);
        for (const change of selections) {
          if (change.selected) next.add(change.id);
          else next.delete(change.id);
        }
        return [...next];
      });
    }
    const positions = changes
      .filter((change) => change.type === 'position' && change.position)
      .map(({ id, position }) => ({ id, position }));
    if (positions.length) moveNodes(positions);
    changes
      .filter((change) => change.type === 'remove')
      .forEach((change) => deleteGate(change.id));
  };
  return { nodes, changeNodes, clearSelection: () => setSelectedNodes([]) };
}

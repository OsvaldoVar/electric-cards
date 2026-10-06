import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
  useNodesInitialized,
  useUpdateNodeInternals,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './CircuitBoard.css';
import { InputNode } from './InputNode';
import { GateNode } from './GateNode';
import { OutputNode } from './OutputNode';
import { Wire } from './Wire';
import { validateConnection } from '../../engine/validateCircuit';
import { Icon } from '../Icon';
import { PuzzleControls } from '../PuzzleControls';
import { routeWires, selectWireGeometry } from '../../services/wireRouting';

const nodeTypes = { input: InputNode, gate: GateNode, output: OutputNode };
const edgeTypes = { wire: Wire };
const ariaLabels = {
  'node.a11yDescription.default': 'Mueve el nodo con las flechas o arrástralo.',
  'edge.a11yDescription.default': 'Selecciona el cable para mostrar el botón de eliminar.',
  'controls.zoomIn': 'Acercar',
  'controls.zoomOut': 'Alejar',
  'controls.fitView': 'Ajustar tablero',
};

function Board({ game, level }) {
  const { circuit, preview, inputs, setInputs, moveNodes, deleteGate, disconnect, connect } =
    game;
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [measuredNodes, setMeasuredNodes] = useState({});
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const nodesInitialized = useNodesInitialized();
  const wireGeometry = useStore(selectWireGeometry);
  const wireRoutes = useMemo(
    () => routeWires(circuit.edges, JSON.parse(wireGeometry)),
    [circuit.edges, wireGeometry],
  );
  const nodeIds = circuit.nodes.map((node) => node.id).join('|');
  const motionDuration = (event) =>
    event.detail === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : 120;
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
  const edges = useMemo(
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
  const connectEnd = (_event, state) => {
    if (!state.isValid && state.fromNode && state.toNode && state.toHandle) {
      connect({
        source: state.fromNode.id,
        sourceHandle: state.fromHandle?.id,
        target: state.toNode.id,
        targetHandle: state.toHandle.id,
      });
    }
  };
  return (
    <section
      className="board-panel pixel-frame"
      aria-label="Editor de circuitos"
      data-review={game.review?.status ?? 'idle'}
      aria-busy={game.playback?.running ?? false}
    >
      <div className="board-heading">
        <h1>Nivel {level.id}</h1>
        <div className="board-actions">
          <div className="board-tools">
            <button
              aria-label="Organizar tablero"
              onClick={(event) => {
                game.arrange();
                window.requestAnimationFrame(() =>
                  fitView({ padding: 0.08, maxZoom: 1, duration: motionDuration(event) }),
                );
              }}
            >
              <Icon name="grid" size={17} />
              <span>Organizar</span>
            </button>
          </div>
          <PuzzleControls game={game} />
        </div>
      </div>
      <div className="circuit-canvas" data-testid="circuit-board">
        <div className="board-view-tools board-tools" aria-label="Vista del circuito">
          <button aria-label="Acercar tablero" onClick={() => zoomIn({ duration: 0 })}>
            <Icon name="plus" size={17} />
          </button>
          <button aria-label="Alejar tablero" onClick={() => zoomOut({ duration: 0 })}>
            <Icon name="minus" size={17} />
          </button>
          <button
            aria-label="Ajustar tablero"
            onClick={(event) =>
              fitView({
                padding: game.vertical ? 0.08 : 0.2,
                maxZoom: 1,
                duration: motionDuration(event),
              })
            }
          >
            <Icon name="fit" size={17} />
            <span>Ajustar vista</span>
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.Step}
          onNodesChange={changeNodes}
          onConnect={connect}
          onConnectEnd={connectEnd}
          isValidConnection={(connection) => validateConnection(circuit, connection).valid}
          onEdgesChange={(changes) => {
            for (const change of changes) {
              if (change.type === 'remove') disconnect(change.id);
              if (change.type === 'select') {
                setSelectedEdge((previous) =>
                  change.selected ? change.id : previous === change.id ? null : previous,
                );
              }
            }
          }}
          onNodeClick={() => setSelectedEdge(null)}
          onEdgeClick={(_event, edge) => setSelectedEdge(edge.id)}
          onPaneClick={() => {
            setSelectedEdge(null);
            setSelectedNodes([]);
          }}
          connectOnClick
          connectionRadius={28}
          nodeDragThreshold={5}
          fitView
          fitViewOptions={{ padding: game.vertical ? 0.08 : 0.18, maxZoom: 1 }}
          minZoom={0.25}
          maxZoom={1.8}
          colorMode="dark"
          deleteKeyCode={['Backspace', 'Delete']}
          ariaLabelConfig={ariaLabels}
          onInit={(flow) => flow.fitView({ padding: game.vertical ? 0.08 : 0.18, maxZoom: 1 })}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={32}
            size={1}
            color="var(--grid)"
          />
        </ReactFlow>
      </div>
      <div className="board-hint">
        <Icon name="link" size={15} />
        <span>
          Toca una salida y después una entrada. También puedes arrastrar los cables.
        </span>
      </div>
    </section>
  );
}

export function CircuitBoard({ game, level }) {
  return (
    <ReactFlowProvider>
      <Board game={game} level={level} />
    </ReactFlowProvider>
  );
}

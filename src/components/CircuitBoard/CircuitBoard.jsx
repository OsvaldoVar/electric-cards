import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './CircuitBoard.css';
import { InputNode } from './InputNode';
import { GateNode } from './GateNode';
import { OutputNode } from './OutputNode';
import { Wire } from './Wire';
import { ConnectionForm } from './ConnectionForm';
import { validateConnection } from '../../engine/validateCircuit';
import { Icon } from '../Icon';

const nodeTypes = { input: InputNode, gate: GateNode, output: OutputNode };
const edgeTypes = { wire: Wire };
const ariaLabels = {
  'node.a11yDescription.default': 'Mueve el nodo con las flechas o arrástralo.',
  'edge.a11yDescription.default': 'Selecciona el cable para mostrar el botón de eliminar.',
  'controls.zoomIn': 'Acercar',
  'controls.zoomOut': 'Alejar',
  'controls.fitView': 'Ajustar tablero',
};

function Board({ game }) {
  const { circuit, preview, inputs, setInputs, moveNodes, deleteGate, disconnect, connect } =
    game;
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const nodes = useMemo(() => {
    let index = 0;
    return circuit.nodes.map((node) => {
      const ports = Object.fromEntries(
        circuit.edges
          .filter((edge) => edge.target === node.id)
          .map((edge) => [
            edge.targetHandle,
            { id: edge.id, value: preview.nodeValues?.[edge.source] },
          ]),
      );
      return {
        ...node,
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
    game.vertical,
  ]);
  useEffect(() => {
    updateNodeInternals(nodes.map((node) => node.id));
  }, [nodes, game.vertical, updateNodeInternals]);
  const edges = useMemo(
    () =>
      circuit.edges.map((edge) => ({
        ...edge,
        type: 'wire',
        selected: edge.id === selectedEdge,
        data: { value: preview.nodeValues?.[edge.source], onDisconnect: disconnect },
      })),
    [circuit.edges, preview, disconnect, selectedEdge],
  );
  const changeNodes = (changes) => {
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
    <section className="board-panel" aria-label="Editor de circuitos">
      <div className="board-heading">
        <span>
          <span className="status-dot" /> TABLERO
        </span>
        <span className="mono">
          {circuit.nodes.filter((node) => node.type === 'gate').length} CARTAS ·{' '}
          {circuit.edges.length} CABLES
        </span>
      </div>
      <div className="circuit-canvas" data-testid="circuit-board">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={changeNodes}
          onConnect={connect}
          onConnectEnd={connectEnd}
          isValidConnection={(connection) => validateConnection(circuit, connection).valid}
          onEdgesChange={(changes) =>
            changes
              .filter((change) => change.type === 'remove')
              .forEach((change) => disconnect(change.id))
          }
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
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#31414b" />
          <Panel position="bottom-right">
            <div className="board-tools">
              <button
                aria-label="Organizar tablero"
                onClick={() => {
                  game.arrange();
                  window.requestAnimationFrame(() =>
                    fitView({ padding: 0.08, maxZoom: 1, duration: 180 }),
                  );
                }}
              >
                <Icon name="grid" size={17} />
              </button>
              <button aria-label="Acercar tablero" onClick={() => zoomIn()}>
                <Icon name="plus" size={17} />
              </button>
              <button aria-label="Alejar tablero" onClick={() => zoomOut()}>
                <Icon name="minus" size={17} />
              </button>
              <button
                aria-label="Ajustar tablero"
                onClick={() =>
                  fitView({ padding: game.vertical ? 0.08 : 0.2, maxZoom: 1, duration: 180 })
                }
              >
                <Icon name="fit" size={17} />
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      <div className="board-hint">
        <Icon name="link" size={15} />
        <span>
          Toca una salida y después una entrada. También puedes arrastrar los cables.
        </span>
      </div>
      <ConnectionForm circuit={circuit} onConnect={connect} />
    </section>
  );
}

export function CircuitBoard({ game }) {
  return (
    <ReactFlowProvider>
      <Board game={game} />
    </ReactFlowProvider>
  );
}

import { useState } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './CircuitBoard.css';
import { InputNode } from './InputNode';
import { GateNode } from './GateNode';
import { OutputNode } from './OutputNode';
import { Wire } from './Wire';
import { validateConnection } from '../../../../engine/validateCircuit';
import { Icon } from '../../../../shared/ui/Icon';
import { PuzzleControls } from '../PuzzleControls';
import { useBoardNodes } from '../../hooks/useBoardNodes';
import { useBoardEdges } from '../../hooks/useBoardEdges';

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
  const { circuit, disconnect, connect } = game;
  const [selectedEdge, setSelectedEdge] = useState(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { nodes, changeNodes, clearSelection } = useBoardNodes(game, selectedEdge);
  const edges = useBoardEdges(game, selectedEdge);
  const motionDuration = (event) =>
    event.detail === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : 120;
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
        <h1>{level.challenge ? `Reto de la etapa ${level.stage}` : `Nivel ${level.id}`}</h1>
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
            clearSelection();
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

import { gateInputCounts, targetPorts } from './operations';
import { topologicalSort, wouldCreateCycle } from './graph';

const messages = {
  INVALID_CIRCUIT: 'El circuito guardado no tiene un formato válido.',
  DUPLICATE_NODE: 'Hay nodos repetidos en el circuito.',
  INVALID_NODE: 'Hay un nodo sin tipo, identificador o datos válidos.',
  UNKNOWN_GATE: 'Esta compuerta no forma parte del juego.',
  INVALID_EDGE: 'Un cable conecta nodos o puertos que no existen.',
  DUPLICATE_EDGE: 'Hay identificadores de cables repetidos.',
  PORT_OCCUPIED: 'Cada entrada acepta un solo cable. Desconecta el anterior primero.',
  SELF_CONNECTION: 'Una compuerta no puede conectarse a sí misma.',
  CYCLE_DETECTED: 'Esta conexión crea un ciclo. Las señales deben avanzar sin regresar.',
  MISSING_CONNECTION: 'Faltan entradas por conectar. Revisa los puertos marcados.',
  INVALID_SIGNAL: 'Las entradas solo pueden tener valores 0 o 1.',
  LEVEL_TERMINALS: 'El circuito debe usar exactamente las entradas y salidas de este nivel.',
  INVENTORY_EXCEEDED: 'El circuito supera el inventario permitido en este nivel.',
  GATE_LOCKED: 'Completa los niveles anteriores para desbloquear este componente.',
};

export function circuitError(code, details = {}) {
  return { code, message: messages[code] ?? code, ...details };
}

export function validateConnection(circuit, connection) {
  const source = circuit.nodes.find((node) => node.id === connection.source);
  const target = circuit.nodes.find((node) => node.id === connection.target);
  let code;
  if (
    !source ||
    !target ||
    !['input', 'gate'].includes(source.type) ||
    connection.sourceHandle !== 'out' ||
    !targetPorts(target).includes(connection.targetHandle)
  ) {
    code = 'INVALID_EDGE';
  } else if (source.id === target.id) code = 'SELF_CONNECTION';
  else if (
    circuit.edges.some(
      (edge) => edge.target === target.id && edge.targetHandle === connection.targetHandle,
    )
  ) {
    code = 'PORT_OCCUPIED';
  } else if (wouldCreateCycle(circuit.edges, source.id, target.id)) code = 'CYCLE_DETECTED';
  return code ? { valid: false, error: circuitError(code) } : { valid: true };
}

export function validateCircuit(
  circuit,
  { allowIncomplete = false, level, unlockedGates } = {},
) {
  const errors = [];
  const add = (code, details) => errors.push(circuitError(code, details));
  if (!circuit || !Array.isArray(circuit.nodes) || !Array.isArray(circuit.edges)) {
    return { valid: false, errors: [circuitError('INVALID_CIRCUIT')] };
  }
  const { nodes, edges } = circuit;
  const byId = new Map();
  const terminals = { input: new Set(), output: new Set() };
  for (const node of nodes) {
    if (
      !node ||
      typeof node.id !== 'string' ||
      !node.id ||
      !node.data ||
      !['input', 'gate', 'output'].includes(node.type)
    ) {
      add('INVALID_NODE');
      continue;
    }
    if (byId.has(node.id)) add('DUPLICATE_NODE', { nodeId: node.id });
    byId.set(node.id, node);
    if (node.type === 'gate') {
      if (!Object.hasOwn(gateInputCounts, node.data.gateType))
        add('UNKNOWN_GATE', { nodeId: node.id });
      else if (unlockedGates && !unlockedGates.includes(node.data.gateType))
        add('GATE_LOCKED', { nodeId: node.id });
    } else {
      const id = node.data[node.type === 'input' ? 'inputId' : 'outputId'];
      if (typeof id !== 'string' || !id || terminals[node.type].has(id))
        add('INVALID_NODE', { nodeId: node.id });
      terminals[node.type].add(id);
    }
  }
  if (errors.length) return { valid: false, errors };
  const occupied = new Set();
  const edgeIds = new Set();
  for (const edge of edges) {
    if (!edge || typeof edge.id !== 'string' || !edge.id) {
      add('INVALID_EDGE');
      continue;
    }
    if (edgeIds.has(edge.id)) add('DUPLICATE_EDGE');
    edgeIds.add(edge.id);
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (
      !source ||
      !target ||
      !['input', 'gate'].includes(source.type) ||
      edge.sourceHandle !== 'out' ||
      !targetPorts(target).includes(edge.targetHandle)
    ) {
      add('INVALID_EDGE', { edgeId: edge.id });
      continue;
    }
    if (edge.source === edge.target) add('SELF_CONNECTION', { edgeId: edge.id });
    const port = `${edge.target}|${edge.targetHandle}`;
    if (occupied.has(port))
      add('PORT_OCCUPIED', { nodeId: edge.target, handle: edge.targetHandle });
    occupied.add(port);
  }
  const order = errors.length ? null : topologicalSort(nodes, edges);
  if (!errors.length && !order) add('CYCLE_DETECTED');
  if (!allowIncomplete) {
    for (const node of nodes) {
      for (const handle of targetPorts(node)) {
        if (!occupied.has(`${node.id}|${handle}`))
          add('MISSING_CONNECTION', { nodeId: node.id, handle });
      }
    }
  }
  if (level) {
    for (const type of ['input', 'output']) {
      const expected = level[type === 'input' ? 'inputs' : 'outputs'].map((item) => item.id);
      if (
        expected.length !== terminals[type].size ||
        expected.some((id) => !terminals[type].has(id))
      )
        add('LEVEL_TERMINALS');
    }
    const counts = {};
    for (const node of nodes.filter((node) => node.type === 'gate')) {
      const type = node.data.gateType;
      counts[type] = (counts[type] ?? 0) + 1;
      if (counts[type] > (level.inventory[type] ?? 0))
        add('INVENTORY_EXCEEDED', { gateType: type });
    }
  }
  return { valid: errors.length === 0, errors, order };
}

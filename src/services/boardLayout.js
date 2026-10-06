export function arrangeNodes(nodes, vertical) {
  const inputs = nodes.filter((node) => node.type === 'input');
  const gates = nodes.filter((node) => node.type === 'gate');
  const outputs = nodes.filter((node) => node.type === 'output');
  const positions = new Map();
  if (vertical) {
    const gateStart = Math.ceil(inputs.length / 2) * 150 + 50;
    const outputStart = gateStart + Math.max(1, Math.ceil(gates.length / 2)) * 150 + 60;
    inputs.forEach((node, index) =>
      positions.set(node.id, {
        x: inputs.length === 1 ? 100 : 20 + (index % 2) * 160,
        y: 35 + Math.floor(index / 2) * 150,
      }),
    );
    gates.forEach((node, index) =>
      positions.set(node.id, {
        x: 20 + (index % 2) * 160,
        y: gateStart + Math.floor(index / 2) * 150,
      }),
    );
    outputs.forEach((node, index) =>
      positions.set(node.id, {
        x: outputs.length === 1 ? 100 : 20 + (index % 2) * 160,
        y: outputStart + Math.floor(index / 2) * 155,
      }),
    );
  } else {
    inputs.forEach((node, index) => positions.set(node.id, { x: 40, y: 60 + index * 145 }));
    gates.forEach((node, index) =>
      positions.set(node.id, {
        x: 270 + (index % 3) * 220,
        y: 80 + Math.floor(index / 3) * 160,
      }),
    );
    outputs.forEach((node, index) =>
      positions.set(node.id, { x: gates.length > 1 ? 1000 : 570, y: 110 + index * 175 }),
    );
  }
  return nodes.map((node) => ({ ...node, position: positions.get(node.id) }));
}

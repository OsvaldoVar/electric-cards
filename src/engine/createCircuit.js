export function createCircuit(level) {
  return {
    nodes: [
      ...level.inputs.map((input, index) => ({
        id: `input-${input.id}`,
        type: 'input',
        position: { x: 40, y: 60 + index * 145 },
        deletable: false,
        data: { inputId: input.id, label: input.label },
      })),
      ...level.outputs.map((output, index) => ({
        id: `output-${output.id}`,
        type: 'output',
        position: { x: 570, y: 110 + index * 175 },
        deletable: false,
        data: { outputId: output.id, label: output.label, visualType: output.type },
      })),
    ],
    edges: [],
  };
}

export function remainingInventory(level, circuit) {
  const counts = { ...level.inventory };
  for (const node of circuit.nodes) {
    if (node.type === 'gate')
      counts[node.data.gateType] = (counts[node.data.gateType] ?? 0) - 1;
  }
  return counts;
}

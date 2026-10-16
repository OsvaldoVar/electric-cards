export function selectWireGeometry(state) {
  return JSON.stringify(
    [...state.nodeLookup.values()].map((node) => ({
      id: node.id,
      ...node.internals.positionAbsolute,
      width: node.measured.width ?? 0,
      height: node.measured.height ?? 0,
      handles: node.internals.handleBounds,
    })),
  );
}

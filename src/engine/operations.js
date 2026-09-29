export const gateInputCounts = Object.freeze({
  AND: 2,
  OR: 2,
  NOT: 1,
  NAND: 2,
  NOR: 2,
  XOR: 2,
  XNOR: 2,
});

export const gateOperations = Object.freeze({
  AND: (a, b) => Number(Boolean(a) && Boolean(b)),
  OR: (a, b) => Number(Boolean(a) || Boolean(b)),
  NOT: (a) => Number(!a),
  NAND: (a, b) => Number(!(Boolean(a) && Boolean(b))),
  NOR: (a, b) => Number(!(Boolean(a) || Boolean(b))),
  XOR: (a, b) => Number(Boolean(a) !== Boolean(b)),
  XNOR: (a, b) => Number(Boolean(a) === Boolean(b)),
});

export const isBinary = (value) => value === 0 || value === 1;
export const targetPorts = (node) => {
  if (node.type === 'output') return ['in'];
  if (node.type !== 'gate' || !Object.hasOwn(gateInputCounts, node.data?.gateType)) return [];
  return gateInputCounts[node.data.gateType] === 1 ? ['a'] : ['a', 'b'];
};

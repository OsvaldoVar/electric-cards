export const gateUnlocks = Object.freeze({
  AND: 0,
  OR: 1,
  NOT: 2,
  NAND: 5,
  NOR: 6,
  XOR: 10,
  XNOR: 11,
  CLOCK: 25,
  DFF: 27,
  TFF: 31,
});

export function unlockedGateIds(completedLevels) {
  return Object.entries(gateUnlocks)
    .filter(([, levelId]) => levelId === 0 || completedLevels[levelId]?.completed)
    .map(([id]) => id);
}

export const gatesUnlockedBy = (levelId) =>
  Object.entries(gateUnlocks)
    .filter(([, after]) => after === levelId)
    .map(([id]) => id);

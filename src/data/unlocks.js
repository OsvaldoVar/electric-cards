import { stages, stagePassed } from './stages';
// Values are the stage at whose entry each component becomes available.
export const gateUnlocks = Object.freeze({
  AND: 1,
  OR: 1,
  NOT: 1,
  NAND: 1,
  NOR: 1,
  XOR: 1,
  XNOR: 1,
  CLOCK: 4,
  DFF: 4,
  TFF: 4,
});
export function unlockedGateIds(completedLevels) {
  // Earned legacy memory lessons retain their components even with new lessons pending.
  const memoryEarned = Object.keys(completedLevels).some(
    (id) => Number(id) >= 26 && Number(id) <= 35 && completedLevels[id]?.completed,
  );
  return Object.entries(gateUnlocks)
    .filter(
      ([, stageId]) =>
        stageId === 1 ||
        memoryEarned ||
        stages
          .filter((stage) => stage.id < stageId)
          .every((stage) => stagePassed(stage, completedLevels)),
    )
    .map(([id]) => id);
}

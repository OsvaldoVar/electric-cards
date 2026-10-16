import { createLevel } from './levels/createLevel';
import { combinationalRecords } from './levels/combinational';
import { sequentialLevels } from './levels/sequential';
import { stageCircuitRecords } from './levels/stageChallenges';
import { stages, stageForLevel } from './stages';

const allLevels = [
  ...combinationalRecords.map(createLevel),
  ...stageCircuitRecords.map(createLevel),
  ...sequentialLevels,
];
const byId = new Map(
  allLevels.map((level) => {
    const stage = stageForLevel(level.id);
    const challenge = level.id === stage.challengeId;
    const introductoryGate = {
      1: 'AND',
      2: 'OR',
      3: 'NOT',
      6: 'NAND',
      7: 'NOR',
      11: 'XOR',
      12: 'XNOR',
      19: 'XOR',
    }[level.id];
    return [
      level.id,
      {
        ...level,
        stage: stage.id,
        world: stage.id,
        difficulty: stage.id,
        challenge,
        ...(introductoryGate
          ? {
              inventory: { [introductoryGate]: level.id === 19 ? 2 : 1 },
              distractor: undefined,
            }
          : {}),
      },
    ];
  }),
);
export const levels = stages.flatMap((stage) =>
  [...stage.levelIds, stage.challengeId].map((id) => byId.get(id)),
);
export const getLevel = (id) => byId.get(Number(id));

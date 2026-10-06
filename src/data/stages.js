// Stable level IDs preserve earned progress; arrays define the teaching order.
export const stages = [
  {
    id: 1,
    title: 'Compuertas básicas',
    subtitle: 'Usa una o dos compuertas del mismo tipo.',
    family: 'mint',
    levelIds: [1, 2, 3, 36, 37, 6, 7, 11, 12, 19],
    challengeId: 38,
    challengeSummary: 'Tres AND, cuatro entradas y una decisión.',
    challengeGateCount: 3,
  },
  {
    id: 2,
    title: 'Combina reglas',
    subtitle: 'Construye circuitos de dos a cuatro compuertas de distintos tipos.',
    family: 'amber',
    levelIds: [4, 5, 8, 9, 10, 13, 14, 15, 18, 20, 16, 17, 24],
    challengeId: 42,
    challengeSummary: 'Cinco compuertas: mayoría y su señal contraria.',
    challengeGateCount: 5,
  },
  {
    id: 3,
    title: 'Diseña y optimiza',
    subtitle: 'Reutiliza señales, construye con NAND y resuelve un sumador completo.',
    family: 'violet',
    levelIds: [21, 22, 23, 25],
    challengeId: 43,
    challengeSummary: 'Seis NAND, tres salidas y señales compartidas.',
    challengeGateCount: 6,
  },
  {
    id: 4,
    title: 'Relojes y flip-flops',
    subtitle: 'Entiende los flancos, la memoria D, la alternancia T y los registros.',
    family: 'blue',
    levelIds: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    challengeId: 44,
    challengeSummary: 'Un reloj, tres memorias y un dato invertido: cinco componentes.',
    challengeGateCount: 5,
  },
  {
    id: 5,
    title: 'Integra todo',
    subtitle: 'Combina lógica, reloj y memoria en circuitos de cinco a siete componentes.',
    family: 'mint',
    levelIds: [39, 40, 41],
    challengeId: 45,
    challengeSummary: 'Ocho componentes: decisión lógica, registro, retraso y alternancia.',
    challengeGateCount: 8,
  },
];
export const stageForLevel = (id) =>
  stages.find(
    (stage) => stage.challengeId === Number(id) || stage.levelIds.includes(Number(id)),
  );
const completed = (progress, id) => progress[id]?.completed === true;
export function stagePassed(stage, progress) {
  // Older players who solved all original lessons keep credit for that stage.
  const originalIds = stage.levelIds.filter((id) => id <= 35);
  return (
    completed(progress, stage.challengeId) ||
    stage.levelIds.every((id) => completed(progress, id)) ||
    (originalIds.length > 0 && originalIds.every((id) => completed(progress, id)))
  );
}
export const stageAvailable = (stage, progress) =>
  stages.filter((item) => item.id < stage.id).every((item) => stagePassed(item, progress));
export function canAccessLevel(id, progress) {
  const stage = stageForLevel(id);
  if (!stage) return false;
  if (completed(progress, id)) return true;
  if (!stageAvailable(stage, progress)) return false;
  if (Number(id) === stage.challengeId || stagePassed(stage, progress)) return true;
  return stage.levelIds
    .slice(0, stage.levelIds.indexOf(Number(id)))
    .every((previous) => completed(progress, previous));
}
export function nextRegularLevel(progress) {
  for (const stage of stages) {
    if (!stagePassed(stage, progress))
      return stage.levelIds.find((id) => !completed(progress, id));
  }
  return null;
}
export function nextLevelAfter(id, progress) {
  const stage = stageForLevel(id);
  if (!stage) return null;
  if (stagePassed(stage, progress)) return nextRegularLevel(progress);
  const next = stage.levelIds
    .slice(stage.levelIds.indexOf(Number(id)) + 1)
    .find((candidate) => !completed(progress, candidate));
  return next && canAccessLevel(next, progress) ? next : nextRegularLevel(progress);
}

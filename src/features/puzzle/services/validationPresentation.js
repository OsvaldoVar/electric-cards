export function caseStatus(playback, index) {
  if (!playback || !playback.result.cases[index]) return 'pending';
  if (index < playback.revealedCount) {
    return playback.result.cases[index].passed ? 'passed' : 'failed';
  }
  return playback.running && index === playback.currentIndex ? 'checking' : 'pending';
}

export const caseLabels = {
  pending: 'Pendiente',
  checking: 'Probando',
  passed: 'Correcto',
  failed: 'Revisar',
};

export function observedCase(level, playback, inputs) {
  if (!playback) return null;
  if (playback.running) return playback.result.cases[playback.currentIndex] ?? null;
  return (
    playback.result.cases.find((row) =>
      level.inputs.every((input) => row.inputs[input.id] === inputs[input.id]),
    ) ?? null
  );
}

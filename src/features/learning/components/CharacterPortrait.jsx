import { GateSymbol } from '../../../shared/ui/GateSymbol';

// Keep the existing educational-card slot, rendered as a technical module.
export function CharacterPortrait({ gate }) {
  return (
    <div className={`character-portrait family-${gate.family}`}>
      <GateSymbol type={gate.id} />
      <span className="character-module-id mono">EC / {gate.id}</span>
    </div>
  );
}

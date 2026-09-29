import { GateSymbol } from './GateSymbol';

export function CharacterPortrait({ gate }) {
  const names = {
    AND: '01',
    OR: '02',
    NOT: '03',
    NAND: '04',
    NOR: '05',
    XOR: '06',
    XNOR: '07',
  };
  return (
    <div
      className={`character-portrait family-${gate.family}`}
      aria-label={`Personaje ${gate.character.name}`}
      role="img"
    >
      <svg viewBox="0 0 180 142" aria-hidden="true">
        <g className="portrait-grid" fill="none" stroke="currentColor">
          <circle cx="90" cy="76" r="55" />
          <circle cx="90" cy="76" r="66" strokeDasharray="3 9" />
          <path d="M0 76h180M90 0v142" />
        </g>
        <path
          d="m90 13 37 19v31l-8 23 17 26-46 21-46-21 17-26-8-23V32Z"
          fill="currentColor"
          opacity=".1"
        />
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m90 21 30 16v28l-10 17H70L60 65V37l30-16ZM57 102l13-20m40 0 13 20M66 102l24 16 24-16" />
          <path d="M70 49h40l-6 15H76l-6-15Z" fill="currentColor" opacity=".9" />
          <path d="M80 72h20M90 33v11M43 47l-9 10 9 10m94-20 9 10-9 10" />
          <circle cx="90" cy="99" r="9" />
        </g>
        <text x="14" y="130" fill="currentColor" fontSize="12" fontFamily="monospace">
          EC / {names[gate.id]}
        </text>
      </svg>
      <span className="portrait-symbol">
        <GateSymbol type={gate.id} />
      </span>
    </div>
  );
}

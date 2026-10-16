// ANSI/IEEE-style shapes: repository-native vector symbols, not gate logic.
export function GateSymbol({ type, className = '' }) {
  const inverse = ['NAND', 'NOR', 'XNOR'].includes(type);
  const disjunction = ['OR', 'NOR', 'XOR', 'XNOR'].includes(type);
  return (
    <svg
      viewBox="0 0 112 70"
      className={`gate-symbol ${className}`}
      role="img"
      aria-label={`Símbolo ${type}`}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {['CLOCK', 'DFF', 'TFF'].includes(type) ? (
          <>
            <rect x="26" y="8" width="60" height="54" />
            <path d="M86 35h22" />
            {type === 'CLOCK' ? (
              <path d="M34 42V25h14v17h14V25h14" />
            ) : (
              <>
                <path d="M4 22h22M4 48h22m0-5 8 5-8 5" />
                <text x="37" y="26" fill="currentColor" stroke="none" fontSize="13">
                  {type === 'DFF' ? 'D' : 'T'}
                </text>
                <text x="68" y="39" fill="currentColor" stroke="none" fontSize="13">
                  Q
                </text>
              </>
            )}
          </>
        ) : type === 'NOT' ? (
          <>
            <path d="M4 35h19m0-24 52 24-52 24V11Z" />
            <circle cx="80" cy="35" r="5" />
            <path d="M85 35h23" />
          </>
        ) : (
          <>
            <path d={disjunction ? 'M4 20h24M4 50h24' : 'M4 20h26M4 50h26'} />
            {disjunction ? (
              <path d="M21 9c28 0 48 6 66 26C69 55 49 61 21 61c13-16 13-36 0-52Z" />
            ) : (
              <path d="M30 9h23c45.333 0 45.333 52 0 52H30V9Z" />
            )}
            {['XOR', 'XNOR'].includes(type) && <path d="M13 9c13 16 13 36 0 52" />}
            {inverse ? (
              <>
                <circle cx="92" cy="35" r="5" />
                <path d="M97 35h11" />
              </>
            ) : (
              <path d="M87 35h21" />
            )}
          </>
        )}
      </g>
    </svg>
  );
}

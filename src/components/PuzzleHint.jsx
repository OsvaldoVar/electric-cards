import { Icon } from './Icon';

export function PuzzleHint({ level, game }) {
  return (
    <details className="puzzle-hint">
      <summary>
        <Icon name="help" size={17} />
        Pista
      </summary>
      <div className="puzzle-hint-content">
        <p className="small muted">
          {level.kind === 'sequential'
            ? 'La regla que cumple las secuencias:'
            : 'La fórmula que cumple la tabla de verdad:'}
        </p>
        <dl className="hint-formulas">
          {level.outputs.map((output) => (
            <div key={output.id}>
              <dt>{output.label}</dt>
              <dd>
                <code>{output.formula}</code>
              </dd>
            </div>
          ))}
        </dl>
        <p className="hint-notation">
          AB: AND · +: OR · ¬: NOT · ⊕: XOR
          {level.kind === 'sequential' && ' · ↑CLK: flanco 0 → 1 · Q⁺: siguiente estado'}
        </p>
        <p className="hint-guidance">{level.hints[game.hintCount]}</p>
        {game.hintCount < level.hints.length - 1 && (
          <button className="button button-quiet" onClick={game.showHint}>
            Otra orientación
          </button>
        )}
      </div>
    </details>
  );
}

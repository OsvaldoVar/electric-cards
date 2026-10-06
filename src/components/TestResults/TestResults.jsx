import { Icon } from '../Icon';
import { caseStatus, caseLabels } from '../../services/validationPresentation';

export function TestResults({ result, playback, level, onCase }) {
  const running = playback?.running ?? false;
  if (!result)
    return (
      <div className="test-placeholder">
        <Icon name="shield" size={18} />
        <p>
          Al probar se verifican{' '}
          <strong>
            {level.tests.length}{' '}
            {level.kind === 'sequential' ? 'pasos de todas las secuencias' : 'combinaciones'}
          </strong>
          , incluyendo las entradas que no ves.
        </p>
      </div>
    );
  return (
    <section
      className={`test-results ${running ? 'test-running' : result.success ? 'test-success' : 'test-failure'}`}
      aria-label="Resultados de la prueba"
    >
      {(!result.success || running) && (
        <div className="test-result-heading" role="status">
          <Icon name={running ? 'play' : result.success ? 'check' : 'help'} size={25} />
          <div>
            <h2>
              {running
                ? 'Probando combinaciones…'
                : result.success
                  ? '¡Circuito resuelto!'
                  : result.errors.length
                    ? 'Completa las conexiones'
                    : 'Todavía hay una señal que ajustar'}
            </h2>
            <p>
              {running
                ? `${playback.revealedCount} de ${result.totalTests} combinaciones revisadas`
                : result.errors.length
                  ? `${result.errors.length} puntos por revisar`
                  : `${result.testsPassed} de ${result.totalTests} ${level.kind === 'sequential' ? 'pasos correctos' : 'combinaciones correctas'} · ${result.gateCount} ${result.gateCount === 1 ? 'compuerta' : 'compuertas'}`}
            </p>
          </div>
        </div>
      )}
      {running && (
        <progress
          className="validation-progress"
          value={playback.revealedCount}
          max={result.totalTests}
          aria-label="Combinaciones revisadas"
        />
      )}
      {result.errors.length > 0 && (
        <ul className="circuit-errors">
          {result.errors.slice(0, 12).map((error, index) => (
            <li key={index}>
              {error.message}
              {error.handle && (
                <span className="mono">
                  {' '}
                  · {error.nodeId.startsWith('output-') ? 'salida' : 'carta'} /{' '}
                  {error.handle.toUpperCase()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {result.cases.length > 0 && (
        <details className="results-details" open={running || !result.success}>
          <summary>
            Ver todas las pruebas{' '}
            <span>
              {result.totalTests} {level.kind === 'sequential' ? 'pasos' : 'casos'}
            </span>
          </summary>
          <div className="table-scroll">
            <table className="results-table">
              <caption>
                {level.kind === 'sequential'
                  ? 'Resultados de todas las secuencias'
                  : 'Resultados de todas las combinaciones'}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Entradas</th>
                  <th scope="col">Esperado</th>
                  <th scope="col">Recibido</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Observar</th>
                </tr>
              </thead>
              <tbody>
                {result.cases.map((test, index) => {
                  const status = playback
                    ? caseStatus(playback, index)
                    : test.passed
                      ? 'passed'
                      : 'failed';
                  const revealed = status === 'passed' || status === 'failed';
                  return (
                    <tr
                      key={index}
                      className={`case-${status}`}
                      aria-current={
                        running && playback.currentIndex === index ? 'step' : undefined
                      }
                    >
                      <td className="mono">
                        {level.kind === 'sequential' &&
                          `Sec. ${test.scenario} · paso ${test.step} · CLK=${test.clock} `}
                        {level.inputs
                          .map((input) => `${input.id}=${test.inputs[input.id]}`)
                          .join(' ')}
                      </td>
                      <td className="mono">
                        {level.outputs
                          .map((output) => `${output.id}=${test.expected[output.id]}`)
                          .join(' ')}
                      </td>
                      <td className="mono">
                        {level.outputs
                          .map(
                            (output) =>
                              `${output.id}=${revealed ? (test.received[output.id] ?? '?') : '—'}`,
                          )
                          .join(' ')}
                      </td>
                      <td>
                        <span className="case-status case-state" data-state={status}>
                          <Icon
                            name={
                              status === 'passed'
                                ? 'check'
                                : status === 'failed'
                                  ? 'close'
                                  : status === 'checking'
                                    ? 'play'
                                    : 'grid'
                            }
                            size={14}
                          />
                          {caseLabels[status]}
                        </span>
                      </td>
                      <td>
                        <button
                          className="case-view"
                          aria-label={
                            level.kind === 'sequential'
                              ? `Ver paso ${test.step} de secuencia ${test.scenario}`
                              : `Ver combinación ${index + 1}`
                          }
                          disabled={!revealed}
                          onClick={() => onCase(test)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

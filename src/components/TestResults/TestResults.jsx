import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import { Stars } from '../Stars';
import { levels } from '../../data/levels';

export function TestResults({ result, level, onCase }) {
  if (!result)
    return (
      <div className="test-placeholder">
        <Icon name="shield" size={18} />
        <p>
          Al probar se verifican <strong>las {level.tests.length} combinaciones</strong>, no
          solo las entradas que ves.
        </p>
      </div>
    );
  return (
    <section
      className={`test-results ${result.success ? 'test-success' : 'test-failure'}`}
      aria-label="Resultados de la prueba"
    >
      <div className="test-result-heading" role="status">
        <Icon name={result.success ? 'check' : 'help'} size={25} />
        <div>
          <h2>
            {result.success
              ? '¡Circuito resuelto!'
              : result.errors.length
                ? 'Completa las conexiones'
                : 'Todavía hay una señal que ajustar'}
          </h2>
          <p>
            {result.errors.length
              ? `${result.errors.length} puntos por revisar`
              : `${result.testsPassed} de ${result.totalTests} combinaciones correctas · ${result.gateCount} ${result.gateCount === 1 ? 'compuerta' : 'compuertas'}`}
          </p>
        </div>
        {result.success && (
          <div className="test-success-actions">
            <Stars count={result.stars} />
            <Link
              className="button button-primary"
              to={level.id < levels.length ? `/puzzle/${level.id + 1}` : '/levels'}
            >
              {level.id < levels.length ? 'Siguiente nivel' : 'Ver recorrido'}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
        )}
      </div>
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
        <details className="results-details" open={!result.success}>
          <summary>
            Ver todas las pruebas <span>{result.totalTests} casos</span>
          </summary>
          <div className="table-scroll">
            <table className="results-table">
              <caption>Resultados de todas las combinaciones</caption>
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
                {result.cases.map((test, index) => (
                  <tr key={index} className={test.passed ? 'case-passed' : 'case-failed'}>
                    <td className="mono">
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
                        .map((output) => `${output.id}=${test.received[output.id] ?? '?'}`)
                        .join(' ')}
                    </td>
                    <td>
                      <span className="case-status">
                        <Icon name={test.passed ? 'check' : 'close'} size={14} />
                        {test.passed ? 'Correcto' : 'Revisar'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="case-view"
                        aria-label={`Ver combinación ${index + 1}`}
                        onClick={() => onCase(test.inputs)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

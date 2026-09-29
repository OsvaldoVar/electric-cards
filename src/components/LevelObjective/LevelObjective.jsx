import { Stars } from '../Stars';
import { Icon } from '../Icon';

export function LevelObjective({ level, game }) {
  return (
    <aside className="objective-panel">
      <span className="eyebrow">TU MISIÓN</span>
      <h2>{level.title}</h2>
      <p className="objective-description">{level.description}</p>
      <div className="objective-inputs">
        <h3>Entradas de prueba</h3>
        <div className="input-switches">
          {level.inputs.map((input) => (
            <button
              key={input.id}
              className={`binary-switch bit-${game.inputs[input.id]}`}
              aria-label={`Cambiar sensor ${input.id}`}
              aria-pressed={game.inputs[input.id] === 1}
              onClick={() =>
                game.setInputs({ ...game.inputs, [input.id]: 1 - game.inputs[input.id] })
              }
            >
              <span>{input.id}</span>
              <strong>{game.inputs[input.id]}</strong>
              <span className="switch-indicator" />
            </button>
          ))}
        </div>
        <p className="muted small">Cámbialas para observar tu circuito.</p>
      </div>
      <div className="star-objective">
        <Stars count={3} />
        <p>
          Resuelve con{' '}
          <strong>
            {level.stars.maxGates3} {level.stars.maxGates3 === 1 ? 'compuerta' : 'compuertas'}
          </strong>{' '}
          o menos para conseguir tres estrellas.
        </p>
        <small>
          Dos estrellas: hasta {level.stars.maxGates2}. Una: cualquier solución válida.
        </small>
      </div>
      <details className="objective-table">
        <summary>
          Ver objetivo por combinación <Icon name="grid" size={15} />
        </summary>
        <div className="table-scroll">
          <table className="truth-table">
            <caption>Resultados requeridos del nivel</caption>
            <thead>
              <tr>
                {[...level.inputs, ...level.outputs].map((item) => (
                  <th key={item.id} scope="col">
                    {item.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {level.tests.map((test, index) => (
                <tr key={index}>
                  {level.inputs.map((input) => (
                    <td key={input.id}>{test.inputs[input.id]}</td>
                  ))}
                  {level.outputs.map((output) => (
                    <td key={output.id} className="table-output">
                      {test.outputs[output.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </aside>
  );
}

import { useState } from 'react';

export function SequentialObjective({ level, game }) {
  const [sequence, setSequence] = useState(1);
  const sequences = [...new Set(level.tests.map((test) => test.scenario))];
  return (
    <section className="objective-panel">
      <h2>Objetivo en el tiempo</h2>
      <p className="objective-description">{level.description} Las memorias empiezan en 0.</p>
      <label className="sequence-picker">
        Secuencia de ejemplo
        <select value={sequence} onChange={(event) => setSequence(Number(event.target.value))}>
          {sequences.map((id) => (
            <option key={id} value={id}>
              Secuencia {id} de {sequences.length}
            </option>
          ))}
        </select>
      </label>
      <div className="table-scroll objective-table">
        <table className="truth-table">
          <caption>Secuencia {sequence}: salidas requeridas por paso</caption>
          <thead>
            <tr>
              <th scope="col">Paso</th>
              <th scope="col">CLK</th>
              {level.inputs.map((input) => (
                <th key={input.id} scope="col">
                  {input.id}
                </th>
              ))}
              {level.outputs.map((output) => (
                <th key={output.id} scope="col">
                  {output.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {level.tests.map(
              (test, index) =>
                test.scenario === sequence && (
                  <tr
                    key={index}
                    className={
                      game.result?.cases[index]
                        ? `case-${game.result.cases[index].passed ? 'passed' : 'failed'}`
                        : ''
                    }
                  >
                    <td>{test.step}</td>
                    <td>{test.clock}</td>
                    {level.inputs.map((input) => (
                      <td key={input.id}>{test.inputs[input.id]}</td>
                    ))}
                    {level.outputs.map((output) => (
                      <td key={output.id} className="table-output">
                        {test.outputs[output.id]}
                      </td>
                    ))}
                  </tr>
                ),
            )}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Se comprobarán {sequences.length} secuencias · {level.tests.length} pasos en total.
      </p>
    </section>
  );
}

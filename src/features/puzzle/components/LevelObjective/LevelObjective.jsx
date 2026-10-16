import { Icon } from '../../../../shared/ui/Icon';
import { caseStatus, caseLabels } from '../../services/validationPresentation';
import { SequentialObjective } from './SequentialObjective';

export function LevelObjective({ level, game }) {
  if (level.kind === 'sequential') return <SequentialObjective level={level} game={game} />;
  const playback = game?.playback;
  const TableContainer = level.inputs.length <= 2 ? 'div' : 'details';
  return (
    <section className="objective-panel">
      <h2>Objetivo</h2>
      <p className="objective-description">{level.description}</p>
      <TableContainer
        className="objective-table"
        open={TableContainer === 'details' && playback ? true : undefined}
      >
        {level.inputs.length > 2 && (
          <summary>
            Ver objetivo por combinación <Icon name="grid" size={15} />
          </summary>
        )}
        <div className="table-scroll">
          <table className="truth-table">
            <caption>Resultados requeridos del nivel</caption>
            <thead>
              <tr>
                {level.inputs.map((item) => (
                  <th key={item.id} scope="col">
                    {item.id}
                  </th>
                ))}
                {level.outputs.map((item) => (
                  <th key={item.id} scope="col">
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {level.tests.map((test, index) => {
                const status = caseStatus(playback, index);
                return (
                  <tr
                    key={index}
                    className={`case-${status}`}
                    aria-label={`Combinación ${index + 1}: ${caseLabels[status]}`}
                    aria-current={
                      playback?.running && playback.currentIndex === index ? 'step' : undefined
                    }
                  >
                    {level.inputs.map((input) => (
                      <td key={input.id}>{test.inputs[input.id]}</td>
                    ))}
                    {level.outputs.map((output) => (
                      <td key={output.id} className="table-output">
                        {test.outputs[output.id]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TableContainer>
    </section>
  );
}

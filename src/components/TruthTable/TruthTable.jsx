export function TruthTable({ gate, activeInputs }) {
  const labels = gate.inputs === 1 ? ['A', 'Y'] : ['A', 'B', 'Y'];
  return (
    <div className="table-scroll">
      <table className="truth-table">
        <caption>Tabla de verdad de {gate.name}</caption>
        <thead>
          <tr>
            {labels.map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gate.truthTable.map((row, index) => (
            <tr
              key={index}
              className={
                activeInputs && activeInputs.every((value, i) => row[i] === value)
                  ? 'active-row'
                  : ''
              }
            >
              {row.map((value, i) => (
                <td key={i} className={i === row.length - 1 ? 'table-output' : ''}>
                  <span className={`bit bit-${value}`}>{value}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

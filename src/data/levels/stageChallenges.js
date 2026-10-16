const majority = ['OR', ['AND', 'A', 'B'], ['AND', 'C', ['OR', 'A', 'B']]];
export const stageCircuitRecords = [
  {
    id: 36,
    title: 'Tres permisos',
    description: 'Abre la puerta solo si A, B y C están activos. Usa dos AND.',
    inputIds: ['A', 'B', 'C'],
    goals: { DOOR: ['Puerta', 'door', ['AND', ['AND', 'A', 'B'], 'C']] },
    inventory: { AND: 2 },
    optimizationGateCount: 2,
    hints: [
      'Agrupa dos permisos y después exige el tercero.',
      'La salida de la primera AND alimenta la segunda.',
    ],
  },
  {
    id: 37,
    title: 'Tres caminos',
    description: 'Enciende la luz si cualquiera de los tres sensores está activo. Usa dos OR.',
    inputIds: ['A', 'B', 'C'],
    goals: { LED: ['Luz de señal', 'led', ['OR', ['OR', 'A', 'B'], 'C']] },
    inventory: { OR: 2 },
    optimizationGateCount: 2,
    hints: ['Agrupa dos alternativas y añade la tercera.', 'Encadena dos OR.'],
  },
  {
    id: 38,
    title: 'Reto de cuatro permisos',
    description:
      'Abre la puerta solo cuando los cuatro sensores estén activos. Este reto de tres AND acredita toda la etapa 1.',
    inputIds: ['A', 'B', 'C', 'D'],
    goals: { DOOR: ['Puerta', 'door', ['AND', ['AND', 'A', 'B'], ['AND', 'C', 'D']]] },
    inventory: { AND: 3 },
    optimizationGateCount: 3,
    hints: [
      'Cada AND combina dos señales. Necesitas reunir las cuatro.',
      'Combina A con B y C con D; exige ambos resultados con otra AND.',
    ],
  },
  {
    id: 42,
    title: 'Mayoría y oposición',
    description:
      'MAYORIA se activa con al menos dos sensores encendidos. OPUESTO muestra su negación. Usa cinco compuertas para acreditar la etapa 2.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      MAYORIA: ['Mayoría', 'flag', majority],
      OPUESTO: ['Opuesto', 'led', ['NOT', majority]],
    },
    inventory: { AND: 2, OR: 2, NOT: 1 },
    optimizationGateCount: 5,
    hints: [
      'Comparte la decisión entre ambas salidas.',
      'La mayoría es (AB) + C(A+B); invierte ese resultado para OPUESTO.',
    ],
  },
  {
    id: 43,
    title: 'Tres funciones con NAND',
    description:
      'DIF indica diferencia, IGUAL indica igualdad y ACARREO exige A y B activos. Resuelve las tres salidas con seis NAND para acreditar la etapa 3.',
    inputIds: ['A', 'B'],
    goals: {
      DIF: ['Diferencia', 'led', ['XOR', 'A', 'B']],
      IGUAL: ['Igualdad', 'led', ['XNOR', 'A', 'B']],
      ACARREO: ['Acarreo', 'flag', ['AND', 'A', 'B']],
    },
    inventory: { NAND: 6 },
    optimizationGateCount: 6,
    hints: [
      'Comparte la primera NAND entre el comparador y el acarreo.',
      'Construye XOR con cuatro NAND. Invierte su salida para IGUAL y la primera NAND para ACARREO.',
    ],
  },
];

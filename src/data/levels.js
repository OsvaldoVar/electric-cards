import { evaluateExpression } from '../engine/evaluateGate';
import { formatExpression } from '../engine/formatExpression';
import { sequentialLevels } from './sequentialLevels';
import { stages, stageForLevel } from './stages';
import { stageCircuitRecords } from './stageLevels';

// Advanced lessons retain their optional distractor.
// Introductory lessons restrict inventory to a single gate type below.
const distractors = {
  1: 'OR',
  2: 'AND',
  3: 'OR',
  4: 'NOT',
  5: 'NOT',
  6: 'OR',
  7: 'AND',
  8: 'OR',
  9: 'AND',
  10: 'XOR',
  11: 'OR',
  12: 'AND',
  13: 'OR',
  14: 'AND',
  15: 'AND',
  16: 'NOT',
  17: 'XOR',
  18: 'XOR',
  19: 'OR',
  20: 'OR',
  21: 'OR',
  22: 'AND',
  23: 'OR',
  24: 'NAND',
  25: 'NOT',
};

function createLevel(record) {
  const { inputIds, goals, ...rest } = record;
  const inputs = inputIds.map((id) => ({
    id,
    label: id === 'S' ? 'Selector S' : `Sensor ${id}`,
  }));
  const outputs = Object.entries(goals).map(([id, value]) => ({
    id,
    label: value[0],
    type: value[1],
    formula: formatExpression(value[2]),
  }));
  const tests = Array.from({ length: 2 ** inputs.length }, (_, index) => {
    const values = Object.fromEntries(
      inputIds.map((id, bit) => [id, (index >> (inputIds.length - bit - 1)) & 1]),
    );
    return {
      inputs: values,
      outputs: Object.fromEntries(
        Object.entries(goals).map(([id, value]) => [id, evaluateExpression(value[2], values)]),
      ),
    };
  });
  return {
    ...rest,
    distractor: distractors[rest.id],
    inventory: {
      ...rest.inventory,
      ...(distractors[rest.id]
        ? { [distractors[rest.id]]: rest.inventory[distractors[rest.id]] ?? 1 }
        : {}),
    },
    difficulty: rest.world,
    inputs,
    outputs,
    tests,
  };
}

const records = [
  {
    id: 1,
    world: 1,
    title: 'Acceso doble',
    description: 'La puerta se abre solo cuando los sensores A y B están activos.',
    inputIds: ['A', 'B'],
    goals: {
      DOOR: ['Puerta', 'door', ['AND', 'A', 'B']],
    },
    inventory: {
      AND: 1,
      OR: 1,
    },
    optimizationGateCount: 1,
    hints: [
      'Ambas condiciones deben cumplirse a la vez.',
      'Prueba una AND con los dos sensores.',
    ],
  },
  {
    id: 2,
    world: 1,
    title: 'Cualquier señal',
    description: 'Enciende el LED si A o B están activos, incluido cuando ambos lo están.',
    inputIds: ['A', 'B'],
    goals: {
      LED: ['Luz de señal', 'led', ['OR', 'A', 'B']],
    },
    inventory: {
      OR: 1,
      AND: 1,
    },
    optimizationGateCount: 1,
    hints: [
      'Una sola entrada activa ya es suficiente.',
      'OR permite que cualquiera active la salida.',
    ],
  },
  {
    id: 3,
    world: 1,
    title: 'Al revés',
    description: 'La bandera debe subir cuando A esté apagado y bajar cuando esté encendido.',
    inputIds: ['A'],
    goals: {
      FLAG: ['Bandera', 'flag', ['NOT', 'A']],
    },
    inventory: {
      NOT: 1,
    },
    optimizationGateCount: 1,
    hints: ['Necesitas invertir el valor de la entrada.', 'NOT transforma 0 en 1 y 1 en 0.'],
  },
  {
    id: 4,
    world: 1,
    title: 'Ruta de emergencia',
    description: 'La puerta se abre si A y B están activos a la vez, o si C está activo.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      DOOR: ['Puerta', 'door', ['OR', ['AND', 'A', 'B'], 'C']],
    },
    inventory: {
      AND: 1,
      OR: 1,
      NOT: 1,
    },
    optimizationGateCount: 2,
    hints: [
      'Resuelve primero la condición de A y B.',
      'Combina esa salida con C mediante OR.',
    ],
  },
  {
    id: 5,
    world: 1,
    title: 'Motor autorizado',
    description: 'El motor gira si C está activo y al menos uno de A o B está activo.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      MOTOR: ['Motor', 'motor', ['AND', ['OR', 'A', 'B'], 'C']],
    },
    inventory: {
      AND: 1,
      OR: 1,
      NOT: 1,
    },
    optimizationGateCount: 2,
    hints: ['C es un permiso obligatorio.', 'Agrupa A y B con OR y exige C con AND.'],
  },
  {
    id: 6,
    world: 2,
    title: 'Aviso pendiente',
    description: 'La alarma está activa excepto cuando A y B están activos a la vez.',
    inputIds: ['A', 'B'],
    goals: {
      ALARM: ['Alarma', 'alarm', ['NAND', 'A', 'B']],
    },
    inventory: {
      NAND: 1,
      AND: 1,
      NOT: 1,
    },
    optimizationGateCount: 1,
    hints: ['Busca la negación de AND.', 'Una NAND resuelve todo el objetivo.'],
  },
  {
    id: 7,
    world: 2,
    title: 'Silencio total',
    description: 'El LED se enciende solo cuando A y B están apagados.',
    inputIds: ['A', 'B'],
    goals: {
      LED: ['Luz de reposo', 'led', ['NOR', 'A', 'B']],
    },
    inventory: {
      NOR: 1,
      OR: 1,
      NOT: 1,
    },
    optimizationGateCount: 1,
    hints: ['El resultado es lo contrario de OR.', 'NOR da 1 únicamente con 0 y 0.'],
  },
  {
    id: 8,
    world: 2,
    title: 'Permiso con bloqueo',
    description: 'La puerta se abre cuando A está activo y B está apagado.',
    inputIds: ['A', 'B'],
    goals: {
      DOOR: ['Puerta', 'door', ['AND', 'A', ['NOT', 'B']]],
    },
    inventory: {
      AND: 1,
      NOT: 1,
      OR: 1,
    },
    optimizationGateCount: 2,
    hints: ['B representa un bloqueo: invierte su señal.', 'Conecta A y NOT(B) a una AND.'],
  },
  {
    id: 9,
    world: 2,
    title: 'Plan alternativo',
    description: 'La bandera sube si A está activo o B está apagado.',
    inputIds: ['A', 'B'],
    goals: {
      FLAG: ['Bandera', 'flag', ['OR', 'A', ['NOT', 'B']]],
    },
    inventory: {
      OR: 1,
      NOT: 1,
      AND: 1,
    },
    optimizationGateCount: 2,
    hints: ['Hay dos maneras de activar la salida.', 'Combina A con NOT(B) usando OR.'],
  },
  {
    id: 10,
    world: 2,
    title: 'El truco de De Morgan',
    description: 'Enciende el LED solo si A y B están apagados. No tienes una NOR.',
    inputIds: ['A', 'B'],
    goals: {
      LED: ['Luz de reposo', 'led', ['NOR', 'A', 'B']],
    },
    inventory: {
      NOT: 2,
      AND: 1,
    },
    optimizationGateCount: 3,
    hints: [
      'Estar ambos apagados equivale a que ambas negaciones estén encendidas.',
      'NOT(A) AND NOT(B) es igual a NOR(A,B).',
    ],
  },
  {
    id: 11,
    world: 3,
    title: 'Una sola señal',
    description: 'La alarma se activa cuando exactamente uno de A o B está activo.',
    inputIds: ['A', 'B'],
    goals: {
      ALARM: ['Alarma', 'alarm', ['XOR', 'A', 'B']],
    },
    inventory: {
      XOR: 1,
      OR: 1,
      AND: 1,
    },
    optimizationGateCount: 1,
    hints: [
      'OR también se activa con dos unos; aquí eso no sirve.',
      'XOR detecta entradas diferentes.',
    ],
  },
  {
    id: 12,
    world: 3,
    title: 'En sintonía',
    description: 'El LED debe encenderse cuando A y B sean iguales, incluso si ambos son 0.',
    inputIds: ['A', 'B'],
    goals: {
      LED: ['Coincidencia', 'led', ['XNOR', 'A', 'B']],
    },
    inventory: {
      XNOR: 1,
      XOR: 1,
      NOT: 1,
    },
    optimizationGateCount: 1,
    hints: ['La igualdad incluye 0/0 y 1/1.', 'XNOR es un comparador de igualdad.'],
  },
  {
    id: 13,
    world: 3,
    title: 'Diferencia autorizada',
    description: 'El motor gira si A y B son diferentes y C está activo.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      MOTOR: ['Motor', 'motor', ['AND', ['XOR', 'A', 'B'], 'C']],
    },
    inventory: {
      XOR: 1,
      AND: 1,
      OR: 1,
    },
    optimizationGateCount: 2,
    hints: ['Primero detecta la diferencia.', 'C debe coincidir con una salida XOR activa.'],
  },
  {
    id: 14,
    world: 3,
    title: 'Iguales o emergencia',
    description: 'Abre la puerta si A y B son iguales o si C está activo.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      DOOR: ['Puerta', 'door', ['OR', ['XNOR', 'A', 'B'], 'C']],
    },
    inventory: {
      XNOR: 1,
      OR: 1,
      AND: 1,
    },
    optimizationGateCount: 2,
    hints: [
      'La igualdad activa la puerta; C también puede hacerlo por sí solo.',
      'Une XNOR(A,B) con C mediante OR.',
    ],
  },
  {
    id: 15,
    world: 3,
    title: 'Dos caras',
    description: 'DIF se enciende si A y B son distintos. IGUAL se enciende si son iguales.',
    inputIds: ['A', 'B'],
    goals: {
      DIF: ['Diferencia', 'led', ['XOR', 'A', 'B']],
      IGUAL: ['Igualdad', 'led', ['XNOR', 'A', 'B']],
    },
    inventory: {
      XOR: 1,
      XNOR: 1,
      NOT: 1,
    },
    optimizationGateCount: 2,
    hints: [
      'Las salidas deben ser opuestas para cada entrada.',
      'Puedes usar XOR y XNOR, o compartir XOR con una NOT.',
    ],
  },
  {
    id: 16,
    world: 4,
    title: 'Decisión por mayoría',
    description: 'La bandera sube cuando al menos dos de los tres sensores están activos.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      FLAG: ['Mayoría', 'flag', ['OR', ['AND', 'A', 'B'], ['AND', 'C', ['OR', 'A', 'B']]]],
    },
    inventory: {
      AND: 3,
      OR: 2,
      NOT: 1,
    },
    optimizationGateCount: 4,
    hints: [
      'Si A y B coinciden en 1, ya existe mayoría. Si solo uno está en 1, C decide.',
      'Usa (A AND B) OR (C AND (A OR B)) para ahorrar una compuerta.',
    ],
  },
  {
    id: 17,
    world: 4,
    title: 'Acceso seguro',
    description: 'La puerta se abre si A y B están activos y tanto C como D están apagados.',
    inputIds: ['A', 'B', 'C', 'D'],
    goals: {
      DOOR: ['Puerta segura', 'door', ['AND', ['AND', 'A', 'B'], ['NOT', ['OR', 'C', 'D']]]],
    },
    inventory: {
      AND: 2,
      OR: 1,
      NOT: 1,
    },
    optimizationGateCount: 4,
    hints: [
      'Agrupa por separado los permisos y los bloqueos.',
      'Combina AND(A,B) con NOT(OR(C,D)) mediante AND.',
    ],
  },
  {
    id: 18,
    world: 4,
    title: 'Alarma silenciable',
    description:
      'La alarma suena si A o B están activos, pero C siempre la silencia cuando está activo.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      ALARM: ['Alarma', 'alarm', ['AND', ['OR', 'A', 'B'], ['NOT', 'C']]],
    },
    inventory: {
      OR: 1,
      AND: 1,
      NOT: 1,
    },
    optimizationGateCount: 3,
    hints: ['C es un bloqueo global.', '(A OR B) AND NOT(C) cumple todas las combinaciones.'],
  },
  {
    id: 19,
    world: 4,
    title: 'Paridad impar',
    description: 'Enciende el LED si el número de entradas activas es impar: una o tres.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      LED: ['Paridad', 'led', ['XOR', ['XOR', 'A', 'B'], 'C']],
    },
    inventory: {
      XOR: 2,
      OR: 1,
      AND: 1,
    },
    optimizationGateCount: 2,
    hints: [
      'XOR acumula la paridad de dos señales.',
      'Encadena dos XOR para comparar tres entradas.',
    ],
  },
  {
    id: 20,
    world: 4,
    title: 'Primer sumador',
    description:
      'SUMA indica que A y B son distintos. ACARREO indica que ambos están activos.',
    inputIds: ['A', 'B'],
    goals: {
      SUMA: ['Suma', 'led', ['XOR', 'A', 'B']],
      ACARREO: ['Acarreo', 'flag', ['AND', 'A', 'B']],
    },
    inventory: {
      XOR: 1,
      AND: 1,
      OR: 1,
    },
    optimizationGateCount: 2,
    hints: [
      'Un semisumador suma dos bits y puede producir un acarreo.',
      'Comparte A y B entre una XOR y una AND.',
    ],
  },
  {
    id: 21,
    world: 5,
    title: 'AND con otro nombre',
    description:
      'Abre la puerta cuando A y B estén activos. Encuentra una solución con dos compuertas.',
    inputIds: ['A', 'B'],
    goals: {
      DOOR: ['Puerta', 'door', ['AND', 'A', 'B']],
    },
    inventory: {
      NAND: 2,
    },
    optimizationGateCount: 2,
    hints: [
      'Una NAND con sus dos entradas iguales se comporta como NOT.',
      'Invierte el resultado de la primera NAND usando la segunda.',
    ],
  },
  {
    id: 22,
    world: 5,
    title: 'OR universal',
    description:
      'Enciende el LED cuando A o B estén activos. Aprovecha las NAND del inventario.',
    inputIds: ['A', 'B'],
    goals: {
      LED: ['Luz de señal', 'led', ['OR', 'A', 'B']],
    },
    inventory: {
      NAND: 3,
    },
    optimizationGateCount: 3,
    hints: [
      'Una NAND puede invertir una entrada si recibe esa señal en ambos puertos.',
      'NAND(NOT(A),NOT(B)) equivale a OR(A,B).',
    ],
  },
  {
    id: 23,
    world: 5,
    title: 'La diferencia mínima',
    description:
      'Activa la alarma si A y B son diferentes. Elige bien entre las compuertas disponibles.',
    inputIds: ['A', 'B'],
    goals: {
      ALARM: ['Diferencia', 'alarm', ['XOR', 'A', 'B']],
    },
    inventory: {
      NAND: 4,
    },
    optimizationGateCount: 4,
    hints: [
      'Comparte el resultado de NAND(A,B) con otras dos NAND.',
      'N1=NAND(A,B); N2=NAND(A,N1); N3=NAND(B,N1); salida=NAND(N2,N3).',
    ],
  },
  {
    id: 24,
    world: 5,
    title: 'El selector',
    description: 'Si S es 0, el LED copia A. Si S es 1, el LED copia B.',
    inputIds: ['A', 'B', 'S'],
    goals: {
      LED: [
        'Salida seleccionada',
        'led',
        ['OR', ['AND', 'A', ['NOT', 'S']], ['AND', 'B', 'S']],
      ],
    },
    inventory: {
      AND: 2,
      OR: 1,
      NOT: 1,
    },
    optimizationGateCount: 4,
    hints: [
      'S permite una ruta mientras su negación permite la otra.',
      '(A AND NOT(S)) OR (B AND S) forma un multiplexor.',
    ],
  },
  {
    id: 25,
    world: 5,
    title: 'Suma completa',
    description:
      'SUMA se activa con una o tres entradas activas. ACARREO se activa con dos o tres.',
    inputIds: ['A', 'B', 'C'],
    goals: {
      SUMA: ['Suma', 'led', ['XOR', ['XOR', 'A', 'B'], 'C']],
      ACARREO: ['Acarreo', 'flag', ['OR', ['AND', 'A', 'B'], ['AND', 'C', ['XOR', 'A', 'B']]]],
    },
    inventory: {
      XOR: 2,
      AND: 3,
      OR: 2,
      NOT: 1,
    },
    optimizationGateCount: 5,
    hints: [
      'Construye la paridad y la mayoría. Busca una señal intermedia que puedan compartir.',
      'Comparte XOR(A,B): SUMA=XOR(esa,C), ACARREO=OR(AND(A,B),AND(esa,C)).',
    ],
  },
];

const allLevels = [
  ...records.map(createLevel),
  ...stageCircuitRecords.map(createLevel),
  ...sequentialLevels,
];
const byId = new Map(
  allLevels.map((level) => {
    const stage = stageForLevel(level.id);
    const challenge = level.id === stage.challengeId;
    const introductoryGate = {
      1: 'AND',
      2: 'OR',
      3: 'NOT',
      6: 'NAND',
      7: 'NOR',
      11: 'XOR',
      12: 'XNOR',
      19: 'XOR',
    }[level.id];
    return [
      level.id,
      {
        ...level,
        stage: stage.id,
        world: stage.id,
        difficulty: stage.id,
        challenge,
        ...(introductoryGate
          ? {
              inventory: { [introductoryGate]: level.id === 19 ? 2 : 1 },
              distractor: undefined,
            }
          : {}),
      },
    ];
  }),
);
export const levels = stages.flatMap((stage) =>
  [...stage.levelIds, stage.challengeId].map((id) => byId.get(id)),
);
export const getLevel = (id) => levels.find((level) => level.id === Number(id));

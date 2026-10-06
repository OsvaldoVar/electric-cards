import { evaluateGate } from '../engine/evaluateGate';
import { gateInputCounts } from '../engine/operations';

const descriptions = {
  AND: {
    expression: 'A · B',
    description: 'La salida se activa únicamente cuando ambas entradas están activas.',
    character: {
      name: 'El Guardián',
      ability: 'Sincronización',
      role: 'Ambos deben estar listos.',
    },
    example: 'Una puerta se abre cuando la tarjeta y la contraseña son correctas.',
    family: 'mint',
  },
  OR: {
    expression: 'A + B',
    description: 'La salida se activa cuando al menos una de las entradas está activa.',
    character: {
      name: 'La Mensajera',
      ability: 'Alternativa',
      role: 'Cualquier señal abre un camino.',
    },
    example: 'Una alarma se activa si el sensor de humo o el de temperatura detecta peligro.',
    family: 'blue',
  },
  NOT: {
    expression: '¬A',
    description: 'Invierte la entrada: un 0 se convierte en 1 y un 1 en 0.',
    character: {
      name: 'El Inversor',
      ability: 'Cambio de polaridad',
      role: 'Lo que entra, sale al revés.',
    },
    example: 'La luz de aviso se enciende cuando el sensor de puerta cerrada está apagado.',
    family: 'amber',
  },
  NAND: {
    expression: '¬(A · B)',
    description: 'La salida permanece activa salvo cuando ambas entradas están activas.',
    character: {
      name: 'La Centinela',
      ability: 'Conjunción invertida',
      role: 'Solo dos señales me detienen.',
    },
    example: 'Un aviso permanece encendido hasta que ambos controles están listos.',
    family: 'amber',
  },
  NOR: {
    expression: '¬(A + B)',
    description: 'La salida se activa únicamente cuando las dos entradas están apagadas.',
    character: {
      name: 'El Silencioso',
      ability: 'Silencio total',
      role: 'Actúo cuando nadie más lo hace.',
    },
    example: 'El modo de reposo se activa cuando ninguno de los sensores detecta actividad.',
    family: 'blue',
  },
  XOR: {
    expression: 'A ⊕ B',
    description:
      'La salida se activa cuando las entradas son diferentes: exactamente una debe estar activa.',
    character: {
      name: 'La Duelista',
      ability: 'Diferencia',
      role: 'Una señal. Nunca las dos.',
    },
    example: 'Un indicador avisa que dos interruptores tienen estados diferentes.',
    family: 'violet',
  },
  XNOR: {
    expression: '¬(A ⊕ B)',
    description:
      'La salida se activa cuando ambas entradas tienen el mismo valor, incluidos dos ceros.',
    character: {
      name: 'El Gemelo',
      ability: 'Coincidencia',
      role: 'La igualdad es mi señal.',
    },
    example: 'Un comparador confirma que dos bits son iguales.',
    family: 'violet',
  },
};

const combinationalGates = Object.fromEntries(
  Object.entries(descriptions).map(([id, data]) => {
    const inputs = gateInputCounts[id];
    const truthTable = Array.from({ length: 2 ** inputs }, (_, index) => {
      const values = Array.from(
        { length: inputs },
        (_, bit) => (index >> (inputs - bit - 1)) & 1,
      );
      return [...values, evaluateGate(id, values)];
    });
    return [id, { id, name: id, inputs, ...data, truthTable }];
  }),
);
export const gates = {
  ...combinationalGates,
  CLOCK: {
    id: 'CLOCK',
    name: 'CLOCK',
    inputs: 0,
    ports: [],
    sequential: true,
    expression: 'CLK: 0 → 1 → 0',
    family: 'blue',
    description:
      'Genera una señal que alterna entre 0 y 1 al avanzar el reloj. El cambio de 0 a 1 se llama flanco ascendente.',
    character: {
      name: 'El Director',
      ability: 'Ritmo',
      role: 'Marco el momento de cada cambio.',
    },
    example: 'Un reloj coordina cuándo los registros guardan un nuevo dato.',
    tableLabels: ['CLK actual', 'CLK siguiente'],
    truthTable: [
      [0, 1],
      [1, 0],
    ],
  },
  DFF: {
    id: 'DFF',
    name: 'DFF',
    inputs: 2,
    ports: ['d', 'clk'],
    sequential: true,
    expression: 'Q⁺ = D en ↑CLK',
    family: 'mint',
    description:
      'El flip-flop D guarda D en el flanco ascendente de CLK. Entre flancos, Q conserva el bit guardado. En el juego comienza en 0.',
    character: {
      name: 'El Archivista',
      ability: 'Memoria de un bit',
      role: 'Guardo el dato cuando llega el pulso.',
    },
    example: 'Un registro conserva un dato aunque cambie la entrada.',
    tableLabels: ['D', 'Q actual', 'Q siguiente en ↑CLK'],
    truthTable: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 1],
      [1, 1, 1],
    ],
  },
  TFF: {
    id: 'TFF',
    name: 'TFF',
    inputs: 2,
    ports: ['t', 'clk'],
    sequential: true,
    expression: 'Q⁺ = Q ⊕ T en ↑CLK',
    family: 'violet',
    description:
      'El flip-flop T alterna Q en un flanco ascendente si T es 1. Si T es 0, mantiene Q. Entre flancos no cambia y comienza en 0.',
    character: {
      name: 'El Alternador',
      ability: 'Cambio controlado',
      role: 'Un pulso puede cambiar mi estado.',
    },
    example: 'Un contador alterna su primer bit cada vez que recibe un pulso habilitado.',
    tableLabels: ['T', 'Q actual', 'Q siguiente en ↑CLK'],
    truthTable: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ],
  },
};
export const gateList = Object.values(gates);

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

export const gates = Object.fromEntries(
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
export const gateList = Object.values(gates);

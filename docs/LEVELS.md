# Autoría de niveles

## Fuentes de contenido

| Archivo                              | Contenido                                          |
| ------------------------------------ | -------------------------------------------------- |
| `src/data/levels.js`                 | Registro público, etapas y consulta por ID         |
| `src/data/levels/sequential.js`      | Secuencias con reloj y memoria                     |
| `src/data/levels/stageChallenges.js` | Lecciones y retos añadidos al currículo            |
| `src/data/stages.js`                 | Orden pedagógico, acceso y crédito de cinco etapas |
| `src/data/unlocks.js`                | Disponibilidad de componentes por etapa            |
| `tests/fixtures/solutions.js`        | Soluciones independientes de referencia            |

Los registros combinacionales se definen en `src/data/levels/combinational.js`. `src/data/levels/createLevel.js` genera sus entradas, salidas y casos completos con el motor; `levels.js` reúne el catálogo y aplica el currículo.

Hay 40 lecciones y cinco retos. Los IDs 1–35 son estables; las lecciones nuevas son 36, 37 y 39–41, y los retos 38 y 42–45. El orden visible depende de `stages.js`, no de ordenar IDs.

## Esquema y reglas

Cada registro contiene ID, título interno, descripción, entradas, salidas, inventario, pruebas, pistas y `optimizationGateCount`. Las salidas admiten `led`, `door`, `flag` y `alarm`, además de `motor`. Solo utiliza los diez componentes soportados.

Las expresiones declarativas usan nombres de entradas o arreglos como `['OR', ['AND', 'A', 'B'], 'C']`. El autor genera las 2ⁿ combinaciones completas; nunca usa `eval()`. El objetivo se expone como tabla, no como circuito resuelto. Inventario puede incluir distractores; cada pieza utilizable tendrá mini tutorial al primer encuentro.

Los niveles secuenciales declaran `kind: 'sequential'` y pruebas `{ scenario, step, clock, inputs, outputs }`. Cada escenario parte de Q=0 e incluye reloj bajo, flanco ascendente, reloj alto estable con dato cambiado y flanco descendente. La vista muestra una secuencia; la validación comprueba todas.

## Currículo

| Etapa | Objetivo                                   | Conteo de referencia del reto |
| ----- | ------------------------------------------ | ----------------------------- |
| 1     | Una o dos compuertas básicas iguales       | 3                             |
| 2     | Dos a cuatro compuertas de distintos tipos | 5                             |
| 3     | NAND, compartir señales y sumador          | 6                             |
| 4     | CLOCK, DFF/TFF y registros                 | 5                             |
| 5     | Integración de decisiones y memoria        | 8                             |

Los conteos incluyen CLOCK y memoria. La optimización es un objetivo factible, no una prueba de mínimo matemático. Una solución correcta siempre completa el nivel.

## Añadir o modificar contenido

1. Conserva IDs usados para no invalidar progreso.
2. Define el registro, su etapa y el orden pedagógico.
3. Confirma que inventario y desbloqueos permiten resolverlo.
4. Añade una construcción independiente en las fixtures de soluciones.
5. Comprueba todos los casos dentro del inventario y objetivo de optimización.
6. Revisa texto, tutoriales, acceso, reto de salto y continuación.
7. Ejecuta las pruebas requeridas y documenta los resultados.

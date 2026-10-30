# Arquitectura

## Organización y dependencias

| Módulo                  | Responsabilidad                                       | Dependencias permitidas                                            |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `app/`                  | Rutas bajo demanda, layout, navegación y ajustes      | Funcionalidades, estado y compartidos                              |
| `features/home/`        | Portada y demostración inicial                        | APIs de aprendizaje y progresión; datos y compartidos              |
| `features/learning/`    | Colección, simuladores, mini tutoriales y sus sprites | Progresión pública, estado, motor, datos y compartidos             |
| `features/progression/` | Mapa y consulta del progreso                          | Estado, datos y compartidos                                        |
| `features/puzzle/`      | Circuitos, editor, reproducción y resultados          | APIs de aprendizaje/progresión, estado, motor, datos y compartidos |
| `state/`                | Context/useReducer, saneamiento y almacenamiento      | Motor, datos y utilidades puras de `shared/lib/`                   |
| `engine/`               | Operaciones, DAG, evaluación, memoria y validación    | Motor y datos; sin React ni estado de la aplicación                |
| `data/`                 | Descriptores, currículo y registros de contenido      | Motor y otros datos; sin interfaz                                  |
| `shared/`               | UI reutilizable, hooks comunes y utilidades puras     | Datos y dependencias de plataforma; sin funcionalidades ni estado  |

La lógica de las señales reside exclusivamente en el motor. Los simuladores y tutoriales llaman a sus funciones. ESLint impide dependencias de interfaz en motor/datos, de funcionalidades en estado/compartidos y accesos a carpetas internas de otra funcionalidad. `learning/index.js` y `progression/index.js` exponen capacidades compartidas; cada módulo usa imports locales para sus propios archivos. La composición de rutas es la excepción explícita: `app/App.jsx` importa las páginas con `lazy()`.

### Contenido

`data/levels.js` es el registro público: conserva las exportaciones `levels` y `getLevel`, los 45 IDs y su orden pedagógico. `data/levels/combinational.js`, `sequential.js` y `stageChallenges.js` contienen registros. `createLevel.js` genera casos exhaustivos usando el motor. El registro aplica etapas y restricciones introductorias; la consulta por ID usa su mapa indexado.

### Estado e interfaz

`state/` concentra `GameContext`, `GameProvider`, `gameReducer`, `useGame` y `storage`. La disposición reutilizable de nodos vive en `shared/lib/boardLayout.js`, sin React ni dependencias del editor. Las páginas coordinan el acceso y componen componentes; `PuzzleSidebar` agrupa herramientas sin asumir la medición del canvas.

`useBoardNodes` adapta circuitos a nodos de React Flow y conserva dimensiones/selección de forma local. `useBoardEdges` combina señales con rutas visuales. `CircuitBoard` compone el canvas y sus controles. La coordinación de simulación y edición permanece en `usePuzzle`.

El trazado se divide en `services/wireRouting.js` como coordinador y `services/routing/` para constantes, extremos y geometría, búsqueda y reserva de carriles, puentes SVG y selección de medidas. No contiene reglas booleanas ni accede al almacenamiento.

### Estilos y herramientas

`styles/index.css` define la entrada y el orden de cascada. Tokens, bases, temas y ajustes compartidos permanecen en `styles/`; los estilos propios de puzzle, progresión y tutoriales están junto a su funcionalidad. Se importan en el orden establecido para conservar la presentación.

`vite.config.js` configura la aplicación; `vitest.config.js` comparte el plugin de React y define exclusivamente `tests/unit/`. Playwright conserva `tests/e2e/`; las soluciones de referencia permanecen en `tests/fixtures/`. `npm run check` reúne lint, formato, pruebas unitarias y build. [CONTRIBUTING.md](../CONTRIBUTING.md) describe el flujo de trabajo.

## Contrato de circuito

```js
{
  nodes: [
    { id: 'input-A', type: 'input', position: { x: 0, y: 0 }, data: { inputId: 'A' } },
    { id: 'gate-1', type: 'gate', position: { x: 250, y: 0 }, data: { gateType: 'AND' } },
    { id: 'output-LED', type: 'output', position: { x: 550, y: 0 }, data: { outputId: 'LED' } }
  ],
  edges: [
    { id: 'wire-1', source: 'input-A', sourceHandle: 'out', target: 'gate-1', targetHandle: 'a' }
  ]
}
```

Destinos booleanos: `a`/`b`, NOT solo `a`. Memoria: `d`/`clk` o `t`/`clk`. Terminal de salida: `in`. Fuente: `out`. IDs estables; posiciones y rutas de cables no afectan a la evaluación.

`evaluateCircuit` devuelve `{ valid: true, outputs, nodeValues }` o errores estructurados. La vista parcial usa `null` para señales desconocidas. `validateLevel` devuelve éxito, casos, errores, número de compuertas y consejo de optimización. Errores estructurales detienen la evaluación; un circuito válido recorre todos los casos. Ordenación topológica O(nodos + cables).

## Estado y persistencia

Context/useReducer guarda finalizaciones, mejores conteos, borradores y `seenTutorials`. Inventario y acceso se derivan del circuito y de finalizaciones válidas. El reducer vuelve a comprobar acceso, conexiones e inventario.

Clave `electric-cards:v1`, versión 1. `seenTutorials` es un campo opcional aditivo con IDs conocidos y valor `true`; los guardados antiguos se cargan con un registro vacío. La acción `ACKNOWLEDGE_TUTORIAL` solo admite componentes desbloqueados presentes en el inventario del nivel accesible. Reiniciar un puzzle no elimina finalizaciones ni tutoriales.

La carga descarta puntuaciones, niveles, circuitos o posiciones inválidos y registros sobredimensionados. Los borradores pasan la validación incompleta del motor. Guardado con debounce y flush en `pagehide`. Ante corrupción o excepciones, el juego funciona con estado vacío o en memoria e informa que el guardado no está disponible. Apariencia usa una clave separada.

## Enseñanza y progresión

`stages.js` define orden, retos, acceso y continuación. Una etapa se acredita mediante su reto o sus lecciones; las finalizaciones antiguas conservan el crédito previsto. IDs 1–35 permanecen estables, con nuevas lecciones 36, 37 y 39–41 y retos 38, 42–45. Nunca se fabrican finalizaciones para lecciones omitidas.

`GateTutorials` filtra el inventario por disponibilidad y registro consultado. Presenta una cola modal automática y permite repaso manual. Reutiliza `GateSimulator`, que selecciona el simulador combinacional o secuencial. La simulación del tutorial tiene estado local independiente del puzzle. Los diez componentes comparten el nuevo guía de `features/learning/data/tutorialGuide.js`: un GIF animado y un PNG para movimiento reducido, seleccionados mediante `picture`. Los recursos originales se importan desde `features/learning/assets/tutorial-guide/` y Vite genera sus URLs con hash. Contrato detallado en [TUTORIALS.md](TUTORIALS.md).

## Memoria discreta

`sequential.js` evalúa con el nuevo reloj y los Q anteriores, toma las muestras y confirma todos los nuevos Q simultáneamente. DFF captura D; TFF alterna si T=1; solo en 0→1. Un registro conectado a otro captura el Q anterior del primero. La validación reinicia memoria entre escenarios y comprueba todos sus pasos.

Memoria y reloj automático son transitorios. Recarga y edición lógica los reinician; mover nodos conserva memoria. El reloj automático pausa al probar o editar y elimina temporizadores al salir. El modelo no representa un chip físico ni retardos analógicos.

## Editor e interacción

Workspace limitado a `100dvh`, scroll interno en herramientas y tablas. React Flow conserva geometría medida para que nodos/cables sigan visibles al arrastrar. Disposición adaptable y controles táctiles de 44px; tokens visuales en `variables.css`, sistema pixel art en [DESIGN.md](../DESIGN.md).

`wireRouting.js` coordina rutas ortogonales con obstáculos, carriles y puentes en cruces. La geometría es estado visual y no se guarda. Se favorecen rutas cortas con separación; módulos superpuestos pueden requerir fallback visible. Organizar recupera corredores. Solo el cable seleccionado muestra sus controles de eliminación.

Enlaces educativos conservan `from` y borradores validados. La revisión combinacional presenta cada caso antes de acreditar; cambios cancelan temporizadores. Teclado y movimiento reducido muestran el resultado inmediatamente. Éxito usa diálogo nativo con continuación; la disposición del tablero no inserta filas de confirmación.

## Trazabilidad

La evolución de decisiones y resultados anteriores se conserva en [history/](history/README.md). Estos contratos describen el estado vigente; no heredan las instrucciones de checkpoints históricos.

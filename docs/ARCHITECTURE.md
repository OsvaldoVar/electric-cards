# Arquitectura

## Capas

| Capa                     | Responsabilidad                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| `data/`                  | Diez descriptores, 45 circuitos y cinco etapas; niveles como datos |
| `engine/`                | Operaciones, DAG, evaluación, memoria y validación pura            |
| `context/` y `services/` | Transiciones, persistencia y geometría del editor                  |
| `hooks/`                 | Control del puzzle y reproducción de validación                    |
| `components/` y `pages/` | Presentación, rutas y React Flow                                   |

La lógica de las señales reside exclusivamente en el motor. Los simuladores y tutoriales llaman a sus funciones; no duplican tablas o reglas booleanas en la interfaz. Las rutas se cargan bajo demanda.

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

`GateTutorials` filtra el inventario por disponibilidad y registro consultado. Presenta una cola modal automática y permite repaso manual. Reutiliza `GateSimulator`, que selecciona el simulador combinacional o secuencial. La simulación del tutorial tiene estado local independiente del puzzle. La asignación visual de los diez componentes a cinco sprites decorativos vive en `data/tutorialGuide.js`; los archivos WebP transparentes se importan desde `assets/tutorial-guide/` y Vite genera sus URLs con hash. Contrato detallado en [TUTORIALS.md](TUTORIALS.md).

## Memoria discreta

`sequential.js` evalúa con el nuevo reloj y los Q anteriores, toma las muestras y confirma todos los nuevos Q simultáneamente. DFF captura D; TFF alterna si T=1; solo en 0→1. Un registro conectado a otro captura el Q anterior del primero. La validación reinicia memoria entre escenarios y comprueba todos sus pasos.

Memoria y reloj automático son transitorios. Recarga y edición lógica los reinician; mover nodos conserva memoria. El reloj automático pausa al probar o editar y elimina temporizadores al salir. El modelo no representa un chip físico ni retardos analógicos.

## Editor e interacción

Workspace limitado a `100dvh`, scroll interno en herramientas y tablas. React Flow conserva geometría medida para que nodos/cables sigan visibles al arrastrar. Disposición adaptable y controles táctiles de 44px; tokens visuales en `variables.css`, sistema pixel art en [DESIGN.md](../DESIGN.md).

`wireRouting.js` coordina rutas ortogonales con obstáculos, carriles y puentes en cruces. La geometría es estado visual y no se guarda. Se favorecen rutas cortas con separación; módulos superpuestos pueden requerir fallback visible. Organizar recupera corredores. Solo el cable seleccionado muestra sus controles de eliminación.

Enlaces educativos conservan `from` y borradores validados. La revisión combinacional presenta cada caso antes de acreditar; cambios cancelan temporizadores. Teclado y movimiento reducido muestran el resultado inmediatamente. Éxito usa diálogo nativo con continuación; la disposición del tablero no inserta filas de confirmación.

## Trazabilidad

La evolución de decisiones y resultados anteriores se conserva en [history/](history/README.md). Estos contratos describen el estado vigente; no heredan las instrucciones de checkpoints históricos.

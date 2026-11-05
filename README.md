# Electric Cards

Juego educativo de lógica digital para PC, tablet y celular. Construye circuitos con un inventario limitado y consigue que sus salidas cumplan **todos los casos de prueba**. Proyecto académico de FCC-BUAP, con interfaz en español y presentación pixel art.

## Funciones

- Cinco etapas, 40 niveles regulares y cinco retos para acreditar etapas.
- AND, OR, NOT, NAND, NOR, XOR, XNOR, CLOCK y flip-flops D/T.
- Mini tutorial interactivo al encontrar un componente nuevo, con explicación, ejemplo, tabla y simulador. Puedes repasarlo dentro del nivel.
- Editor con movimiento, conexión por arrastre o dos toques, eliminación y recuperación de vista.
- Validación exhaustiva de combinaciones y secuencias, pistas y consejos de optimización.
- Guardado local de progreso, borradores y tutoriales consultados.
- Apariencia clara u oscura, controles táctiles y navegación con teclado.

No requiere cuenta ni backend. El progreso pertenece al navegador y no se sincroniza entre dispositivos.

## Compartir y jugar sin instalar nada

La edición portátil es **un solo archivo `Electric-Cards.html`**. Envíalo por correo,
USB o mensajería: quien lo reciba debe descargarlo y abrirlo con su navegador, no con
la vista previa del correo. No necesita Node.js, servidor, cuenta ni conexión a Internet.

Funciona como aplicación web local en navegadores modernos de Windows, Linux y macOS.
No es un `.exe` específico de un sistema operativo. En móviles, la apertura de HTML
local depende del navegador y del gestor de archivos; para esos dispositivos también
se conserva la publicación web habitual.

Para generar el archivo desde el código:

```sh
npm ci
npm run build:portable
```

Comparte **`dist-portable/Electric-Cards.html`**, sin carpetas adicionales. Incluye
código, estilos, fuentes, ilustraciones y licencias. El progreso se guarda en el
navegador, **no dentro del HTML**: enviar o mover el archivo no transfiere las partidas,
y algunos navegadores restringen el guardado de archivos locales. El juego sigue
funcionando aunque no se permita guardar y muestra el aviso correspondiente.

Consulta [la guía de la edición portátil](docs/PORTABLE.md) para comprobaciones,
compatibilidad y diferencias respecto de la edición web.

## Inicio rápido

Requiere Node.js 22.12 o posterior; se recomienda Node.js 24 y npm. El repositorio privado requiere acceso autorizado.

```sh
git clone https://github.com/OsvaldoVar/electric-cards.git
cd electric-cards
npm ci
npm run dev
```

Abre la dirección que muestra Vite. Para comprobar la versión de producción:

```sh
npm run build
npm run preview
```

## Cómo jugar

1. Abre Jugar y elige un nivel disponible.
2. Consulta el mini tutorial de cada componente nuevo y experimenta con sus entradas.
3. Lee el objetivo, añade cartas y conecta sus puertos de salida y entrada.
4. Cambia las entradas o avanza el reloj para explorar el circuito.
5. Pulsa Probar circuito y revisa los casos fallidos o la ventana de éxito.

Una solución correcta acredita el nivel aunque pueda usar menos compuertas. Reiniciar conserva el progreso; eliminar una carta devuelve su unidad al inventario. Organizar y Ajustar vista recuperan el tablero. La colección permite consultar fichas completas y volver al nivel de origen.

## Recorrido

| Etapa | Aprendizaje                                 | Componentes del reto |
| ----- | ------------------------------------------- | -------------------- |
| 1     | Una o dos compuertas básicas del mismo tipo | 3                    |
| 2     | Dos a cuatro compuertas de distintos tipos  | 5                    |
| 3     | Optimización, NAND y señales compartidas    | 6                    |
| 4     | Reloj, flancos, flip-flops y registros      | 5                    |
| 5     | Integración de lógica y memoria             | 8                    |

Completar las lecciones de una etapa o su reto abre la siguiente. Los niveles omitidos quedan disponibles para practicar. Las siete compuertas booleanas están disponibles inicialmente, sujetas al inventario del nivel; CLOCK/DFF/TFF se habilitan al entrar a la etapa 4. Los IDs son estables y su número puede diferir del orden pedagógico.

## Desarrollo y verificación

React, Vite, JavaScript, CSS, React Router y React Flow. Estado con Context/useReducer y localStorage; pruebas con Vitest, Testing Library y Playwright.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

| Directorio                                     | Responsabilidad                                               |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `src/app/`                                     | Composición de rutas, layout, navegación y ajustes            |
| `src/features/home/`                           | Portada y demostración inicial                                |
| `src/features/learning/`                       | Colección, simuladores, tutoriales y sus recursos             |
| `src/features/progression/`                    | Mapa de etapas y consulta del progreso                        |
| `src/features/puzzle/`                         | Editor, controles, validación visual y trazado de cables      |
| `src/state/`                                   | Context, reducer y persistencia validada                      |
| `src/engine/`                                  | Lógica booleana, memoria, grafos y validación pura            |
| `src/data/`                                    | Descriptores y catálogo de niveles, separado de sus registros |
| `src/shared/`                                  | Componentes reutilizables, hooks y utilidades puras           |
| `src/styles/`                                  | Tokens, reglas globales y entrada ordenada de estilos         |
| `tests/unit/`, `tests/e2e/`, `tests/fixtures/` | Pruebas unitarias, navegador y soluciones independientes      |
| `docs/`                                        | Guías vigentes e historial técnico                            |

`npm run check` ejecuta lint, formato, pruebas unitarias y compilación. `npm run format` aplica el formato común. La configuración de Vitest está separada de Vite. ESLint comprueba los límites entre módulos.

Lee la [guía de contribución](CONTRIBUTING.md) y [AGENTS.md](AGENTS.md) antes de modificar el proyecto. Consulta el [índice de documentación](docs/README.md), los [resultados y límites de verificación](docs/TESTING.md), la [hoja de ruta](docs/ROADMAP.md) y el [registro de cambios](CHANGELOG.md).

El juego modela señales binarias y circuitos acíclicos con memoria discreta; no modela electrónica analógica ni tiempos físicos. Para publicar la SPA, consulta [DEPLOYMENT.md](docs/DEPLOYMENT.md).

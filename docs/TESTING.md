# Pruebas y verificación

## Ejecución

Requiere Node.js 22.12+ y npm; se recomienda Node.js 24.

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:portable
```

Playwright comprueba la build de producción. CI ejecuta lint, formato, pruebas unitarias, build y navegador en pushes a main y pull requests. Consulta [GitHub Actions](https://github.com/OsvaldoVar/electric-cards/actions) para el resultado remoto; los resultados locales no lo sustituyen.

La suite portátil usa `playwright.portable.config.js` y `tests/portable/`, sin
servidor. `npm run test:portable` genera el archivo antes de abrir una copia aislada
por `file://` con la red desactivada. CI reutiliza la salida ya generada por `check`
y ejecuta esa configuración directamente después de las pruebas web.

## Cobertura

| Área         | Verificación                                                                                |
| ------------ | ------------------------------------------------------------------------------------------- |
| Motor        | Tablas, señales inválidas, fan-out, puertos, ciclos y múltiples salidas                     |
| Contenido    | Los 45 circuitos de referencia y todos sus casos o secuencias                               |
| Estado       | Inventario, acceso por etapas, retos, borradores y saneamiento                              |
| Persistencia | Compatibilidad v1, registros inválidos, tutoriales y errores de almacenamiento              |
| Interfaz     | Simuladores, validación, continuación, retorno educativo y controles                        |
| Tutoriales   | Primera aparición, cola, repaso, Escape, recarga, borrador antiguo y guardado no disponible |
| Navegador    | Circuitos completos, ratón/touch, movimiento, cables, señales, diálogos y responsive        |

Las regresiones existentes usan una fixture de jugador que ya consultó los tutoriales. La suite dedicada `tutorials.spec.js` usa contextos nuevos sin esa fixture y comprueba el flujo real de primera aparición, incluidos saltos de etapa. Los controles y reglas del juego se prueban sin reemplazar su implementación.

## Verificación vigente — optimización y HTML portátil — 2026-11-05

Comprobaciones locales de la integración:

- `npm run check`: aprobado; ESLint, Prettier, 111 pruebas unitarias en 14
  archivos y compilaciones web y portátil.
- `npm run test:e2e`: 127 pruebas aprobadas y una omisión intencional del
  escenario exclusivamente táctil en el proyecto de escritorio.
- `npx playwright test --config playwright.portable.config.js`: 18 pruebas
  aprobadas, nueve en escritorio y nueve con touch emulado. Dieciséis casos
  copian solo el HTML a una carpeta aislada y lo renombran con espacios antes
  de abrirlo con la red desactivada, sin servidor ni recursos externos. Dos
  casos adicionales interceptan la respuesta de un documento HTTP y comprueban
  navegación, recarga y simulador desde una ruta con nombre de archivo; no
  necesitan un servidor real ni acceso de red.
- Los casos portátiles comprueban un nivel completo y sus cables mediante ratón
  y taps, persistencia tras recarga, tutorial y fuentes cargados, navegación e
  historial, foco del enlace de salto, tema, simuladores CLOCK/DFF/TFF, retrato
  de movimiento reducido y juego utilizable cuando falla el guardado.
- Las dos suites cubren 360×800, 768×1024, 1366×768 y 1920×1080 sin
  desbordamiento horizontal. La suite web añade otros tamaños y orientación.
- Regresiones del motor: equivalencia en los 45 circuitos de referencia y un
  solo análisis estructural durante los 512 pasos del nivel 45, en lugar de 1025. La prueba contó el comportamiento anterior antes de la optimización.
- `npm audit`: cero vulnerabilidades en el árbol completo.

La primera pasada portátil detectó cuatro fallos en las nuevas pruebas: dos
localizadores suponían un elemento `output` inexistente en el simulador
combinacional y dos preparaciones de estado eran sobrescritas por el flush
`pagehide`. Se corrigieron los localizadores conforme al marcado real y la
preparación mediante `addInitScript`; no se alteró el juego para satisfacer esas
expectativas erróneas.

La revisión independiente encontró que la selección por protocolo fallaba al
servir el HTML portátil desde una URL HTTP con nombre de archivo: la prueba
negativa mostró la pantalla de ruta no encontrada. La build portátil ahora fija
el router hash con `import.meta.env.VITE_PORTABLE`; la edición web conserva el
router habitual. La regresión de HTTP y la suite completa aprueban después del
cambio. La build final usa una sustitución explícita del `import.meta` genérico
para su salida IIFE y ya no emite los avisos `EMPTY_IMPORT_META` de los helpers
inlineados; no se desactivan globalmente los avisos del compilador.

La comprobación local usa Chromium en Linux, tanto escritorio como touch
emulado. No verifica equipos Windows/macOS, Firefox, Safari/iOS ni móviles
físicos; abrir archivos HTML en móviles depende además del gestor de archivos.
No se ejecutó CI remoto, despliegue, commit ni push para esta entrega.

### Línea base y prueba negativa de la edición portátil

Entorno local: Node.js 24.22.2, npm 11.19.1 y Chrome for Testing 145.0.7632.6,
revisión 1208 de Playwright. Se usa `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` porque
el ejecutable de Chromium ya está disponible, pero la descarga adicional de
`chromium_headless_shell` se interrumpió en el CDN. No se cambian las dependencias
para resolver esta limitación del entorno.

Antes de los cambios de producción, `npm run check` aprobó lint, formato, las
104 pruebas unitarias y la build web. La suite web completa aprobó 127 casos con
una omisión intencional del escenario touch en escritorio.

La nueva prueba `one copied HTML` se ejecutó primero contra `dist/index.html`,
copiado sin sus recursos (`PORTABLE_HTML=dist/index.html`). Falló como se esperaba:
no apareció la portada y se detectaron 13 intentos/fallos de carga de JS, CSS,
icono, inicializador de tema y fuente externos. Esto confirma que copiar solo el
HTML de la build web no produce una aplicación portátil.

La instalación inicial informó seis avisos de auditoría en herramientas de
desarrollo. `npm audit fix`, sin `--force` ni saltos de versión mayor, actualizó
17 paquetes y retiró uno; el lockfile fija Vite 8.3.6 y Vitest 5.1.0. La
comprobación posterior `npm audit` informa cero vulnerabilidades en el árbol
completo, no solo en dependencias de ejecución.

## Verificación anterior — compatibilidad del runner de CI — 2026-10-30

El workflow fija `runs-on: ubuntu-24.04`. `ubuntu-latest` seleccionó Ubuntu 26.04 y Playwright 1.58.2 detuvo la instalación de Chromium por sistema no compatible, después de aprobar lint, formato, las 104 pruebas unitarias y la build. Se conservan la instalación con `--with-deps` y la suite completa de navegador; no se omiten comprobaciones ni se actualizan dependencias.

La ejecución remota del PR de corrección es la comprobación del runner y de la instalación real de Chromium. Consultar su resultado en GitHub Actions; este registro no anticipa un resultado aprobado.

## Verificación anterior — nuevo guía de tutoriales — 2026-10-30

- `npm run check`: aprobado; ESLint, Prettier, 104 pruebas unitarias y build de producción.
- Suite `tests/e2e/tutorials.spec.js`: 18 pruebas aprobadas en escritorio y touch, incluida la carga de imágenes en los diez componentes, repaso, simuladores y layouts a 360×800, 768×1024, 1366×768 y 1920×1080.
- Comprobación en Chromium de `picture`: GIF de 368 px en modo normal y PNG de 512 px al activar movimiento reducido.
- Capturas de escritorio y móvil inspeccionadas: el nuevo retrato conserva el espacio de cabecera y no tapa el simulador.
- GIF y PNG copiados sin modificar sus bytes; el GIF conserva seis fotogramas y transparencia. Los cinco WebP anteriores se retiran.

El CDN de Playwright entregó un ZIP inválido. Las pruebas utilizaron Chromium 153 de una instalación temporal de `@sparticuz/chromium` fuera del proyecto mediante `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. No se cambian dependencias ni lockfile. La suite completa de otros módulos, Safari/iOS físico y Firefox no se ejecutaron para este cambio visual.

## Verificación anterior — estructura modular — 2026-10-15

Refactorización basada en main `c2b7c1d76407ad2db552a44c1e93057be81635a5`. Entorno: Node.js 24.19.0 y npm 11.9.0. Los contratos del motor, IDs de niveles, rutas públicas y formato del guardado v1 se conservan.

| Comprobación             | Resultado                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`          | Aprobado: ESLint, Prettier, Vitest y compilación de producción                                                                     |
| Vitest / Testing Library | 104 pruebas aprobadas en 12 archivos, reubicados bajo `tests/unit/`                                                                |
| Límites de módulos       | Cuatro comprobaciones negativas confirmaron el rechazo de imports prohibidos en motor, estado, compartidos y entre funcionalidades |
| Playwright completo      | 127 pruebas aprobadas y una omisión intencional del caso táctil en el proyecto de escritorio                                       |

Las reglas de dependencias se comprobaron mediante la API de ESLint sin agregar archivos de prueba artificiales al proyecto. Los recursos trasladados conservan sus blobs originales. Los cambios de ubicación de pruebas no alteran los escenarios existentes. En la repetición final se produjo un 404 transitorio al recargar el mapa mientras se regeneraba `dist/`; la traza confirmó la respuesta HTTP y el mismo caso aprobó al repetirlo con la build estable, sin cambiar código ni expectativas. Se comprobaron recorridos completos, persistencia, memoria, inventario, navegación, tutoriales, cables y layouts entre 360 y 1920 px, incluidos 360×800, 768×1024, 1366×768 y 1920×1080.

El CDN de Playwright entregó un ZIP inválido. La comprobación local utiliza Chromium 153 de una instalación temporal de `@sparticuz/chromium` fuera del repositorio, mediante `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. La instalación temporal y los binarios no forman parte del proyecto ni cambian sus dependencias. Safari/iOS físico y Firefox permanecen sin verificar.

## Verificación anterior — sprites de tutoriales — 2026-10-08

Verificado sobre main `82c49c5f1d03f1d701631919aaf221c51e6b8e3b` con esta integración, Node.js 24.19.0 y npm 11.9.0.

| Comprobación                                  | Resultado                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ESLint y Prettier                             | Aprobados                                                                                         |
| Vitest / Testing Library                      | 104 pruebas aprobadas en 12 archivos                                                              |
| Build de producción                           | Aprobada; cinco sprites con URLs versionadas                                                      |
| Playwright completo, escritorio y touch       | 125 aprobadas y una omisión intencional, antes de añadir el caso de carga de los diez componentes |
| Suite final de tutoriales, escritorio y touch | 18 aprobadas, incluida carga real de sprites en los diez tutoriales                               |
| Recursos gráficos                             | Cinco WebP transparentes; igualdad exacta RGBA respecto de los PNG de origen                      |

Se revisaron visualmente capturas de AND en escritorio y móvil, NAND y XOR en escritorio, además de los cinco sprites. Se corrigieron los dedos de ambas manos de celebración y la mano flexionada de la pose pensativa; en saludo se distinguen cinco dedos. Las manos fuera de encuadre o cubiertas no permiten un conteo visual completo.

La suite comprueba carga efectiva de imágenes, estabilidad al repasar, disponibilidad del simulador y ausencia de desbordamiento horizontal, además del flujo y guardado existentes. Los diálogos se comprobaron a 360×800, 768×1024, 1366×768 y 1920×1080.

El CDN de Playwright volvió a entregar un ZIP inválido. Se utilizó Chromium 153 de una instalación temporal de `@sparticuz/chromium` fuera del proyecto y una configuración temporal para servir preview en 127.0.0.1. Esos archivos no forman parte del commit. No se modificaron dependencias ni lockfile. Safari/iOS y Firefox físicos permanecen sin verificar.

## Verificación anterior — mini tutoriales — 2026-10-08

Verificado sobre main `4fd610280c3054f8e19d770ff252c3227b0b7809` con los cambios de esta entrega, Node.js 24.19.0 y npm 11.9.0.

| Comprobación                            | Resultado                                                     |
| --------------------------------------- | ------------------------------------------------------------- |
| ESLint                                  | Aprobado                                                      |
| Vitest / Testing Library                | 104 pruebas aprobadas en 12 archivos                          |
| Build de producción                     | Aprobada                                                      |
| Playwright completo, escritorio y touch | 125 aprobadas, una omisión intencional de touch en escritorio |
| Enlaces locales de documentación        | Sin enlaces rotos                                             |

La conexión táctil nativa aprobó en el proyecto touch. La suite comprueba primera aparición, cola al saltar etapas, repaso, Escape, persistencia, borrador antiguo y almacenamiento no disponible. Las capturas AND de escritorio y móvil se inspeccionaron visualmente; la revisión móvil motivó compactar el simulador sin cambiar el aprendizaje.

El CDN de Playwright devolvió un ZIP inválido. La comprobación local utilizó Chromium 153 de una instalación temporal de `@sparticuz/chromium` fuera del repositorio. Una configuración temporal cambió el host de preview a 127.0.0.1; no modifica dependencias, lockfile ni configuración de producción. Las fixtures de regresión conservan un registro explícito de tutoriales consultados; las pruebas de primera aparición usan un contexto sin ese registro.

Después del ajuste móvil final, la suite específica aprobó sus 16 casos de escritorio y touch. Se comprobó CLOCK, captura D y alternancia T dentro del tutorial y se inspeccionó la captura móvil final. Prettier también aprobó.

## Límites conocidos

- Chromium móvil emulado no equivale a un iPhone o dispositivo Android físico.
- Safari/iOS físico y Firefox no se verificaron en esta entrega.
- Los pendientes visuales del checkpoint pixel art requieren dictamen actualizado: zoom sobre entradas en móvil y tamaño de módulos en horizontal. Las pruebas funcionales no cierran esos hallazgos por sí solas.
- El planificador de cables no garantiza carriles separados si se superponen físicamente las cartas; Organizar recupera espacio.
- No se ejecutó despliegue en esta tarea.

## Informes y trazabilidad

Playwright deja capturas, contextos y trazas en `test-results/` e informe HTML en `playwright-report/`; ambos se excluyen de Git. No subas node_modules ni dist. La suite de tutoriales genera capturas a cuatro resoluciones para revisión visual.

Los resultados de sesiones anteriores y el checkpoint del rediseño se conservan en [history/](history/README.md). Las guías actuales describen el contrato vigente.

# Pruebas y verificación

## Ejecución

Requiere Node.js 22.12+ y npm; se recomienda Node.js 24.

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

Playwright comprueba la build de producción. CI ejecuta lint, formato, pruebas unitarias, build y navegador en pushes a main y pull requests. Consulta [GitHub Actions](https://github.com/OsvaldoVar/electric-cards/actions) para el resultado remoto; los resultados locales no lo sustituyen.

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

## Registro vigente — nuevo guía de tutoriales — 2026-10-30

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

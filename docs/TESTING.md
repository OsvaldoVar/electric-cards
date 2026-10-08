# Pruebas y verificación

## Ejecución

Requiere Node.js 22.12+ y npm; se recomienda Node.js 24.

```sh
npm ci
npm run lint
npm run format:check
npm run test
npm run build
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

## Registro vigente — 2026-10-08

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

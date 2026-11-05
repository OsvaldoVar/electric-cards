# Contribuir a Electric Cards

## Preparar el entorno

Usa Node.js 24 (`.nvmrc`) o 22.12+. Instala las versiones fijadas por el lockfile:

```sh
npm ci
npm run dev
```

El proyecto usa JavaScript, React y CSS. Conserva el stack y los contratos de [AGENTS.md](AGENTS.md). No requiere servicios externos ni secretos.

## Dónde implementar cada cambio

| Cambio                                 | Lugar                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Operaciones, puertos, grafos o memoria | `src/engine/` y `tests/unit/engine/`                                              |
| Nuevos niveles o cambios de inventario | `src/data/levels/`, registro `src/data/levels.js` y `tests/fixtures/solutions.js` |
| Editor, cables, resultados o controles | `src/features/puzzle/`                                                            |
| Fichas, simuladores o mini tutoriales  | `src/features/learning/`                                                          |
| Mapa de etapas o resumen de progreso   | `src/features/progression/`                                                       |
| Estado persistido y transiciones       | `src/state/` y `tests/unit/state/`                                                |
| Rutas, navegación o ajustes globales   | `src/app/`                                                                        |
| Elementos usados por varias funciones  | `src/shared/ui/`, `hooks/` o `lib/`                                               |

Cada funcionalidad agrupa sus páginas, componentes, hooks, servicios y estilos cuando los necesita. Evita crear carpetas vacías o capas sin responsabilidad. Mantén las reglas de señales dentro del motor. Los registros de contenido y la generación de sus casos tienen archivos distintos.

Las funciones compartidas entre funcionalidades se exponen por su `index.js`; importa directamente los archivos dentro de una misma funcionalidad. La composición de rutas en `app/App.jsx` carga las páginas directamente bajo demanda. Los módulos compartidos no importan funcionalidades ni estado. El estado no importa componentes ni el editor. ESLint comprueba estos límites.

Las utilidades de `shared/lib/` son puras; la medición de React Flow y la selección visual permanecen en los hooks del editor. No guardes geometría medida, selección ni rutas SVG en localStorage.

## Formato y comandos

```sh
npm run format
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:portable
```

`check` combina ESLint, Prettier, Vitest y build. Ejecuta Playwright después de cambios de interfaz o interacción y sobre una build actualizada. Para trabajar sobre una prueba concreta:

```sh
npm run test -- tests/unit/engine/levels.test.js
npm run test:e2e -- tests/e2e/tutorials.spec.js
```

Vite y Vitest tienen configuraciones separadas. Playwright sirve la build web en `127.0.0.1:4173` y ejecuta proyectos de escritorio y touch. La configuración `playwright.portable.config.js` comprueba exclusivamente `tests/portable/`: copia un solo HTML a una carpeta independiente, lo abre por `file://` sin servidor y desactiva la red. Ejecuta `npm run test:portable` para generar y comprobar esa salida; sus contratos se documentan en [PORTABLE.md](docs/PORTABLE.md). El formato general se define en `.editorconfig` y `.prettierrc.json`; `.gitattributes` normaliza finales de línea sin alterar recursos binarios.

## Compatibilidad y revisión

- Conserva IDs de niveles, orden pedagógico y la clave/versionado del guardado.
- Comprueba circuitos con las soluciones independientes; evita copiar la fórmula del nivel como única prueba.
- Revisa las resoluciones y los controles táctiles de [UI.md](docs/UI.md).
- Actualiza la guía afectada y [CHANGELOG.md](CHANGELOG.md) en el mismo cambio.
- Registra solo resultados ejecutados y límites reales en [TESTING.md](docs/TESTING.md).
- Incluye una descripción concreta del comportamiento y de la verificación en el pull request.

`docs/history/` conserva material anterior y no define requisitos activos. Las antiguas salidas de revisión visual están archivadas en `docs/history/visual-reviews/`; no deben regenerarse como parte de CI. `dist/`, informes de pruebas, cachés y dependencias se generan localmente y no se versionan.

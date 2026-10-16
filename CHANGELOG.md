# Registro de cambios

## 2026-10-15

### Reorganizado

- Aplicación dividida en `app`, `features`, `state`, `shared`, `data` y `engine`.
- Funcionalidades de inicio, aprendizaje, progresión y puzzle con responsabilidades explícitas y APIs públicas para capacidades compartidas.
- Medición y adaptación de nodos/aristas separadas de `CircuitBoard`; herramientas en `PuzzleSidebar`.
- Planificador de cables separado en geometría, búsqueda, reserva de carriles y presentación SVG.
- Catálogo de niveles separado de sus registros y constructor; IDs, currículo y guardado v1 compatibles.
- Estilos propios junto a cada funcionalidad, con entrada central que conserva la cascada.
- Pruebas unitarias en `tests/unit/`, configuración de Vitest independiente y fixtures compartidas conservadas.
- Formulario de conexión sin uso y sus estilos retirados; revisiones visuales antiguas archivadas en `docs/history/visual-reviews/`.

### Mantenimiento

- Límites de dependencias comprobados por ESLint y comando `npm run check` usado por CI.
- Configuración de editor, finales de línea, Node y formato; dependencias y lockfile sincronizados.
- Guía de contribución, plantilla de pull request y documentación actualizadas.

## 2026-10-08

### Añadido

- Guía pixel art transparente en los tutoriales de los diez componentes, con cinco poses estables.
- Corrección de dedos en celebración y pose pensativa; recursos WebP sin pérdida.

- Mini tutorial interactivo por primera aparición de cada componente del inventario.
- Cola para varias piezas nuevas y repaso desde el mismo nivel.
- Registro validado de tutoriales consultados, compatible con guardados v1.
- Índice documental, guía de tutoriales y separación entre contratos actuales e historial.

### Actualizado

- README, especificación, arquitectura, currículo, hoja de ruta y descripción del producto sincronizados con cinco etapas y 45 circuitos.
- Reglas de mantenimiento documental y registro de verificación.

Los cambios previos y sus resultados se conservan en [docs/history/](docs/history/README.md).

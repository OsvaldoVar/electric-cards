# Registro de cambios

## 2026-11-05

### Añadido

- Edición portátil en un único `Electric-Cards.html` con JavaScript, estilos, fuentes, imágenes y licencias incrustados, sin servidor ni conexión.
- Compilación portátil independiente de la edición web y navegación por hash para abrir y recargar pantallas desde archivos locales.
- Pruebas de navegador sobre una copia aislada y renombrada del HTML, con red desactivada; cobertura de circuito completo, guardado, simuladores, tema, recursos y cuatro tamaños de pantalla.
- Guía de uso y distribución offline, límites del guardado local y artefacto portátil en CI.

### Optimizado y modularizado

- Preparación e indexación del circuito separadas de la evaluación de señales en un módulo puro del motor.
- Validación exhaustiva con un solo análisis estructural por nivel, reutilizado en todos los casos y pasos secuenciales; el nivel 45 pasa de 1025 análisis repetidos a uno.
- Muestreo secuencial con acceso indexado a cables, sin búsquedas lineales por puerto ni pérdida de simultaneidad de los registros.
- Evaluadores públicos conservan la validación defensiva y los códigos de error; añadidas pruebas de equivalencia de los 45 circuitos y del número de validaciones.
- Actualizado el lockfile con versiones compatibles de herramientas y dependencias transitivas para resolver los seis avisos de auditoría, sin actualizaciones mayores forzadas.

## 2026-10-30

### Actualizado

- CI fija Ubuntu 24.04 para instalar Chromium con Playwright 1.58.2 y evitar la incompatibilidad de Ubuntu 26.04.

- Nuevo personaje en los diez mini tutoriales con el GIF y PNG originales del usuario.
- Retrato estático cuando está activada la preferencia de movimiento reducido.
- Retiradas las cinco poses WebP del modelo anterior; tamaños y simuladores conservados.

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

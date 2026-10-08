# Avance del rediseño pixel art — 2026-10-01

## Estado al cerrar esta sesión

**Implementación visual avanzada y guardada. Pendiente de correcciones finales en móvil; no declarar terminado el rediseño.** El usuario pidió documentar rápidamente porque necesita irse. Retomar desde este archivo, sin rehacer la aplicación ni descartar cambios.

Proyecto: `/home/osvaldo/Projects/electric-cards`.
Referencia: imagen enviada por el usuario, originalmente `/tmp/codex-clipboard-M8JF3i.png`.
Objetivo autorizado: rediseño exclusivamente visual, inspirado en videojuego indie pixel art moderno. Preservar lógica, rutas, React Flow, inventario, validación, reloj/memoria, estados, guardado y todas las interacciones existentes. Sin gradientes decorativos, glassmorphism, blur, sombras suaves, personajes ni escenario. Paleta especificada por el usuario, amarillo como acción principal.

## Implementado

- Inspección de rutas, componentes, estilos, motor, hooks, reducer y almacenamiento existentes, además de AGENTS.md y documentación.
- Sistema de tokens en `src/styles/variables.css`: paleta oscura solicitada, colores semánticos, espaciado de 4 px, bordes, sombras duras, tipografía, tiempos y z-index.
- Pixelify Sans local en `public/fonts/pixelify-regular.ttf` y `pixelify-bold.ttf`, con licencia `Pixelify-OFL.txt`. Fuente Bold precargada en `index.html`.
- HUD con configuración, mapa, Jugar / Compuertas y Electric Cards. Botones amarillos gruesos, presión de 2 px y foco visible.
- Editor limitado a 100dvh, panel izquierdo de 300–360 px en escritorio, scroll interno de herramientas y canvas principal. Tablet conserva panel izquierdo; móvil vertical utiliza herramientas compactas arriba. Teléfonos horizontales mantienen panel y canvas lado a lado.
- Marcos escalonados reutilizables en `src/styles/pixel.css`, sin recortar puertos ni la capa interactiva de React Flow.
- Nodos de entrada, compuertas y salida como módulos técnicos pixelados. Valores binarios visibles y borde amarillo al seleccionar una compuerta.
- Símbolos SVG de las diez piezas conservados, con trazos más firmes. Iconos funcionales SVG; sin emojis.
- Cables de 3.5 px: 0 rosa, 1 cyan, desconocido discontinuo; bajo trazo tenue de SVG sin filtros ni blur.
- Tabla de verdad funcional intacta, con fondos oscuros para filas correctas/incorrectas y valores obtenidos cuando ya existían.
- Inventario compacto y botones para añadir/aprender. Pistas, reloj, resultados y controles actuales conservados.
- Zoom arriba a la derecha e instrucciones de conexión abajo.
- Misma estética aplicada a inicio, mapa, colección, fichas, simuladores y diálogos. Los retratos gráficos de personajes se sustituyeron por símbolos técnicos dentro del componente existente; textos educativos conservados.
- Oscuro por defecto; una preferencia clara guardada explícitamente se respeta. Ambos modos siguen funcionando y se guardan con la clave de apariencia existente.
- Transiciones breves (80/120 ms), sin entradas flotantes ni efectos continuos; teclado y movimiento reducido siguen funcionando.

Archivos principales: `src/styles/variables.css`, `pixel.css`, `workspace.css`, `theme.css`, `motion.css`, `globals.css`, `screens.css`, `progression.css`; `src/components/CircuitBoard/CircuitBoard.css` y componentes de ese directorio; `GateSymbol.jsx`, `Icon.jsx`, `CharacterPortrait.jsx`, `SettingsDialog.jsx`, `src/pages/Puzzle.jsx`, `src/main.jsx`, `public/theme-init.js`, `index.html`.

## Verificaciones ejecutadas

- `npm run lint`: pasó.
- `npm run test`: 83 tests, 10 archivos, todos pasaron.
- `npm run build`: pasó; `dist/` contiene la implementación actual.
- `npm run format:check`: pasó en la última ejecución previa a la documentación de cierre.
- Suite completa Playwright: **83 pasaron y 1 omitido intencionalmente en escritorio**; el caso de conexión touch nativa sí pasó en el proyecto touch.
- Se actualizaron únicamente las expectativas visuales de paleta en las pruebas existentes y se añadieron resoluciones a la cobertura de workspace. Se conserva la cobertura funcional.
- Capturas: 64 combinaciones de ruta/resolución, sin desbordamiento de página ni errores de ejecución. Resoluciones: 1920×1080, 1600×900, 1366×768, 1280×720, 768×1024, 844×390, 640×360 y 360×800.
- 88 PNG de revisión válidos en `.impeccable/review/pixel/`; reporte `checks.json`. Script: `.impeccable/capture-pixel.cjs`.
- Detector Impeccable ejecutado una vez: `[]`.
- Comparación binaria con el inicio de sesión: **src/engine, src/data, src/context, src/hooks y src/services no cambiaron**. Hashes y comprobación: `.impeccable/review/pixel/logic-integrity.json`.
- Contrastes medidos: texto principal 16.18:1, secundario 8.00:1, texto sobre acción amarilla 13.48:1, verde de acierto 7.89:1, rosa de error 4.81:1.

Estas pruebas no detectan todas las oclusiones entre controles y nodos; la revisión visual encontró pendientes reales descritos abajo.

## Pendientes confirmados por revisión independiente

1. **P1 — Móvil vertical:** en `reference-360.png`, después de Organizar, los controles de zoom cubren parte del nodo B, incluido su valor/interruptor. B ocupa aproximadamente x188–269 / y377–453, mientras los controles ocupan x186–333 / y377–423. Corregir para que pueda verse y tocarse. No resolver ocultando el nodo ni desactivando controles. Mantener React Flow, IDs, datos guardados y funcionamiento.
2. **P1 — Teléfono horizontal:** en `puzzle-844.png`, reservar una franja de 64 px para el zoom evita el solapamiento, pero Ajustar vista deja módulos de unos 45 px de ancho y puertos demasiado pequeños. Revisar la distribución del espacio útil y el encuadre inicial; mantener zoom y recuperación de vista.
3. Aplicar las correcciones en un lote, reconstruir y capturar otra vez los mismos estados móviles. Enviar al mismo revisor para puntuar los hallazgos como resueltos/parciales/pendientes.
4. Ejecutar las comprobaciones correspondientes después de cambios de layout/interacción. Registrar resultados reales en `docs/TESTING.md`.
5. La documentación visual ya quedó actualizada: `DESIGN.md`, `.impeccable/design.json`, `docs/UI.md` y contrato nuevo al final de `docs/ARCHITECTURE.md`. Mantenerla sincronizada después de corregir los dos P1. El dictamen independiente está guardado en `.impeccable/review/pixel/finish-review.md`, con disposición `fix`.

## Cómo retomar

Leer primero este archivo y `.impeccable/review/pixel/finish-review.md` cuando esté disponible. Abrir la referencia y capturas móvil/horizontal. Trabajar sobre CSS/componentes actuales, conservando el motor. No reiniciar la tarea ni interpretar el diff contra HEAD como cambios de esta sesión: **ya existían muchos cambios locales antes de comenzar**. No hacer reset, checkout destructivo ni reemplazar esos cambios.

Herramientas locales utilizadas:

```sh
export PATH=/tmp/electric-cards-toolchain/bin:$PATH
npm run lint
npm run test
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2
npm run format:check
node .impeccable/capture-pixel.cjs
```

Node 24.14.0 se descargó a `/tmp/electric-cards-toolchain`; no se añadieron dependencias al proyecto. Si `/tmp` se limpia habrá que disponer de Node 22.12+ o 24. El navegador es `/usr/bin/chromium`. La captura necesita preview en el puerto 4173. La sesión dejó un preview local activo: `http://localhost:4173/puzzle/1`; puede reiniciarse con `npm run preview -- --port 4173 --strictPort`.

Las capturas usan un contexto aislado y borradores de QA; no modifican el progreso del navegador real del usuario. No hubo commit, push, publicación ni despliegue. Safari/iOS físico y Firefox no se verificaron.

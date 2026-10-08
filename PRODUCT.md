# Electric Cards

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que aprenden lógica digital mediante puzzles, en español, desde computadoras, tabletas y teléfonos. No se requiere experiencia previa. La documentación no define una edad concreta.

## Product Purpose

Aprender construyendo circuitos booleanos. Una solución debe satisfacer todas las combinaciones o secuencias temporales del nivel.

## Positioning

Inventario finito de siete compuertas, un reloj y flip-flops D/T, 40 lecciones y cinco retos de salto en cinco etapas, editor interactivo y comprobación exhaustiva. Colección educativa con símbolos, expresiones, tablas, simuladores y mini tutoriales al encontrar componentes nuevos.

## Operating Context

Aplicación React y Vite sin cuenta ni backend. Conexiones por arrastre, dos toques. Las entradas permiten explorar señales 0, 1 y estado desconocido. El progreso y los borradores se guardan en el navegador.

## Capabilities and Constraints

El usuario confirmó el 29 de septiembre de 2026 que el rediseño debe conservar toda la lógica, niveles, conexiones táctiles y progreso guardado. Mantener rutas, IDs, esquema de almacenamiento y reglas del motor. El 30 de septiembre de 2026, el usuario amplió el juego con CLOCK y flip-flops D/T, desbloqueo progresivo y una ventana de éxito. Estos componentes usan memoria en pasos discretos; las conexiones siguen siendo acíclicas. Sin circuitos cíclicos, backend ni electrónica analógica. Respetar AGENTS.md y las pruebas existentes.

## Brand Commitments

Nombre Electric Cards, interfaz en español y personajes educativos de las siete compuertas. El usuario solicita reemplazar la experiencia visual completa; la estética anterior sirve como referencia funcional.

## Evidence on Hand

docs/SPEC.md, docs/LEVELS.md, src/data/gates.js, src/data/levels.js, tests/fixtures/solutions.js y las pruebas del motor. SVG propios para personajes y símbolos. Hay capturas de la versión anterior en docs/screenshots/.

## Product Principles

- Aprender experimentando y viendo el resultado.
- Explicar fallos y objetivos con lenguaje concreto.
- Conservar la respuesta inmediata de las interacciones frecuentes.
- Dar acceso equivalente con ratón, teclado y pantalla táctil.
- Conservar el progreso y permitir recuperar el tablero.

## Accessibility & Inclusion

Objetivos táctiles grandes, estados descritos con texto además del color, foco visible, navegador ampliable y movimiento reducido. Verificación en 360×800, 768×1024, 1366×768 y 1920×1080.

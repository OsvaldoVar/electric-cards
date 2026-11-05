# Mini tutoriales de componentes

## Comportamiento

Al abrir un nivel accesible, `GateTutorials` considera todos los componentes de su inventario con cantidad positiva y desbloqueados, incluidos distractores. Los que no aparecen en `seenTutorials` abren un diálogo automáticamente. Si hay varios, se presentan de uno en uno siguiendo el orden del inventario.

Cada tutorial reutiliza la descripción, expresión, ejemplo y tabla de `src/data/gates.js`, junto con `GateSimulator`. Cambiar entradas resalta la fila activa; CLOCK alterna fases y DFF/TFF permiten experimentar con flancos y memoria. Cada componente comienza su demostración desde cero.

Siguiente componente o Volver al circuito registra el tutorial consultado. Escape realiza la misma operación para la ficha actual. La sección Mini tutoriales de este nivel permite repasar cada pieza sin navegar fuera del puzzle. El diálogo contiene el foco y permite scroll interno en pantallas pequeñas; no añade filas al tablero.

## Guía visual

Los diez tutoriales muestran el nuevo personaje pixel art proporcionado por el usuario. `src/features/learning/data/tutorialGuide.js` importa el GIF animado `guide-animated.gif` y el retrato PNG `guide-still.png` desde `src/features/learning/assets/tutorial-guide/`. Sustituyen las cinco poses del modelo anterior.

Un elemento `picture` selecciona el PNG cuando el navegador indica `prefers-reduced-motion: reduce`; en los demás casos muestra el GIF original, conservando sus seis fotogramas, tiempos y transparencia. Ambos archivos se conservan sin modificaciones. La edición web publica sus URLs con hash; la edición portátil los incrusta como URLs de datos dentro del único HTML, manteniendo la selección por movimiento reducido y sin descargas externas.

La imagen es decorativa (`alt=""`, sin foco ni interacción). Mide 112 px en escritorio y 80 px hasta 600 px de ancho, con `object-fit: contain` y `image-rendering: pixelated`. La cabecera mantiene su tamaño al cargar cualquiera de los recursos. El cambio no añade estados de guardado.

## Guardado y compatibilidad

`seenTutorials` pertenece al estado v1 existente y solo acepta IDs conocidos con valor `true`. Un guardado antiguo no tiene fichas consultadas: se muestran al siguiente uso. Cerrar el tutorial no completa niveles, no cambia el borrador y no guarda entradas de la demostración. Reiniciar un puzzle conserva el registro. Si localStorage no está disponible, el registro dura la sesión y se mantiene el aviso existente de guardado.

Saltarse una etapa no marca tutoriales como consultados. Al entrar a un reto o lección posterior, se muestran los componentes nuevos presentes allí, incluidos CLOCK/DFF/TFF cuando correspondan.

## Mantenimiento

1. Mantén nombre, descripción, expresión, ejemplo y tabla en `gates.js`.
2. Implementa la operación exclusivamente en el motor y su simulador correspondiente.
3. Añade el componente al inventario y reglas de desbloqueo apropiadas.
4. Comprueba primera aparición, repaso, recarga, Escape, varios componentes y uso táctil.
5. Actualiza esta guía, contratos y registro de cambios si cambia el flujo.

No se mantienen listas de introducción duplicadas por nivel: el inventario y los desbloqueos son la fuente del tutorial.

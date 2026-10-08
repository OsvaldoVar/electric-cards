# Interfaz e interacción

Presentación vigente: editor de lógica con estética pixel art, implementado desde octubre de 2026. [DESIGN.md](../DESIGN.md) define el sistema visual; los estilos anteriores se conservan como historial.

## Sistema visual

`variables.css` define paleta, tipografía local Pixelify Sans, espaciado, profundidad y movimiento. Fondo `#090d1f`, superficies `#11162b` y `#181e37`, bordes violeta, acciones amarillas `#ffd34e`, texto claro y secundario `#aeb4d0`. Señales 0 rosa y 1 cian; desconocidas discontinuas. Los valores numéricos complementan el color.

Los materiales usan paneles opacos, bordes de 2px, esquinas mínimas y marcos escalonados huecos que no recortan puertos ni foco. Sin gradientes, cristal, blur o sombras difusas. Los componentes se representan con símbolos técnicos; los nombres educativos permanecen. Conserva la licencia de la fuente en `public/fonts/Pixelify-OFL.txt`.

La apariencia oscura es predeterminada. Configuraciones permite una preferencia clara persistida en `electric-cards:theme`, independiente del progreso. Los diálogos nativos mantienen foco modal, Escape y regreso al control de origen cuando existe.

## Navegación y aprendizaje

Inicio contiene el simulador AND y continuación. El mapa muestra cinco etapas, 40 lecciones y cinco retos con estados disponibles, bloqueados, resueltos o etapa acreditada. Los títulos visibles de puzzles usan Nivel N, con IDs estables.

La colección y sus fichas muestran expresión, explicación, ejemplo, símbolo, tabla y simulador de los diez componentes. Enlaces iniciados desde un puzzle conservan `from`; el encabezado y la ficha permiten Volver al nivel N. La recarga conserva el origen y recupera el borrador validado. Una visita directa a la colección ofrece el mapa.

## Mini tutoriales

Cada componente nuevo del inventario utilizable abre un tutorial dentro del nivel. Si hay varios, se presentan de uno en uno. La ficha incluye explicación, expresión, ejemplo, tabla y simulador interactivo. Escape o continuar registra la lectura; Mini tutoriales de este nivel permite repaso. El diálogo se limita al viewport y desplaza su contenido sin cambiar la geometría del tablero. Véase [TUTORIALS.md](TUTORIALS.md).

## Disposición del editor

Puzzle ocupa `100dvh` sin scroll del documento. El encabezado contiene mapa, configuración, navegación y marca. El panel lateral agrupa objetivo, tutoriales, inventario, reloj, pistas, entradas y resultados; solo herramientas y tablas se desplazan internamente. Un contenedor exterior mantiene fijo el marco pixelado.

El ancho lateral es `clamp(300px, 23vw, 360px)`, reducido a 300px en 1200px y 280px en 1000px. A 700px o menos, las herramientas se apilan sobre el tablero en una región limitada a `min(26dvh, 208px)`. Teléfonos horizontales de al menos 701px de ancho y hasta 540px de alto usan panel lateral de 252px.

El encabezado del tablero contiene nivel, Organizar, Probar circuito y Reiniciar. Zoom y Ajustar vista flotan en el canvas; instrucciones permanecen abajo. Validación y diálogos no insertan filas en el editor.

## Construcción y cables

Añadir desde inventario; mover nodos; conectar por arrastre o dos toques en puertos visibles. No hay formulario de selectores de conexión. Controles táctiles de 44px, puertos visuales cuadrados de 16px, foco cian y selección amarilla.

Entradas/compuertas miden 136px y salidas 144px. Las rutas ortogonales coordinan carriles, evitan módulos y muestran puentes cuadrados en cruces. Una fuente compartida puede conservar un tramo inicial común. Señales conocidas usan trazo de 4px sobre contorno oscuro de 8px; selección 6px. Geometría y colores se actualizan al mover o explorar, sin alterar conexiones.

Solo un cable seleccionado muestra el botón central y la X del destino. Seleccionar nodo o canvas los oculta. Teclado, ratón y touch comparten selección controlada; nunca se guarda con el borrador. Organizar y Ajustar vista permiten recuperar la construcción.

## Validación y memoria

Probar circuito recorre combinaciones y muestra resultados antes de acreditar. Tabla objetivo contiene entradas y valores esperados, con filas de revisión accesibles; el detalle conserva los valores recibidos. Los fallos usan información textual y color. Cambios cancelan reproducción; teclado y movimiento reducido muestran resultados sin demoras.

La ventana de éxito ofrece continuación, desbloqueos y optimización cuando corresponde. Seguir explorando o Escape regresa al tablero. Reiniciar vacía el borrador sin borrar progreso.

Las secuencias usan reloj manual/automático, pausa y reinicio de memoria. CLOCK/DFF/TFF explican fases y transiciones. Un tutorial tiene memoria independiente del circuito. Recargar o editar lógica reinicia el estado temporal; mover nodos lo conserva.

## Accesibilidad y revisión

Controles nativos, etiquetas claras, foco visible, zoom del navegador y objetivos de 44px. Presión de 80ms y cambios de estado de 120ms; teclado y movimiento reducido eliminan movimiento CSS. No suavizar el arrastre ni añadir bucles decorativos.

Revisar 360×800, 768×1024, 1366×768 y 1920×1080, además de horizontal, tema claro y movimiento reducido. Las comprobaciones físicas y los pendientes visuales históricos requieren revisión separada; resultados y límites actuales en [TESTING.md](TESTING.md).

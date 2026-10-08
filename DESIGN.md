---
name: Electric Cards
description: Editor de lógica con materiales pixel art, señales legibles y controles táctiles.
colors:
  background: '#090d1f'
  surface: '#11162b'
  surface-light: '#181e37'
  border: '#504075'
  border-highlight: '#8b5cb5'
  yellow: '#ffd34e'
  yellow-light: '#ffe47a'
  pink: '#ff547d'
  cyan: '#63ddff'
  green: '#55e58c'
  red: '#e84763'
  text: '#f4f2ff'
  text-secondary: '#aeb4d0'
  canvas: '#0c1125'
  grid: '#1b2340'
  frame-dark: '#050817'
  button-border: '#a8792d'
  button-shadow: '#654329'
  signal-soft: '#10392d'
  danger-soft: '#401b30'
  warning-soft: '#302a24'
  modal-backdrop: 'rgb(5 8 23 / 80%)'
  light-background: '#eeedf7'
  light-surface: '#faf8ff'
  light-surface-light: '#e3e1f2'
  light-canvas: '#e9e8f5'
  light-grid: '#d6d3e8'
  light-text: '#17182f'
  light-text-secondary: '#53546e'
  light-frame-dark: '#34304b'
  light-signal-soft: '#d5f1df'
  light-danger-soft: '#f7dde5'
  light-warning-soft: '#f7edcc'
  light-success: '#176b3d'
  light-cyan: '#225477'
  light-pink: '#a92249'
  light-signal-unknown: '#65627b'
typography:
  display:
    fontFamily: 'Pixelify Sans, system-ui, sans-serif'
    fontSize: 'clamp(36px, 4.1vw, 60px)'
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: '0'
  headline:
    fontFamily: 'Pixelify Sans, system-ui, sans-serif'
    fontSize: '26px'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '0'
  board-title:
    fontFamily: 'Pixelify Sans, system-ui, sans-serif'
    fontSize: 'clamp(26px, 2.4vw, 36px)'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '0'
  title:
    fontFamily: 'Pixelify Sans, system-ui, sans-serif'
    fontSize: '21px'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '0'
  body:
    fontFamily: 'Pixelify Sans, system-ui, sans-serif'
    fontSize: '18px'
    lineHeight: 1.45
  label:
    fontFamily: 'Pixelify Sans, system-ui, sans-serif'
    fontSize: '18px'
    fontWeight: 700
    lineHeight: 1.2
  mono:
    fontFamily: 'Pixelify Sans, ui-monospace, monospace'
rounded:
  surface: '2px'
  control: '2px'
spacing:
  space-1: '4px'
  space-2: '8px'
  space-3: '12px'
  space-4: '16px'
  space-5: '20px'
  space-6: '24px'
  space-8: '32px'
components:
  button-primary:
    backgroundColor: '{colors.yellow}'
    textColor: '{colors.background}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '12px 20px'
  button-primary-hover:
    backgroundColor: '{colors.yellow-light}'
    textColor: '{colors.background}'
  button-secondary:
    backgroundColor: '{colors.yellow}'
    textColor: '{colors.background}'
    rounded: '{rounded.control}'
    padding: '12px 20px'
  sequence-select:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: '9px 30px 9px 12px'
  level-card:
    backgroundColor: '{colors.surface-light}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: '16px 14px'
  detail-badge:
    backgroundColor: '{colors.surface-light}'
    textColor: '{colors.yellow}'
    rounded: '{rounded.control}'
    padding: '4px 10px'
  gate-node:
    backgroundColor: '{colors.surface-light}'
    rounded: '{rounded.surface}'
    padding: '8px'
    width: '136px'
---

# Design System: Electric Cards

## Overview

**Creative North Star: "Editor indie de lógica pixel art"**

Un editor indie de rompecabezas lógicos: lienzo nocturno, paneles sólidos, marcos escalonados violeta y botones amarillos con relieve duro. La referencia aportada por el usuario fija la identidad pixel art y la relación entre herramientas laterales y tablero. La interfaz sigue siendo un circuito interactivo real, con texto español y símbolos técnicos propios.

La densidad sirve a la construcción: objetivo e inventario comparten un panel compacto; el lienzo conserva espacio para arrastrar, conectar e inspeccionar señales. Portada, mapa, colección, detalle y diálogos reutilizan los mismos materiales. La apariencia oscura es predeterminada; una elección clara guardada conserva una paleta alternativa con texto y señales de contraste adecuado.

**Key Characteristics:**

- Superficies opacas y marcos pixelados huecos que dejan visibles los puertos.
- Pixelify Sans autohospedada en títulos, lectura, cifras y expresiones.
- Acciones amarillas; cables 0 rosa, 1 cian y desconocidos discontinuos.
- Relieve de píxel con sombras duras sin desenfoque y respuesta breve a la presión.

## Colors

La paleta nocturna separa herramientas, acciones y señales mediante colores nítidos. Los valores normativos están en el frontmatter y se implementan en `src/styles/variables.css`.

### Primary

- **Amarillo de acción** (`yellow`): botones, navegación activa, inventario y marco de compuerta seleccionada.
- **Amarillo de respuesta** (`yellow-light`): hover de controles con puntero preciso y pequeños realces duros.

### Secondary

- **Cian de señal** (`cyan`): cable y puerto con valor 1, foco de teclado e información de optimización.
- **Rosa de señal** (`pink`): cable y puerto con valor 0 y acciones de eliminación.

### Tertiary

- **Verde de acierto** (`green`): salida activa, indicadores de valor 1 y pruebas correctas; no sustituye el cian de los cables.
- **Rojo de salida** (`red`): marco de salida 0; los errores usan el alias semántico `danger`, que apunta a rosa.
- **Violeta de estructura** (`border`, `border-highlight`): paneles, divisores, marcos huecos y límites de controles.

### Neutral

- **Noche de editor** (`background`, `canvas`): página y lienzo; `grid` conserva una retícula discreta.
- **Panel nocturno** (`surface`, `surface-light`): herramientas, tablas y módulos.
- **Tinta luminosa** (`text`, `text-secondary`): lectura principal y secundaria.
- **Relieve oscuro** (`frame-dark`, `button-border`, `button-shadow`): contornos y sombras duras.
- **Fondos de estado** (`signal-soft`, `danger-soft`, `warning-soft`): señales, error y aviso sobre superficies opacas.
- **Fondo modal** (`modal-backdrop`): velo oscuro del diálogo nativo; no añade desenfoque.

Los tokens `light-*` describen las sustituciones de `html[data-theme='light']`. El amarillo de los botones conserva texto nocturno. Cian, rosa y éxito cambian a versiones oscuras; los títulos y símbolos que eran amarillos sobre panel oscuro pasan a texto oscuro cuando es necesario. Los alias históricos de color existen por compatibilidad de componentes, no representan otra identidad visual.

**The Signal Meaning Rule.** Mostrar valores 0, 1 y desconocido junto al color; reservar el trazo discontinuo para la señal desconocida y distinguir el valor actual del veredicto de una prueba.

## Typography

**Display Font:** Pixelify Sans, system-ui, sans-serif.

**Body Font:** Pixelify Sans, system-ui, sans-serif.

**Label/Mono Font:** Pixelify Sans, ui-monospace, monospace.

La misma familia pixelada reúne títulos, instrucciones y expresiones. Los archivos regular y bold se sirven desde `public/fonts/` con `font-display: swap`; no hay solicitud remota de fuentes. Mantener su licencia OFL.

### Hierarchy

- **Display**: título de portada, peso 700 y escala fluida del frontmatter; en teléfono usa la adaptación de portada.
- **Headline**: títulos de sección y herramientas, peso 700; objetivo e inventario usan mayúsculas.
- **Board title**: «Nivel N», compacto y en mayúsculas; baja a 24px en teléfono y 22px hasta 380px.
- **Title**: subtítulos de bloques; inventario usa 22px y las tarjetas de colección 26px.
- **Body**: lectura base de 18px, interlineado 1.45; objetivo usa 1.35. Evitar párrafos largos dentro de los nodos.
- **Label**: acciones en mayúsculas; controles compactos bajan a 16px. Metadatos usan 14–16px; tabla objetivo 17px.
- **Mono**: expresiones, identificadores EC y valores binarios. Las etiquetas técnicas pequeñas permanecen asociadas a controles accesibles.

## Layout

La escala compartida avanza en pasos de 4px. Las páginas de lectura tienen un ancho máximo de 1440px. La portada presenta introducción y simulador en columnas amplias y apila el contenido en pantallas pequeñas.

El puzzle usa un shell de `100dvh`, sin desplazamiento del documento. La cabecera ocupa normalmente 76px. A la izquierda están Configuraciones y Mapa; a la derecha, Jugar, Compuertas y marca. El espacio restante contiene herramientas y tablero con separación de 16px.

El panel izquierdo mide `clamp(300px, 23vw, 360px)` en escritorio, 300px hasta 1200px y 280px hasta 1000px. Objetivo, inventario, reloj, pistas y resultados desplazan dentro de este panel. El tablero reserva una fila estable para Nivel N, Organizar, Probar circuito y Reiniciar; zoom y Ajustar vista flotan arriba a la derecha del lienzo. Las instrucciones ocupan una franja inferior estable.

Hasta 700px, herramientas y tablero se apilan: herramientas ocupan como máximo `min(26dvh, 208px)` y el lienzo recibe el espacio restante. La cabecera baja a 64px; se acortan etiquetas visuales sin perder nombres accesibles. Con altura máxima de 540px y ancho mínimo de 701px, el teléfono horizontal mantiene herramientas de 252px al lado del lienzo y cabecera de 56px. Tablas anchas desplazan dentro de su contenedor.

**The Recoverable Canvas Rule.** Mantener Organizar, zoom y Ajustar vista visibles; desplazar las herramientas dentro del panel sin cambiar las dimensiones del tablero.

## Elevation & Depth

La profundidad combina diferencias de tono y desplazamientos de píxel con bordes sólidos. Paneles y tarjetas usan `4px 4px 0 var(--frame-dark)`. Los botones combinan `0 4px 0 var(--button-shadow)` y `0 6px 0 var(--frame-dark)`; al presionar reducen esos desplazamientos a 2px y 4px. No hay elevación ambiental.

Los cables conocidos usan recorridos ortogonales con giros de 90°, trazo de 4px y un contorno oscuro de 8px; no usan filtros ni desenfoque. La vista previa al conectar usa el mismo recorrido angular. La señal desconocida omite el contorno oscuro. Un cable seleccionado aumenta el trazo principal a 6px.

**The Crisp Material Rule.** Usar superficies sólidas, bordes definidos y sombras con desenfoque cero; no introducir gradientes, glassmorphism, blur ni sombras suaves.

## Shapes

Superficies y controles tienen esquinas mínimas de 2px y bordes compartidos de 2px. El marco decorativo usa escalones de 4px en un pseudo-elemento hueco; no aplica clipping al contenido. Puertos cuadrados de 16px, con borde de señal y contorno oscuro, amplían su área interactiva a 44px. Los símbolos SVG conservan trazos cuadrados y uniones definidas, con curvas únicamente donde pertenecen al símbolo lógico. El marco del panel de herramientas está fuera del contenido desplazable para evitar líneas que atraviesen el inventario.

**The Live Geometry Rule.** El marco decorativo nunca recorta puertos, controles de desconexión, foco ni la capa interactiva de React Flow.

## Components

### Buttons

Acciones primarias y secundarias comparten amarillo, texto nocturno, borde ocre y relieve duro. La jerarquía depende de posición, etiqueta y agrupación; no añadir una variante de cristal. Hover preciso usa amarillo claro. Presionar desplaza el control 2px durante 80ms y reduce su relieve. Desactivados usan superficie clara y texto secundario, sin sombra.

### Panels, cards and inventory

Paneles opacos con borde violeta y sombra dura agrupan tareas reales. Las tarjetas de nivel conservan estado disponible, actual, completado o bloqueado; el nivel actual añade amarillo. Inventario usa símbolo técnico, nombre, disponibilidad y acción visible de añadir. `CharacterPortrait` conserva su slot de presentación, pero muestra `GateSymbol` y el identificador EC; no representa un personaje. Nombres y explicaciones educativas existentes se conservan.

### Inputs / Fields

Los selectores nativos de secuencia conservan superficie opaca, borde, altura mínima de 46px y etiqueta. No reintroducir el formulario de selectores de conexión retirado por el usuario. Interruptores binarios mantienen etiqueta, valor y estado accesible.

### Navigation

Navegación en contenedor violeta, superficie clara y sombra dura; enlaces de 18px en mayúsculas. El enlace activo usa amarillo y `aria-current`. En teléfono se compacta el texto visual de la marca y del mapa, manteniendo sus nombres accesibles.

### Circuit modules and wires

Entradas y compuertas miden 136px; salidas 144px. Compuertas seleccionadas usan un marco amarillo. El foco de teclado usa contorno cian de 3px, separado del estado de selección. Puertos 0 rosa y 1 cian; cables desconocidos tienen segmentos `8 4`. El veredicto de la salida cambia su marco sin ocultar el valor actual. Eliminar y desconectar conservan controles visibles de 44px. React Flow mantiene arrastre, selección, zoom y geometría.

### Feedback and dialogs

Probar circuito recorre combinaciones y muestra resultados sin alterar filas estructurales del tablero. La tabla objetivo conserva entradas y valores esperados; los fallos se muestran en rojo, sin texto «Obtenido», y mantienen etiquetas accesibles. El detalle de las pruebas conserva sus valores recibidos. Éxito abre el diálogo nativo con Siguiente nivel, desbloqueos y consejo de optimización cuando procede. Configuraciones usa el mismo material; Escape y cierre restauran el foco. No hay banner de éxito sobre el tablero.

### Motion and accessibility

Cambios de color y borde usan 120ms `ease-out`; presión usa 80ms. No añadir animaciones continuas ni suavizar el arrastre. El teclado elimina animaciones y transiciones CSS. Movimiento reducido elimina esas transiciones y el desplazamiento de presión. Foco visible, botones nativos, etiquetas, blancos táctiles y navegación por teclado forman parte del diseño.

## Do's and Don'ts

### Do:

- **Do** reutilizar los tokens de `src/styles/variables.css` y el marco hueco de `src/styles/pixel.css`.
- **Do** usar Pixelify Sans autohospedada y conservar `public/fonts/Pixelify-OFL.txt`.
- **Do** acompañar estados con valores, etiquetas, símbolos y foco visible.
- **Do** conservar controles táctiles de al menos 44px y conexiones por arrastre o dos toques.
- **Do** respetar movimiento reducido, teclado y la elección de apariencia guardada.
- **Do** conservar el tablero interactivo y el desplazamiento interno de tablas y herramientas.

### Don't:

- **Don't** añadir gradientes, transparencias de cristal, desenfoque o sombras difusas.
- **Don't** añadir paisajes o escenas decorativas. Los componentes mantienen símbolos técnicos; por petición del usuario, los mini tutoriales incorporan una única guía pixel art en cinco poses, descrita en `docs/TUTORIALS.md`.
- **Don't** depender solo del color, del hover o de un gesto preciso para operar el editor.
- **Don't** recortar los puertos o el foco al implementar esquinas escalonadas.
- **Don't** cambiar motor, niveles, IDs, inventario, rutas ni guardado para resolver una decisión visual.
- **Don't** insertar confirmaciones de éxito o una acción de siguiente nivel encima del tablero; usar el diálogo existente.

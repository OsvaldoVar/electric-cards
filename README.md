# Electric Cards

Juego web educativo de lógica digital. Construye un circuito con un inventario
limitado de compuertas y consigue que sus salidas cumplan el objetivo en **todas
las combinaciones de entrada**. Interfaz en español para PC, tablet y celular.

![Inicio de Electric Cards](docs/screenshots/home-desktop.png)

## Qué incluye

- 25 puzzles en cinco mundos, con dificultad progresiva y retos de optimización.
- AND, OR, NOT, NAND, NOR, XOR y XNOR.
- Editor de nodos: añadir, mover, conectar, desconectar y eliminar cartas.
- Conexión por arrastre, dos toques o selectores accesibles.
- Vista previa de señales 0/1; conexiones incompletas muestran `?`.
- Rechazo de ciclos, puertos ocupados y conexiones inválidas.
- LEDs, puertas, banderas, alarmas y motores como salidas binarias.
- Validación exhaustiva con resultados de cada combinación.
- Estrellas, desbloqueo de niveles y conservación de mejores resultados.
- Guardado local del progreso y de los circuitos en construcción.
- Colección educativa con personajes, símbolos, expresiones, tablas de verdad
  y simuladores interactivos para las siete compuertas.
- Instrucciones para agentes, documentación técnica y CI para GitHub Actions.

No necesita backend ni cuenta. El progreso se guarda en este navegador y no se
sincroniza entre dispositivos.

## Ejecutar

Requiere Node.js 22.12+; se recomienda Node.js 24.

```sh
git clone https://github.com/OsvaldoVar/electric-cards.git
cd electric-cards
npm ci
npm run dev
```

El repositorio es privado: GitHub debe autorizar tu cuenta para clonarlo.

Abre la dirección mostrada por Vite. Para probar desde un celular de tu red,
utiliza la dirección de red que muestra el servidor. El firewall del equipo
debe permitir el puerto de desarrollo.

```sh
npm run build
npm run preview
```

`dist/` contiene la versión estática de producción. El servidor debe devolver
`index.html` al abrir rutas como `/puzzle/1`. `vercel.json` incluye las reglas
de SPA para importar el repositorio en Vercel. No requiere variables secretas.

## Cómo jugar

1. Abre **Jugar** y elige un nivel disponible.
2. Lee la misión y observa el inventario.
3. Toca una carta para añadirla. Arrástrala dentro del tablero para colocarla.
4. Conecta una salida con una entrada: arrastra el cable, toca ambos puertos
   o abre **Conectar con selectores**.
5. Cambia las entradas para explorar el comportamiento del circuito.
6. Pulsa **Probar circuito**. Solo completas el nivel al pasar todos los casos.
7. Revisa las combinaciones fallidas, usa una pista o mejora tu solución.

Una estrella confirma la solución. Dos y tres requieren los presupuestos de
compuertas indicados. No se penaliza pedir pistas. Eliminar una carta devuelve
su unidad al inventario. Reiniciar vacía el tablero y conserva las estrellas.
El botón **Ajustar tablero** recupera los nodos después de moverlos o hacer zoom.
**Organizar tablero** distribuye las cartas para la pantalla actual: de
izquierda a derecha en PC y de arriba hacia abajo en celular.

![Puzzle de Electric Cards resuelto](docs/screenshots/puzzle-desktop.png)

## Stack

React + Vite, JavaScript, CSS, React Router, @xyflow/react, Context/useReducer,
localStorage, Vitest, React Testing Library, Playwright, ESLint y Prettier.
El lockfile fija las versiones instaladas. Los símbolos y personajes son SVG
del repositorio y no dependen de servicios de imágenes o fuentes externas.

## Verificar

```sh
npm run lint
npm run format:check
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright prueba la build de producción; ejecuta `npm run build` primero.
`npm run test:watch` activa el modo interactivo de Vitest. CI ejecuta las mismas
comprobaciones y conserva los informes de Playwright si hay un fallo.
La verificación de esta versión está registrada en [docs/TESTING.md](docs/TESTING.md).

## Estructura

```text
src/
  components/    Editor, cartas, tablas, objetivos y resultados
  context/       Proveedor y reducer del juego
  data/          Compuertas, mundos y niveles declarativos
  engine/        Operaciones, DAG, evaluación y validación pura
  hooks/         Coordinación del puzzle y progreso
  pages/         Rutas cargadas bajo demanda
  services/      Persistencia versionada y saneamiento de borradores
  styles/        Variables, estilos globales y reglas responsive
tests/
  engine/        Tablas, grafos y soluciones de los 25 niveles
  fixtures/      Circuitos de referencia independientes
  e2e/           Recorridos de escritorio y touch
docs/            Especificación, arquitectura, contenido y QA
```

Lee [AGENTS.md](AGENTS.md) y todos los archivos de `docs/` antes de modificar.
La lógica booleana pertenece al motor; las vistas no calculan operaciones.
Para añadir contenido, sigue [docs/LEVELS.md](docs/LEVELS.md).

## Documentación

| Archivo                                      | Contenido                                      |
| -------------------------------------------- | ---------------------------------------------- |
| [AGENTS.md](AGENTS.md)                       | Reglas para trabajar en el proyecto            |
| [docs/SPEC.md](docs/SPEC.md)                 | Alcance, pantallas y criterios de aceptación   |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Motor, contratos, estado y decisiones técnicas |
| [docs/LEVELS.md](docs/LEVELS.md)             | Formato y creación de nuevos niveles           |
| [docs/UI.md](docs/UI.md)                     | Diseño responsive e interacción accesible      |
| [docs/TESTING.md](docs/TESTING.md)           | Cómo verificar y resultados de QA              |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Ejecución y publicación en Vercel              |
| [docs/ROADMAP.md](docs/ROADMAP.md)           | Trabajo completado y siguientes mejoras        |

## Alcance y próximos pasos

La aplicación trabaja con circuitos combinacionales acíclicos y señales 0/1.
No modela electrónica analógica, voltajes, tiempos de propagación,
microcontroladores ni circuitos de realimentación.

La siguiente iteración puede añadir exportación/importación de progreso,
un tutorial guiado y un editor de niveles que produzca el mismo formato de
datos. Antes de una entrega definitiva, conviene completar las comprobaciones
en Safari, Firefox y celulares físicos indicadas en el registro de QA.

Diseñado para el proyecto académico de compuertas lógicas de FCC-BUAP.

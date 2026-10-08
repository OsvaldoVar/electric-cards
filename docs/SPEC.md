# Especificación funcional

Electric Cards enseña lógica combinacional y secuencial mediante circuitos. Es una SPA estática en español para escritorio, tablet y celular, sin servidor de aplicación, autenticación ni base de datos.

## Pantallas

| Ruta           | Función                                               |
| -------------- | ----------------------------------------------------- |
| `/`            | Introducción, simulador y continuación                |
| `/levels`      | Cinco etapas, 40 lecciones y cinco retos              |
| `/puzzle/:id`  | Objetivo, tutoriales, inventario, editor y resultados |
| `/learn`       | Colección de diez componentes                         |
| `/learn/:gate` | Símbolo, expresión, explicación, tabla y simulador    |

Los enlaces educativos iniciados en un puzzle conservan el origen mediante `from`; permiten volver al mismo nivel.

## Reglas

- Entradas y salidas fijas, instancias de componentes móviles y señales 0/1.
- NOT tiene una entrada; CLOCK ninguna; las demás compuertas dos. DFF usa D/CLK y TFF T/CLK.
- Cada puerto destino admite un cable; una salida puede alimentar varios destinos.
- El grafo es acíclico. Conexiones incompletas muestran valores desconocidos.
- Todos los componentes colocados deben estar conectados por completo para validar.
- El inventario es finito; eliminar una carta devuelve su unidad.
- La validación comprueba estructura, inventario, terminales y todos los casos o pasos.
- Toda solución correcta completa el nivel. Superar el objetivo de compuertas muestra consejo de optimización, sin penalización ni estrellas.
- Completar lecciones o el reto acredita una etapa; los niveles omitidos no se marcan como resueltos.
- Las siete compuertas booleanas están habilitadas inicialmente. CLOCK/DFF/TFF requieren entrada a etapa 4; los logros antiguos de memoria conservan acceso.

## Enseñanza

Cada componente que aparece por primera vez en el inventario utilizable abre un mini tutorial. Si aparecen varios, se presentan de uno en uno. El tutorial incluye descripción, expresión, ejemplo y simulador con tabla, y puede cerrarse o repasarse dentro del nivel. Consultarlo no acredita niveles ni cambia el circuito. Véase [TUTORIALS.md](TUTORIALS.md).

## Reloj y memoria

DFF guarda D y TFF alterna Q si T=1, exclusivamente en flancos 0→1. Todos los registros empiezan en 0, conservan Q en flancos descendentes o reloj estable y actualizan simultáneamente en un reloj compartido. Las secuencias independientes se validan desde Q=0. La memoria y los temporizadores son transitorios; los borradores y el progreso se guardan localmente.

## Criterios de aceptación

Completar un nivel con ratón o conexiones táctiles, identificar los casos fallidos y recuperar progreso tras recargar. Los tutoriales deben respetar teclado, Escape, foco modal y pantallas pequeñas. Ninguna acción requiere exclusivamente hover o menú contextual. Las comprobaciones y sus límites se registran en [TESTING.md](TESTING.md).

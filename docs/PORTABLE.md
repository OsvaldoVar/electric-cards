# Edición portátil sin conexión

## Para quien recibe el juego

1. Descarga `Electric-Cards.html` en una carpeta de tu equipo.
2. Ábrelo con un navegador moderno como Chrome, Edge, Firefox o Safari. Si se abre
   como texto, usa **Abrir con** y elige el navegador.
3. Pulsa **Empezar a jugar**. No hace falta instalar herramientas ni mantener conexión.

Envía el archivo descargado, no únicamente un enlace a una ruta `file://` de tu equipo.
Las vistas previas de correo, mensajería y servicios de archivos pueden bloquear
JavaScript: descarga el HTML antes de abrirlo. En móviles, algunos gestores de
archivos usan vistas previas que no ejecutan aplicaciones web; en ese caso utiliza
la edición web publicada o un navegador que admita archivos locales.

El archivo contiene el juego completo: cinco etapas, 40 lecciones, cinco retos,
diez componentes, editor y tutoriales. Los enlaces de navegación usan `#/levels`,
`#/puzzle/1`, etc. Puedes recargar una pantalla sin servidor. La edición portátil
mantiene esas rutas hash también si se sirve por HTTP desde una carpeta o intranet;
no requiere reglas de redirección del servidor.

## Progreso y privacidad

El guardado pertenece al navegador y al lugar donde se abre el archivo, no al HTML.
Compartirlo no comparte tus partidas. Mantén el archivo en la misma ubicación y
utiliza el mismo navegador si quieres conservar tu progreso. Renombrarlo, moverlo,
abrirlo en otro perfil o borrar los datos del navegador puede dejar el guardado anterior
inaccesible. El comportamiento de `localStorage` para `file://` depende del navegador.

En modo privado o con el almacenamiento bloqueado puedes seguir jugando, pero el
progreso puede no sobrevivir al cierre. El juego avisa cuando detecta que no puede
guardar. No envía partidas a un servidor ni sincroniza entre dispositivos.

## Generar y comprobar

Solo quien genera el archivo necesita Node.js 22.12+ o 24 y npm:

```sh
npm ci
npm run build:portable
npm run test:portable
```

La salida para compartir es `dist-portable/Electric-Cards.html`. No hacen falta
`assets/`, fuentes, imágenes ni `node_modules` junto a ella. Las licencias incluidas
forman parte del HTML: no las elimines al distribuirlo.

La prueba portátil copia únicamente el HTML, lo renombra con espacios y lo abre por
`file://` en un contexto de Chromium sin red. Comprueba navegación, recarga,
construcción y validación de un circuito, guardado, simuladores de memoria,
ilustraciones, fuentes, tema, almacenamiento bloqueado y tamaños entre 360 y 1920 px.
Dos casos adicionales comprueban el mismo HTML en un origen HTTP mediante una
respuesta interceptada, con navegación, recarga y simulador. No levanta ningún
servidor. Los resultados ejecutados y los límites reales están
en [TESTING.md](TESTING.md); soporte esperado no equivale a prueba física en cada SO.

## Edición web y desarrollo

`npm run dev`, `npm run build` y `npm run preview` conservan la edición web con rutas
habituales y recursos separados. El empaquetado portátil es una salida adicional,
no un reemplazo de la arquitectura modular del código fuente. Consulta
[ARCHITECTURE.md](ARCHITECTURE.md) y [DEPLOYMENT.md](DEPLOYMENT.md).

CI comprueba ambas ediciones y adjunta el HTML como artefacto cuando todas las
pruebas aprueban. Ejecutar comandos locales no publica archivos ni crea una release
en GitHub automáticamente.

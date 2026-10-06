# Ejecución y publicación

Electric Cards es una SPA estática. No necesita backend, base de datos,
autenticación ni variables de entorno secretas. El guardado pertenece al
navegador del jugador y al origen donde se abre la aplicación.

## Desarrollo local

Requiere Node.js 22.12+; se recomienda Node.js 24.

```sh
git clone https://github.com/OsvaldoVar/electric-cards.git
cd electric-cards
npm ci
npm run dev
```

El repositorio es privado: utiliza una cuenta de GitHub con acceso. Vite muestra
las direcciones local y de red. Para probar desde un celular, conecta ambos
dispositivos a la misma red y permite el puerto del servidor en el firewall.

## Producción local

```sh
npm run lint
npm run test
npm run build
npm run preview
```

La build genera `dist/`. El comando preview permite comprobar esta build;
no es un servidor de producción permanente. El servidor de publicación debe
devolver `index.html` para rutas de la aplicación que no sean archivos.

## Vercel

1. En Vercel, importa `OsvaldoVar/electric-cards` desde la cuenta autorizada de
   GitHub.
2. Mantén el directorio raíz del repositorio y selecciona el preset Vite.
3. Usa Node.js 24, `npm ci` como instalación y `npm run build` como build.
4. Usa `dist` como directorio de salida. No añadas variables secretas.
5. Publica y comprueba el inicio, `/levels`, `/puzzle/1`, `/learn` y
   `/learn/AND`, abriendo cada ruta directamente y recargando.

`vercel.json` incluye el fallback de rutas de la SPA. Las futuras actualizaciones
de `main` pueden generar despliegues con la integración normal de Vercel.
Este repositorio incluye la configuración; todavía no se ha desplegado.

## Comprobar una publicación

- Completa el primer nivel y recarga para comprobar el guardado.
- Construye un circuito únicamente con toques en un celular.
- Revisa el tablero y los controles a 360, 768, 1366 y 1920 px de ancho.
- Comprueba que una ruta directa funciona sin devolver un 404 del servidor.
- Consulta GitHub Actions para las pruebas automáticas y `TESTING.md` para
  los límites conocidos de la verificación.

Cambiar el dominio o limpiar los datos del navegador no transfiere el progreso.
El progreso y los borradores no se sincronizan entre dispositivos.

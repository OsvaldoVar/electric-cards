# Documentación de Electric Cards

Documentación vigente del juego educativo de lógica digital. La interfaz está en español; los contratos técnicos conservan los nombres del código.

## Guías por tarea

| Necesidad                             | Documento                                          |
| ------------------------------------- | -------------------------------------------------- |
| Instalar y comenzar a jugar           | [README del proyecto](../README.md)                |
| Entender el alcance y las reglas      | [Especificación](SPEC.md)                          |
| Modificar el motor, estado o guardado | [Arquitectura](ARCHITECTURE.md)                    |
| Crear niveles y retos                 | [Autoría de niveles](LEVELS.md)                    |
| Mantener los mini tutoriales          | [Tutoriales](TUTORIALS.md)                         |
| Mantener interacción y diseño         | [Interfaz](UI.md) y [sistema visual](../DESIGN.md) |
| Ejecutar pruebas y consultar límites  | [Verificación](TESTING.md)                         |
| Preparar una publicación              | [Despliegue](DEPLOYMENT.md)                        |
| Consultar pendientes                  | [Hoja de ruta](ROADMAP.md)                         |
| Consultar cambios entregados          | [Registro de cambios](../CHANGELOG.md)             |

## Organización y mantenimiento

Estos documentos describen el comportamiento actual. El [historial](history/README.md) conserva decisiones, resultados y checkpoints anteriores; no define el contrato vigente. Las capturas de `screenshots/` pueden corresponder a versiones anteriores.

Al modificar una función, actualiza su contrato, la guía correspondiente y el registro de cambios en el mismo commit. Registra únicamente pruebas ejecutadas, separando resultados de limitaciones. Mantén enlaces relativos válidos y evita duplicar inventarios o reglas que ya tienen un documento de referencia.

Las reglas de contribución para personas y agentes están en [AGENTS.md](../AGENTS.md). El código y las pruebas determinan el comportamiento ejecutable; la documentación debe mantenerse sincronizada con ellos.

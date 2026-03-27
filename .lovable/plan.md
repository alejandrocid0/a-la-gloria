
## Verificación actual

He revisado el estado real antes de ejecutar nada y ahora mismo el punto de partida es este:

- Hoy hay **73 partidas completadas** y **5 en `in_progress`**
- En la última comprobación, las **5 ya están por encima de 10 minutos**, así que son candidatas claras a limpieza manual
- La función backend de envío de resultados está configurada correctamente a nivel de infraestructura (`submit-game` con validación JWT desactivada en infraestructura y validación en código)
- En los logs HTTP recientes de `submit-game` solo aparecen respuestas **200 OK**
- No aparecen **401/500** recientes en esa función
- Los logs internos de la función solo muestran eventos normales de arranque/parada, sin errores útiles

## Conclusión provisional

Ahora mismo **sí hay usuarios bloqueados por partidas abandonadas**.

Pero, con la evidencia actual, **no parece que el fallo principal esté en `submit-game` devolviendo errores del servidor**. Lo más probable es esto:

```text
usuario inicia partida
-> se crea fila games = in_progress
-> el usuario abandona / recarga / pierde conexión / cierra app
-> nunca llega la llamada final de submit-game
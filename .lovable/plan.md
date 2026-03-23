
Objetivo: corregir el desfase para que el gráfico de “7 días” muestre exactamente 7 puntos (6 días anteriores + hoy) y el de “30 días” exactamente 30 puntos (29 anteriores + hoy), eliminando el día extra de la izquierda y evitando que se sume también en los resúmenes inferiores.

Plan

1. Revisar y corregir el cálculo de rangos en `src/components/admin/ActivityChart.tsx`
- Mantener la lógica conceptual actual:
  - 7d = hoy y los 6 días anteriores
  - 30d = hoy y los 29 días anteriores
- Cambiar la forma en que se construyen `p_start_date` y `p_end_date` para no perder un día al serializar fechas.

2. Eliminar la causa real del bug
- Ahora mismo el componente:
  - crea fechas con `new Date(todayStr + "T00:00:00")`
  - luego las convierte con `toISOString().split("T")[0]`
- Eso desplaza la fecha un día hacia atrás al pasar por UTC cuando la medianoche en España todavía es “el día anterior” en UTC.
- Voy a sustituir esa conversión por una generación de strings de fecha “puros” en formato `YYYY-MM-DD`, sin usar `toISOString()` para los parámetros del RPC.

3. Aplicar la corrección también al periodo comparativo
- Ajustar igual la consulta `prevTimelineData`, porque el resumen inferior compara contra el bloque anterior.
- Debe quedar así:
  - 7d actual: hoy-6 → hoy
  - 7d previo: hoy-13 → hoy-7
  - 30d actual: hoy-29 → hoy
  - 30d previo: hoy-59 → hoy-30

4. Mantener el backend tal como está salvo que vea una inconsistencia adicional
- La función `get_daily_activity_stats` ya trabaja con fechas inclusivas y con zona `Europe/Madrid`.
- Por lo que he revisado, el problema no está en SQL sino en cómo el frontend le manda la fecha de inicio.

5. Asegurar que el gráfico y los resúmenes queden alineados
- No hace falta tocar el cálculo de los totales inferiores si la fuente `timelineData` ya llega con el rango correcto.
- Al corregir ese rango:
  - desaparece el punto extra a la izquierda
  - dejan de sumarse esos datos extra en “nuevos registros” y “partidas jugadas”

Validación prevista
- Vista 7 días:
  - 7 puntos exactos
  - el primero será el más antiguo visible
  - el séptimo será hoy
- Vista 30 días:
  - 30 puntos exactos
  - el primero será el más antiguo visible
  - el trigésimo será hoy
- Los totales de abajo deberán coincidir exactamente con esos mismos 7 o 30 días, sin el día adicional.

Detalles técnicos
- Archivo afectado principal: `src/components/admin/ActivityChart.tsx`
- Causa raíz detectada:
  ```text
  Fecha España a medianoche -> Date local -> toISOString() -> UTC
  ```
  Ese paso convierte, por ejemplo, `2026-03-23 00:00` en España en algo como `2026-03-22T23:00:00.000Z`, y al cortar la parte de fecha termina mandando `2026-03-22`.
- Solución técnica:
  - trabajar con fechas de calendario, no con instantes UTC
  - generar `p_start_date` / `p_end_date` con formateo local estable (`yyyy-MM-dd`) en vez de `toISOString().split("T")[0]`

Resultado esperado tras implementarlo
- Se quitará exactamente un día por la izquierda en ambas vistas.
- El gráfico dejará de enseñar 8 y 31 puntos.
- Los sumatorios inferiores ya no estarán inflados por ese día extra.

## Resumen

Añadir un selector **Semanal / Global** en la página de Ranking. Por defecto se abre en **Semanal**. Suma todas las partidas jugadas desde el lunes hasta el domingo (Europe/Madrid) por cada jugador. Top 100, mismo diseño visual.

## 1. Backend — Migración

Crear dos funciones SQL `SECURITY DEFINER` (mismo patrón que `get_top_ranking` y `get_user_ranking_position`):

### `get_top_weekly_ranking(limit_count int default 100)`

Devuelve: `rank_position`, `id`, `name`, `hermandad`, `weekly_points`, `games_this_week`.

Lógica:
- Calcular lunes 00:00 (Europe/Madrid): `date_trunc('week', (now() AT TIME ZONE 'Europe/Madrid')::date)`.
- Sumar `total_score` de `games` donde `(created_at AT TIME ZONE 'Europe/Madrid')::date` está entre el lunes y el domingo (lunes + 6 días).
- Solo `status = 'completed'`.
- Excluir admins (igual que el global).
- Solo usuarios con al menos una partida en el rango (los que tengan 0 no aparecen).
- Orden: `weekly_points DESC`, desempate por `games_this_week DESC` y `name ASC`.
- Limitar a `limit_count`.

### `get_user_weekly_ranking_position(user_uuid uuid)`

Devuelve: `rank_position`, `name`, `weekly_points`, `total_users` (jugadores con puntos esta semana).

Mismo cálculo, pero rankeando todos los jugadores con puntos esta semana y devolviendo solo la fila del usuario solicitado. Si el usuario no ha jugado esta semana, no devuelve filas (el frontend lo trata como "sin posición esta semana").

## 2. Frontend — `src/pages/Ranking.tsx`

- Añadir estado `mode: "weekly" | "global"`, valor inicial `"weekly"`.
- Bajo el header, añadir un componente **Tabs** (shadcn) con dos pestañas: **Semanal** y **Global**, ancho completo, mismo estilo que las pestañas del panel admin.
- Duplicar las queries existentes:
  - Global: las dos actuales (`get_top_ranking`, `get_user_ranking_position`) — sin cambios.
  - Semanal: dos nuevas usando las RPCs del paso 1.
- Renderizar la lista activa según `mode`. Reutilizar el mismo render de tarjetas (medallas, fila destacada, posición fija inferior).
- En modo semanal, los puntos mostrados son `weekly_points`.
- Empty state cuando la semanal está vacía: tarjeta sencilla con el texto "Aún nadie ha sumado puntos esta semana — ¡sé el primero!".

## 3. Sin cambios en juego ni en otras pantallas

El cálculo se hace en lectura sobre `games`. No hay que tocar cómo se guardan las partidas.

---

¿Procedemos?

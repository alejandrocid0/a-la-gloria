

## Plan: Todos los KPIs con partidas completadas reales

### Problema
- El KPI "Partidas" muestra `allGamesInDb` (incluye abandonadas) en vez de `totalGames` (completadas).
- El gráfico de actividad (`get_daily_activity_stats`) cuenta TODAS las partidas de la tabla `games`, incluyendo abandonadas.
- El KPI "Diarias" (`avgDailyGames`) ya usa `totalGames` (completadas), así que ese sí es correcto.

### Cambios

**1. `StatsCards.tsx`** — Volver a las 5 tarjetas originales
- Eliminar tarjeta "Abandonadas"
- La tarjeta "Partidas" mostrará `stats.totalGames` (completadas reales)
- Quitar `allGamesInDb` y `abandonedGames` de la interfaz

**2. `AdminDashboard.tsx`** — Limpiar queries sobrantes
- Eliminar las dos queries extra a la tabla `games` (`allGamesCount`, `abandonedCount`)
- Eliminar `allGamesInDb` y `abandonedGames` del return

**3. Migración SQL** — Filtrar `get_daily_activity_stats()` solo completadas
- Añadir `WHERE status = 'completed'` en la subquery `daily_games` para que el gráfico diario solo cuente partidas terminadas

### Resultado
- KPI "Partidas" = solo completadas
- KPI "Diarias" = promedio solo de completadas (ya lo era)
- Gráfico de actividad = solo partidas completadas por día
- La línea de referencia (promedio) será coherente




## Plan: KPIs de partidas totales vs abandonadas

La lógica es simple:
- **Partidas totales** = registros en la tabla `games` (todos los status)
- **Partidas completadas** = suma de `games_played` de los perfiles (las que pasaron por `submit-game`)
- **Abandonadas** = totales - completadas

### Cambios

1. **`AdminDashboard.tsx`**: Ya tenemos `allGamesInDb` (total en tabla games) y `totalGames` (suma de profiles). Solo hay que asegurar que se pasan correctamente.

2. **`StatsCards.tsx`**: Modificar las tarjetas:
   - Cambiar "Válidas" → **"Partidas"** mostrando `allGamesInDb` como número principal y "totales" como subtexto
   - Cambiar "Abandonadas" → **"Abandonadas"** mostrando `allGamesInDb - totalGames` como número principal y "completadas: X" como subtexto

No se necesitan cambios en base de datos ni nuevas queries.


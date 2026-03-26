

# Corregir `verify_jwt` y limpiar partidas bloqueadas

## Cambios

### 1. `supabase/config.toml` — Cambiar `verify_jwt` a `false`

Las tres funciones (`check-answer`, `submit-game`, `submit-tournament-round`) pasan a `verify_jwt = false`. Ya validan el JWT en su propio código, así que la seguridad no cambia.

### 2. Migración SQL — Eliminar partidas `in_progress` de hoy

Eliminar (no abandonar) las filas bloqueadas para que los usuarios puedan volver a jugar hoy:

```sql
DELETE FROM games
WHERE date = (NOW() AT TIME ZONE 'Europe/Madrid')::DATE
  AND status = 'in_progress'
  AND created_at < NOW() - INTERVAL '10 minutes';
```

Se usa DELETE en vez de UPDATE a `abandoned` porque así los usuarios pueden crear una nueva partida hoy mismo (la restricción `(user_id, date)` se libera).

## Sin cambios en el frontend

No se toca ningún archivo de código. Solo configuración y limpieza de datos.

## Resultado

- Las Edge Functions vuelven a funcionar inmediatamente tras el despliegue
- Los usuarios bloqueados hoy pueden volver a jugar
- Todo queda estable para Semana Santa


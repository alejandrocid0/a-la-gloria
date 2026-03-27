

# Correcciones para garantizar estabilidad en Semana Santa

## Diagnóstico

### Estado actual (27 marzo)
- **62 completadas, 23 bloqueadas** hoy — ratio anormal
- Ayer (26 mar): 113 completadas, 26 bloqueadas — también anormal
- Días anteriores (20-22 mar): 0 bloqueadas. Días 23-25: 2-6 bloqueadas (normal)

### Causa raíz
El cambio de `verify_jwt` se aplicó el 26, pero las partidas que se iniciaron durante la ventana del fallo (antes del fix) quedan como `in_progress` permanentemente hasta que el cron las limpie.

### Problemas del cron actual
1. **Solo se ejecuta los lunes** (`0 3 * * 1`) → las 26 partidas bloqueadas de ayer no se limpiarán hasta el lunes 30
2. **Solo limpia días anteriores** (`date < today`) → si un usuario pierde conexión hoy, queda bloqueado todo el día
3. Durante Semana Santa (28 mar – 6 abr) el cron solo se ejecutará el lunes 30, dejando partidas bloqueadas de martes a domingo sin limpiar

## Plan de cambios

### 1. Migración SQL — Limpiar partidas bloqueadas ahora

Eliminar todas las partidas `in_progress` con más de 10 minutos de antigüedad (tanto de hoy como de ayer). Esto libera a los ~49 usuarios bloqueados para que puedan volver a jugar.

```sql
DELETE FROM games
WHERE status = 'in_progress'
AND created_at < NOW() - INTERVAL '10 minutes';
```

### 2. Migración SQL — Cambiar el cron a ejecución diaria

Modificar la frecuencia del cron job de "lunes a las 3:00" a **"todos los días a las 3:00 (hora Madrid)"**:

```sql
SELECT cron.unschedule(1);

SELECT cron.schedule(
  'cleanup-abandoned-games',
  '0 3 * * *',
  'SELECT public.cleanup_abandoned_games()'
);
```

### 3. Migración SQL — Actualizar la función de limpieza

Modificar `cleanup_abandoned_games` para que también limpie partidas del día actual que lleven más de 10 minutos:

```sql
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_games()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.games 
  WHERE status = 'in_progress' 
  AND created_at < NOW() - INTERVAL '10 minutes';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
```

Cambios respecto a la versión actual:
- Elimina la restricción `date < today` → ahora limpia también las del día actual si llevan >10 min
- Elimina la verificación de `has_role(auth.uid(), 'admin')` → el cron se ejecuta como `postgres` y no tiene `auth.uid()`
- Mantiene `SECURITY DEFINER` para que el cron pueda ejecutarla

### Sin cambios en frontend

No se toca ningún archivo de código. Solo base de datos y cron.

## Resultado

- Los ~49 usuarios bloqueados (26+23) se liberan inmediatamente
- El cron limpia partidas abandonadas **cada día** a las 3:00 AM, no solo los lunes
- Si un usuario pierde conexión, su partida se limpiará a las 3:00 AM del mismo día (o del siguiente si es tarde)
- Semana Santa cubierta sin intervención manual

## Nota sobre anti-trampas

La limpieza solo afecta a partidas con >10 minutos en `in_progress`. Una partida normal dura como máximo 2.5 minutos (10 preguntas × 15 segundos). Si alguien abandona intencionalmente, sigue sin poder jugar hasta que el cron se ejecute (máximo 24h), manteniendo la protección anti-exploits.




## Fix: Recursion infinita en RLS de tournament_participants

### Problema

La politica SELECT de `tournament_participants` dice:

```sql
EXISTS (
  SELECT 1 FROM tournament_participants tp
  WHERE tp.tournament_id = tournament_participants.tournament_id
    AND tp.user_id = auth.uid()
)
```

Esto consulta `tournament_participants` dentro de su propia politica RLS, causando recursion infinita. Error 500 en cada consulta a esta tabla.

### Solucion

Reemplazar la politica recursiva por una simple: cada usuario autenticado puede ver sus propias filas (`auth.uid() = user_id`). Para ver datos de otros participantes del mismo torneo, ya existe la funcion `get_tournament_ranking` (SECURITY DEFINER) que bypasea RLS.

### Cambio unico — Migracion SQL

1. DROP la politica `"Users can view tournament participants"`
2. CREATE nueva politica: `auth.uid() = user_id` para SELECT

Esto corrige el error 500 que aparece repetidamente en los logs y permite que la pagina de torneos cargue las participaciones del usuario correctamente.

No se necesitan cambios en el frontend.




## Fix: Conteo de participantes visible para todos

### El problema

La query en `Tournament.tsx` (línea 84) hace un `SELECT tournament_id FROM tournament_participants`. La política RLS de esa tabla solo permite a cada usuario ver **sus propias** filas (`auth.uid() = user_id`). Resultado: un usuario normal ve "0" o "1" participantes en cada torneo, nunca el total real.

### La solución

**1. Nueva función RPC `get_tournament_participant_counts`**

```sql
CREATE FUNCTION get_tournament_participant_counts()
RETURNS TABLE(tournament_id uuid, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
-- Cuenta todos los participantes por torneo, sin restricción RLS
SELECT tournament_id, COUNT(*) FROM tournament_participants GROUP BY tournament_id
```

**2. Cambiar la query en `Tournament.tsx`**

Reemplazar el SELECT directo por una llamada a la RPC:

```typescript
const { data: participantCounts } = useQuery({
  queryKey: ["tournament-participant-counts"],
  queryFn: async () => {
    const { data } = await supabase.rpc("get_tournament_participant_counts");
    // Convertir array [{tournament_id, count}] a Record<string, number>
    const counts: Record<string, number> = {};
    for (const row of data) counts[row.tournament_id] = row.count;
    return counts;
  },
  refetchInterval: 10000, // Bonus: auto-refresco cada 10s
});
```

### Resultado esperado

| Antes | Después |
|-------|---------|
| Usuario normal ve "0 participantes" o "1 participante" | Ve el total real: "42 participantes" |
| Admin ve el conteo correcto | Sin cambios |
| No se auto-actualiza | Se refresca cada 10 segundos |


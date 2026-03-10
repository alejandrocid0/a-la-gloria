

## Plan: Pantalla de participantes pre-torneo

### Problema
Cuando un jugador se une y `current_round = 0`, va al ranking que muestra "CLASIFICACIÓN" con podio vacío. Necesitamos una vista de **lista de participantes** ordenada por orden de llegada, con un botón "Jugar Ronda 1" deshabilitado que se activa cuando el admin desbloquea la ronda.

### Cambios

**1. Nueva función RPC `get_tournament_participants_list`**

Necesaria porque la RLS de `tournament_participants` solo permite ver la propia participación. Esta función (Security Definer) devuelve todos los participantes de un torneo ordenados por `joined_at`, accesible para cualquier participante.

**2. Modificar `src/pages/TournamentRanking.tsx`**

Detectar si `current_round === 0` (torneo no iniciado):

- **Header**: Cambiar "CLASIFICACIÓN" por "PARTICIPANTES" y el subtítulo por "Esperando a que comience el torneo"
- **Lista**: Mostrar participantes numerados por orden de llegada (sin puntos, sin podio) usando la nueva RPC
- **Botón inferior**: "Jugar Ronda 1" deshabilitado con icono de candado. Polling cada 5s detecta cuando `current_round >= 1` y lo habilita automáticamente

Cuando `current_round >= 1`, se muestra el ranking normal actual sin cambios.

### Detalles técnicos

```sql
-- Nueva RPC
CREATE FUNCTION get_tournament_participants_list(p_tournament_id uuid)
RETURNS TABLE(user_id uuid, name text, hermandad text, joined_at timestamptz, position bigint)
-- Valida que el caller sea participante
-- ORDER BY joined_at ASC
-- ROW_NUMBER() para numerar
```

En el componente:
```typescript
// Condición principal
const isPreStart = currentRound === 0;

// Si pre-start: query participants_list, mostrar UI de espera
// Si started: query ranking (actual), mostrar podio + clasificación
```


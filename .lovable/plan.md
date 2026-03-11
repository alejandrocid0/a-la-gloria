

## Plan: Mover badge al contenido y clasificación abierta en torneos finalizados

### 1. Mover badge de estado de la imagen al contenido (`TournamentCard.tsx`)

- Eliminar el `<span>` con posición `absolute` que está sobre la imagen (líneas 83-91).
- Colocarlo en la zona de contenido, en la misma línea que el nombre del torneo (línea 106), a la derecha del `<h3>`.

```text
┌──────────────────────────┐
│  [Imagen sin badge]      │
├──────────────────────────┤
│ MAR │ Nombre   [Próximo] │  ← badge inline junto al nombre
│ 11  │ descripción...     │
│16:45│ 👤 12 · 📅 11/3    │
└──────────────────────────┘
```

### 2. Botón "Ver clasificación" para torneos finalizados (`TournamentCard.tsx`)

- Si `status === "completed"`: el botón siempre dice "Ver clasificación" y navega a `/torneo/:id/ranking`. No muestra "Unirse al torneo" ni abre el diálogo de código.
- Lógica del `handleButtonClick`: añadir condición prioritaria `if (status === "completed")` → navegar directamente al ranking.

### 3. Ranking accesible para no-participantes en torneos completados

El RPC `get_tournament_ranking` lanza excepción si el usuario no es participante. Necesitamos una nueva función RPC `get_tournament_ranking_public` que permita ver la clasificación de torneos completados sin ser participante.

**Nueva función SQL:**
- `get_tournament_ranking_public(p_tournament_id uuid)`: igual que `get_tournament_ranking` pero solo funciona cuando el torneo tiene `status = 'completed'` y no exige ser participante. Devuelve la misma estructura.

**Cambio en `TournamentRanking.tsx`:**
- Detectar si el usuario es participante del torneo.
- Si no lo es y el torneo está completado, usar `get_tournament_ranking_public` en vez de `get_tournament_ranking`.
- Ocultar botones de jugar ronda; solo mostrar "Volver a torneos".

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `TournamentCard.tsx` | Badge movido junto al nombre; botón siempre "Ver clasificación" si completado |
| `TournamentRanking.tsx` | Usar RPC público para torneos completados si el usuario no es participante |
| Nueva migración SQL | Crear `get_tournament_ranking_public` |


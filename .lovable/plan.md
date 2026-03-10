## Plan: Texto contextual del botón en TournamentCard

### Cambios

**1. Pasar `currentRound` del torneo al TournamentCard**

En `Tournament.tsx`, añadir la prop `currentRound={t.current_round}` al componente TournamentCard.

**2. Modificar `TournamentCard.tsx**`

Añadir prop `currentRound?: number` y calcular el texto del botón según el estado:

```typescript
const buttonLabel = !isJoined
  ? "Unirse al torneo"
  : currentRound === 0
    ? "Ver participantes"
    : roundsCompleted >= TOTAL_ROUNDS || status === "completed"
      ? "Ver clasificación"
      : "Jugar Torneo";
```

Solo se toca el texto del botón. La navegación sigue siendo la misma (siempre va a `/torneo/:id/ranking`, que ya maneja internamente qué mostrar).

### Resultado

- **No unido**: "Unirse al torneo" (sin cambios)
- **Unido, ronda 0**: "Ver participantes"
- **Unido, torneo activo con rondas pendientes**: "Jugar ronda X (X = número de la siguiente ronda desbloqueada)"
- **Unido, todas las rondas jugadas o torneo finalizado**: "Ver clasificación"
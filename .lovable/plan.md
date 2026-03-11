

## Plan: Botón "Jugar Ronda X" en la pantalla de resultados

### Situación actual
- **TournamentRoundResult**: Solo muestra "Ver clasificación". El jugador debe ir al ranking para encontrar el botón de jugar la siguiente ronda.
- **TournamentCard** (página /torneo): Ya muestra "Jugar ronda X" cuando hay una ronda pendiente. No necesita cambios.

### Cambio propuesto

**`src/pages/TournamentRoundResult.tsx`** — Añadir un botón "Jugar Ronda X" debajo de "Ver clasificación" cuando la siguiente ronda está desbloqueada:

```text
┌──────────────────────────┐
│    Ver clasificación     │  ← botón dorado (cta) existente
└──────────────────────────┘
┌──────────────────────────┐
│    Jugar Ronda 2  ▶      │  ← NUEVO botón morado (primary)
└──────────────────────────┘
```

- Se muestra solo cuando `isNextRoundUnlocked` es `true` (el admin ya desbloqueó la siguiente ronda)
- Navega directamente a `/torneo/:id/jugar/:nextRound`
- Usa `variant="default"` (morado) con `size="xl"` para que destaque pero sea secundario al ranking
- Si la ronda no está desbloqueada, sigue apareciendo el mensaje "Esperando..." como ahora
- Si es ronda 5 completada y torneo finalizado, no se muestra (ya está cubierto por `isTournamentCompleted`)

No se necesitan cambios en otros archivos.


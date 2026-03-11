

## Plan: Clasificación Final tras Ronda 5

### Problema actual
- **TournamentRanking.tsx**: Cuando el torneo se finaliza, el título dice "CLASIFICACIÓN" y el subtítulo "Clasificación final", pero si el jugador llega justo después de completar ronda 5, puede ver "Ronda actual: 5" hasta que el admin pulse finalizar. Una vez finalizado, funciona bien pero el título principal no cambia.
- **TournamentRoundResult.tsx**: Tras completar ronda 5, sigue mostrando "Ronda 5" en el header y "Esperando a que se desbloquee la siguiente ronda..." abajo, cuando ya no hay más rondas.
- **TournamentLive.tsx**: Funciona correctamente cuando `status === "completed"`.

### Cambios

**`src/pages/TournamentRanking.tsx`**
- Línea 122: Cambiar título de "CLASIFICACIÓN" a "CLASIFICACIÓN FINAL" cuando `isTournamentCompleted`.
- Línea 130: Ya dice "Clasificación final" — cambiar a "Torneo finalizado" para el subtítulo.
- Cuando `isTournamentCompleted` y el usuario es participante, el botón inferior debe ser "Volver a torneos" (actualmente solo lo muestra si `!isParticipant` — ya está cubierto en línea 166 con `isTournamentCompleted || !isParticipant`, correcto).

**`src/pages/TournamentRoundResult.tsx`**
- Detectar si `roundNumber === 5` (última ronda). Si además `isTournamentCompleted`:
  - Header: cambiar "Ronda 5" → "Ronda Final" y "¡Ronda Completada!" → "¡Torneo Completado!"
  - Eliminar el mensaje "Esperando siguiente ronda" (ya lo hace en línea 111, correcto).
- Si `roundNumber === 5` pero aún no está completado: mostrar "Esperando clasificación final..." en vez de "Esperando siguiente ronda".

**`src/pages/TournamentLive.tsx`**
- Ya maneja correctamente el estado `completed` con "¡Torneo finalizado!". Sin cambios necesarios.


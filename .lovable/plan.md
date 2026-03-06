

## Flujo interior del torneo — pantallas visuales (solo UI, sin lógica real)

Basado en los mockups y tu descripción, el flujo de cada ronda del torneo es:

1. **Jugar ronda** → misma UI que partida diaria (GameHeader + QuestionCard, 10 preguntas, feedback verde/rojo)
2. **Resultado de ronda** → pantalla tipo Results pero con header "¡Ronda Completada!" y botón dorado "Continuar" (bloqueado hasta que admin autorice vía `current_round`)
3. **Ranking del torneo** → podio top 3 (mockup "Ganadores") + lista del resto, con botón dorado "Siguiente ronda" abajo

### Archivos a crear

**1. `src/pages/TournamentPlay.tsx`** — Orquestador de la partida de torneo
- Reutiliza `GameHeader` y `QuestionCard` exactamente igual que `Play.tsx`
- Recibe `tournamentId` y `roundNumber` como params de ruta
- Al terminar las 10 preguntas, navega a `/torneo/:id/resultado` con los datos en state
- Por ahora usa preguntas mock (placeholder) ya que no conectamos lógica

**2. `src/pages/TournamentRoundResult.tsx`** — Resultado de ronda
- Diseño idéntico a `Results.tsx` pero:
  - Header: "¡Ronda Completada!" (como mockup Partida_1.png)
  - Tarjeta de puntuación + Aciertos + Promedio (mismo layout)
  - Botón dorado "Continuar" → si la siguiente ronda no está desbloqueada (`current_round` del torneo), mostrar botón deshabilitado con texto "Esperando siguiente ronda..."
  - Si está desbloqueada → navega a `/torneo/:id/ranking`

**3. `src/pages/TournamentRanking.tsx`** — Ranking/Ganadores del torneo
- Header morado "GANADORES" con botón X para cerrar
- **Podio top 3**: columnas doradas escalonadas (1°, 2°, 3°) con avatar, nombre y hermandad
- **Lista 4° en adelante**: tarjetas con posición, nombre, hermandad y puntuación
- Botón dorado abajo: "Siguiente ronda" (si hay más rondas) o "Volver a torneos" (si es la última)
- Datos mock por ahora (nombres placeholder)

### Rutas nuevas en `App.tsx`

```
/torneo/:id/jugar/:round   → TournamentPlay
/torneo/:id/resultado      → TournamentRoundResult
/torneo/:id/ranking        → TournamentRanking
```

### Lo que NO se implementa (solo visual)

- No se conecta a `tournament_questions`, `tournament_answers` ni `tournament_participants`
- No se validan respuestas con el servidor
- Los datos de ranking y resultado son mock/placeholder
- El botón "Continuar" comprueba visualmente `current_round` pero no ejecuta lógica real
- El flujo completo es navegable para ver cómo queda


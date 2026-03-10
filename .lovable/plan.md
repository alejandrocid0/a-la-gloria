## Plan: Redirección automática tras unirse a un torneo

### Cambio

Un único cambio en `JoinTournamentDialog.tsx`: tras insertar al participante exitosamente, usar `useNavigate` para redirigir a `/torneo/{id}/ranking` (que ya muestra la lista de participantes cuando `current_round === 0`).

### Detalle técnico

En `JoinTournamentDialog.tsx`:

1. Importar `useNavigate` de `react-router-dom`
2. En `handleJoin`, después del insert exitoso y antes de cerrar el diálogo, añadir:
  ```typescript
   navigate(`/torneo/${tournament.id}/ranking`);
  ```

No hace falta tocar nada más. La pantalla `TournamentRanking` ya maneja correctamente todos los estados:

- **Ronda 0**: muestra "PARTICIPANTES" con botón bloqueado "Jugar Ronda 1" hasta que se desbloquee y puedan pulsarlo para jugar la ronda
- **Ronda activa**: muestra "CLASIFICACIÓN" con botón bloqueado "Jugar Ronda X" y abierto cuando la ronda se desbloquee
- **Torneo completado**: muestra clasificación final con "Volver a torneos"
- **Botón X (cerrar)**: navega a `/torneo`, donde la tarjeta ya muestra el botón contextual correcto gracias al cambio anterior

### Flujo completo resultante

```text
Lista torneos → "Unirse" → Código → ✓ Redirige a /torneo/:id/ranking
  ↓ (ronda 0: lista participantes, botón bloqueado)
  ↓ (admin desbloquea ronda 1)
  ↓ Jugar Ronda 1 → Resultados → Ranking (botón ronda 2 bloqueado)
  ↓ ...repite hasta ronda 5...
  ↓ Clasificación final
  ↓ "Volver a torneos" o X → Lista torneos (tarjeta actualizada)
```


## Plan: Implementacion completa del sistema de Torneos

### Reglas confirmadas

- **Flujo obligatorio**: Ronda → Resultado → Ranking → Siguiente ronda
- **Orden estricto**: Debe jugar ronda N antes de N+1
- **Un intento** por ronda
- **Puntuación**: Igual que partida diaria (velocidad x acierto), acumulativa
- **Espera**: Puede quedarse en ranking con polling O salir a la lista de torneos y volver
- **"Jugar Torneo"** desde tarjeta → siempre al ranking del torneo (desde ahi ve su progreso y accede a la siguiente ronda)
- **Ranking**: Muestra acumulado total + puntos de la ultima ronda

### Discrepancia detectada en la BD

El trigger `validate_tournament_answer` valida `selected_answer` entre 0-3, pero el sistema de partida diaria usa 1-4 (A=1, B=2, C=3, D=4). Hay que corregir el trigger para usar 0-4 (0=sin respuesta, 1-4=opciones), consistente con el juego diario.

---

### Paso a paso de implementacion

#### Paso 1 — Migracion de BD (correcciones)

- Corregir trigger `validate_tournament_answer`: rango `selected_answer` de 0 a 4 (no 0-3).
- Añadir politica RLS en `tournament_questions` para que participantes puedan leer las preguntas de su torneo (actualmente solo admins pueden leer, pero la funcion `get_tournament_round_questions` es SECURITY DEFINER asi que ya funciona — no se necesita politica extra).

#### Paso 2 — Edge Function `submit-tournament-round`

Nueva funcion backend que:
1. Recibe `{ tournamentId, roundNumber, answers[] }` con JWT del usuario.
2. Valida que el usuario es participante del torneo.
3. Valida que `roundNumber <= current_round` del torneo (ronda desbloqueada).
4. Valida que el usuario no haya respondido ya esa ronda (consulta `tournament_answers`).
5. Valida orden: si `roundNumber > 1`, comprueba que tenga respuestas de la ronda anterior.
6. Para cada respuesta, consulta `correct_answer` de la pregunta y calcula puntos (mismo calculo que `submit-game`: `Math.round(100 * timeLeft / 15)`).
7. Inserta filas en `tournament_answers` con `is_correct`, `points_earned`, `time_taken`.
8. Actualiza `tournament_participants`: suma `total_score` y incrementa `rounds_completed`.
9. Devuelve `{ score, correctAnswers, totalQuestions, roundNumber }`.

#### Paso 3 — Conectar `JoinTournamentDialog`

- Añadir estado para el codigo introducido.
- Al pulsar "Unirme", buscar torneo por `join_code`.
- Si existe y status != 'completed', insertar en `tournament_participants`.
- Pasar `tournamentId` y callback `onJoined` desde `TournamentCard`.
- Invalidar queries de participaciones.

#### Paso 4 — Conectar `TournamentCard` con navegacion

- Pasar `tournamentId` como prop.
- Cuando `isJoined=true` y pulsa "Jugar Torneo" → navegar a `/torneo/:id/ranking`.
- Ajustar `Tournament.tsx` para pasar los datos necesarios (contar participantes reales por torneo).

#### Paso 5 — Conectar `TournamentPlay` con datos reales

- Al montar, llamar a la funcion de BD `get_tournament_round_questions(tournamentId, roundNumber)` para obtener las preguntas reales.
- Verificar que el usuario puede jugar esta ronda (participante + ronda desbloqueada + no jugada ya).
- Sustituir mock por preguntas reales.
- Verificar respuestas con `check-answer` (ya existente, funciona igual).
- Al terminar las 10 preguntas, llamar a `submit-tournament-round`.
- Navegar a resultado con los datos del servidor.

#### Paso 6 — Conectar `TournamentRoundResult` con datos reales

- Recibe datos del servidor via `location.state`.
- Consultar `current_round` del torneo para saber si la siguiente ronda esta desbloqueada.
- Si `roundNumber < current_round` → boton "Continuar" activo.
- Si `roundNumber >= current_round` → boton deshabilitado "Esperando siguiente ronda..." con polling cada 10s.

#### Paso 7 — Conectar `TournamentRanking` con datos reales

- Consultar `tournament_participants` del torneo con JOIN a `profiles` para nombre y hermandad.
- Ordenar por `total_score` DESC.
- Mostrar acumulado total como puntuacion principal.
- Mostrar puntos de la ultima ronda al lado (consultar `tournament_answers` agrupado por ronda).
- Boton "Siguiente ronda":
  - Si `roundNumber < current_round` → activo, navega a `/torneo/:id/jugar/:nextRound`.
  - Si `roundNumber >= current_round` → deshabilitado con polling.
  - Si es la ultima ronda (5) y `status=completed` → "Volver a torneos".
- Permitir salir con X → vuelve a `/torneo`.

#### Paso 8 — Pantalla de torneo: estado del usuario

- En `Tournament.tsx`, al lado de cada torneo donde el usuario esta inscrito, mostrar su progreso (rondas completadas, puntuacion acumulada).
- Contar participantes reales por torneo (query a `tournament_participants`).

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `supabase/functions/submit-tournament-round/index.ts` | Crear (nuevo) |
| `src/components/tournament/JoinTournamentDialog.tsx` | Conectar logica de union |
| `src/components/tournament/TournamentCard.tsx` | Añadir `tournamentId`, navegacion |
| `src/pages/Tournament.tsx` | Pasar `tournamentId`, conteo real de participantes |
| `src/pages/TournamentPlay.tsx` | Reemplazar mock por datos reales + submit al servidor |
| `src/pages/TournamentRoundResult.tsx` | Polling de `current_round`, logica de desbloqueo |
| `src/pages/TournamentRanking.tsx` | Datos reales de participantes, doble puntuacion |
| Migracion SQL | Corregir trigger `validate_tournament_answer` |

### Orden de implementacion recomendado

1. Migracion BD (trigger) — sin esto las respuestas 1-4 fallarian
2. Edge Function `submit-tournament-round` — el backend debe estar listo antes del frontend
3. `JoinTournamentDialog` + `TournamentCard` — para poder unirse y navegar
4. `TournamentPlay` — conectar preguntas reales y envio de respuestas
5. `TournamentRoundResult` — polling de desbloqueo
6. `TournamentRanking` — datos reales y navegacion condicional
7. `Tournament.tsx` — progreso del usuario y conteo real


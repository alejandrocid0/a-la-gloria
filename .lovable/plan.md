

## Problemas criticos detectados y mejoras para torneos presenciales

He revisado todo el codigo y hay **2 bugs criticos de RLS** que romperan el ranking en produccion, ademas de algunas mejoras para el uso presencial en tiempo real.

---

### Bug 1 — El ranking no muestra datos de otros jugadores

`TournamentRanking.tsx` hace dos consultas cliente:

1. Consulta `profiles` con `.in("id", userIds)` para obtener nombres de todos los participantes.
2. Consulta `tournament_answers` para obtener puntos de la ultima ronda de todos los usuarios.

**Problema**: Las politicas RLS de `profiles` solo permiten ver el perfil propio (`auth.uid() = id`), y las de `tournament_answers` solo permiten ver las propias respuestas (`auth.uid() = user_id`). En produccion, cada usuario solo vera su propio nombre en el ranking; el resto aparecera como "Jugador" sin puntos de ronda.

**Solucion**: Crear una funcion `SECURITY DEFINER` que devuelva el ranking completo del torneo con nombres, hermandad, puntuacion total y puntos de la ultima ronda, todo en una sola llamada.

### Bug 2 — Los participantes no pueden ver el ranking de otros participantes (parcialmente)

La politica RLS de `tournament_participants` para SELECT usa una subconsulta recursiva que comprueba si el usuario actual es participante del mismo torneo. Esto deberia funcionar, pero la consulta de perfiles asociada falla por el Bug 1.

---

### Mejoras para uso presencial

**Polling mas agresivo**: Para un evento presencial donde la gente pasa de ronda en minutos, 10 segundos es aceptable. Pero podriamos reducirlo a **5 segundos** en las pantallas de espera (resultado y ranking) para que la transicion sea mas fluida.

**Invalidar cache al cambiar de pantalla**: El `staleTime` de 5 minutos del QueryClient puede causar que al volver al ranking no se vean los datos actualizados. Hay que invalidar las queries de torneo al navegar.

---

### Plan de cambios

#### 1. Migracion SQL — Funcion `get_tournament_ranking`

Crear una funcion `SECURITY DEFINER` que:
- Recibe `p_tournament_id` como parametro
- Valida que el usuario que llama es participante del torneo
- Devuelve: `user_id, name, hermandad, total_score, rounds_completed, last_round_score, position`
- Calcula `last_round_score` como la suma de `points_earned` en la ronda mas alta jugada por cada usuario

#### 2. Refactorizar `TournamentRanking.tsx`

- Reemplazar las 3 queries separadas (participants + profiles + answers) por una sola llamada a `get_tournament_ranking`
- Reducir `refetchInterval` a 5000ms
- Mantener la query de `tournament-status` separada (para polling del `current_round`)

#### 3. Reducir polling en `TournamentRoundResult.tsx`

- Cambiar `refetchInterval` de 10000 a 5000ms para deteccion mas rapida del desbloqueo de ronda

#### 4. Invalidar cache en navegacion

- En `TournamentRoundResult` al pulsar "Ver clasificacion", invalidar las queries de ranking antes de navegar
- En `TournamentCard` al pulsar "Jugar Torneo", invalidar queries de torneo

---

### Detalle tecnico de la funcion SQL

```text
get_tournament_ranking(p_tournament_id UUID)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  hermandad TEXT,
  total_score INT,
  rounds_completed INT,
  last_round_score INT,
  position BIGINT
)
```

La funcion:
1. Verifica que `auth.uid()` es participante del torneo
2. JOIN `tournament_participants` con `profiles` para nombre/hermandad
3. LEFT JOIN con subconsulta de `tournament_answers` agrupada por `user_id` para la ronda mas alta completada
4. Ordena por `total_score DESC` y asigna posicion con `ROW_NUMBER()`


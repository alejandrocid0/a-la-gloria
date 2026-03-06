

## Torneos: Diseño de base de datos y arquitectura completa

### Mecánica confirmada

- 5 rondas de 10 preguntas cada una (50 preguntas por torneo)
- Ronda 1: kanicofrade, Ronda 2: nazareno, Ronda 3: costalero, Ronda 4: capataz, Ronda 5: maestro
- El admin desbloquea cada ronda manualmente desde el panel
- Ranking acumulado visible al finalizar cada ronda
- Participantes ilimitados, acceso mediante código
- Reutiliza usuarios (`profiles`) y preguntas (`questions`) existentes

### Tablas nuevas

**1. `tournaments`** — Datos del torneo

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| name | TEXT NOT NULL | Nombre del torneo |
| description | TEXT | Descripción opcional |
| tournament_date | DATE NOT NULL | Fecha del torneo |
| join_code | TEXT NOT NULL UNIQUE | Código de acceso (6 caracteres) |
| status | TEXT DEFAULT 'upcoming' | upcoming / active / completed |
| current_round | INTEGER DEFAULT 0 | Ronda actualmente desbloqueada (0 = ninguna, 1-5) |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

El admin controla el avance cambiando `current_round` (0→1→2→3→4→5) y `status`.

**2. `tournament_questions`** — 50 preguntas asignadas al torneo

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| tournament_id | UUID FK → tournaments | |
| question_id | UUID FK → questions | |
| round_number | INTEGER (1-5) | Ronda a la que pertenece |
| order_number | INTEGER (1-10) | Posición dentro de la ronda |
| UNIQUE(tournament_id, question_id) | | Sin repetir preguntas |
| UNIQUE(tournament_id, round_number, order_number) | | Sin repetir posición |

**3. `tournament_participants`** — Inscripciones

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| tournament_id | UUID FK → tournaments | |
| user_id | UUID NOT NULL | (sin FK a auth.users) |
| joined_at | TIMESTAMPTZ DEFAULT NOW() | |
| total_score | INTEGER DEFAULT 0 | Puntuación acumulada |
| rounds_completed | INTEGER DEFAULT 0 | Última ronda completada |
| UNIQUE(tournament_id, user_id) | | Un registro por usuario por torneo |

**4. `tournament_answers`** — Respuestas de cada ronda

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| tournament_id | UUID FK → tournaments | |
| user_id | UUID NOT NULL | |
| question_id | UUID FK → questions | |
| round_number | INTEGER (1-5) | |
| selected_answer | INTEGER (1-4) | |
| is_correct | BOOLEAN | |
| time_taken | FLOAT | Segundos |
| points_earned | INTEGER DEFAULT 0 | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |
| UNIQUE(tournament_id, user_id, question_id) | | Una respuesta por pregunta |

### Políticas RLS

- **tournaments**: Admins ALL; usuarios autenticados SELECT (para ver torneos disponibles)
- **tournament_questions**: Admins ALL; participantes SELECT solo de rondas desbloqueadas (`round_number <= tournament.current_round`), sin `correct_answer` (se usa función security definer igual que el juego diario)
- **tournament_participants**: Admins SELECT ALL; usuarios INSERT propio (`auth.uid() = user_id`); usuarios SELECT del torneo al que pertenecen (para ver lista de participantes)
- **tournament_answers**: Admins SELECT ALL; usuarios INSERT propio; usuarios SELECT propio

### Relación con tablas existentes

```text
profiles (existente)         questions (existente)
    │                              │
    │ user_id                      │ question_id
    ▼                              ▼
tournament_participants    tournament_questions
    │                              │
    │ tournament_id                │ tournament_id
    ▼                              ▼
              tournaments
                  │
                  │ tournament_id
                  ▼
          tournament_answers
```

No se modifica ninguna tabla existente. Los puntos del torneo son independientes del ranking diario.

### Flujo de datos

1. Admin crea torneo → `INSERT tournaments` + `INSERT tournament_questions` (50 filas)
2. Usuario introduce código → `INSERT tournament_participants`
3. Admin desbloquea ronda 1 → `UPDATE tournaments SET current_round = 1`
4. Usuario juega ronda → `INSERT tournament_answers` (10 filas) + `UPDATE tournament_participants.total_score/rounds_completed`
5. Todos ven ranking acumulado → `SELECT tournament_participants ORDER BY total_score DESC`
6. Admin desbloquea ronda 2 → repite ciclo
7. Tras ronda 5 → `UPDATE tournaments SET status = 'completed'`

### Orden de implementación

1. Migración SQL: crear las 4 tablas + RLS + función security definer para preguntas de torneo
2. Admin: componente TournamentManager (crear torneo, asignar preguntas por ronda, controlar desbloqueo)
3. Frontend usuario: lista de torneos, diálogo unirse, pantalla detalle con participantes
4. Lógica de juego del torneo (ronda por ronda)


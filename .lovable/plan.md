

## Plan: Añadir hora y ubicación a los torneos

### 1. Migración SQL — Nuevas columnas en `tournaments`
- `tournament_time` (TIME, nullable) — hora del evento
- `location` (TEXT, nullable) — ubicación/dirección del evento

### 2. `TournamentManager.tsx` — Panel admin

**Formulario de creación** (CREATE VIEW):
- Añadir campo de hora (`<Input type="time">`) junto al selector de fecha
- Añadir campo de ubicación (`<Input>` con placeholder "Ej: Salón parroquial San Lorenzo")
- Nuevos states: `formTime`, `formLocation`
- Incluir ambos en el `insert` al crear torneo

**Vista detalle** (DETAIL VIEW):
- Mostrar hora y ubicación en la grid de info (junto a Fecha, Código, etc.)

**Vista lista** (LIST VIEW):
- Mostrar hora y ubicación en el subtexto de cada torneo

**Interface `Tournament`**: añadir `tournament_time` y `location`

### 3. `TournamentCard.tsx` — Tarjeta del jugador
- Nuevas props: `tournamentTime?: string`, `location?: string`
- En el bloque de fecha destacada: mostrar la hora del torneo (de `tournament_time`) en vez de intentar parsear hora del date
- Añadir fila con icono `MapPin` mostrando la ubicación debajo de participantes/fecha

### 4. `Tournament.tsx` — Pasar las nuevas props
- Pasar `tournamentTime={t.tournament_time}` y `location={t.location}` a `TournamentCard`

### Resultado
- Admin puede crear torneos con fecha, hora y ubicación
- Los jugadores ven fecha+hora juntos y la ubicación en la tarjeta del torneo


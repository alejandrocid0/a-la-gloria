

## Resumen: Estado actual del flujo de torneos

### Lo que YA funciona para tu demo

1. **Crear torneo** con preguntas desde admin → ✅
2. **Jugadores se unen** con código de acceso → ✅
3. **Admin desbloquea Ronda 1** (botón "Desbloquear" en la vista de detalle del torneo) → cambia el torneo a "active" y `current_round = 1` → ✅
4. **Los móviles de los jugadores** detectan la ronda disponible (polling cada 5s) y pueden jugarla → ✅
5. **Tras jugar**, ven sus resultados → pasan al ranking → esperan la siguiente ronda (polling 5s) → ✅
6. **Admin desbloquea ronda 2, 3, 4, 5** con un solo botón cada vez → ✅
7. **Finalizar torneo** tras la ronda 5 → ✅

### Lo que FALTA: Pantalla en vivo para proyectar

Actualmente no tienes una vista de "pantalla grande" que muestre en tiempo real cuántos jugadores han completado cada ronda y el ranking actualizado. La pantalla de ranking (`/torneo/:id/ranking`) existe, pero requiere ser participante del torneo (la función RPC lo verifica).

### Plan: Nueva página `/torneo/:id/live`

Crear una página pública para proyectar en pantalla grande durante el evento.

**1. Nueva función RPC `get_tournament_live_stats`** (Security Definer)
- Devuelve: total participantes, cuántos han completado la ronda actual, y el ranking completo (nombre, hermandad, puntuación, rondas completadas).
- Sin restricción de participante — solo necesita que el usuario esté autenticado y sea admin.

**2. Nueva página `src/pages/TournamentLive.tsx`**
- Diseño optimizado para pantalla grande (TV/proyector):
  - Nombre del torneo y ronda actual en grande
  - Barra de progreso: "7/10 jugadores han completado la ronda"
  - Ranking en tiempo real con podio visual (top 3 destacados)
  - Auto-refresh cada 3 segundos
- Accesible solo para admins en `/torneo/:id/live`

**3. Ruta en `App.tsx`**
- Nueva ruta protegida con `AdminRoute`: `/torneo/:id/live`

**4. Enlace en el panel admin**
- Botón "Abrir vista en vivo" en la vista de detalle del torneo, que abre `/torneo/:id/live` en nueva pestaña para proyectar.

### Flujo del evento mañana

```text
TU MÓVIL (Admin)              PANTALLA GRANDE              MÓVILES JUGADORES
─────────────────              ───────────────              ─────────────────
Panel Admin                    /torneo/ID/live              /torneo → Unirse
  ↓ Desbloquear R1             "Ronda 1 — 0/10"            → Jugar Ronda 1
  ↓                            "Ronda 1 — 3/10"            → Jugando...
  ↓                            "Ronda 1 — 10/10 ✓"         → Resultados
  ↓                            Ranking actualizado          → Ver ranking
  ↓ Desbloquear R2             "Ronda 2 — 0/10"            → Jugar Ronda 2
  ...                          ...                          ...
  ↓ Finalizar                  "¡Torneo finalizado!"       → Ranking final
```

### Sin cambios en la lógica existente
Todo lo actual sigue igual. Solo se añade la vista para proyectar.


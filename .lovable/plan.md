
## Objetivo

Permitir que el usuario se inscriba a un torneo presencial **sin salir de la app**, con el mismo formulario que en el Hub, y que en el panel de administración puedas ver y **exportar a CSV** las inscripciones de cada torneo para importarlas manualmente en el Hub.

Sin sincronización automática entre proyectos. Todo vive en la BD de esta app y se traslada por CSV cuando lo necesites.

---

## 1. Base de datos (esta app)

Nueva tabla `tournament_registrations`:

- `tournament_id` (FK lógica a `tournaments`)
- `user_id` (opcional — si está logueado, lo guardamos)
- `nombre`, `email`, `telefono` (opcional), `mensaje` (opcional)
- `created_at`

**RLS:**
- INSERT: cualquier usuario autenticado puede insertar su propia inscripción.
- SELECT: solo admins (`has_role(auth.uid(),'admin')`).
- UPDATE/DELETE: solo admins.

Índice por `tournament_id` para filtrar rápido en el admin.

Función RPC `count_tournament_registrations()` (admin-only) para mostrar el contador en cada torneo del admin sin cargar todos los registros.

---

## 2. Frontend — formulario de inscripción

Nuevo componente `src/components/tournament/InscripcionTorneoDialog.tsx`, **réplica visual y funcional** del que existe en el Hub (`InscripcionTorneoDialog.tsx`):

- Mismo schema Zod (`nombre` 2–100, `email` válido ≤255, `telefono` ≤30 opc., `mensaje` ≤1000 opc.).
- Mismos campos, mismos textos ("Inscribirse al torneo", "Confirmar inscripción", etc.).
- Adaptado a los tokens de diseño de esta app (morado/dorado, Cinzel/Inter).
- Si el usuario está logueado, prerellena `nombre` y `email` desde `profiles`.
- Insert en `tournament_registrations`. Toast de éxito/error.
- Evita duplicados: si ya existe una inscripción con ese `email` para ese `tournament_id`, se muestra "Ya estás inscrito".

### Botón en `TournamentCard.tsx`

Encima del botón actual de "Unirse al torneo" / "Jugar ronda X", añadir un botón **dorado** "Inscríbete al torneo" que abre el diálogo. Solo visible cuando:
- `status === "upcoming"` o `status === "active"` (no en finalizados).
- Opcionalmente, ocultarlo si el usuario ya está inscrito (mostrar "Inscrito ✓" deshabilitado).

---

## 3. Admin — pestaña de inscritos por torneo

En `src/components/admin/TournamentManager.tsx`:

- Por cada torneo de la lista, mostrar un contador `Inscritos: N` y un botón **"Ver inscritos"**.
- Al pulsar, abre un diálogo / panel con:
  - Tabla con `Nombre`, `Email`, `Teléfono`, `Mensaje`, `Fecha`.
  - Búsqueda por nombre/email.
  - Botón **"Exportar CSV"** que descarga `inscripciones-{nombre-torneo}-{YYYY-MM-DD}.csv` con cabeceras compatibles con el Hub (`nombre,email,telefono,mensaje,torneo_id,created_at`), para que la importación manual sea directa.
  - Botón **"Eliminar"** por fila (admin).

---

## 4. Flujo operativo (para ti)

1. Creas el torneo en esta app y en el Hub (como hasta ahora).
2. Los usuarios se inscriben desde la app → quedan en `tournament_registrations`.
3. En cualquier momento entras al admin de torneos, abres "Ver inscritos" del torneo, exportas CSV.
4. Importas ese CSV en el panel admin del Hub.

---

## Lo que NO se toca

- Lógica de juego, rondas, ranking, participaciones (`tournament_participants`) — intacto.
- BD del Hub — intacta.
- Sin edge functions, sin claves cruzadas entre proyectos, sin riesgo de romper nada.

---

## Detalles técnicos

- Migración SQL nueva para `tournament_registrations` + RLS + índice + RPC contador.
- Sin cambios en `tournaments`, `tournament_participants`, ni en funciones existentes.
- Se respetan los tokens de diseño (`bg-secondary`, `text-secondary-foreground`, etc.).
- CSV generado client-side con `Blob` + `URL.createObjectURL`, sin dependencias nuevas.

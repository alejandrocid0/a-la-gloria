

## Plan: Editar datos de torneo desde vista de detalle (solo si no ha empezado)

### Lógica
- Un torneo se considera "no empezado" cuando `status === 'upcoming'` y `current_round === 0`.
- Una vez que se desbloquea la primera ronda (pasa a `active`), los campos dejan de ser editables.

### Cambios en `TournamentManager.tsx`

**Nuevo estado:**
- `isEditing` (boolean) — alterna entre vista lectura y edición en la vista de detalle.
- `editName`, `editDescription`, `editDate`, `editTime`, `editLocation`, `editCode`, `editImage`, `editImagePreview` — estados del formulario de edición, inicializados con los valores actuales del torneo al pulsar "Editar".

**Nueva mutación `updateMutation`:**
- Sube nueva imagen si se cambió (al bucket `tournament-images`).
- Ejecuta `supabase.from('tournaments').update({...}).eq('id', t.id)` con los campos editados.
- Invalida queries y cierra modo edición.

**Vista de detalle — cambios UI:**
- Mostrar botón "Editar" (icono `Edit2`) junto al nombre del torneo, **solo si `t.status === 'upcoming'`**.
- Al pulsar "Editar", la tarjeta de info se transforma en formulario inline con los mismos campos que el formulario de creación (nombre, descripción, imagen, fecha, hora, ubicación, código).
- Botones "Guardar" y "Cancelar" al final del formulario.
- Si el torneo ya está `active` o `completed`, no se muestra el botón de editar.

**No se editan las preguntas de las rondas** — solo los datos informativos del torneo. Las preguntas ya asignadas permanecen igual.

### Sin cambios en base de datos
Las columnas ya existen. La política RLS `Admins can manage tournaments` con `ALL` ya permite `UPDATE`.


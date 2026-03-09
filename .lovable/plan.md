

## Plan: Crear torneos sin preguntas (estado "borrador")

Sí, es totalmente posible. La idea es permitir crear un torneo solo con los datos básicos (nombre, fecha, imagen, ubicación...) y asignar las preguntas más tarde.

### Cambios

**1. `TournamentManager.tsx` — Formulario de creación**
- Eliminar la exigencia de `allRoundsComplete` en `canCreate`. La validación pasa a ser solo: nombre ≥ 3 chars + fecha + código ≥ 4 chars.
- Si no se han seleccionado preguntas (o están incompletas), el torneo se crea con status `"draft"` en vez de `"upcoming"`.
- Si las 5 rondas están completas, se crea con `"upcoming"` como hasta ahora.
- Los selectores de preguntas por ronda siguen visibles pero son opcionales.

**2. `TournamentManager.tsx` — Vista de lista**
- Nuevo badge para `"draft"`: amarillo, con texto "Borrador".
- En el subtexto mostrar "Pendiente de preguntas" cuando sea draft.

**3. `TournamentManager.tsx` — Vista de detalle**
- Si el torneo es `"draft"`, mostrar un aviso tipo banner: "Este torneo está en borrador. Asigna las preguntas de las 5 rondas para poder programarlo."
- Añadir botón "Asignar preguntas" que abre una nueva vista/sección para seleccionar las preguntas por ronda (reutilizando los mismos selectores del formulario de creación).
- Una vez completadas las 5 rondas, botón "Programar torneo" que cambia el status a `"upcoming"` e inserta las `tournament_questions`.
- Bloquear el avance de rondas (botón Desbloquear Ronda 1) si el torneo es draft.

**4. `TournamentCard.tsx` — Vista del jugador**
- Los torneos con status `"draft"` NO se mostrarán a los jugadores (ya se filtran implícitamente porque no son "upcoming"/"active"/"completed", pero añadiremos un filtro explícito en `Tournament.tsx`).

**5. `Tournament.tsx` — Filtrar drafts**
- Añadir `.neq("status", "draft")` a la query de torneos para que los borradores no aparezcan a los jugadores.

### Sin cambios en base de datos
El campo `status` es de tipo TEXT, por lo que ya acepta el valor `"draft"` sin necesidad de migración.

### Flujo del admin
1. Crea torneo con datos básicos → se guarda como "Borrador"
2. Entra en el torneo → asigna preguntas cuando quiera
3. Al completar las 5 rondas → pulsa "Programar" → pasa a "Próximo"
4. Los jugadores solo ven torneos "Próximo" o "En curso"


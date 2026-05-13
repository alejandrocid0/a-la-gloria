## Diagnóstico

La página `/torneo` consulta la vista `tournaments_public`, que está creada con `security_invoker=on`. Esto hace que la vista use las políticas RLS del usuario que consulta sobre la tabla base `tournaments`.

El problema: la tabla `tournaments` **solo tiene una política RLS** ("Admins can manage tournaments"). No existe ninguna política `SELECT` para usuarios autenticados normales. Resultado:

- Los admins ven los torneos correctamente.
- Los usuarios normales (como tu cuenta `ale.06cromero@gmail.com`, que no tiene rol admin) reciben **0 filas** → la pantalla muestra "Próximamente más torneos".

El torneo "Prueba" existe en BD con `status = 'upcoming'` y aparece bien en `tournaments_public` cuando se consulta sin RLS.

## Solución

Añadir una política `SELECT` en `tournaments` para que cualquier usuario autenticado pueda leer los torneos que no estén en `draft` ni `archived` (los estados "internos" del admin). El resto de operaciones (INSERT/UPDATE/DELETE) siguen restringidas a admins.

### Migración SQL

```sql
CREATE POLICY "Authenticated users can view published tournaments"
ON public.tournaments
FOR SELECT
TO authenticated
USING (status NOT IN ('draft', 'archived'));
```

Con esto:
- Los usuarios verán "Prueba" (upcoming), torneos `active` y `completed`.
- No verán borradores ni archivados.
- Los admins siguen viendo todo (su política `ALL` ya lo cubre).
- La vista `tournaments_public` empieza a devolver datos a usuarios normales sin tocar nada del frontend.

## Lo que NO se toca

- Frontend (`Tournament.tsx`, `TournamentCard.tsx`): ya filtran correctamente por `status`.
- Otras tablas, RLS, RPCs, edge functions.
- El sistema de inscripciones y el de participaciones.



## Eliminar la tabla `user_answers` (sin uso)

### Contexto

La tabla `user_answers` fue creada como opcional para guardar cada respuesta individual de los usuarios (pregunta por pregunta). Sin embargo, nunca se implemento la logica que la utiliza. El juego guarda resultados directamente en `games` y `profiles`. La tabla tiene 0 filas y 0 referencias funcionales en el codigo.

### Cambios

**1. Migracion SQL** -- Eliminar la tabla de la base de datos:

```sql
DROP TABLE IF EXISTS public.user_answers;
```

**2. `src/pages/Play.tsx`** -- Eliminar los comentarios que mencionan `user_answers` (lineas 41-44 y 84) para que no queden referencias a algo que ya no existe.

**3. `src/lib/database.sql`** -- Eliminar el bloque de creacion de `user_answers`, sus indices y sus politicas RLS de este archivo de referencia.

No se toca ningun otro archivo. El archivo `types.ts` se regenerara automaticamente tras la migracion.

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | `DROP TABLE IF EXISTS public.user_answers` |
| `src/pages/Play.tsx` | Eliminar comentarios sobre user_answers |
| `src/lib/database.sql` | Eliminar seccion de user_answers |


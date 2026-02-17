

## Alinear KPIs con la retencion: excluir admin de todas las estadisticas

### Problema

La funcion SQL de retencion correctamente excluye al admin y devuelve 233 usuarios. Sin embargo, el KPI "Usuarios" consulta directamente `profiles` sin filtrar, mostrando 234. Esto crea una incoherencia visible en el dashboard.

### Solucion

Modificar la consulta de KPIs y la de Top Hermandades para usar `get_public_profiles()` (que ya excluye admins), en lugar de consultar directamente la tabla `profiles`.

### Cambios en `src/components/admin/AdminDashboard.tsx`

**1. Query de KPIs (lineas 52-58)**

Reemplazar las dos consultas separadas a `profiles` por una sola llamada a `get_public_profiles()`:

```text
Antes:
  supabase.from("profiles").select("*", { count: "exact", head: true })
  supabase.from("profiles").select("games_played")

Despues:
  supabase.rpc('get_public_profiles')
  const totalUsers = profiles.length
  const totalGames = profiles.reduce(...)
```

**2. Query de Top Hermandades (lineas ~130-145)**

Reemplazar `supabase.from("profiles").select("hermandad")` por usar los datos de `get_public_profiles()` para contar hermandades solo de jugadores reales.

### Resultado

- KPI "Usuarios": mostrara 233 (sin admin)
- KPI "Partidas": solo partidas de jugadores reales
- "Nuevos/dia" y "Diarias": calculados sobre la base correcta
- Top Hermandades: sin contar al admin
- Retencion: ya muestra 233 correctamente
- Todas las metricas seran 100% coherentes

### Archivos modificados

- `src/components/admin/AdminDashboard.tsx` (2 queries)


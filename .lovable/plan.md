

## Corregir calculo de retencion: incluir usuarios sin partidas (5 categorias)

### Problema actual

La funcion SQL `get_user_retention_stats` usa `JOIN` con la tabla `games`, por lo que solo devuelve usuarios que han jugado al menos una partida. Los usuarios registrados que nunca jugaron no aparecen, lo que distorsiona los porcentajes y la retencion media.

### Cambios

#### A. Migracion SQL: actualizar `get_user_retention_stats`

Cambiar el `JOIN` por un `LEFT JOIN` con `games` para incluir todos los perfiles. Anadir una quinta categoria `"inactive"` para usuarios con 0 partidas (0% de retencion).

- `LEFT JOIN games g ON g.user_id = p.id` en lugar de `FROM games g JOIN profiles p`
- Los usuarios sin partidas tendran `days_played = 0` y `percentage = 0`
- Nueva categoria: `WHEN days_played = 0 THEN 'inactive'`
- Anadir `'inactive'` al JSON de `counts` y `users`

#### B. Frontend: `AdminDashboard.tsx`

1. Actualizar el tipo `RetentionCategory` para incluir `"inactive"`:
   ```
   type RetentionCategory = "high" | "medium" | "low" | "none" | "inactive" | null;
   ```

2. Actualizar la interfaz de respuesta del RPC para incluir `inactive` en `counts` y `users`.

3. Calcular `totalUsers` sumando las 5 categorias (high + medium + low + none + inactive).

4. Anadir porcentaje y conteo para `inactive` en `retentionStats`.

5. Calcular `avgRetention` incluyendo los usuarios inactivos (con 0% cada uno), dividiendo por el total de las 5 categorias.

6. Cambiar el grid de 4 a 5 columnas (`grid-cols-5`).

7. Anadir un quinto recuadro en rojo oscuro para "Inactivos (0%)" con icono `XCircle` (o similar), boton de exportar CSV, y el mismo patron de click para abrir el Dialog.

8. Actualizar `getCategoryTitle` para incluir `"inactive" -> "Inactivos (0 partidas)"`.

9. Actualizar `getCategoryUsers` para devolver `retentionStats.users.inactive`.

### Detalle tecnico

**Migracion SQL:**

```sql
CREATE OR REPLACE FUNCTION public.get_user_retention_stats()
RETURNS json ...
-- CTE user_stats: LEFT JOIN games, GROUP BY profile
-- days_played = COUNT(DISTINCT g.date) (sera 0 si no hay partidas)
-- Nueva categoria 'inactive' cuando days_played = 0
-- counts y users incluyen 'inactive'
```

**AdminDashboard.tsx - cambios clave:**

- Linea 29: anadir `"inactive"` al tipo
- Lineas 150-158: anadir `inactive` a la interfaz de respuesta
- Lineas 160-161: sumar 5 categorias para totalUsers
- Lineas 172-184: anadir `inactiveRetention` y `counts.inactiveRetention`
- Lineas 204-216: incluir usuarios inactivos (con percentage=0) en el calculo de avgRetention, dividiendo por totalUsers real
- Linea 394: cambiar grid a 5 columnas
- Anadir quinto recuadro rojo oscuro (bg-red-900/10, border-red-900/30) entre lineas 465-466
- Actualizar `getCategoryTitle` y `getCategoryUsers`

### Archivos modificados

- **Migracion SQL**: nueva migracion para actualizar `get_user_retention_stats`
- **`src/components/admin/AdminDashboard.tsx`**: tipo, interfaz, calculos, grid 5 columnas, quinto recuadro


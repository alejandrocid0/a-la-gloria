

## Plan: Corregir Constraint de Base de Datos y Limpiar Logica

### Problema Identificado

Existe un **CHECK constraint** en la tabla `feedback` que solo permite los estados antiguos:

```sql
CHECK (status IN ('pending', 'read', 'resolved'))
```

Cuando intentas cambiar a `errors`, `ideas` o `compliments`, la base de datos rechaza la actualizacion con el error:

```
"new row for relation \"feedback\" violates check constraint \"feedback_status_check\""
```

Este error aparece en los logs de Postgres que analice.

---

### Solucion

#### 1. Migracion SQL: Actualizar el CHECK Constraint

Eliminar el constraint antiguo y crear uno nuevo con los 5 estados:

```sql
-- Eliminar constraint antiguo
ALTER TABLE public.feedback 
DROP CONSTRAINT feedback_status_check;

-- Crear constraint con los 5 nuevos estados
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('pending', 'errors', 'ideas', 'compliments', 'resolved'));
```

---

#### 2. Archivo: `src/components/admin/FeedbackList.tsx`

**Cambios:**

**a) Eliminar fallback para estados legacy** (lineas 98-113)

Ya no hay estados `'read'` en la base de datos, por lo que el fallback es innecesario. Se usara directamente `statusConfig`.

**b) Bloquear el Select cuando el estado es "resolved"**

Segun tu preferencia, una vez resuelto no se puede reabrir:

```tsx
<Select
  value={feedback.status}
  onValueChange={(value) => updateStatus.mutate({ 
    id: feedback.id, 
    status: value 
  })}
  disabled={updateStatus.isPending || feedback.status === 'resolved'}
>
```

**c) Simplificar acceso a config**

Cambiar de `getStatusConfig(feedback.status)` a `statusConfig[feedback.status as FeedbackStatus]` con fallback seguro.

---

### Flujo Final de Estados

```text
           +------------+
           |  PENDING   |
           +-----+------+
                 |
   +-------------+-------------+
   |             |             |
   v             v             v
+------+    +-------+    +------------+
|ERRORS|<-->| IDEAS |<-->|COMPLIMENTS |
+--+---+    +---+---+    +-----+------+
   |            |              |
   +------------+--------------+
                |
                v
          +-----------+
          | RESOLVED  | (bloqueado)
          +-----------+
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migracion SQL | Reemplazar CHECK constraint con los 5 estados |
| `src/components/admin/FeedbackList.tsx` | Eliminar fallback legacy, bloquear Select en "resolved" |

---

### Resultado Esperado

- El desplegable funcionara correctamente para todos los estados
- Los contadores sumaran el total correcto (pendientes + categorias + resueltos = total)
- Los feedbacks resueltos mostraran el Select deshabilitado


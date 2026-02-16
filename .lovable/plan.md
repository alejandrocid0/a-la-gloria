
## Corregir el limite de 1000 preguntas en el panel admin

### Problema

La base de datos tiene **1024 preguntas**, pero el panel muestra solo 1000. Esto ocurre porque Supabase aplica un limite por defecto de 1000 filas en las consultas `.select('*')`.

### Solucion

Modificar la consulta en `src/pages/Admin.tsx` para obtener todas las filas usando paginacion por lotes.

### Detalle tecnico

**Archivo: `src/pages/Admin.tsx`** (lineas 25-35)

Reemplazar la consulta actual:

```typescript
const { data, error } = await supabase
  .from('questions')
  .select('*')
  .order('created_at', { ascending: false });
```

Por una funcion que carga en lotes de 1000 hasta agotar los resultados:

```typescript
const allQuestions: any[] = [];
let offset = 0;
const batchSize = 1000;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + batchSize - 1);

  if (error) throw error;

  if (data && data.length > 0) {
    allQuestions.push(...data);
    offset += batchSize;
    hasMore = data.length === batchSize;
  } else {
    hasMore = false;
  }
}

return allQuestions;
```

Esto garantiza que se carguen las 1024 preguntas (y cualquier cantidad futura).

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Admin.tsx` | Reemplazar query simple por carga paginada con `.range()` |

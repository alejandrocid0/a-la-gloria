

# Bug: Punto verde no aparece para fechas nuevas

## Causa raíz

La query que carga los días con puntos verdes (línea 72) hace `supabase.from('daily_questions').select('date')` **sin paginación**. Supabase tiene un límite por defecto de **1000 filas** por consulta.

Con más de 90 días configurados × 10 preguntas cada uno = 900+ filas, la query ya está rozando el límite. Al añadir nuevos días, las filas más recientes (como el 8 de abril) quedan fuera del resultado, y el punto verde no aparece.

## Solución

### `src/components/admin/DailyQuestionsSelector.tsx`

Cambiar la query `days-with-ten-questions` para que haga el conteo directamente en la base de datos en lugar de traer todas las filas y contarlas en el cliente:

```ts
queryFn: async () => {
  const { data, error } = await supabase
    .rpc('get_dates_with_ten_questions');
  // ... o alternativamente, paginar la query actual
}
```

**Opción más sencilla sin crear una función RPC**: paginar la query existente igual que ya se hace con `all-questions`, usando `Promise.all` con rangos (0-999, 1000-1999, etc.) para obtener todas las filas.

Esto no cambia nada visual — solo garantiza que se carguen todos los datos y el punto verde aparezca para cualquier fecha guardada.

### Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/DailyQuestionsSelector.tsx` | Paginar la query `days-with-ten-questions` para superar el límite de 1000 filas |


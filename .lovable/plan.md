

## Plan: Paginar consulta del selector diario a 3 páginas (hasta 3000 preguntas)

### Cambio

**Archivo**: `src/components/admin/DailyQuestionsSelector.tsx` — función `queryFn` del query `all-questions` (líneas ~45-53)

Reemplazar la consulta simple por 3 llamadas con `.range()`:

```typescript
queryFn: async () => {
  const fetchPage = (start: number, end: number) =>
    supabase
      .from('questions')
      .select('id, question_text, difficulty, last_used_date')
      .order('created_at', { ascending: false })
      .range(start, end);

  const [p1, p2, p3] = await Promise.all([
    fetchPage(0, 999),
    fetchPage(1000, 1999),
    fetchPage(2000, 2999),
  ]);

  if (p1.error) throw p1.error;

  return [
    ...(p1.data || []),
    ...(p2.data || []),
    ...(p3.data || []),
  ] as Question[];
},
```

### Sobre los datos existentes

Las 209 preguntas que no aparecían (kanicofrade y costalero antiguas) **nunca perdieron datos**. Sus campos `last_used_date`, `difficulty`, `category` y demás están intactos en la base de datos. Solo faltaba traerlas a la interfaz.

### Impacto

- Un solo archivo modificado
- Cubre hasta 3000 preguntas
- Las 3 consultas se ejecutan en paralelo con `Promise.all` para no añadir latencia


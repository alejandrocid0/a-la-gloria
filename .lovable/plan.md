
## Cambiar dificultad de preguntas "no procesiona" a kanicofrade

### Contexto
- Hay **56 preguntas** que empiezan por "¿Cual de estas hermandades no procesiona..." con dificultad **nazareno**
- Ya existen 57 preguntas similares ("si procesiona") con dificultad **kanicofrade**
- Todas comparten el mismo patron y ya aparecen bajo la categoria "Hermandades que procesionan" en el panel

### Cambio en base de datos

Un solo UPDATE que cambia `difficulty` de `'nazareno'` a `'kanicofrade'` para las 56 preguntas. El campo `last_used_date` NO se toca, se mantiene intacto tal como esta (las que ya se usaron conservan su fecha, las que no se han usado siguen con null).

```sql
UPDATE public.questions
SET difficulty = 'kanicofrade'
WHERE question_text LIKE '¿Cuál de estas hermandades no procesiona%'
  AND difficulty = 'nazareno';
```

### Que NO cambia
- El campo `last_used_date` permanece igual en todas las preguntas
- No hay cambios en codigo (la categoria en QuestionsList ya las agrupa correctamente)
- No se modifica ninguna otra pregunta

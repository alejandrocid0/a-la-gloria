

## Cambiar dificultad de preguntas de restauraciones

### Resumen

Se han encontrado **30 preguntas** en la base de datos que comienzan con "¿Quién restauró en..." y actualmente tienen dificultad **capataz**. Se actualizarán todas a dificultad **maestro** con una sola operación.

### Cambio

- **Tabla afectada**: `questions`
- **Filtro**: `question_text LIKE '¿Quién restauró en%'`
- **Campo**: `difficulty` de `capataz` a `maestro`
- **Registros afectados**: 30

### Ejecución

Se usará una sentencia UPDATE directa sobre la base de datos (no requiere migración de esquema):

```sql
UPDATE questions
SET difficulty = 'maestro'
WHERE question_text LIKE '¿Quién restauró en%'
  AND difficulty = 'capataz';
```

### Sin cambios de código

No se necesita modificar ningún archivo del frontend. Los componentes ya manejan la dificultad "maestro" correctamente.


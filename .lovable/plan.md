

## Plan: Cambiar dificultad de "Autores de Vírgenes" de capataz a costalero

### Alcance

- **60 preguntas** afectadas (todas las que empiezan por "¿Quién talló a la Virgen...")
- Cambio: `difficulty` de `capataz` → `costalero`

### Ejecución

Un único UPDATE en la base de datos:

```sql
UPDATE questions 
SET difficulty = 'costalero' 
WHERE question_text LIKE '¿Quién talló a la Virgen%' 
AND difficulty = 'capataz';
```

### Impacto

- **Juego diario**: Las preguntas aparecerán en la posición de dificultad costalero (preguntas 3-4 de 10) en lugar de capataz (preguntas 7-8).
- **Torneos**: Sin impacto en torneos pasados. En futuros torneos, el admin las verá como costalero al asignarlas.
- **No requiere cambios de código**: Solo es un cambio de datos.




## Ordenar preguntas por disponibilidad en el selector diario

### Resumen
Reordenar las preguntas dentro de cada nivel de dificultad en el `DailyQuestionsSelector` por uso: primero las nunca usadas, luego las usadas hace mas tiempo, y al final las usadas mas recientemente.

### Cambios en `src/components/admin/DailyQuestionsSelector.tsx`

**Ordenar `levelQuestions` antes de renderizar**

Dentro del map de `DIFFICULTY_LEVELS`, ordenar las preguntas de cada nivel con un `.sort()` que aplique esta logica:

1. Preguntas con `last_used_date === null` van primero (nunca usadas)
2. El resto se ordena por `last_used_date` ascendente (las usadas hace mas tiempo antes, las recientes al final)

### Detalles tecnicos

Reemplazar la linea:
```
const levelQuestions = questions.filter(q => q.difficulty === level.key);
```

Por:
```
const levelQuestions = questions
  .filter(q => q.difficulty === level.key)
  .sort((a, b) => {
    if (a.last_used_date === null && b.last_used_date === null) return 0;
    if (a.last_used_date === null) return -1;
    if (b.last_used_date === null) return 1;
    return new Date(a.last_used_date).getTime() - new Date(b.last_used_date).getTime();
  });
```

Esto produce el orden: nunca usadas → usadas hace mas tiempo → usadas recientemente. No se añaden estados, filtros ni separadores adicionales.


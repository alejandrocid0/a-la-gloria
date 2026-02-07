
## Plan: Indicador de preguntas sin usar por categoría

### Objetivo

Añadir en el selector de preguntas diarias un pequeño indicador que muestre cuántas preguntas de cada nivel de dificultad **nunca han sido usadas**.

---

### Diseño visual

```text
┌─────────────────────────────────────────────────────────────┐
│ NAZARENO                                                    │
│ 250 preguntas (25 sin usar)                     (1/2) ✓     │
├─────────────────────────────────────────────────────────────┤
│ ☐ ¿En qué año...?                          [Nunca usada]    │
│ ☑ ¿Cuál es el...?                          [Hace 5 días]    │
└─────────────────────────────────────────────────────────────┘
```

El texto "(25 sin usar)" aparecerá en **verde** para destacar visualmente que son preguntas frescas.

---

### Lógica de cálculo

Para cada nivel de dificultad:
1. Filtrar las preguntas de ese nivel: `questions.filter(q => q.difficulty === level.key)`
2. Contar las que tienen `last_used_date === null`

---

### Cambios en el código

**Archivo**: `src/components/admin/DailyQuestionsSelector.tsx`

**Modificación**: En el header de cada nivel (líneas 298-313), añadir el contador de preguntas sin usar.

**Código actual**:
```tsx
<span className="text-xs text-muted-foreground">
  {levelQuestions.length} preguntas
</span>
```

**Código nuevo**:
```tsx
<span className="text-xs text-muted-foreground">
  {levelQuestions.length} preguntas{' '}
  <span className="text-green-600 font-medium">
    ({levelQuestions.filter(q => q.last_used_date === null).length} sin usar)
  </span>
</span>
```

---

### Resultado esperado

| Nivel | Ejemplo de visualización |
|-------|--------------------------|
| Kanicofrade | 180 preguntas **(45 sin usar)** |
| Nazareno | 250 preguntas **(25 sin usar)** |
| Costalero | 200 preguntas **(0 sin usar)** |
| Capataz | 150 preguntas **(12 sin usar)** |
| Maestro | 120 preguntas **(8 sin usar)** |

El número en verde permite al administrador ver de un vistazo qué categorías tienen más preguntas frescas disponibles.

---

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/DailyQuestionsSelector.tsx` | Añadir contador de preguntas sin usar en el header de cada nivel |

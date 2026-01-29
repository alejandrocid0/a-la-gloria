

## Plan: Cambiar esquema de colores de uso de preguntas

### Resumen del Cambio

Modificar la función `getUsageBadgeColor` en `DailyQuestionsSelector.tsx` para implementar un nuevo esquema de 4 colores que distingue mejor el estado de las preguntas.

---

### Esquema de Colores

| Condición | Antes | Después |
|-----------|-------|---------|
| Nunca usada | Verde | Verde (sin cambio) |
| Más de 30 días sin usar | Verde | Amarillo |
| Entre 10-30 días sin usar | Amarillo | Naranja |
| Menos de 10 días | Rojo | Rojo (sin cambio) |

---

### Cambio en Código

**Archivo**: `src/components/admin/DailyQuestionsSelector.tsx`

**Líneas**: 231-236

**Antes**:
```typescript
const getUsageBadgeColor = (days: number | null): string => {
  if (days === null) return 'bg-green-500/20 text-green-700 dark:text-green-400';
  if (days < 10) return 'bg-red-500/20 text-red-700 dark:text-red-400';
  if (days <= 30) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
  return 'bg-green-500/20 text-green-700 dark:text-green-400';
};
```

**Después**:
```typescript
const getUsageBadgeColor = (days: number | null): string => {
  // Verde: nunca usada
  if (days === null) return 'bg-green-500/20 text-green-700 dark:text-green-400';
  // Rojo: usada hace menos de 10 días
  if (days < 10) return 'bg-red-500/20 text-red-700 dark:text-red-400';
  // Naranja: usada hace 10-30 días
  if (days <= 30) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
  // Amarillo: usada hace más de 30 días
  return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
};
```

---

### Resumen Visual

```text
🟢 Verde   → Nunca usada (prioridad máxima para usar)
🟡 Amarillo → +30 días sin usar (buena opción)
🟠 Naranja  → 10-30 días sin usar (aceptable)
🔴 Rojo     → <10 días (evitar repetir)
```

---

### Clases Tailwind utilizadas

- **Verde**: `bg-green-500/20 text-green-700` (ya existe)
- **Amarillo**: `bg-yellow-500/20 text-yellow-700` (ya existe, solo cambia condición)
- **Naranja**: `bg-orange-500/20 text-orange-700` (nuevo)
- **Rojo**: `bg-red-500/20 text-red-700` (ya existe)

Tailwind incluye la paleta `orange` por defecto, no requiere configuración adicional.


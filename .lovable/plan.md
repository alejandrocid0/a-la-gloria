
## Cambios en el selector de preguntas diarias

### Resumen
Modificar la lógica de colores y el contador del componente `DailyQuestionsSelector` para considerar como "disponibles" (verde) tanto las preguntas nunca usadas como las usadas hace mas de 50 dias.

### Cambios en `src/components/admin/DailyQuestionsSelector.tsx`

**1. Actualizar la funcion `getUsageBadgeColor`**
- Verde: nunca usada **O** usada hace mas de 50 dias (antes solo nunca usada)
- Rojo: usada hace menos de 10 dias (sin cambio)
- Naranja: usada hace 10-30 dias (sin cambio)
- Amarillo: usada hace 31-50 dias (antes era >30 dias)

**2. Actualizar el texto del contador por nivel**
- Cambiar de `"{X} sin usar"` a `"{X} disponibles para usar"`
- El conteo incluira preguntas nunca usadas + preguntas usadas hace mas de 50 dias

### Detalles tecnicos

En la funcion `getUsageBadgeColor`:
- `days === null` o `days > 50` → verde
- `days < 10` → rojo
- `days <= 30` → naranja
- `days <= 50` → amarillo

En el contador por nivel (linea ~218):
- Filtro actual: `q.last_used_date === null`
- Nuevo filtro: `q.last_used_date === null || differenceInDays(new Date(), new Date(q.last_used_date)) > 50`
- Texto: `({count} disponibles para usar)`

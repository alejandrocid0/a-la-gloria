

## Plan: Aumentar umbral de disponibilidad de 50 a 70 días

### Cambios en `src/components/admin/DailyQuestionsSelector.tsx`

Dos líneas a modificar:

1. **Línea 232-233**: Cambiar el comentario y el umbral del badge verde de `> 50` a `> 70`
2. **Línea 313**: Cambiar el filtro del contador "disponibles para usar" de `> 50` a `> 70`

No hay más archivos afectados. Es un cambio puramente visual en el panel de admin.


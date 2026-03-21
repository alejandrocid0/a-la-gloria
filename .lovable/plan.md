

## Plan: Resumen mensual de usuarios en el panel de administración

### Enfoque recomendado

Añadir un **botón "Mensual"** en la barra de filtros del gráfico de actividad (junto a "7 días", "30 días" y "Todo"). Al seleccionarlo, el gráfico mostrará barras agrupadas por mes con registros y partidas, usando un `BarChart` en lugar de `LineChart` para que visualmente se distinga y se lea mejor por meses.

Es la opción más limpia porque reutiliza la misma Card sin añadir componentes nuevos y es consistente con la navegación existente.

### Cambios

**`src/components/admin/adminTypes.ts`**
- Ampliar el tipo `TimeRange` a `"7d" | "30d" | "all" | "monthly"`

**`src/components/admin/ActivityChart.tsx`**
1. Añadir `"monthly"` al array de botones de rango, con etiqueta "Mensual"
2. Cuando `timeRange === "monthly"`, la query trae datos desde el lanzamiento (igual que "all") pero los agrupa por mes en un `useMemo`:
   ```typescript
   // Agrupar por mes: "ene 2026", "feb 2026", etc.
   const grouped = rawData.reduce((acc, row) => {
     const monthKey = format(parseISO(row.fecha), "MMM yyyy", { locale: es });
     acc[monthKey] = acc[monthKey] || { fecha: monthKey, registros: 0, partidas: 0 };
     acc[monthKey].registros += row.registros;
     acc[monthKey].partidas += row.partidas;
     return acc;
   }, {});
   ```
3. En la vista mensual, renderizar un `BarChart` (importar `BarChart, Bar` de recharts) con dos barras (registros en dorado, partidas en morado)
4. En las demás vistas, mantener el `LineChart` actual sin cambios
5. Ocultar la `ReferenceLine` y los porcentajes de cambio en la vista mensual (no aplican)

### Resultado

Un botón "Mensual" que muestra un gráfico de barras con el total de nuevos usuarios y partidas por cada mes desde el lanzamiento, integrado en la misma Card de Actividad.


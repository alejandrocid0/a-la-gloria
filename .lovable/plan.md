

## Plan: Líneas de promedio acumulado solo en vista "Todo"

### Cambio

**Archivo**: `src/components/admin/ActivityChart.tsx`

1. **Calcular promedios acumulados** cuando `timeRange === "all"`: en un `useMemo`, recorrer `timelineData` y para cada punto calcular la media acumulada de partidas y registros desde el inicio:
   ```typescript
   const chartData = useMemo(() => {
     if (timeRange !== "all" || !timelineData) return timelineData || [];
     let sumP = 0, sumR = 0;
     return timelineData.map((row, i) => {
       sumP += row.partidas;
       sumR += row.registros;
       return { ...row, avgPartidas: +(sumP/(i+1)).toFixed(1), avgRegistros: +(sumR/(i+1)).toFixed(1) };
     });
   }, [timelineData, timeRange]);
   ```

2. **Añadir dos líneas condicionales** al `LineChart` solo cuando `timeRange === "all"`:
   - `avgPartidas` — morada clara, trazo punteado, sin puntos
   - `avgRegistros` — dorada clara, trazo punteado, sin puntos

3. **Pasar `chartData`** al `LineChart` en lugar de `timelineData` directamente.

4. El resto del gráfico (vistas 7d y 30d) permanece exactamente igual, con las mismas líneas sólidas, la ReferenceLine y los porcentajes de cambio.

### Resultado

- **7 días / 30 días**: gráfico idéntico al actual
- **Todo**: se añaden dos líneas punteadas mostrando cómo han crecido los promedios diarios acumulados desde el lanzamiento

### Impacto

- Un solo archivo modificado
- Sin cambios en base de datos
- Sin queries adicionales (los datos ya se traen en la vista "all")


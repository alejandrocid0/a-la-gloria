## Indicador porcentual de cambio en el grafico de Actividad

### Que se hara

Junto a cada total (registros y partidas) en las vistas de 7 y 30 dias, se anadira entre parentesis un porcentaje que indica si ha crecido o bajado respecto al periodo anterior equivalente.

Ejemplo: si en los ultimos 7 dias hubo 52 registros y en los 7 dias anteriores hubo 40, se mostrara:

```text
👤 52 nuevos registros (+30%)    🎮 320 partidas jugadas (-5%)
```

- Flecha o signo positivo en verde cuando crece
- Signo negativo en rojo cuando baja
- "0%" o "=" cuando no hay cambio

### Detalle tecnico

**Archivo unico: `src/components/admin/ActivityChart.tsx**`

1. **Nueva query para el periodo anterior**: Anadir una segunda query (`prevTimelineData`) que pida los datos del periodo inmediatamente anterior al seleccionado:
  - Si el rango es "7d": pedir del dia -14 al dia -7
  - Si el rango es "30d": pedir del dia -60 al dia -30
  - No se ejecuta cuando `timeRange === "all"` (usando `enabled: timeRange !== "all"`)
  - Reutiliza la misma RPC `get_daily_activity_stats`
2. **Calcular totales del periodo anterior** con `useMemo`:
  - `prevTotalRegistros` y `prevTotalPartidas` sumando los datos de `prevTimelineData`
3. **Funcion auxiliar `calcPctChange**`: recibe `(current, previous)` y devuelve el porcentaje de cambio. Si el periodo anterior es 0 y el actual > 0, mostrar "+100%". Si ambos son 0, mostrar "0%".
4. **Renderizar el porcentaje** junto a cada total en los badges existentes:
  - Color verde (`#22c55e`) si es positivo
  - Color rojo (`#ef4444`) si es negativo
  - Color gris si es 0%
5. Elimina los emoticonos.

### Que NO cambia

- La query principal del periodo actual
- La RPC `get_daily_activity_stats` (se reutiliza tal cual)
- El grafico, la leyenda y la linea de referencia
- La vista "Todo" no muestra nada (ya esta asi)
- No hay cambios en base de datos
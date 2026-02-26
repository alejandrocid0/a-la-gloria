

## Resumen de totales en el grafico de Actividad

### Que se hara

Debajo del grafico (bajo la leyenda de colores), se mostrara una fila con dos indicadores que sumen los totales del periodo seleccionado:
- **Nuevos registros**: suma de todos los `registros` del periodo (color dorado #E4B229)
- **Partidas jugadas**: suma de todas las `partidas` del periodo (color morado #4B2B8A)

Este resumen solo aparecera en las vistas **7 dias** y **30 dias**. En la vista **Todo** no se mostrara.

### Ejemplo visual

```text
|  👤 52 nuevos registros   |   🎮 320 partidas jugadas  |
```

Dos badges/chips en una fila centrada, cada uno con el color correspondiente a su linea en el grafico.

### Detalle tecnico

**Archivo unico: `src/components/admin/ActivityChart.tsx`**

1. Calcular los totales con `useMemo` a partir de `timelineData`:
   - `totalRegistros = timelineData.reduce((sum, d) => sum + d.registros, 0)`
   - `totalPartidas = timelineData.reduce((sum, d) => sum + d.partidas, 0)`

2. Debajo del `div` del grafico (despues del cierre de `ResponsiveContainer`), anadir condicionalmente (solo si `timeRange !== "all"`):
   - Un `div` con `flex justify-center gap-4 mt-3` conteniendo dos `span` estilizados:
     - Registros: fondo dorado suave, texto dorado, con el total
     - Partidas: fondo morado suave, texto morado, con el total

3. No se modifican queries ni base de datos. Los datos ya existen en `timelineData`.

### Que NO cambia

- La query a `get_daily_activity_stats` permanece igual
- El grafico, la leyenda y la linea de referencia no se tocan
- No hay cambios en base de datos ni en otros archivos


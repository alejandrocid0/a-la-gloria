

## Corregir la linea de promedio en el grafico

### Problema

La linea de referencia calcula el promedio dividiendo las partidas visibles en el rango seleccionado entre el numero de dias de ese rango. El usuario quiere que refleje el mismo valor que el KPI "Diarias" de arriba: total de partidas / dias desde el 30 de diciembre de 2025 (actualmente 57.6).

### Solucion

Reemplazar el calculo inline del `ReferenceLine` por el valor `stats?.avgDailyGames`, que ya existe y se muestra en la tarjeta KPI.

### Detalle tecnico

**Archivo:** `src/components/admin/AdminDashboard.tsx`

Cambiar la propiedad `y` del `ReferenceLine` (linea ~333) de:

```typescript
y={+(timelineData.reduce(...) / timelineData.length).toFixed(1)}
```

A:

```typescript
y={stats?.avgDailyGames ? +stats.avgDailyGames : 0}
```

Tambien actualizar la condicion para que solo se muestre cuando `stats` este disponible:

```typescript
{timelineData && timelineData.length > 0 && stats?.avgDailyGames && (
  <ReferenceLine
    y={+stats.avgDailyGames}
    stroke="#4B2B8A"
    strokeWidth={1}
    strokeOpacity={0.4}
    strokeDasharray="6 3"
    label={{ value: `Promedio: ${stats.avgDailyGames}`, position: "right", fontSize: 10, fill: "#4B2B8A", opacity: 0.6 }}
  />
)}
```

Asi la linea mostrara siempre el mismo valor que la tarjeta KPI "Diarias" (57.6), independientemente del rango de tiempo seleccionado. Un unico cambio en un archivo.


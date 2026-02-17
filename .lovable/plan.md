
## Limitar la vista "Todo" del grafico al 1 de diciembre de 2025

### Problema

Cuando se selecciona "Todo" en el grafico de actividad del panel de administracion, la fecha de inicio queda como `null`, lo que hace que la funcion RPC devuelva datos desde enero de 2025 (o antes). Esto deja demasiado espacio vacio antes del lanzamiento real.

### Solucion

Cambiar la logica en `src/components/admin/AdminDashboard.tsx` para que, cuando `timeRange === "all"`, se use el **1 de diciembre de 2025** como fecha de inicio en lugar de `null`.

### Detalle tecnico

**Archivo:** `src/components/admin/AdminDashboard.tsx` (lineas 82-88)

Codigo actual:

```typescript
if (timeRange === "7d") {
  startDate = subDays(now, 7);
} else if (timeRange === "30d") {
  startDate = subDays(now, 30);
}
// "all" deja startDate = null
```

Codigo nuevo:

```typescript
if (timeRange === "7d") {
  startDate = subDays(now, 7);
} else if (timeRange === "30d") {
  startDate = subDays(now, 30);
} else {
  // Vista "Todo" desde el 1 de diciembre de 2025
  startDate = new Date(2025, 11, 1); // mes 11 = diciembre
}
```

Es un cambio de 1 linea. No se tocan otros archivos ni la base de datos.

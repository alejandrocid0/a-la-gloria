

## Refactorizar AdminDashboard.tsx en componentes modulares

### Objetivo

Dividir `AdminDashboard.tsx` (~594 lineas) en 5 archivos mas pequenos y manejables sin cambiar ningun comportamiento visual ni funcional.

### Archivos nuevos (todos en `src/components/admin/`)

| Archivo | Contenido | Lineas origen aprox. |
|---|---|---|
| `adminTypes.ts` | Tipos compartidos: `TimeRange`, `RetentionCategory`, `UserRetentionInfo` | 28-39 |
| `StatsCards.tsx` | Los 5 KPIs en grid. Recibe `avgRetention` como prop | 238-316 |
| `ActivityChart.tsx` | Grafico de lineas + selector de rango temporal (7d/30d/Todo). Query propia `admin-dashboard-timeline` | 318-383 |
| `RetentionSection.tsx` | 5 tarjetas de retencion + dialog de usuarios + exportar correos CSV. Query propia `admin-dashboard-retention`. Expone `avgRetention` via callback | 385-549 |
| `HermandadesSection.tsx` | Top 10 Hermandades (card + dialog). Query propia `admin-dashboard-hermandades` | 551-589 |

### Archivo modificado

**`AdminDashboard.tsx`** se reduce a ~40 lineas:
- Mantiene la query `admin-dashboard-stats` (la mas ligera)
- Calcula `avgRetention` usando la query de retention cacheada por React Query (misma queryKey que `RetentionSection`, sin doble peticion)
- Renderiza los 4 componentes en un `div` con `flex flex-col gap-6`

### Flujo de datos

```text
AdminDashboard.tsx (~40 lineas)
  |
  |-- StatsCards         props: { stats, avgRetention }
  |-- ActivityChart      query interna: admin-dashboard-timeline
  |-- RetentionSection   query interna: admin-dashboard-retention
  |-- HermandadesSection query interna: admin-dashboard-hermandades
```

`StatsCards` no tiene query propia; recibe los datos ya procesados desde el padre. Esto evita duplicar la query de stats y mantiene el componente puramente presentacional.

### Pasos de implementacion

1. Crear `adminTypes.ts` con los 3 tipos exportados
2. Crear `StatsCards.tsx` como componente presentacional (recibe props, no hace queries)
3. Crear `ActivityChart.tsx` con su query y estado `timeRange` interno
4. Crear `RetentionSection.tsx` con su query, estados de dialog, logica de exportacion CSV, y las funciones auxiliares `getCategoryTitle`, `getCategoryUsers`
5. Crear `HermandadesSection.tsx` con su query y estado `showHermandades`
6. Reducir `AdminDashboard.tsx` a importar y componer los 4 componentes, manteniendo solo la query de stats y la de retention (para calcular `avgRetention`)

### Que NO cambia

- Aspecto visual: identico al actual
- Funcionalidad: identica (exportar CSV, dialogs, graficos, KPIs)
- Queries a la base de datos: las mismas, con las mismas queryKeys
- Dependencias externas: ninguna nueva


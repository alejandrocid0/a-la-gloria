

## Plan: Reorganizar KPIs en Cuadrícula 2x2

### Resumen de Cambios

Se reorganizará la sección de KPIs principales de 3 tarjetas verticales a una cuadrícula 2x2 con 4 métricas más relevantes:

| Posición | Métrica Actual | Métrica Nueva |
|----------|---------------|---------------|
| Arriba-Izq | Usuarios | Usuarios (sin cambio) |
| Arriba-Der | Partidas | Partidas (sin cambio) |
| Abajo-Izq | Promedio partidas/usuario | **Retención Media Global** |
| Abajo-Der | - | **Partidas Diarias Promedio** |

---

### Nuevas Métricas

**1. Retención Media Global**
- Calcula el promedio ponderado de los porcentajes de retención de todos los usuarios
- Fórmula: `SUM(porcentaje_retención_cada_usuario) / total_usuarios`
- Se obtiene sumando los porcentajes individuales del RPC `get_user_retention_stats`
- Icono: `TrendingUp` o `Percent`
- Muestra: `XX.X%` con subtítulo "retención media"

**2. Partidas Diarias Promedio (desde 30 dic)**
- Calcula: `total_partidas / días_desde_lanzamiento`
- Fecha de lanzamiento: 30 de diciembre de 2024
- Usa los datos ya disponibles en `stats.totalGames`
- Icono: `Calendar` o `BarChart`
- Muestra: `XX.X` con subtítulo "partidas/día"

---

### Cambios en Código

**Archivo**: `src/components/admin/AdminDashboard.tsx`

**1. Modificar query de stats**

Añadir cálculo de días desde lanzamiento y partidas diarias:

```typescript
const LAUNCH_DATE = new Date('2024-12-30');
const daysSinceLaunch = Math.max(
  Math.floor((Date.now() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24)),
  1
);
const avgDailyGames = (totalGames / daysSinceLaunch).toFixed(1);
```

**2. Calcular retención media desde retentionStats**

Añadir cálculo en el componente usando los datos de usuarios:

```typescript
const avgRetention = useMemo(() => {
  if (!retentionStats?.users) return null;
  const allUsers = [
    ...retentionStats.users.high,
    ...retentionStats.users.medium,
    ...retentionStats.users.low,
    ...retentionStats.users.none
  ];
  if (allUsers.length === 0) return 0;
  const sumPercentages = allUsers.reduce((sum, u) => sum + u.percentage, 0);
  return (sumPercentages / allUsers.length).toFixed(1);
}, [retentionStats]);
```

**3. Cambiar layout de KPIs**

De columna vertical a grid 2x2:

```tsx
// Antes: flex flex-col gap-4 con 3 Cards
// Después: grid grid-cols-2 gap-4 con 4 Cards

<div className="grid grid-cols-2 gap-4">
  {/* Usuarios */}
  <Card>...</Card>
  
  {/* Partidas */}
  <Card>...</Card>
  
  {/* Retención Media */}
  <Card>
    <CardHeader>
      <CardTitle>
        <Percent /> Retención
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>{avgRetention}%</p>
      <p>retención media</p>
    </CardContent>
  </Card>
  
  {/* Partidas Diarias */}
  <Card>
    <CardHeader>
      <CardTitle>
        <Calendar /> Diarias
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>{avgDailyGames}</p>
      <p>partidas/día</p>
    </CardContent>
  </Card>
</div>
```

**4. Ajustar layout general**

Cambiar el grid principal para acomodar el nuevo bloque 2x2:

```tsx
// Antes: grid-cols-1 lg:grid-cols-[200px_1fr]
// Después: sin columna lateral, todo en una columna con el grid 2x2 arriba

<div className="flex flex-col gap-6">
  {/* KPIs en grid 2x2 */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    ...
  </div>
  
  {/* Resto del contenido */}
  <Card>Gráfico</Card>
  <div>Top 3 Hermandades</div>
  <Card>Retención detallada</Card>
</div>
```

---

### Imports Adicionales

```typescript
import { Calendar, Percent } from "lucide-react";
import { useMemo } from "react";
```

---

### Vista Final Esperada

```text
+-------------------+-------------------+
|    👥 Usuarios    |   🎮 Partidas     |
|       XXX         |       XXX         |
+-------------------+-------------------+
|   📊 Retención    |   📅 Diarias      |
|      XX.X%        |       XX.X        |
|  retención media  |    partidas/día   |
+-------------------+-------------------+

[Gráfico de Actividad con filtros temporales]

[Top 3 Hermandades en fila]

[Retención de Usuarios - 4 categorías clickeables]
```

---

### Detalles Técnicos

| Aspecto | Valor |
|---------|-------|
| Fecha lanzamiento | 30 diciembre 2024 (`2024-12-30`) |
| Cálculo días | `Math.floor((now - launchDate) / 86400000)` |
| Retención media | Promedio aritmético de `percentage` de todos los usuarios |
| Mínimo días | 1 (para evitar división por 0) |


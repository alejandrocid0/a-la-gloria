

## Nuevo KPI: Usuarios Nuevos Diarios

### Cambio

Anadir una quinta tarjeta KPI al panel de administracion que muestre el promedio de usuarios nuevos por dia, calculado como: `totalUsers / diasDesdeLanzamiento`.

### Detalle tecnico

**Archivo:** `src/components/admin/AdminDashboard.tsx`

1. En la query `admin-dashboard-stats`, anadir un nuevo campo `avgDailyUsers` con el mismo calculo que `avgDailyGames` pero usando `totalUsers`:

```typescript
const avgDailyUsers = (totalUsers / daysSinceLaunch).toFixed(1);
return { totalUsers, totalGames, avgDailyGames, avgDailyUsers, daysSinceLaunch };
```

2. Importar el icono `UserPlus` de `lucide-react` para la nueva tarjeta.

3. Cambiar el grid de `grid-cols-2 md:grid-cols-4` a `grid-cols-2 md:grid-cols-5` para acomodar 5 tarjetas en escritorio.

4. Anadir la nueva tarjeta KPI despues de la de "Diarias" (o donde mejor encaje), con el mismo estilo visual:

```typescript
<Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
      <UserPlus className="h-4 w-4" />
      Nuevos/dia
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold text-secondary">
      {stats?.avgDailyUsers ?? "..."}
    </p>
    <p className="text-xs opacity-70 mt-1">usuarios/dia</p>
  </CardContent>
</Card>
```

Un solo archivo modificado, sin cambios en base de datos.


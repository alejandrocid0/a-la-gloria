

## Nueva categoría de exportacion: jugadores con 0-1 partidas

### Resumen
Añadir un boton adicional en la seccion "Exportar lista de correos" que exporte los correos de todos los jugadores que hayan jugado 0 o 1 partida, independientemente de su categoria de retencion.

### Cambios en `src/components/admin/RetentionSection.tsx`

**1. Nueva funcion de exportacion**
Crear una funcion `exportLowActivityCSV` que recoja usuarios de TODAS las categorias de retencion y filtre solo los que tengan `gamesPlayed <= 1`. La funcion `get_user_retention_stats` ya devuelve el campo `gamesPlayed` en cada usuario, asi que no hay cambios en base de datos.

**2. Nuevo boton en la seccion de exportacion**
Añadir un sexto boton debajo de los existentes (o en la misma grid ampliada) con el texto "0-1 partidas (N)" que llame a `exportLowActivityCSV`. Se mantiene el mismo estilo visual que los demas botones.

**3. Calculo del conteo**
Usar `useMemo` para calcular la lista de usuarios con 0-1 partidas a partir de los datos ya cargados en `retentionStats.users`, recorriendo todas las categorias y filtrando por `gamesPlayed <= 1`.

### Detalles tecnicos

```text
// Nuevo memo para usuarios con 0-1 partidas
const lowActivityUsers = useMemo(() => {
  if (!retentionStats?.users) return [];
  const all = [
    ...(retentionStats.users.high || []),
    ...(retentionStats.users.medium || []),
    ...(retentionStats.users.low || []),
    ...(retentionStats.users.none || []),
    ...(retentionStats.users.inactive || []),
  ];
  return all.filter(u => (u.gamesPlayed ?? 0) <= 1);
}, [retentionStats]);

// Funcion de exportacion
const exportLowActivityCSV = () => {
  const csv = "Nombre,Correo\n" + lowActivityUsers.map(u => `"${u.name}","${u.email}"`).join("\n");
  // ... misma logica de descarga con nombre "baja_actividad.csv"
};

// Grid pasa de grid-cols-5 a incluir el boton extra
<button onClick={exportLowActivityCSV}>
  0-1 partidas ({lowActivityUsers.length})
</button>
```

No se requieren cambios en base de datos ni en tipos. Solo cambios en `RetentionSection.tsx`.


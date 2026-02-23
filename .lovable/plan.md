

## Mejora #8: Mostrar hermandad en todas las posiciones del ranking

### Cambio

Actualmente en `Ranking.tsx` (linea 131-133), la hermandad solo se muestra para las posiciones 1-3:

```text
{player.position <= 3 && (
  <span className="text-xs text-muted-foreground">{player.hermandad}</span>
)}
```

### Solucion

Eliminar la condicion `player.position <= 3` para que la hermandad se muestre siempre debajo del nombre del jugador en todas las posiciones del ranking.

### Detalle tecnico

Un unico cambio en `src/pages/Ranking.tsx`: reemplazar el bloque condicional por el `<span>` sin condicion. La funcion RPC `get_top_ranking` ya devuelve el campo `hermandad` para todos los jugadores, asi que no hay cambios en backend.

### Que NO cambia

- Logica de carga del ranking
- Estilos del top 3 (medallas, gradientes)
- Barra fija de posicion del usuario
- Backend / base de datos


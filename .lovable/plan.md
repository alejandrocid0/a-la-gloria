

## Simplificar estadisticas del grafico de Actividad

### Cambios en `src/components/admin/ActivityChart.tsx`

1. **Eliminar la leyenda del grafico**: Quitar `<Legend />` (linea 136) del `LineChart`. Las lineas ya se identifican por color y los totales de abajo.

2. **Eliminar import de Legend**: Quitar `Legend` del import de recharts (linea 7).

3. **Quitar fondos redondeados de los badges**: Reemplazar los `<span>` con estilos `rounded-full`, `backgroundColor` y `px-3 py-1` por texto plano sin fondo. Solo quedara el texto con su color y el porcentaje al lado.

El resultado sera algo como:

```text
52 nuevos registros (+30%)  ·  320 partidas jugadas (-5%)
```

Texto limpio, sin pastillas de fondo, cada uno en su color (dorado y morado), con el porcentaje coloreado segun crecimiento/bajada.

### Detalle tecnico

- Linea 7: quitar `Legend` del import
- Linea 136: eliminar `<Legend />`
- Lineas 153-160: reemplazar los `span` con fondo por `span` sin fondo, sin `rounded-full`, sin `backgroundColor`, solo `color` y `font-semibold`

No hay cambios en queries, base de datos ni otros archivos.

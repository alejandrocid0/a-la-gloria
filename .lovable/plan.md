

## Plan: Rediseñar layout del contenido en TournamentCard

### Cambios en `src/components/tournament/TournamentCard.tsx`

**Eliminar** el recuadro gris de fecha (líneas 92-98) y reorganizar el contenido así:

```text
┌──────────────────────────────┐
│  [Imagen del torneo]         │
├──────────────────────────────┤
│ Nombre del Torneo  [Próximo] │  ← título + badge más grande
│ Descripción breve...         │
│ ┌──────────────────────────┐ │
│ │👤 12 participantes       │ │  ← recuadro gris/muted
│ │📅 11/3/2026 · 16:45      │ │  ← fecha + hora juntas
│ │📍 Ubicación del evento   │ │
│ └──────────────────────────┘ │
│ [  Botón contextual        ] │
└──────────────────────────────┘
```

**Detalles:**
1. El contenido ocupa todo el ancho (sin columna lateral de fecha).
2. Nombre en tamaño más grande (`text-lg`) con badge al lado (un poco más grande, `text-xs`).
3. Descripción debajo del nombre.
4. Los metadatos (participantes, fecha+hora, ubicación) van dentro de un recuadro `bg-muted rounded-lg p-3` con los datos en filas. La hora se añade junto a la fecha separada por `·`.
5. Progress de rondas (si joined) va dentro del mismo recuadro muted.

### Archivo afectado
| Archivo | Cambio |
|---------|--------|
| `TournamentCard.tsx` | Reestructurar layout: eliminar columna fecha, expandir contenido, agrupar metadatos en recuadro muted |


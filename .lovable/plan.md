

## Plan: Separar torneos finalizados de la vista principal

### Cambios en `src/pages/Tournament.tsx`

1. **Filtrar torneos activos vs finalizados**: Dividir `tournaments` en dos listas:
   - `activeTournaments`: status `upcoming` o `active`
   - `completedTournaments`: status `completed`

2. **Mostrar solo activos en la lista principal**: La lista principal solo renderiza `activeTournaments`. Si no hay activos, mostrar "Próximamente más torneos".

3. **Enlace "Torneos anteriores"**: Debajo del banner de cuenta atrás, añadir una fila con un enlace/botón discreto que diga "Torneos anteriores" con un icono de flecha (`ChevronRight` o `History`). Solo visible si hay torneos completados. Al pulsar, navega a `/torneo/anteriores`.

### Nueva página `src/pages/PastTournaments.tsx`

- Página simple con header "Torneos anteriores", botón de volver, y lista de torneos con `status === 'completed'` usando el mismo `TournamentCard`.
- Ruta: `/torneo/anteriores` (protegida).

### Cambios en `src/components/tournament/TournamentCard.tsx`

- Cambiar el color del badge "Finalizado": actualmente usa `bg-secondary` para todos. Para `completed`, usar un color diferente (gris/muted, ej: `bg-muted text-muted-foreground`).

### Cambios en `src/App.tsx`

- Añadir ruta `/torneo/anteriores` apuntando a `PastTournaments` dentro de `ProtectedRoute`.

### Resumen visual

```text
Pantalla Torneos (principal):
┌─────────────────────────┐
│  Header: Torneos        │
├─────────────────────────┤
│ ¡Próximo torneo hoy!    │
│                         │
│ 📋 Torneos anteriores → │  ← solo si hay completados
├─────────────────────────┤
│ [TournamentCard activo] │
│ [TournamentCard próximo]│
└─────────────────────────┘

Pantalla Torneos Anteriores:
┌─────────────────────────┐
│ ← Torneos anteriores    │
├─────────────────────────┤
│ [TournamentCard final.] │  badge gris "Finalizado"
│ [TournamentCard final.] │
└─────────────────────────┘
```


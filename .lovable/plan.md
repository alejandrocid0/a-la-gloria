

## Plan: Barra dorada en vista en vivo + ordenar torneos por fecha y hora

### Cambio 1: Barra de progreso dorada en `TournamentLive.tsx`

**Línea 106** — La barra `<Progress>` usa el color `bg-primary` (morado) por defecto para el indicador. Hay que cambiar el indicador a dorado.

Pasar una clase personalizada al indicador. Como el componente `Progress` no expone `indicatorClassName`, modificar `src/components/ui/progress.tsx` para aceptar una prop `indicatorClassName`, y luego usarla en `TournamentLive`:

- **`src/components/ui/progress.tsx`**: Añadir prop `indicatorClassName` y aplicarla al `Indicator` con merge sobre `bg-primary`.
- **`src/pages/TournamentLive.tsx`** línea 106: Pasar `indicatorClassName="bg-secondary"` (dorado) con transición suave.

### Cambio 2: Ordenar torneos por fecha + hora en `Tournament.tsx`

**Línea 22** — Actualmente ordena solo por `tournament_date`. Añadir segundo criterio `.order("tournament_time", { ascending: true })` para que torneos del mismo día se ordenen por hora.


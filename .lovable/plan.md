

## Plan: Mostrar podio siempre en la clasificación del torneo

### Cambio en `src/pages/TournamentRanking.tsx`

**Línea 153**: Cambiar `{top3.length >= 3 && <TournamentPodium top3={top3} />}` por `<TournamentPodium top3={top3} />`.

Esto hace que el podio se renderice siempre, incluso con 1 o 2 jugadores. `TournamentPodium` ya muestra `"?"` y `"---"` para posiciones vacías, así que no necesita cambios.

No se modifica nada más. El ranking público para torneos completados ya funciona correctamente con el flujo actual.


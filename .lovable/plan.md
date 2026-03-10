

## Plan: Eliminar mockups de torneos

### Cambio

En `src/pages/Tournament.tsx`:

1. **Eliminar** la constante `MOCK_TOURNAMENTS` completa (líneas ~10-45)
2. **Eliminar** la variable `isMock` y la lógica condicional `tournaments = dbTournaments.length > 0 ? dbTournaments : MOCK_TOURNAMENTS`
3. **Usar directamente** `dbTournaments` como fuente de datos
4. **Añadir estado vacío**: cuando `dbTournaments` es un array vacío, mostrar un texto centrado "Próximamente más torneos" en lugar de las tarjetas
5. **Limpiar props**: eliminar `isMock={true/false}` del `TournamentCard` y la lógica de `_participantCount` para mocks

### Resultado

- Sin torneos reales → texto centrado "Próximamente más torneos"
- Con torneos reales → tarjetas normales con datos reales


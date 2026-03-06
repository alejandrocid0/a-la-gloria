

## Cambio de lógica: botón contextual en cada tarjeta de torneo

### Resumen

Eliminar el botón global "Unirse con código" y mover esa lógica a cada tarjeta individual. El botón dorado de cada torneo cambia según el estado del usuario:

- **No apuntado** → botón dorado "Unirse al torneo" → abre diálogo con código
- **Ya apuntado** → botón dorado "Jugar torneo" → navega al torneo

### Cambios

**1. `src/pages/Tournament.tsx`**
- Eliminar el botón "Unirse con código" (líneas 92-103)
- Eliminar el estado `joinOpen` y el componente `JoinTournamentDialog` del nivel de página
- Consultar `tournament_participants` para el usuario actual (`auth.uid()`) y pasar a cada tarjeta si el usuario ya está inscrito
- Pasar `join_code` del torneo a cada `TournamentCard`

**2. `src/components/tournament/TournamentCard.tsx`**
- Añadir props: `isJoined: boolean`, `joinCode: string`, `onJoin?: () => void`
- Si `isJoined = false`: botón muestra "Unirse al torneo" y abre `JoinTournamentDialog` inline (estado local)
- Si `isJoined = true`: botón muestra "Jugar Torneo"
- Incluir el `JoinTournamentDialog` dentro de cada tarjeta, pre-rellenando o validando contra el `joinCode` del torneo
- Para mockups: el botón siempre muestra "Unirse al torneo" (sin funcionalidad real)

**3. `src/components/tournament/JoinTournamentDialog.tsx`**
- Sin cambios de diseño, se reutiliza tal cual pero ahora se abre desde cada tarjeta individual


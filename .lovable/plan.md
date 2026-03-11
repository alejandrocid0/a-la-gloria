

## Plan: Eliminar pre-relleno del código de acceso al torneo

### Problema

`TournamentCard` pasa `prefillCode={joinCode}` al `JoinTournamentDialog`, y `joinCode` viene directamente de `t.join_code` en la base de datos. Esto hace que cualquier usuario vea el código ya escrito al pulsar "Unirse al torneo", anulando la seguridad del código.

### Cambio

En `src/components/tournament/TournamentCard.tsx`:
- Eliminar el prop `prefillCode={joinCode}` del `JoinTournamentDialog` (línea ~170), dejándolo sin valor o vacío.
- Opcionalmente eliminar también el prop `joinCode` del componente `TournamentCard` ya que no debería llegar al frontend del jugador.

En `src/pages/Tournament.tsx`:
- Dejar de pasar `joinCode={t.join_code}` al `TournamentCard` para que el código nunca llegue al cliente del jugador.

Resultado: el diálogo se abrirá con el campo vacío y el usuario tendrá que escribir el código manualmente.


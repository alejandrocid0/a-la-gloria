

## Plan: Mejoras del flujo admin para el día del torneo

### Problemas detectados

1. **Participantes no se actualizan en tiempo real**: La query `participantCounts` (línea 137) no tiene `refetchInterval`. El admin no ve nuevos participantes sin recargar.
2. **Botón "Desbloquear" para Ronda 1 no es claro**: Cuando `current_round === 0`, desbloquear la Ronda 1 es equivalente a "Iniciar Torneo", pero el botón no lo refleja.

### Cambios en `src/components/admin/TournamentManager.tsx`

1. **Añadir `refetchInterval: 5000`** a la query `participantCounts` (línea 137) para que el admin vea participantes uniéndose en tiempo real.

2. **Diferenciar el botón de Ronda 1**: Cuando `current_round === 0` y se muestra el botón para desbloquear la Ronda 1, cambiar el texto a "Iniciar Torneo" con icono de `Swords` en lugar de "Desbloquear".

### Resultado

El flujo del admin el día del torneo será:
- Abre detalle del torneo → ve el código (con botón copiar) → comparte el código
- Ve participantes sumándose en tiempo real (polling 5s)
- Pulsa "Iniciar Torneo" (desbloquea Ronda 1, estado pasa a `active`)
- Ve progreso de cada ronda (X/Y jugadores completados, polling 5s)
- Desbloquea siguientes rondas cuando lo considere
- Pulsa "Finalizar Torneo" tras la Ronda 5


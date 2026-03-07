

## Revisión completa del sistema de torneos — Estado actual

Todo el flujo está correctamente implementado y conectado. No hay bugs funcionales pendientes.

### Flujo confirmado y funcionando

1. **Admin crea torneo** → nombre, descripción, fecha, imagen, código de 6 caracteres, 50 preguntas (10 por ronda × 5 niveles de dificultad)
2. **Admin desbloquea rondas manualmente** → botón "Desbloquear" en panel admin incrementa `current_round` de 0 a 5
3. **Admin finaliza torneo manualmente** → botón "Finalizar Torneo" tras ronda 5 (confirmado que lo quieres manual)
4. **Usuario se une con código** → JoinTournamentDialog busca torneo por `join_code`, inserta en `tournament_participants`
5. **Usuario accede al ranking** → desde la tarjeta del torneo, siempre va al ranking (hub central)
6. **Usuario juega ronda** → ranking muestra botón "Jugar Ronda N" si está desbloqueada y no la ha jugado
7. **Preguntas reales** → `get_tournament_round_questions` (SECURITY DEFINER) valida participación y ronda desbloqueada
8. **Verificación en servidor** → `check-answer` valida cada respuesta en tiempo real con feedback visual
9. **Envío batch al terminar** → `submit-tournament-round` valida todo de nuevo, calcula puntos, inserta respuestas, actualiza totales
10. **Resultado** → muestra puntuación de la ronda con polling cada 5s para detectar siguiente ronda
11. **Ranking** → `get_tournament_ranking` (SECURITY DEFINER) muestra todos los participantes con nombre, hermandad, puntos totales y puntos de última ronda
12. **Llegadas tarde** → confirmado que pueden ponerse al día jugando rondas anteriores en orden

### Único cambio pendiente: cuenta atrás automática

El banner "Próximo torneo en 3 días" en `Tournament.tsx` está hardcoded. Hay que calcularlo automáticamente basándose en el próximo torneo con `status = 'upcoming'` y su `tournament_date`.

**Cambio en `Tournament.tsx`**:
- Buscar el torneo con status `upcoming` más cercano en fecha
- Calcular la diferencia en días entre hoy y `tournament_date`
- Si hay torneo próximo: mostrar "Próximo torneo en X días" (o "Próximo torneo hoy" si es hoy)
- Si no hay torneos próximos: ocultar el banner
- Si el torneo más cercano ya pasó de fecha: ocultar el banner

Solo se modifica un archivo: `src/pages/Tournament.tsx` (líneas 116-120 aproximadamente).


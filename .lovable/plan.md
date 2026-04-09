

# Análisis de estabilidad: opciones para eliminar bloqueos en partida

## El problema exacto

Cuando un usuario responde una pregunta, ocurre esto:

```text
Usuario toca respuesta → Timer de 15s SE PARA → await check-answer (red) → feedback verde/rojo → 1.5s → siguiente pregunta
```

Si la red falla o es lenta en el `await`, la app se congela indefinidamente porque no hay nada que fuerce el avance. Esto genera partidas abandonadas y pérdida de rachas.

## Las 3 opciones reales

### Opción A: Timeout en check-answer (recomendada)

Añadir un límite de 4 segundos a la llamada. Si no responde, se salta el feedback visual y se avanza.

- **Con buena conexión**: experiencia idéntica a la actual (verde/rojo en ~200ms)
- **Con mala conexión**: la pregunta avanza sin colores, pero la partida no se bloquea
- **Resultado final**: submit-game valida todo al final, la puntuación siempre es correcta
- **Llamadas de red**: sigue siendo 10 por partida (check-answer) + 1 (submit-game)
- **Riesgo**: ninguno. Es un cambio puramente defensivo

### Opción B: Eliminar check-answer completamente

No llamar al servidor entre preguntas. El feedback verde/rojo desaparece. Solo se muestra la puntuación final en la pantalla de resultados.

- **Ventaja**: reduce de 11 a 1 las llamadas de red por partida. Máxima estabilidad
- **Desventaja**: los usuarios pierden el feedback inmediato verde/rojo que les gusta
- **Se podría compensar**: ampliando la pantalla de resultados para mostrar pregunta por pregunta si acertó o no (submit-game ya devuelve esa info)
- **Llamadas de red**: solo 1 (submit-game)

### Opción C: Eliminar check-answer + feedback local con respuestas incluidas

Modificar las funciones RPC para que incluyan `correct_answer` en las preguntas enviadas al cliente. Así el feedback verde/rojo se calcula localmente sin red.

- **Ventaja**: feedback instantáneo, 0 llamadas entre preguntas, máximo rendimiento
- **Desventaja grave de seguridad**: el usuario tendría las respuestas correctas en memoria del navegador antes de responder. Cualquiera con DevTools podría ver las 10 respuestas. Esto invalida todo el sistema de seguridad que construimos en marzo
- **No recomendada**

## Recomendación

**Opción A** es la mejor relación coste/beneficio. No cambia la experiencia para el 95% de usuarios (conexión normal), y protege al 5% con conexión lenta de quedarse bloqueados. Es la menos invasiva y la más segura.

Si en el futuro quieres reducir llamadas al mínimo (por ejemplo, para la app nativa), la **Opción B** sería el siguiente paso, pero requiere rediseñar la pantalla de resultados.

## Cambios técnicos (Opción A)

### 1. Nuevo archivo: `src/lib/supabaseHelpers.ts`

Función `invokeWithTimeout` que envuelve `supabase.functions.invoke` con un `AbortController`. Si la llamada supera N milisegundos, se cancela y devuelve `null`.

### 2. Modificar: `src/hooks/useGameLogic.ts`

**En `processAnswer`** (línea 150-160):
- Reemplazar `await supabase.functions.invoke('check-answer')` por `invokeWithTimeout('check-answer', body, 4000)`
- Si devuelve `null` (timeout), poner `setVerifiedAnswer(null)` y continuar sin feedback visual
- Añadir `processingRef.current = false` en el `catch` para evitar bloqueo permanente

**En `submitGame`** (línea 88):
- Envolver con timeout de 8 segundos + 1 reintento automático
- Si ambos fallan, mostrar botón de reintento en vez de redirigir a inicio

### 3. Modificar: `src/components/game/QuestionCard.tsx`

- Cuando `verifiedAnswer` es `null` tras responder (caso timeout), mostrar el botón seleccionado con un estilo neutro (sin verde ni rojo) y avanzar normalmente

| Archivo | Cambio |
|---------|--------|
| `src/lib/supabaseHelpers.ts` | Nuevo: función `invokeWithTimeout` con AbortController |
| `src/hooks/useGameLogic.ts` | Timeout 4s en check-answer, timeout 8s + retry en submit-game, fix processingRef |
| `src/components/game/QuestionCard.tsx` | Manejar caso sin feedback (verifiedAnswer null tras responder) |

No requiere cambios en base de datos ni en Edge Functions.


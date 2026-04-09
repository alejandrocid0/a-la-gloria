

# Fix final: Recuperación de partidas ante fallos de red

## Resumen

Dos cambios en el manejo de errores de `useGameLogic.ts` + pantalla de reintento en `Play.tsx`. No se toca el flujo normal de juego.

## Cambios

### 1. `src/hooks/useGameLogic.ts`

**En `submitGame`** (líneas 103-106 y 125-129):
- Añadir estado `submitFailed: boolean` (default `false`)
- Cuando submit falla (ambos intentos): `setSubmitFailed(true)` en vez de `navigate('/')`
- Nueva función `retrySubmit()`: llama `submitGame(submissionDataRef.current)` y resetea `submitFailed`
- Exportar `submitFailed` y `retrySubmit`

**En `startGame`** (líneas 217-222):
- Cuando error `23505`: hacer SELECT de la partida existente para hoy
- Si `status === 'in_progress'`: reutilizar ese `gameId`, llamar `setGameStarted(true)`
- Si `status === 'completed'`: mantener error actual "No puedes volver a jugar hoy"

### 2. `src/pages/Play.tsx`

- Antes del render del juego activo, comprobar `game.submitFailed`
- Si es `true`: renderizar pantalla con icono `WifiOff`, texto "No se han podido enviar tus resultados", botón "Reintentar" → `game.retrySubmit()`, y texto pequeño "Comprueba tu conexión a internet"

## Archivos

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useGameLogic.ts` | Estado `submitFailed` + `retrySubmit` + reutilizar partida `in_progress` en `startGame` |
| `src/pages/Play.tsx` | Pantalla de reintento cuando `submitFailed === true` |

No requiere cambios en base de datos, Edge Functions ni RLS.


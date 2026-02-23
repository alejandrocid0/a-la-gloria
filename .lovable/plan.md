

## Refactorizar Play.tsx — Eliminar duplicacion y modularizar

### El problema

`Play.tsx` tiene 618 lineas con dos bloques de ~100 lineas cada uno que hacen lo mismo: verificar respuesta con el servidor, mostrar feedback, avanzar o enviar resultado final. La unica diferencia visual entre "tiempo agotado" y "usuario responde" es un texto rojo de 3 lineas.

### Respuesta a la duda: tiempo agotado vs respuesta manual

El hook `useGameLogic` expone un estado `timeExpired: boolean`:

- Timer llega a 0: `timeExpired = true`, llama a `processAnswer(0, 15)`
- Usuario pulsa: `timeExpired = false`, llama a `processAnswer(answerValue, timeTaken)`

El componente `QuestionCard` lee ese boolean para mostrar o no el texto "Tiempo agotado!". La logica interna de `processAnswer` es identica en ambos casos.

### Archivos nuevos

| Archivo | Contenido | Lineas aprox. |
|---|---|---|
| `src/hooks/useGameLogic.ts` | Hook con estados del juego, timer, `processAnswer()` unificado, `submitGame()`, `startGame()` | ~150 |
| `src/components/game/PreGameScreen.tsx` | Pantalla intro "A esta es" con info del dia y boton de inicio | ~80 |
| `src/components/game/GameHeader.tsx` | Barra superior: progreso, timer, puntos maximos | ~40 |
| `src/components/game/QuestionCard.tsx` | Pregunta + 4 botones de respuesta + texto "Tiempo agotado" condicional | ~90 |

### Archivo modificado

**`src/pages/Play.tsx`** se reduce a ~80 lineas:
- Carga las queries de datos (preguntas, fecha servidor, partida de hoy)
- Muestra estados de carga/error
- Instancia `useGameLogic` con las preguntas y el usuario
- Renderiza `PreGameScreen` o `GameHeader` + `QuestionCard` segun `gameStarted`

### Logica unificada en useGameLogic

```text
Estados expuestos:
  gameStarted, currentQuestion, timeLeft, timeExpired,
  selectedAnswer, verifiedAnswer, isVerifying, gameId

Funciones expuestas:
  startGame()    -> crea registro en BD, pone gameStarted=true
  processAnswer(answer, timeElapsed) -> registra, verifica, feedback, avanza/finaliza

Flujo interno de processAnswer:
  1. Guardar respuesta en submissionData
  2. Llamar a check-answer (edge function)
  3. Poner verifiedAnswer con resultado del servidor
  4. Esperar 1.5s
  5. Si quedan preguntas: resetear estados, avanzar
  6. Si ultima pregunta: submitGame() -> submit-game, invalidar cache, navigate /resultados
```

El `useEffect` del timer dentro del hook detecta `timeLeft === 0` y llama a `processAnswer(0, 15)`. El componente QuestionCard llama a `processAnswer(answerValue, timeTaken)` al hacer click. **Un solo punto de logica.**

### Correccion del comentario

Linea 25: `correct_answer: integer (0-3)` se corrige a `(1-4)`.

### Que NO cambia

- Aspecto visual: identico (incluido el texto "Tiempo agotado!" cuando corresponde)
- Flujo de juego: identico
- Llamadas al servidor: las mismas edge functions
- Dependencias: ninguna nueva


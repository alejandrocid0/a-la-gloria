

## Mejora #7: Indicador de "Nueva mejor puntuacion" en Results.tsx

### Que mejora y por que

Actualmente, cuando un jugador supera su record personal, no recibe ninguna notificacion. La puntuacion se guarda silenciosamente. Esto es una oportunidad perdida de motivacion: el momento justo tras superar tu marca es cuando mas impacto tiene un mensaje de celebracion. Mejora la retencion y la sensacion de progreso.

### Donde se mostraria

Justo debajo de la puntuacion en la Score Card principal de Results.tsx, aparecera un banner dorado con el texto "Nueva mejor puntuacion!" cuando el score actual supere el record anterior. Si no es record, no se muestra nada (sin cambios visuales).

### Como funciona (sin tocar la base de datos)

La edge function `submit-game` ya calcula si es un nuevo record en la linea 217:

```text
const newBestScore = Math.max(profile.best_score || 0, totalScore);
```

Solo falta:

1. **En `submit-game/index.ts`**: anadir un campo `isNewBestScore: totalScore > (profile.best_score || 0)` a la respuesta JSON (linea 260-267).

2. **En `useGameLogic.ts`**: pasar ese nuevo campo `isNewBestScore` en el `navigate('/resultados', { state: ... })` (linea 100-108).

3. **En `Results.tsx`**: leer `isNewBestScore` del state y, si es `true`, mostrar un banner dorado animado debajo de la puntuacion.

### Detalle tecnico

**Archivo 1: `supabase/functions/submit-game/index.ts`**
- Anadir una variable `isNewBestScore` antes del return (tras linea 217).
- Incluirla en el JSON de respuesta junto a `score`, `correctAnswers`, etc.

**Archivo 2: `src/hooks/useGameLogic.ts`**
- Leer `result.isNewBestScore` de la respuesta del edge function.
- Pasarlo en el objeto `state` del `navigate('/resultados', ...)`.

**Archivo 3: `src/pages/Results.tsx`**
- Extraer `isNewBestScore` de `location.state`.
- Si es `true`, renderizar un `<div>` con fondo dorado, icono de trofeo y texto "Nueva mejor puntuacion!" entre la Score Card y las Stats.
- Estilo: borde dorado (`border-[hsl(45,71%,65%)]`), fondo con gradiente dorado suave, texto centrado con animacion `animate-pulse` sutil.

### Que NO cambia

- Base de datos: no hay migraciones ni columnas nuevas
- Logica de calculo de puntuacion: identica
- Flujo de juego: identico
- Aspecto de Results.tsx cuando NO es record: identico


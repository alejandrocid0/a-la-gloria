

# Fix feedbackDelay: siempre 1500ms

## Cambio

En `src/hooks/useGameLogic.ts`, línea ~167-168, reemplazar:

```ts
// Wait for visual feedback (1.5s if we got feedback, 0.5s if timeout), then advance
const feedbackDelay = verifiedAnswer !== null ? 1500 : 500;
```

Por:

```ts
const feedbackDelay = 1500;
```

También eliminar `verifiedAnswer` de la lista de dependencias del `useCallback` de `processAnswer` (línea ~185), ya que dejará de usarse dentro del callback.

Un archivo, dos líneas.


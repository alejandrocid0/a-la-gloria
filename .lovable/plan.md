

## Correcciones: prefillCode + auto-refresco de torneos

### 1. Fix prefillCode en `JoinTournamentDialog.tsx`

Añadir un `useEffect` que sincronice el estado `code` cuando el diálogo se abre:

```typescript
useEffect(() => {
  if (open) setCode(prefillCode);
}, [open, prefillCode]);
```

### 2. Auto-refresco en `Tournament.tsx`

Añadir `refetchInterval: 10000` a la query principal `dbTournaments` para que el estado de los torneos se actualice automáticamente cada 10 segundos.


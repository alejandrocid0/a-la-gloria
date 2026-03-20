

## Plan: Mejorar manejo de logout en Admin

### Problema

`supabase.auth.signOut()` no lanza excepciones cuando la sesión ya no existe en el servidor — devuelve `{ error }` en el objeto de retorno. El código actual usa try/catch, por lo que el error pasa desapercibido y el usuario queda atrapado.

### Cambio

**Archivo**: `src/pages/Admin.tsx` (función `handleLogout`, líneas 66-74)

Cambiar de try/catch a inspeccionar el resultado, y navegar a `/auth` siempre (incluso si hay error, porque si la sesión no existe, el usuario ya está efectivamente deslogueado):

```typescript
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn("Logout error (proceeding anyway):", error.message);
  }
  toast.success("Sesión cerrada correctamente");
  navigate('/auth');
};
```

### Impacto

- Un único archivo modificado
- El usuario siempre será redirigido a `/auth` al pulsar "Cerrar Sesión", independientemente del estado de la sesión en el servidor


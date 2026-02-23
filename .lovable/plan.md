

## Refactorizar Auth.tsx -- Separar formularios en componentes independientes

### El problema actual

`Auth.tsx` tiene 459 lineas con tres formularios distintos mezclados en un solo componente, controlados por una combinacion de booleanos que se cruzan entre si:

- `showResetForm` -- muestra el formulario de nueva contrasena
- `showResetInLogin` -- muestra el formulario de solicitar enlace de recuperacion
- `isRecoveryMode` -- evita redirigir al usuario cuando viene de un enlace de recovery

Esto genera un bloque ternario triple anidado (lineas 293-401) dificil de leer:

```text
{!showResetInLogin && !showResetForm ? (
   <LoginForm>
) : showResetForm ? (
   <UpdatePasswordForm>
) : (
   <RequestResetForm>
)}
```

### Beneficio real y honesto

- **Legibilidad**: cada formulario sera un archivo independiente de 60-90 lineas en lugar de una cadena ternaria triple de 110 lineas.
- **Mantenimiento aislado**: si manana quieres cambiar el flujo de registro (por ejemplo, anadir un campo "apellido"), solo tocas `RegisterForm.tsx` sin riesgo de romper el login o la recuperacion.
- **Eliminacion de estados cruzados**: los booleanos `showResetForm` / `showResetInLogin` / `isRecoveryMode` se simplifican a un unico estado tipo `loginView: 'login' | 'requestReset' | 'updatePassword'` que es imposible que entre en conflicto.
- **No cambia nada para el usuario**: las tres funciones (login, registro, recuperacion) siguen funcionando exactamente igual. Las mismas validaciones Zod, los mismos toasts, las mismas llamadas al servidor.

### Plan de implementacion

| Archivo | Contenido | Lineas aprox. |
|---|---|---|
| `src/components/auth/LoginForm.tsx` | Formulario de email + contrasena + enlace "Olvidaste tu contrasena?" + logica de verificacion admin | ~70 |
| `src/components/auth/RegisterForm.tsx` | Formulario con nombre, hermandad (combobox), email, contrasena + indicador de fortaleza | ~80 |
| `src/components/auth/RequestResetForm.tsx` | Formulario de solicitar enlace de recuperacion por email | ~50 |
| `src/components/auth/UpdatePasswordForm.tsx` | Formulario de nueva contrasena + confirmar contrasena (cuando el usuario llega desde el enlace de recovery) | ~60 |
| `src/pages/Auth.tsx` | Componente orquestador: detecta modo recovery desde URL, redirige si autenticado, renderiza Tabs con los componentes | ~80 |

### Detalle tecnico

**Estado simplificado en Auth.tsx:**

```text
Antes (3 booleanos que se cruzan):
  showResetForm + showResetInLogin + isRecoveryMode

Despues (1 estado claro):
  loginView: 'login' | 'requestReset' | 'updatePassword'
  + isRecoveryMode solo para el useEffect de redireccion
```

**Props que recibe cada componente:**

- `LoginForm`: `isLoading`, `onSubmit(email, password)`, `onForgotPassword()`
- `RegisterForm`: `isLoading`, `onSubmit(name, hermandad, email, password)`
- `RequestResetForm`: `isLoading`, `onSubmit(email)`, `onBack()`
- `UpdatePasswordForm`: `isLoading`, `onSubmit(password)`, `onBack()`

Cada componente gestiona su propio estado local (valores de inputs) y llama al callback del padre al hacer submit. La logica de llamadas a Supabase, validacion Zod, toasts de error y navegacion se mantiene en `Auth.tsx` exactamente como esta ahora.

### Que NO cambia

- Flujo de login con verificacion de admin: identico
- Registro con trigger `handle_new_user()`: identico
- Recuperacion de contrasena en dos pasos (solicitar enlace + cambiar contrasena): identico
- Validaciones Zod: las mismas
- Indicador de fortaleza de contrasena: el mismo componente
- Combobox de hermandades: el mismo componente
- Aspecto visual: identico
- Dependencias: ninguna nueva


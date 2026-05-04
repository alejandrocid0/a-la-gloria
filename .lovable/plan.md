## Resumen

1. Renombrar el botón en el perfil.
2. Añadir un botón "Eliminar cuenta definitivamente" en la página Acerca, con confirmación, que borra el usuario por completo.
3. Crear un registro de auditoría (`account_deletions`) para que en el panel admin quede constancia.

---

## 1. Cambio de texto (Profile)

En `src/pages/Profile.tsx`, cambiar el texto del botón:
- **Antes**: "Más info sobre A la Gloria"
- **Después**: "Más información y ajustes"

---

## 2. Eliminar cuenta definitivamente

### Frontend — `src/pages/Acerca.tsx`

Añadir, debajo del formulario de contacto, una **Card roja de "Zona de peligro"** con un botón "Eliminar cuenta definitivamente" que abra un `AlertDialog`. El diálogo:
- Avisa de que la acción es **irreversible** y que se perderán puntos, partidas, rachas y logros.
- Pide escribir la palabra **"ELIMINAR"** para confirmar.
- Al confirmar llama a la edge function `delete-account` y, al volver, hace `signOut()` y redirige a `/auth` con un toast.

### Backend — Edge function `delete-account`

Nueva función en `supabase/functions/delete-account/index.ts` (con `verify_jwt = false` y validación manual del JWT en código, según convención del proyecto). Lógica con `service_role`:

1. Validar JWT y obtener `user_id`.
2. Leer `profiles` (name, email, hermandad, total_points, games_played) para guardar el registro de auditoría.
3. Insertar fila en `account_deletions` con esos datos + `deleted_at = now()`.
4. Borrar datos del usuario en orden:
   - `tournament_answers` where `user_id`
   - `tournament_participants` where `user_id`
   - `games` where `user_id`
   - `feedback` where `user_id`
   - `user_roles` where `user_id`
   - `profiles` where `id` (cubierto también por la policy "Users can delete own profile", pero lo hacemos con service_role para garantizarlo)
5. `supabase.auth.admin.deleteUser(user_id)` — esto impide volver a iniciar sesión con esas credenciales (incluido Google OAuth con ese email).
6. Responder `{ success: true }`.

### Migración de base de datos

Crear tabla de auditoría:

```sql
CREATE TABLE public.account_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id uuid NOT NULL,
  name text,
  email text,
  hermandad text,
  total_points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver el histórico
CREATE POLICY "Admins can view deletions"
  ON public.account_deletions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Solo el service_role inserta (desde la edge function); ninguna policy de INSERT pública.
```

---

## 3. Panel admin — visibilidad del registro

Añadir al final del `AdminDashboard` una nueva sección **"Cuentas eliminadas"** (`AccountDeletionsSection.tsx`) que liste las últimas 50 eliminaciones (fecha, nombre, email, hermandad, puntos y partidas que tenía al borrarse). Es informativa; los datos ya no afectan a estadísticas vivas.

---

## 4. Respuesta a tu pregunta sobre estadísticas

**Sí, exactamente.** Al borrar el perfil:

- **Total de usuarios**: baja en 1 (la query `get_public_profiles` deja de contarlo).
- **Total de partidas**: baja en `games_played` de ese usuario (las filas de `games` se borran).
- **Nuevos/día, Partidas/día, Recurrentes**: se recalculan automáticamente en la siguiente carga del dashboard porque se basan en las queries en vivo.
- **Ranking**: el usuario desaparece y los demás suben de posición.
- **Torneos pasados**: sus respuestas y participación se borran, así que dejará de aparecer en rankings históricos de torneo.

Por eso es importante el registro `account_deletions`: es la única traza que queda de que esa persona existió, para tu control.

---

## Detalles técnicos (referencia)

- `verify_jwt = false` en `supabase/config.toml` para la nueva función (validación de JWT manual con `supabase.auth.getUser(token)`).
- Cliente con `SUPABASE_SERVICE_ROLE_KEY` dentro de la function para poder borrar de `auth.users`.
- Llamada desde el frontend con `supabase.functions.invoke('delete-account')`.
- Tras éxito: `await signOut()` + `navigate('/auth')`.
- Sin nuevas dependencias. Sin cambios en otras pantallas.

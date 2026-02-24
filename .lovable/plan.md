

## Mejora #9: Editar nombre y hermandad desde el perfil

### Que se hara

En la tarjeta superior de perfil (la que muestra el avatar, nombre, hermandad y email), se anadira un icono de edicion (lapiz) en la esquina superior derecha. Al pulsarlo, la tarjeta cambiara a modo edicion inline: el nombre se convertira en un input de texto y la hermandad en el combobox `HermandadCombobox` ya existente. El email NO sera editable. Apareceran botones de "Guardar" y "Cancelar" para confirmar o descartar los cambios.

### Donde aparece

Dentro del `<Card>` de "User Info" en `Profile.tsx` (lineas 51-80). El icono de lapiz se posicionara en la esquina superior derecha de esa tarjeta usando `position: relative` en la Card y `position: absolute` en el boton.

### Flujo de usuario

1. El usuario ve su perfil con el icono de lapiz arriba a la derecha de la tarjeta.
2. Pulsa el lapiz -> la tarjeta cambia a modo edicion: nombre se convierte en input, hermandad en combobox. El email permanece como texto no editable.
3. El usuario modifica lo que quiera y pulsa "Guardar" -> se valida con zod, se hace UPDATE a `profiles` via Supabase, se muestra toast de exito y se refresca el perfil.
4. Si pulsa "Cancelar" -> se restauran los valores originales y se vuelve al modo lectura.

### Detalle tecnico

**Archivo 1: `src/lib/validations.ts`**
- Anadir un nuevo schema `editProfileSchema` con las mismas reglas que `registerSchema` para `name` (2-50 chars, solo letras) y `hermandad` (min 1 char).

**Archivo 2: `src/pages/Profile.tsx`**
- Importar: `useState`, `Pencil` de lucide-react, `Input`, `HermandadCombobox`, `supabase`, `useQueryClient`, y el nuevo schema de validaciones.
- Anadir estados: `isEditing`, `editName`, `editHermandad`, `isSaving`.
- En la Card de User Info:
  - Hacer la Card `relative`.
  - Anadir un boton con icono `Pencil` en `absolute top-3 right-3` que activa `isEditing`.
  - Cuando `isEditing === true`:
    - El nombre se reemplaza por un `<Input>` con el valor de `editName`.
    - La hermandad se reemplaza por `<HermandadCombobox>` con el valor de `editHermandad`.
    - El email se mantiene como texto.
    - Se muestran dos botones pequenos: "Guardar" (accent) y "Cancelar" (outline).
  - Cuando `isEditing === false`: se muestra la vista actual sin cambios.
- Funcion `handleSave`:
  - Validar con `editProfileSchema.safeParse({ name, hermandad })`.
  - Si hay error, mostrar toast con el mensaje.
  - Si es valido, hacer `supabase.from('profiles').update({ name, hermandad }).eq('id', user.id)`.
  - Invalidar query `['profile', user.id]` con `useQueryClient`.
  - Toast de exito, cerrar modo edicion.

### Validacion y seguridad

- Validacion client-side con zod (mismo patron que registro).
- Server-side: la RLS policy "Users can update their own profile" ya existe y permite `UPDATE WHERE auth.uid() = id`.
- El `handle_new_user` trigger valida nombre (2-50 chars) y hermandad (no vacia) en inserts; para updates, la validacion zod en frontend cubre lo mismo.

### Que NO cambia

- Base de datos: no hay migraciones (la policy de UPDATE ya existe).
- El resto de la pantalla de perfil (stats, logros, botones).
- El componente `HermandadCombobox` se reutiliza tal cual.
- El hook `useProfile` se reutiliza tal cual, solo se invalida la cache tras guardar.


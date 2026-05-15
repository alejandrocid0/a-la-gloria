## Objetivo
Asegurar que todos los botones con `size="icon"` cumplen el mínimo táctil de 48×48dp recomendado por Google Play, sin romper layouts densos del panel admin.

## Cambios

### 1. `src/components/ui/button.tsx` — variantes de tamaño
- `icon`: `h-10 w-10` → **`h-12 w-12`** (48px = 48dp). Aplica a toda la app por defecto.
- Añadir variante nueva `iconSm: "h-9 w-9"` (36px) **solo** para contextos densos del admin donde 48px rompería el layout (chip al lado de texto inline, overlays sobre miniaturas).
- Aumentar tamaño del svg interno: `[&_svg]:size-4` → `[&_svg]:size-5` para que el icono escale proporcionalmente.

### 2. Overrides existentes a revisar
- `TournamentManager.tsx:869` (botón ✕ sobre miniatura de imagen, `h-8 w-8`): cambiar a `size="iconSm"` y dejar el posicionamiento absoluto. 36×36 es aceptable porque está sobre una imagen pequeña en un formulario admin.
- `TournamentManager.tsx:958` (copiar código junto al texto, `h-6 w-6`): cambiar a `size="iconSm"`. Sigue siendo admin-only e inline con texto.

### 3. Botones user-facing que heredan el nuevo `h-12 w-12` automáticamente
- `Acerca.tsx:95` — botón volver atrás
- `Terms.tsx:16`, `Privacy.tsx:16` — botones volver atrás
- `Admin.tsx:84`, `Admin.tsx:182` — admin (acepta el aumento)
- `TournamentRegistrationsDialog.tsx:168` — eliminar inscripción (admin, fila de tabla). 48px puede inflar la fila → cambiar a `size="iconSm"` para mantener tabla compacta.
- `TournamentManager.tsx:630, 728` — admin

### 4. Verificación visual
Tras el cambio, revisar en preview móvil:
- Cabeceras con botón "atrás" (Privacy, Terms, Acerca)
- Tabla de inscritos del admin (no debe romperse)
- Modal de edición de torneo (overlay ✕ sobre imagen)

## Resumen
- **Por defecto** todos los `size="icon"` pasan a 48×48px → cumple Google Play.
- **`iconSm` (36×36)** para 3 casos admin densos donde 48px no encaja.
- Cero cambios en lógica ni en backend; solo presentación.
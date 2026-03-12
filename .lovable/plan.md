

## Plan: Limpieza de código muerto

He revisado todo el código. Aquí está cada pieza de código muerto, qué es y si afecta eliminarlo:

---

### 1. `src/lib/supabase.ts` — ELIMINAR
- **Qué es**: Archivo placeholder con TODOs comentados. Nunca se usó.
- **Importado por**: Nadie. 0 referencias.
- **Afecta eliminarlo**: No. El cliente real está en `src/integrations/supabase/client.ts`.

### 2. `src/lib/database.sql` — ELIMINAR
- **Qué es**: SQL inicial con solo 3 tablas (profiles, questions, games). No incluye tournaments, feedback, daily_questions, user_roles ni nada reciente.
- **Importado por**: Nadie. Es un archivo SQL suelto que no se ejecuta.
- **Afecta eliminarlo**: No. La fuente de verdad son las migraciones en `supabase/migrations/`.

### 3. `src/pages/Index.tsx` — ELIMINAR
- **Qué es**: Página template de Lovable ("Welcome to Your Blank App").
- **Importado por**: Nadie. Se importa en `App.tsx` pero **no se usa en ninguna ruta** (la ruta `/` apunta a `Home`, no a `Index`). Espera — déjame verificar.
- **Corrección**: Sí se importa en `App.tsx` línea 7, pero no hay ninguna `<Route>` que lo renderice. Es un import muerto.
- **Afecta eliminarlo**: No. Hay que eliminar también el import en `App.tsx`.

### 4. `src/App.css` — ELIMINAR
- **Qué es**: CSS del template Vite por defecto (estilos de logo giratorio, `.card`, `.read-the-docs`).
- **Importado por**: Nadie. 0 referencias. Todos los estilos reales están en `index.css` con Tailwind.
- **Afecta eliminarlo**: No.

### 5. `IMPLEMENTATION_GUIDE.md` — ELIMINAR
- **Qué es**: Guía de implementación inicial de 444 líneas que describe pasos para conectar con la base de datos. Todo esto ya está implementado y funcionando.
- **Afecta eliminarlo**: No. Es documentación obsoleta.

### 6. `public/placeholder.svg` — ELIMINAR
- **Qué es**: Imagen placeholder de Lovable.
- **Referenciado por**: Nadie. 0 referencias en código.
- **Afecta eliminarlo**: No.

### 7. `src/assets/mockup-torneo.png` — ELIMINAR
- **Qué es**: Imagen de mockup de torneo.
- **Referenciado por**: Nadie. 0 referencias en código.
- **Afecta eliminarlo**: No.

---

### Resumen

| Archivo | Tipo | Referencias | Riesgo |
|---------|------|-------------|--------|
| `src/lib/supabase.ts` | Config muerta | 0 | Ninguno |
| `src/lib/database.sql` | SQL obsoleto | 0 | Ninguno |
| `src/pages/Index.tsx` | Página sin ruta | 0 (import muerto en App.tsx) | Ninguno |
| `src/App.css` | CSS sin usar | 0 | Ninguno |
| `IMPLEMENTATION_GUIDE.md` | Doc obsoleta | 0 | Ninguno |
| `public/placeholder.svg` | Asset sin usar | 0 | Ninguno |
| `src/assets/mockup-torneo.png` | Asset sin usar | 0 | Ninguno |

**Cambio adicional**: Eliminar el `import Index from "./pages/Index"` de `App.tsx` (línea 7).

Ninguna de estas eliminaciones afecta al funcionamiento de la app. Son restos del template inicial y de la fase de planificación.




## Plan: Torneos Archivados (solo visible en admin)

### Concepto

Añadir un estado `archived` a los torneos. Los torneos archivados desaparecen de la vista pública pero siguen accesibles en el panel de administración, en una sección colapsable separada.

### Cambios necesarios

#### 1. Panel de Admin — `TournamentManager.tsx`

- Actualizar `TournamentStatus` type para incluir `"archived"`
- Añadir badge "Archivado" (gris/púrpura) en `getStatusBadge`
- En la **lista**, separar torneos en dos grupos:
  - **Torneos activos** (draft, upcoming, active, completed) — se muestran como ahora
  - **Torneos archivados** — sección colapsable al final con icono de `Archive`
- En la **vista detalle** de torneos completados, añadir botón "Archivar torneo" en la zona de peligro (junto a eliminar), que cambia el status a `archived`
- En la **vista detalle** de torneos archivados, añadir botón "Desarchivar" que devuelve el status a `completed`

#### 2. Vista pública — `Tournament.tsx`

- Añadir `"archived"` al filtro `.neq("status", "draft")`, quedando: `.neq("status", "draft").neq("status", "archived")`

#### 3. Vista pública — `PastTournaments.tsx`

- Ya filtra por `.eq("status", "completed")`, por lo que los archivados quedan excluidos automáticamente. No requiere cambios.

#### 4. Sin migración de base de datos

- El campo `status` es de tipo `text`, no un enum de Postgres, por lo que no necesita migración. Se puede usar `"archived"` directamente.

### Resumen de archivos modificados

| Archivo | Cambio |
|---|---|
| `TournamentManager.tsx` | Tipo, badge, lista separada, botones archivar/desarchivar |
| `Tournament.tsx` | Filtrar archivados de la query |


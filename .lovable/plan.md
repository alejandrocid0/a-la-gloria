## Cambio 1 — "Cuentas eliminadas" como tarjeta colapsable

Reescribir `src/components/admin/AccountDeletionsSection.tsx` siguiendo exactamente el patrón de `HermandadesSection`:

- **Vista colapsada** (Card clickable): solo el título `Cuentas eliminadas` con un `<span>` al lado entre paréntesis mostrando:
  - `(Cero cuentas eliminadas)` si `total === 0`
  - `(N cuentas eliminadas)` si `total > 0` (singular si N === 1)
- **Al pulsar** se abre un `Dialog` con el listado **completo** (sin `.limit(50)`), ordenado por `deleted_at` descendente.
- Cada fila del dialog muestra: posición, nombre, email, hermandad, fecha y `puntos · partidas` que tenía al borrarse.
- Se elimina la tabla actual (no aparece nada visible salvo el título-cabecera).

Sin cambios en el dashboard ni en la migración: la sección ya está añadida al final.

## Cambio 2 — "Exportar lista de correos" como desplegable

Modificar `src/components/admin/RetentionSection.tsx` líneas 257–284 (la Card "Exportar lista de correos"):

- Quitar la rejilla actual de 6 botones.
- Dejar solo:
  - Título de la Card: `Exportar lista de correos`
  - Un `<Select>` (shadcn) con las 6 opciones, mostrando el contador entre paréntesis:
    - `Alta retención (N)`
    - `Media retención (N)`
    - `Baja retención (N)`
    - `Muy baja retención (N)`
    - `Inactivos (N)`
    - `0-2 partidas (N)`
  - Un único botón a la derecha: **"Descargar CSV"** que invoca `exportCSV(selected)` o `exportLowActivityCSV()` según la opción elegida.
- El botón queda deshabilitado hasta que el admin elija una opción.
- Se reutilizan las funciones `exportCSV` y `exportLowActivityCSV` ya existentes — sin tocar lógica de descarga.

Layout responsive: `Select` flex-1 + botón al lado en desktop, apilados en móvil.

## Resultado

El panel de admin queda más limpio: dos tarjetas-cabecera (Hermandades, Cuentas eliminadas) más una sola fila para exportar correos, en vez de 6 botones sueltos.

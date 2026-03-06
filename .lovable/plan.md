## Pantalla de Torneos (usuario) — solo visual, sin funcionalidad

Basado en los mockups proporcionados, creo dos elementos:

### 1. Página `/torneo` (`src/pages/Tournament.tsx`)

Rediseño completo siguiendo el mockup:

- **Header morado** con título "TORNEO" en Cinzel y subtítulo
- **Cuenta atrás** "Próximo Torneo en X días" (placeholder estático)
- **Lista de tarjetas de torneo** con 3 mockups hardcodeados:
  - Imagen horizontal arriba (placeholder con gradiente morado/dorado)
  - Layout: fecha a la izquierda (mes + día + hora), info a la derecha (nombre, fecha inicio, hora límite, nº participantes)
  - Botón dorado "Jugar Torneo"
- **Lógica de datos**: consulta `tournaments` de la base de datos. Si hay torneos reales, los muestra; si no, muestra los 3 mockups
- **BottomNav** inferior

### 2. Diálogo "Unirse a Torneo" (`src/components/tournament/JoinTournamentDialog.tsx`)

Componente Dialog siguiendo el segundo mockup:

- Título "UNIRSE A TORNEO" en Cinzel morado
- Texto explicativo
- Input grande con placeholder "Ej: 123 452"
- Botón dorado "Unirme al torneo"
- Sin funcionalidad real (solo visual)

### Archivos a crear/modificar

1. **Crear** `src/components/tournament/TournamentCard.tsx` — tarjeta reutilizable
2. **Crear** `src/components/tournament/JoinTournamentDialog.tsx` — diálogo unirse
3. **Reescribir** `src/pages/Tournament.tsx` — página completa con tabs, mockups y query

Los 3 torneos mockup se definen como constante local ahora, y se usan como fallback cuando la query a `tournaments` devuelve vacío, hasta que yo los elimine.
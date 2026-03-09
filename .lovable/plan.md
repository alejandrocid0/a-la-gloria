

## Plan: Ubicación con enlace a Google Maps

### Cambios

**1. Migración SQL** — Nueva columna `location_url` (TEXT, nullable) en `tournaments`

**2. `TournamentManager.tsx` — Panel admin**
- Añadir campo "Enlace de ubicación" (`<Input>` con placeholder "https://maps.google.com/...") debajo del campo de ubicación
- Incluirlo en creación y edición del torneo
- Nuevo state: `formLocationUrl` / `editLocationUrl`

**3. `TournamentCard.tsx` — Tarjeta del jugador**
- Si existe `locationUrl`, el texto de ubicación se convierte en un `<a>` con `target="_blank"` que abre el enlace
- Si no hay URL, se muestra el texto plano como hasta ahora

**4. `Tournament.tsx`** — Pasar `locationUrl={t.location_url}` al componente

### Flujo para el admin
1. Escribe el nombre del sitio en "Ubicación" (ej: "Salón parroquial San Lorenzo")
2. Pega el enlace de Google Maps en "Enlace de ubicación"
3. Los jugadores ven el nombre y al pulsar se abre Google Maps

### Sin coste ni dependencias externas
Solo se almacena una URL. No se usa ninguna API de Google.


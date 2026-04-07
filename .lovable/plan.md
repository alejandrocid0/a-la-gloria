

# Nuevo KPI: Jugadores recurrentes (7+ partidas)

## Qué se hará

Añadir una sexta tarjeta al panel de administración que muestre el número de usuarios con 7 o más partidas completadas. Debajo del número grande, en texto pequeño: "más de 7 partidas".

## Cambios

### 1. AdminDashboard.tsx — Calcular el nuevo KPI

Ya se cargan todos los perfiles con `games_played`. Solo hay que añadir un contador:

```ts
const recurringUsers = allProfiles.filter(p => (p.games_played || 0) >= 7).length;
```

Se añade `recurringUsers` al objeto `stats` retornado.

### 2. StatsCards.tsx — Nueva tarjeta

- Actualizar la interfaz `StatsData` para incluir `recurringUsers: number`
- Añadir una sexta `Card` con icono `Star` (de lucide-react), título "Recurrentes", el número grande, y subtítulo `"más de 7 partidas"` en texto pequeño
- El grid pasa de `grid-cols-2 md:grid-cols-4` a `grid-cols-2 md:grid-cols-3` (6 tarjetas en 2 filas de 3 en desktop, 3 filas de 2 en móvil)

No requiere cambios en base de datos ni nuevas queries — el dato ya está disponible en `games_played` de los perfiles que ya se cargan.


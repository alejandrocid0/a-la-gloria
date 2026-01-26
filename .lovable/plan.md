

## Plan: Corregir Metrica de Retencion por Usuario Individual

### Problema Actual

La funcion `get_user_retention_stats` calcula la retencion usando una fecha fija (30 de diciembre de 2025) para todos los usuarios:

```sql
total_days := GREATEST((CURRENT_DATE - '2025-12-30'::DATE) + 1, 1);
-- Esto da 28 dias para TODOS los usuarios
```

**Impacto**: Un usuario que se registro hace 3 dias y ha jugado 3 dias tiene 100% de retencion real, pero el sistema le asigna 10.7% (3/28).

---

### Solucion Propuesta

Modificar la funcion SQL para calcular los dias disponibles de forma individual por usuario usando su fecha de registro (`created_at`).

---

### Cambios Tecnicos

**Archivo a modificar**: Funcion RPC `get_user_retention_stats`

**Cambio principal**: Reemplazar la fecha fija por un calculo individual:

```sql
-- ANTES (fecha fija global)
total_days := GREATEST((CURRENT_DATE - '2025-12-30'::DATE) + 1, 1);

-- DESPUES (fecha individual por usuario)
(CURRENT_DATE - p.created_at::DATE) + 1 as dias_disponibles
```

**Nueva logica de categorizacion**:

```sql
WITH user_stats AS (
  SELECT 
    g.user_id,
    p.name,
    p.hermandad,
    p.games_played,
    p.created_at,
    COUNT(DISTINCT g.date) as days_played,
    -- Calcular dias disponibles desde registro de ESTE usuario
    GREATEST((CURRENT_DATE - p.created_at::DATE) + 1, 1) as days_available,
    -- Porcentaje basado en dias del usuario
    ROUND(
      (COUNT(DISTINCT g.date)::NUMERIC / 
       GREATEST((CURRENT_DATE - p.created_at::DATE) + 1, 1)) * 100, 
      1
    ) as percentage
  FROM games g
  JOIN profiles p ON p.id = g.user_id
  WHERE NOT EXISTS (...)
  GROUP BY g.user_id, p.name, p.hermandad, p.games_played, p.created_at
)
```

---

### Cambio en la Respuesta JSON

Actualmente la funcion devuelve:
```json
{
  "totalDaysAvailable": 28,  // Valor fijo (sera eliminado o convertido en promedio)
  "counts": {...},
  "users": {...}
}
```

Propuesta:
```json
{
  "launchDate": "2025-12-30",  // Mantener referencia informativa
  "counts": {...},
  "users": {
    "high": [
      {
        "id": "...",
        "name": "Carlos",
        "hermandad": "...",
        "daysPlayed": 3,
        "daysAvailable": 3,  // NUEVO: dias desde su registro
        "percentage": 100    // Ahora correcto
      }
    ]
  }
}
```

---

### Cambio en el Frontend (minimo)

**Archivo**: `src/components/admin/AdminDashboard.tsx`

Actualizar el texto del encabezado de retencion:

```tsx
// ANTES
<span className="text-sm font-normal text-muted-foreground">
  (desde 30/12/2025 - {retentionStats?.totalDaysAvailable} dias)
</span>

// DESPUES
<span className="text-sm font-normal text-muted-foreground">
  (calculado desde registro individual de cada usuario)
</span>
```

Y en el modal de usuarios, mostrar los dias disponibles de cada uno:

```tsx
<p className="font-bold text-sm">
  {user.daysPlayed}/{user.daysAvailable} dias
</p>
```

---

### Ejemplo de Resultados Corregidos

| Usuario | Registro | Dias en app | Dias jugados | % Actual | % Corregido | Categoria |
|---------|----------|-------------|--------------|----------|-------------|-----------|
| Carlos | 24/01 | 3 | 3 | 10.7% | **100%** | High |
| Hugo | 21/01 | 6 | 4 | 14.3% | **66.7%** | Medium |
| Jose Manuel | 21/01 | 6 | 5 | 17.8% | **83.3%** | High |
| Pablo | 22/01 | 5 | 1 | 3.6% | **20%** | Low |

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migracion SQL | Reemplazar funcion `get_user_retention_stats` |
| `src/components/admin/AdminDashboard.tsx` | Actualizar interfaz `UserRetentionInfo`, texto del encabezado, y modal de usuarios |

---

### Complejidad

**Baja-Media**. Los cambios son localizados:
1. Una funcion SQL a reescribir
2. Ajustes menores en el componente React

No hay impacto en otras partes de la aplicacion ni en la seguridad.


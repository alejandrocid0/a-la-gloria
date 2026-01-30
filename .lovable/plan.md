

## Plan: Actualizar rangos de retención de usuarios

### Objetivo

Cambiar el sistema de categorías de retención para que sea completamente basado en porcentajes, con los siguientes rangos:

| Categoría | Antes | Después |
|-----------|-------|---------|
| Alta | +80% | +80% (sin cambio) |
| Media | 50-80% | 50-80% (sin cambio) |
| Baja | <50% | 20-50% |
| Sin retención | 0-1 partidas | <20% |

---

### Cambios necesarios

#### 1. Función SQL del servidor

**Archivo**: Nueva migración SQL

**Cambio en la lógica de categorización**:

```sql
-- ANTES
CASE 
  WHEN days_played <= 1 THEN 'none'
  WHEN percentage >= 80 THEN 'high'
  WHEN percentage >= 50 THEN 'medium'
  ELSE 'low'
END as category

-- DESPUÉS
CASE 
  WHEN percentage >= 80 THEN 'high'
  WHEN percentage >= 50 THEN 'medium'
  WHEN percentage >= 20 THEN 'low'
  ELSE 'none'
END as category
```

La nueva lógica:
- Ya no considera el número de partidas como criterio especial
- Clasifica únicamente por porcentaje de retención

---

#### 2. Frontend - Etiquetas de UI

**Archivo**: `src/components/admin/AdminDashboard.tsx`

**Cambios en las etiquetas descriptivas**:

| Ubicación | Antes | Después |
|-----------|-------|---------|
| Línea ~381 | "+80% días" | "+80%" |
| Línea ~392 | "50-80% días" | "50-80%" |
| Línea ~403 | "<50% días" | "20-50%" |
| Línea ~414 | "0-1 partida" | "<20%" |

**Cambios en títulos del modal** (función `getCategoryTitle`):

| Categoría | Antes | Después |
|-----------|-------|---------|
| high | "Alta Retención (+80%)" | "Alta Retención (+80%)" |
| medium | "Media Retención (50-80%)" | "Media Retención (50-80%)" |
| low | "Baja Retención (<50%)" | "Baja Retención (20-50%)" |
| none | "Sin Retención (0-1 partida)" | "Muy Baja Retención (<20%)" |

---

### Resumen visual

```text
┌────────────────────────────────────────────────────────────┐
│  📊 Retención de Usuarios                                  │
│  (% calculado desde registro de cada usuario)              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  ✅ X%   │  │  🏆 X%   │  │  ⚠️ X%   │  │  ❌ X%   │   │
│  │  +80%    │  │ 50-80%   │  │ 20-50%   │  │  <20%    │   │
│  │ N users  │  │ N users  │  │ N users  │  │ N users  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│     Alta         Media         Baja        Muy Baja       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### Archivos a modificar

| Archivo | Tipo de cambio |
|---------|----------------|
| Nueva migración SQL | Actualizar función `get_user_retention_stats` |
| `src/components/admin/AdminDashboard.tsx` | Actualizar etiquetas y títulos |

---

### Impacto en datos existentes

- Los usuarios que antes estaban en "Sin Retención" por tener 0-1 partidas ahora podrían moverse a otra categoría según su porcentaje real
- Por ejemplo, un usuario con 1 partida de 2 días posibles (50%) ahora aparecería en "Media" en lugar de "Sin Retención"
- Esto proporciona una visión más realista de la retención basada en el engagement relativo


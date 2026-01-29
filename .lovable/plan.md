

## Plan: Añadir Estado "Archivado" y Vista Separada

### Resumen de Cambios

Se añadirá un sexto estado `archived` (Archivado) que funciona como destino final para feedback procesado. Los feedbacks archivados no aparecerán en la lista general, solo al hacer clic en la tarjeta de "Archivados".

---

### Cambios en Base de Datos

**Migración SQL**: Actualizar el CHECK constraint para incluir `archived`:

```sql
ALTER TABLE public.feedback 
DROP CONSTRAINT IF EXISTS feedback_status_check;

ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('pending', 'errors', 'ideas', 'compliments', 'resolved', 'archived'));
```

---

### Cambios en Código

**Archivo**: `src/components/admin/FeedbackList.tsx`

| Cambio | Descripción |
|--------|-------------|
| Añadir estado `archived` al tipo | `type FeedbackStatus = 'pending' \| 'errors' \| ... \| 'archived'` |
| Añadir configuración visual | Icono `Archive`, colores grises/neutros |
| Desbloquear estado `resolved` | Quitar `disabled` cuando `status === 'resolved'` |
| Añadir estado local `showArchived` | Para controlar qué vista mostrar |
| Filtrar lista principal | Excluir `status === 'archived'` de la lista general |
| Hacer clickable la tarjeta Archivados | Al pulsar, mostrar solo los archivados |
| Añadir `archived` al Select | Nueva opción en el desplegable |
| Contador de archivados | Nueva tarjeta en el resumen |

---

### Nuevo Flujo de Estados

```text
        +-----------+
        |  PENDING  |
        +-----+-----+
              |
  +-----------+-----------+
  |           |           |
  v           v           v
+------+  +-------+  +------------+
|ERRORS|<>| IDEAS |<>|COMPLIMENTS |
+--+---+  +---+---+  +-----+------+
   |          |            |
   +----------+------------+
              |
              v
        +-----------+
        | RESOLVED  |  (editable)
        +-----+-----+
              |
              v
        +-----------+
        | ARCHIVED  |  (vista separada)
        +-----------+
```

---

### Comportamiento de la UI

**Vista General (por defecto)**:
- Muestra todos los feedbacks EXCEPTO los archivados
- Las 6 tarjetas de resumen muestran contadores
- La tarjeta "Archivados" es clickable

**Vista Archivados**:
- Se activa al pulsar la tarjeta "Archivados"
- Muestra solo feedbacks con `status === 'archived'`
- Botón para volver a la vista general
- Permite mover feedbacks de vuelta a otro estado si es necesario

---

### Detalles Técnicos

**Configuración visual para `archived`**:
```typescript
archived: { 
  label: "Archivado", 
  icon: Archive, 
  variant: "secondary",
  bgColor: "bg-gray-50",
  borderColor: "border-gray-300",
  textColor: "text-gray-700",
  iconColor: "text-gray-500"
}
```

**Estado local para controlar la vista**:
```typescript
const [showArchived, setShowArchived] = useState(false);
```

**Filtrado de la lista**:
```typescript
const displayedFeedback = showArchived 
  ? feedbackList.filter(f => f.status === 'archived')
  : feedbackList.filter(f => f.status !== 'archived');
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | Añadir `'archived'` al CHECK constraint |
| `src/components/admin/FeedbackList.tsx` | Añadir estado, configuración, filtros y vista separada |


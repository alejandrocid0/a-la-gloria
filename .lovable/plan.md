

## Plan: Sistema de Categorias de Feedback con Desplegable

### Resumen del Cambio

Transformar el sistema actual de 3 estados (pendiente, leido, resuelto) a un sistema de 5 estados con categorias:

| Estado Actual | Nuevo Estado |
|---------------|--------------|
| pending | **pending** (Pendiente) |
| read | **errors** (Errores) |
| - | **ideas** (Ideas) |
| - | **compliments** (Halagos) |
| resolved | **resolved** (Resuelto) |

### Flujo de Estados

```text
                    +------------+
                    |  PENDING   |
                    | (Amarillo) |
                    +-----+------+
                          |
          Admin categoriza el feedback
                          |
        +-----------------+-----------------+
        |                 |                 |
        v                 v                 v
+-------+-------+ +-------+-------+ +-------+-------+
|    ERRORS     | |     IDEAS     | |  COMPLIMENTS  |
|    (Rojo)     | |    (Azul)     | |    (Rosa)     |
+-------+-------+ +-------+-------+ +-------+-------+
        |                 |                 |
        +-----------------+-----------------+
                          |
                   Admin resuelve
                          |
                          v
                  +-------+-------+
                  |   RESOLVED    |
                  |   (Verde)     |
                  +---------------+
```

---

### Cambios Tecnicos

#### 1. Base de Datos (No requiere migracion)

La tabla `feedback` ya tiene el campo `status` como `text`, por lo que los nuevos valores funcionaran automaticamente. Solo necesitamos:

- Actualizar el valor por defecto si queremos (opcional, ya es 'pending')
- Considerar si queremos migrar los estados existentes 'read' a alguna categoria

**Migracion de datos existentes (opcional)**: Los feedbacks con estado 'read' podrian mantenerse como 'read' hasta que el admin los recategorice, o podriamos migrarlos a 'pending' para forzar su recategorizacion.

---

#### 2. Archivo: `src/components/admin/FeedbackList.tsx`

**Cambios principales:**

**a) Actualizar el tipo FeedbackStatus:**
```typescript
type FeedbackStatus = 'pending' | 'errors' | 'ideas' | 'compliments' | 'resolved';
```

**b) Actualizar statusConfig con iconos y colores:**
```typescript
const statusConfig = {
  pending: { label: "Pendiente", icon: Clock, variant: "default", color: "yellow" },
  errors: { label: "Errores", icon: AlertCircle, variant: "destructive", color: "red" },
  ideas: { label: "Ideas", icon: Lightbulb, variant: "secondary", color: "blue" },
  compliments: { label: "Halagos", icon: Heart, variant: "outline", color: "pink" },
  resolved: { label: "Resuelto", icon: CheckCircle, variant: "outline", color: "green" },
};
```

**c) Reemplazar botones por Select desplegable:**

Importar componente Select de shadcn/ui:
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```

Implementar desplegable en cada tarjeta de feedback:
```tsx
<Select
  value={feedback.status}
  onValueChange={(value) => updateStatus.mutate({ 
    id: feedback.id, 
    status: value as FeedbackStatus 
  })}
>
  <SelectTrigger className="w-[140px]">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pendiente</SelectItem>
    <SelectItem value="errors">Errores</SelectItem>
    <SelectItem value="ideas">Ideas</SelectItem>
    <SelectItem value="compliments">Halagos</SelectItem>
    <SelectItem value="resolved">Resuelto</SelectItem>
  </SelectContent>
</Select>
```

**d) Actualizar tarjetas de resumen (5 en lugar de 3):**
```tsx
<div className="grid grid-cols-5 gap-3">
  <Card className="p-3 text-center bg-yellow-50 border-yellow-200">
    <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
    <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
    <p className="text-xs text-yellow-600">Pendientes</p>
  </Card>
  <Card className="p-3 text-center bg-red-50 border-red-200">
    <AlertCircle className="w-4 h-4 mx-auto mb-1 text-red-600" />
    <p className="text-xl font-bold text-red-700">{errorsCount}</p>
    <p className="text-xs text-red-600">Errores</p>
  </Card>
  <Card className="p-3 text-center bg-blue-50 border-blue-200">
    <Lightbulb className="w-4 h-4 mx-auto mb-1 text-blue-600" />
    <p className="text-xl font-bold text-blue-700">{ideasCount}</p>
    <p className="text-xs text-blue-600">Ideas</p>
  </Card>
  <Card className="p-3 text-center bg-pink-50 border-pink-200">
    <Heart className="w-4 h-4 mx-auto mb-1 text-pink-600" />
    <p className="text-xl font-bold text-pink-700">{complimentsCount}</p>
    <p className="text-xs text-pink-600">Halagos</p>
  </Card>
  <Card className="p-3 text-center bg-green-50 border-green-200">
    <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-600" />
    <p className="text-xl font-bold text-green-700">{resolvedCount}</p>
    <p className="text-xs text-green-600">Resueltos</p>
  </Card>
</div>
```

**e) Eliminar funcion getNextStatus** (ya no necesaria con desplegable)

**f) Actualizar exportacion CSV** para incluir el estado:
```typescript
const csvData = feedbackList.map(f => ({
  'Nombre': f.user_name,
  'Email': f.user_email,
  'Mensaje': f.message,
  'Estado': statusConfig[f.status as FeedbackStatus]?.label || f.status,
}));
```

---

### Nuevos Iconos a Importar

```typescript
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Download,
  AlertCircle,  // NUEVO - para Errores
  Lightbulb,    // NUEVO - para Ideas
  Heart         // NUEVO - para Halagos
} from "lucide-react";
```

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/FeedbackList.tsx` | Tipo de estado, iconos, Select desplegable, tarjetas de resumen, exportacion CSV |

---

### Consideracion: Feedbacks Existentes con Estado 'read'

Actualmente hay feedbacks con estado 'read'. Opciones:

1. **Mantenerlos como estan**: Funcionaran pero no tendran un estilo definido hasta que los recategorices manualmente
2. **Migrar a 'pending'**: Forzar que el admin los recategorice

Recomiendo la opcion 1: mantenerlos y manejarlos como fallback en el codigo hasta que los recategorices.

---

### Resultado Visual Esperado

Cada tarjeta de feedback mostrara:
- Badge con icono y color segun categoria
- Desplegable para cambiar estado directamente
- Las 5 categorias visibles en el resumen superior


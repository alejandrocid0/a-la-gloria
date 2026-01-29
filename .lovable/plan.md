

## Plan: Corregir Compatibilidad con Estados Legacy en Feedback

### Problema Detectado

He revisado el codigo y las peticiones de red. **La logica backend funciona correctamente** (las peticiones PATCH devuelven Status 204). 

Sin embargo, he identificado que existen feedbacks con estado `'read'` (estado legacy anterior) que causan problemas de visualizacion porque:

1. El Select tiene `value="read"` pero no hay ninguna opcion con ese valor
2. Esto puede hacer que el desplegable parezca no funcionar o muestre comportamiento inconsistente
3. Veo en la base de datos: `"status":"read"` en algunos registros antiguos

### Solucion Propuesta

**Opcion A (Recomendada)**: Migrar los estados `'read'` existentes a `'pending'` para que el admin los recategorice con el nuevo sistema.

**Opcion B**: Anadir una opcion temporal `'read'` al Select hasta que se migren manualmente.

---

### Implementacion (Opcion A)

**Paso 1**: Ejecutar una migracion SQL para actualizar los estados legacy:

```sql
UPDATE feedback 
SET status = 'pending' 
WHERE status = 'read';
```

Esto movera los 2 feedbacks con estado `'read'` a `'pending'` para que los puedas recategorizar.

**Paso 2 (Opcional)**: Simplificar el codigo eliminando el fallback para `'read'`:

La funcion `getStatusConfig` ya maneja estados desconocidos como fallback, pero si migramos los datos, podemos confiar en que todos los estados son validos.

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migracion SQL | `UPDATE feedback SET status = 'pending' WHERE status = 'read'` |
| `src/components/admin/FeedbackList.tsx` | (Opcional) Limpiar fallback si ya no es necesario |

---

### Verificacion Actual de la Base de Datos

Segun los network requests, hay exactamente 2 feedbacks con estado `'read'`:
- ID: `0ce3b530-...` - "Pues no tocaria Nada la verdad es impresionante..."
- ID: `fa3a49f8-...` - "Me gusta mucho el juego y la dinamica..."

Estos son los que causan el comportamiento extrano.

---

### Resultado Esperado

Despues de la migracion:
- Todos los feedbacks estaran en uno de los 5 estados validos
- El Select funcionara correctamente para todos los registros
- Podras categorizar los feedbacks antiguos con el nuevo flujo: Pendiente -> Categoria -> Resuelto


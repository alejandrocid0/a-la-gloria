

## Dos cambios: mover Top 10 Hermandades y exportar CSV de retencion

### 1. Mover Top 10 Hermandades debajo de Retencion

Intercambiar el orden en el JSX: primero la seccion de Retencion de Usuarios, despues el recuadro de Top 10 Hermandades (y su Dialog).

### 2. Exportar CSV por categoria de retencion

Para enviar campanas de email desde Sender, se necesita exportar Nombre y Correo de los usuarios de cada categoria.

**Problema:** La funcion `get_user_retention_stats` no devuelve el email de los usuarios. Hay que modificarla.

**Cambios necesarios:**

#### A. Migracion SQL

Actualizar la funcion `get_user_retention_stats` para incluir el campo `email` de la tabla `profiles` en el JSON de cada usuario.

En el `json_agg` de cada categoria, anadir `'email', p.email` junto a `'name', name`.

#### B. Codigo TypeScript (`AdminDashboard.tsx`)

1. Anadir `email` a la interfaz `UserRetentionInfo`:
```typescript
interface UserRetentionInfo {
  id: string;
  name: string;
  email: string;
  hermandad: string;
  daysPlayed: number;
  daysAvailable: number;
  percentage: number;
}
```

2. Importar `Download` de `lucide-react`.

3. Crear una funcion `exportCSV` que genere un CSV con columnas Nombre y Correo:
```typescript
const exportCSV = (category: RetentionCategory) => {
  const users = getCategoryUsers(category);
  const csv = "Nombre,Correo\n" + users.map(u => `"${u.name}","${u.email}"`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retencion_${category}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
```

4. En cada uno de los 4 recuadros de retencion, anadir un boton de descarga CSV al lado del icono/contenido. Se usara `e.stopPropagation()` para que el click en el boton no abra el Dialog de la lista de usuarios.

5. Mover el bloque de Top 10 Hermandades (lineas 370-408) por debajo del bloque de Retencion (linea 502).

### Resumen de archivos

- **Migracion SQL**: actualizar `get_user_retention_stats` para incluir `email`
- **`src/components/admin/AdminDashboard.tsx`**: reordenar secciones, anadir interfaz email, funcion exportCSV, botones de descarga en cada recuadro de retencion

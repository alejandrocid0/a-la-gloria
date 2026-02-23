

## Corregir botones anidados y crear seccion de exportacion de correos

### Que se hace

1. **Eliminar los botones de descarga CSV** de dentro de las 5 tarjetas de retencion (lineas 398-485). Esto corrige el bug de HTML invalido (botones anidados) sin necesidad de cambiar las tarjetas a `div`.

2. **Crear un nuevo recuadro** debajo de las estadisticas de retencion titulado "Exportar lista de correos", con 5 botones en fila (uno por categoria), cada uno con su color correspondiente y el numero de usuarios. Al pulsar cualquiera, se descarga el CSV de esa categoria directamente.

### Resultado visual

```text
+---------------------------------------------------------------+
| Retencion de Usuarios                                         |
|                                                               |
|  [Alta]    [Media]   [Baja]   [Sin ret]  [Inactivos]         |
|  85%       10%       3%       1%         1%                   |
|  (click = abre dialog con lista de usuarios)                  |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| Exportar lista de correos                                     |
|                                                               |
|  [Alta +80%]  [Media 50-80%]  [Baja 20-50%]  [<20%]  [0 p.] |
|  12 emails    8 emails        5 emails       2 em.   3 em.   |
|  (click = descarga CSV directamente)                          |
+---------------------------------------------------------------+
```

### Detalles tecnicos

**Archivo**: `src/components/admin/AdminDashboard.tsx`

**Cambio 1 -- Limpiar tarjetas de retencion (lineas 398-485)**:
- Eliminar los `<button>` internos de descarga (los que contienen `<Download />`) de las 5 tarjetas.
- Cambiar los `<button>` exteriores por `<div role="button" tabIndex={0}>` con `onKeyDown` para accesibilidad, ya que solo abren el dialog.

**Cambio 2 -- Nuevo Card de exportacion (despues de linea 486)**:
- Anadir un nuevo `<Card>` con titulo "Exportar lista de correos".
- Dentro, un `grid grid-cols-2 md:grid-cols-5 gap-4` con 5 botones `<button>` independientes.
- Cada boton llama a la funcion `exportCSV()` existente con su categoria correspondiente.
- Colores consistentes con las tarjetas de arriba (verde, amarillo, naranja, rojo, rojo oscuro).
- Cada boton muestra: icono `<Download />`, nombre de la categoria, y numero de usuarios (`retentionStats?.counts.X`).

### Beneficios

- **HTML valido**: se eliminan los 5 casos de botones anidados.
- **Clicks fiables**: las tarjetas solo abren el dialog, los botones de exportacion solo descargan. Sin conflictos.
- **Mejor UX**: seccion dedicada y visible para exportar, mas facil de localizar que un icono pequeno en la esquina.
- **Accesibilidad**: estructura semantica correcta, cada elemento interactivo tiene un unico proposito.


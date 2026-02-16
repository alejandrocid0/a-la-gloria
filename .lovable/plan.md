

## Dos mejoras en la pestana Preguntas del panel admin

### Cambio 1: Resultados de busqueda compactos

**Objetivo**: Al buscar por texto, mostrar los resultados justo debajo del buscador de forma compacta (solo texto + botones editar/eliminar), sin las 4 opciones de respuesta. El formulario de edicion solo aparece al pulsar "Editar".

**Archivo: `src/pages/Admin.tsx`**

Reordenar el layout de la pestana "questions":

1. CSV Importer (igual)
2. Buscador (igual)
3. **Si hay busqueda activa**: mostrar `QuestionsList` justo debajo del buscador (antes del formulario)
4. Formulario de edicion (solo visible cuando `editingQuestion` no es null, o cuando no hay busqueda activa para crear preguntas nuevas)
5. **Si NO hay busqueda activa**: mostrar `QuestionsList` (cuadricula de categorias) debajo del formulario

**Archivo: `src/components/admin/QuestionsList.tsx`**

Crear una version compacta del renderizado cuando `isSearching` es true:
- Mostrar solo el texto de la pregunta, la dificultad como badge, y los botones editar/eliminar
- Sin mostrar las 4 opciones de respuesta (option_a, option_b, option_c, option_d)
- Esto ahorra espacio vertical y facilita la navegacion

### Cambio 2: Preservar la dificultad al editar

**Archivo: `src/components/admin/QuestionForm.tsx`**

El problema es que el componente `Select` con `defaultValue` no se actualiza cuando cambia `editQuestion` porque React no re-renderiza elementos con `defaultValue` ya montados.

Solucion: Anadir una prop `key={editQuestion?.id || 'new'}` al componente `QuestionForm` en `Admin.tsx`, lo que fuerza un remontaje completo del formulario (incluyendo el Select de dificultad y el RadioGroup de respuesta correcta) cada vez que se selecciona una pregunta diferente para editar.

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `src/pages/Admin.tsx` | Reordenar layout: busqueda > resultados compactos > formulario. Anadir `key` al QuestionForm |
| `src/components/admin/QuestionsList.tsx` | Renderizado compacto en modo busqueda (sin opciones de respuesta) |


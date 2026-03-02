

## Dos cambios: nueva categoria "Nazarenos" + selector de categoria en el importador CSV

### 1. Cambio puntual en base de datos

Mover las 30 preguntas que empiezan por "¿Que hermandad tiene mas nazarenos" a una nueva categoria visible en el panel.

- Añadir una nueva entrada en `QUESTION_CATEGORIES` en `QuestionsList.tsx` con el patron `¿Que hermandad tiene mas nazarenos` y la etiqueta "Nazarenos". Se colocara ANTES de "Hermandades (general)" para que el patron mas especifico tenga prioridad.

No requiere cambio en base de datos ya que la categorizacion es por patron de texto.

### 2. Nuevo campo `category` en la tabla `questions`

Para que el importador CSV pueda asignar categorias sin depender solo del patron de texto, se añadira una columna `category` (texto, nullable) a la tabla `questions`.

```text
questions
  + category  |  text  |  nullable  |  default: null
```

### 3. Actualizar la logica de agrupacion en QuestionsList

Modificar `groupQuestionsByCategory()` para que:
1. Si una pregunta tiene el campo `category` relleno, se agrupa por ese valor directamente.
2. Si `category` es null, se usa el patron de texto actual como fallback.

Esto mantiene compatibilidad con las preguntas existentes (que no tienen category) y permite que las nuevas importaciones usen el campo.

### 4. Selector de categoria en el importador CSV

Añadir al componente `CSVImporter.tsx` un selector con tres opciones:

- **"Automatica (por patron de texto)"** -- comportamiento actual, no asigna category
- **Elegir una categoria existente** -- desplegable con las categorias ya definidas en `QUESTION_CATEGORIES` mas cualquier valor unico de `category` en la base de datos
- **"Crear nueva categoria"** -- campo de texto libre para escribir el nombre

Cuando se selecciona una categoria (existente o nueva), todas las preguntas del CSV se importaran con ese valor en el campo `category`.

### 5. Interfaz del selector

```text
+-----------------------------------------------+
| Categoria de destino                          |
| [v] Automatica (por patron de texto)          |
|     Advocaciones del Cristo                   |
|     Sedes canonicas                           |
|     Nazarenos                                 |
|     ...                                       |
|     + Crear nueva categoria...                |
+-----------------------------------------------+
| [  Nombre de la nueva categoria  ]  (si elige |
|     "Crear nueva")                            |
+-----------------------------------------------+
```

### Seccion tecnica

**Migracion SQL:**
```sql
ALTER TABLE public.questions ADD COLUMN category text;
```

**QuestionsList.tsx:**
- Añadir entrada `{ key: 'nazarenos', label: 'Nazarenos', pattern: '¿Que hermandad tiene mas nazarenos' }` antes de `hermandades-general`.
- Modificar `groupQuestionsByCategory()`: si `q.category` existe, buscar la key que coincida con ese valor (o crear grupo dinamico), si no, usar patron de texto.

**CSVImporter.tsx:**
- Nuevo estado `selectedCategory` con opciones: `'auto'`, un key de categoria existente, o `'new'`.
- Nuevo estado `newCategoryName` para texto libre.
- Al importar, si la categoria no es 'auto', asignar el campo `category` a cada pregunta insertada.
- Cargar categorias unicas desde la BD con `SELECT DISTINCT category FROM questions WHERE category IS NOT NULL`.

**Archivos a modificar:**
- `src/components/admin/QuestionsList.tsx` -- nueva entrada de patron + logica de agrupacion por campo category
- `src/components/admin/CSVImporter.tsx` -- selector de categoria
- Migracion SQL para añadir columna `category`


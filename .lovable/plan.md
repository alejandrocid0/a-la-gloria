

## Organizar preguntas por categorias con navegacion por botones

### Objetivo

Reemplazar la lista plana de ~959 preguntas por una vista de dos niveles:
1. **Vista principal**: cuadriculas de botones/tarjetas con el nombre de cada categoria y su numero de preguntas.
2. **Vista de categoria**: al pulsar un boton, se muestra solo las preguntas de esa categoria, con un boton "Volver" para regresar a la cuadricula.

### Diseno visual

**Vista principal (cuadricula de categorias):**

```text
┌──────────────────────────────────────────────────────────────┐
│  Banco de Preguntas (959)                                    │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Advocaciones del    │  │ Advocaciones de la  │           │
│  │ Cristo              │  │ Virgen              │           │
│  │        70           │  │        71           │           │
│  └─────────────────────┘  └─────────────────────┘           │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Sedes canonicas     │  │ Fechas y anos       │           │
│  │        77           │  │        77           │           │
│  └─────────────────────┘  └─────────────────────┘           │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ Restauraciones      │  │ Otras               │           │
│  │        30           │  │       415           │           │
│  └─────────────────────┘  └─────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

**Vista de categoria (tras pulsar un boton):**

```text
┌──────────────────────────────────────────────────────────────┐
│  [< Volver]   Advocaciones del Cristo (70)                   │
├──────────────────────────────────────────────────────────────┤
│  [Pregunta 1 con sus opciones y botones editar/eliminar]     │
│  [Pregunta 2 ...]                                            │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

### Comportamiento

- **Sin busqueda activa**: se muestra la cuadricula de categorias. Al pulsar una, se ven solo sus preguntas.
- **Con busqueda activa**: se muestra la lista plana filtrada (igual que ahora), ignorando las categorias.
- El boton "Volver" regresa a la cuadricula de categorias.

### Detalles tecnicos

**Archivo: `src/components/admin/QuestionsList.tsx`**

1. Definir el mapa de categorias con patrones:
   ```typescript
   const QUESTION_CATEGORIES = [
     { key: 'advocaciones-cristo', label: 'Advocaciones del Cristo', pattern: '¿Cuál es la advocación del Cristo' },
     { key: 'advocaciones-virgen', label: 'Advocaciones de la Virgen', pattern: '¿Cuál es la advocación de la Virgen' },
     { key: 'sedes', label: 'Sedes canónicas', pattern: '¿Cuál es la sede' },
     { key: 'anos', label: 'Fechas y años', pattern: '¿En qué año' },
     { key: 'dias', label: 'Días de procesión', pattern: '¿Qué día' },
     { key: 'hermandades-procesionan', label: 'Hermandades que procesionan', pattern: '¿Cuál de estas hermandades' },
     { key: 'hermandades-general', label: 'Hermandades (general)', pattern: '¿Qué hermandad' },
     { key: 'restauraciones', label: 'Restauraciones', pattern: '¿Quién restauró en' },
   ];
   ```

2. Anadir un estado local `selectedCategory` (string | null).

3. Crear funcion `groupQuestionsByCategory` que agrupa las preguntas segun los patrones; las que no coinciden van a "Otras".

4. Cuando `selectedCategory` es null y no hay busqueda activa: renderizar la cuadricula de tarjetas (`grid grid-cols-2 gap-4`), cada una clicable con `onClick={() => setSelectedCategory(key)}`.

5. Cuando `selectedCategory` tiene valor: renderizar un boton "Volver" + la lista de preguntas filtradas de esa categoria (reutilizando la logica de cards actual).

**Archivo: `src/pages/Admin.tsx`**

- Pasar `isSearching={searchTerm.length > 0}` como prop a `QuestionsList` para que sepa cuando mostrar la cuadricula vs la lista plana.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/QuestionsList.tsx` | Anadir estado `selectedCategory`, funcion de agrupacion, vista de cuadricula y vista de categoria |
| `src/pages/Admin.tsx` | Pasar prop `isSearching` a QuestionsList |


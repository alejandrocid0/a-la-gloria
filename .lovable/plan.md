## Ordenar banco de preguntas por dificultad (panel admin)

### Cambio solicitado
En la vista principal del banco de preguntas (panel admin), las categorías deben ordenarse por dificultad como criterio prioritario, y alfabéticamente solo como desempate.

### Orden de dificultad deseado
1. kanicofrade (arriba)
2. nazareno
3. costalero
4. capataz
5. maestro (abajo)

### Implementación

**Archivo a modificar:** `src/components/admin/QuestionsList.tsx`

**Cambios concretos:**

1. Añadir constante de orden de dificultades al inicio del archivo:
```ts
const DIFFICULTY_ORDER = ["kanicofrade", "nazareno", "costalero", "capataz", "maestro"];
```

2. Reemplazar la línea de ordenación actual:
```ts
.sort((a, b) => a.label.localeCompare(b.label, 'es'));
```

Por una ordenación de dos criterios:
- **Primario:** índice de dificultad en `DIFFICULTY_ORDER` (obtenido vía `getCategoryDifficulty`).
- **Secundario (empate):** `localeCompare(..., 'es')` por nombre de categoría.

3. Las demás vistas permanecen intactas:
- Búsqueda activa (`isSearching`): sin cambios.
- Vista de categoría seleccionada: sin cambios.
- Agrupación por categoría: sin cambios.

### Resultado esperado
El listado vertical de categorías en el panel admin se ordenará primero por dificultad (de kanicofrade a maestro) y, dentro de la misma dificultad, alfabéticamente.

---
*No requiere cambios de base de datos ni migraciones.*
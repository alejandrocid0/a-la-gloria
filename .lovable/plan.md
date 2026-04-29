

# Normalizar dificultad de preguntas de Sedes Canónicas

## Qué se hará

Una única operación de base de datos (usando la herramienta de inserción/update) para cambiar la dificultad de las 77 preguntas cuyo texto comienza por "¿Cuál es la sede" a `nazareno`.

```sql
UPDATE questions SET difficulty = 'nazareno' WHERE question_text LIKE '¿Cuál es la sede%' AND difficulty != 'nazareno';
```

No se requieren cambios en el código — el componente `QuestionsList.tsx` ya lee la dificultad directamente de la base de datos y la mostrará correctamente.

## Resultado esperado

Las 77 preguntas individuales de sedes canónicas pasarán a dificultad `nazareno`, alineándose con lo que ya muestra la categoría en el banco de preguntas.


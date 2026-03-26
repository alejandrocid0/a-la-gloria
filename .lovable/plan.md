

# Proteger la columna `correct_answer` de la tabla `questions`

## El problema (explicación sencilla)

La tabla `questions` tiene una política de seguridad que dice "cualquier usuario autenticado puede leer todas las columnas". Aunque tu código frontend solo pide las columnas seguras (sin `correct_answer`), **un usuario con conocimientos técnicos podría abrir la consola del navegador y hacer una consulta directa** pidiendo `correct_answer`, obteniendo todas las respuestas correctas antes de jugar.

Esto **no viene de un cambio reciente** — es la configuración original de la tabla. El código ya intenta mitigarlo pidiendo solo campos seguros (`SAFE_QUESTION_FIELDS`), pero la protección real tiene que estar en la base de datos, no en el frontend.

## Solución

Eliminar la política permisiva y que todas las consultas de preguntas para el juego pasen por funciones seguras del servidor (que ya existen parcialmente).

## Cambios

### 1. Migración SQL

- **Crear función** `get_random_questions_by_difficulty(p_difficulty text, p_limit int)` — `SECURITY DEFINER`, devuelve preguntas sin `correct_answer` (para el fallback cuando no hay preguntas del día).
- **Eliminar política** `"Authenticated users can read questions"` de la tabla `questions`.

Tras esto, solo los admins podrán hacer SELECT directo sobre `questions`. Los jugadores accederán mediante las funciones RPC que ya existen (`get_questions_for_daily_game`) y la nueva.

### 2. Actualizar `src/hooks/useGameQuestions.ts`

- Cambiar el fallback (cuando no hay `daily_questions`) para que use la nueva función RPC `get_random_questions_by_difficulty` en vez de consultar la tabla directamente.
- Cambiar la carga de preguntas del día para usar `get_questions_for_daily_game` (función que ya existe) en vez de hacer join con la tabla.

## Impacto

- **Jugadores**: sin cambio visible, todo funciona igual
- **Panel admin**: sin cambio, la política de admin sigue permitiendo acceso completo
- **Seguridad**: un usuario ya no puede obtener `correct_answer` de ninguna forma desde el cliente


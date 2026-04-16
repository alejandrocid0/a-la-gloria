

# Rediseño de la pestaña Preguntas del Admin

## Resumen

Convertir las 4 secciones actuales (CSV Importer, Buscador, Formulario de crear, Banco de preguntas) en un **acordeón colapsable** con botones finos que muestran solo icono + título. Las categorías del banco pasan de cuadrícula 2 columnas a lista vertical ordenada alfabéticamente.

## Cambios

### 1. Admin.tsx — Pestaña "questions"

Reemplazar el contenido actual de `TabsContent value="questions"` por 4 secciones con `Collapsible` (ya existe en el proyecto):

```
📥 Importar preguntas desde CSV
🔍 Buscar preguntas
✏️ Crear nueva pregunta
📚 Banco de preguntas (1.555)
```

Cada sección es un botón fino (border, rounded, padding pequeño) que al hacer clic despliega el contenido correspondiente. Solo una sección abierta a la vez (controlado con un estado `openSection`).

- Se elimina el título "Banco de Preguntas" redundante de QuestionsList (ya lo muestra el acordeón).
- Se elimina el buscador embebido en Card (pasa a ser contenido del colapsable "Buscar preguntas").

### 2. QuestionsList.tsx — Categorías como lista vertical

Cambiar la cuadrícula (`grid-cols-2`) por una lista vertical:
- Cada categoría es una fila horizontal con nombre a la izquierda y contador a la derecha.
- Ordenadas **alfabéticamente** por nombre.
- Estilo: `flex justify-between`, borde fino, hover con highlight.

### Sobre las dificultades por categoría

Resultado del análisis:

| Categoría | Dificultad | Uniforme |
|---|---|---|
| Advocaciones del Cristo | nazareno | Si |
| Advocaciones de la Virgen | nazareno | Si |
| Antifaces de nazarenos | kanicofrade | Si |
| Autores de Cristos | costalero | Si |
| Autores de Vírgenes | costalero | Si |
| Autores de figuras secundarias | capataz | Si |
| Autores de vísperas | costalero | Si |
| Bandas de Cristo | costalero | Si |
| Bandas de palio | costalero | Si |
| Capataces | capataz | Si |
| Días de procesión | kanicofrade | Si |
| Posición en carrera oficial | nazareno | Si |
| Pregoneros Semana Santa | maestro | Si |
| Restauraciones | maestro | Si |
| Tipos de paso de Cristo | kanicofrade | Si |
| **Sedes canónicas** | **costalero + kanicofrade** | **NO** |
| "Otras" (sin categoría explícita) | **mezcla de todas** | **NO** |

**Sedes canónicas** tiene 55 preguntas como costalero y 22 como kanicofrade. El resto de categorías (las que vienen del campo `category` en DB) son uniformes. Las preguntas sin categoría explícita (agrupadas por patrón de texto) también son uniformes por grupo, excepto "Otras" que es el cajón de sastre.

Esto queda para que lo revises y decidas si quieres reclasificar las sedes canónicas.

## Archivos a modificar

1. **`src/pages/Admin.tsx`** — Reemplazar contenido de la pestaña questions por 4 colapsables
2. **`src/components/admin/QuestionsList.tsx`** — Cambiar grid por lista vertical alfabética

No se crean archivos nuevos ni se añaden dependencias (Collapsible ya existe).


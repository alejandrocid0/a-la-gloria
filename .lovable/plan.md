

## Plan: Buscador de preguntas por texto

### Objetivo

Añadir un campo de búsqueda entre el importador CSV y el formulario de preguntas que permita filtrar las preguntas por palabras contenidas en el texto de la pregunta, facilitando la localización y edición de preguntas específicas.

---

### Ubicación del cambio

**Archivo**: `src/pages/Admin.tsx`

El buscador se añadirá en la pestaña "Preguntas", justo después del `<CSVImporter />` y antes del `<QuestionForm />`.

---

### Diseño propuesto

```text
┌─────────────────────────────────────────────┐
│  [Importador CSV]                           │
├─────────────────────────────────────────────┤
│  🔍 Buscar preguntas...                     │  ← NUEVO
│  ┌─────────────────────────────────────┐    │
│  │ Escribe para filtrar (ej: "Virgen") │    │
│  └─────────────────────────────────────┘    │
│  Mostrando X de Y preguntas                 │
├─────────────────────────────────────────────┤
│  [Formulario de pregunta]                   │
├─────────────────────────────────────────────┤
│  [Lista de preguntas filtradas]             │
└─────────────────────────────────────────────┘
```

---

### Implementación

1. **Añadir estado para el término de búsqueda** en `Admin.tsx`:
   ```typescript
   const [searchTerm, setSearchTerm] = useState("");
   ```

2. **Crear lógica de filtrado** que busque coincidencias parciales (case-insensitive):
   ```typescript
   const filteredQuestions = questions.filter((q) =>
     q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
   );
   ```

3. **Añadir componente de búsqueda** con:
   - Icono de lupa (Search de lucide-react)
   - Input de texto con placeholder descriptivo
   - Botón para limpiar búsqueda (X)
   - Contador de resultados: "Mostrando X de Y preguntas"

4. **Pasar preguntas filtradas** a `QuestionsList`:
   ```typescript
   <QuestionsList
     questions={filteredQuestions}  // ← Cambio
     onEdit={setEditingQuestion}
     onDelete={refetch}
   />
   ```

---

### Componente de búsqueda (UI)

```typescript
<Card className="p-4">
  <div className="flex items-center gap-2">
    <Search className="h-5 w-5 text-muted-foreground" />
    <Input
      placeholder="Buscar preguntas por texto..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1"
    />
    {searchTerm && (
      <Button variant="ghost" size="icon" onClick={() => setSearchTerm("")}>
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
  {searchTerm && (
    <p className="text-sm text-muted-foreground mt-2">
      Mostrando {filteredQuestions.length} de {questions.length} preguntas
    </p>
  )}
</Card>
```

---

### Funcionalidad

| Característica | Descripción |
|----------------|-------------|
| Búsqueda en tiempo real | Filtra mientras escribes |
| Case-insensitive | "virgen" encuentra "Virgen" |
| Búsqueda parcial | "Macar" encuentra "Macarena" |
| Botón limpiar | Restaura vista completa con un clic |
| Contador | Muestra cuántas preguntas coinciden |

---

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Admin.tsx` | Añadir estado `searchTerm`, lógica de filtrado y componente de búsqueda |

---

### Beneficios

- Localizar preguntas específicas entre las ~900 existentes
- Editar errores detectados rápidamente
- Sin necesidad de scroll infinito buscando manualmente
- Filtrado instantáneo sin recargar datos


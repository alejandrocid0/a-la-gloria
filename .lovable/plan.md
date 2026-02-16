

## Nueva categoria "Autores de Cristos" en el banco de preguntas

### Cambio unico

**Archivo: `src/components/admin/QuestionsList.tsx`**

Anadir una nueva entrada al array `QUESTION_CATEGORIES` con el patron que detecta preguntas que empiezan por "¿Quién talló al Cristo":

```typescript
{ key: 'autores-cristos', label: 'Autores de Cristos', pattern: '¿Quién talló al Cristo' }
```

Se colocara justo antes de la entrada existente de "Autores de Virgenes" (`¿Quién talló a la Virgen`) para mantener el orden logico. No hay conflicto entre ambos patrones porque uno usa "talló al" y el otro "talló a la".

No se toca ningun otro archivo ni se modifica la base de datos.


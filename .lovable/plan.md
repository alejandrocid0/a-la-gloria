

## Plan: Mostrar ambos botones en la pantalla de inicio

### Objetivo

Mostrar tanto el botón **"Compartir con otros cofrades"** (WhatsApp) como el **"Buzón de sugerencias"** en la pantalla de inicio, uno debajo del otro.

---

### Orden de los elementos

```text
┌─────────────────────────────────────────┐
│  [Tarjeta de posición en ranking]       │
├─────────────────────────────────────────┤
│  📱 Comparte con otros cofrades         │  ← Primero
├─────────────────────────────────────────┤
│  💬 Buzón de sugerencias                │  ← Segundo
└─────────────────────────────────────────┘
```

---

### Funcionalidad del botón "Compartir"

| Característica | Valor |
|----------------|-------|
| Acción | Abre WhatsApp con mensaje prellenado |
| Mensaje | "¡Prueba ya A la Gloria, el mejor juego para cofrades! Demuestra que eres quien más sabe de Semana Santa 🏆. alagloria.es" |
| Icono | `MessageCircle` de lucide-react |
| Estilo | Mismo que buzón de sugerencias (borde dorado, fondo blanco) |

---

### Cambios en el código

**Archivo**: `src/pages/Home.tsx`

1. **Eliminar la constante** `SHOW_SHARE_BUTTON` (ya no es necesaria)

2. **Eliminar la lógica condicional** que mostraba uno u otro

3. **Mostrar ambos botones** en el siguiente orden:
   - Botón de WhatsApp ("Comparte con otros cofrades")
   - Componente `<FeedbackDialog />` ("Buzón de sugerencias")

---

### Código resultante (zona de botones)

```tsx
{/* Compartir con otros cofrades */}
<Button 
  asChild
  variant="outline"
  size="xl"
  className="w-full border-[hsl(45,71%,65%)] border-2 bg-white hover:bg-[hsl(45,71%,65%)]/10 text-foreground font-bold shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)]"
>
  <a
    href="https://wa.me/?text=¡Prueba%20ya%20A%20la%20Gloria,%20el%20mejor%20juego%20para%20cofrades!%20Demuestra%20que%20eres%20quien%20más%20sabe%20de%20Semana%20Santa%20🏆.%20alagloria.es"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2"
  >
    <MessageCircle className="w-5 h-5" />
    Comparte con otros cofrades
  </a>
</Button>

{/* Buzón de sugerencias */}
<FeedbackDialog />
```

---

### Resumen visual

Ambos botones tendrán el mismo estilo visual (coherencia):
- Ancho completo
- Borde dorado (`border-[hsl(45,71%,65%)]`)
- Fondo blanco con hover suave
- Icono a la izquierda del texto
- Altura XL para fácil pulsación en móvil

---

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Eliminar constante y condicional, mostrar ambos botones |


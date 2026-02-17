
## Reemplazar Top 3 Hermandades por Top 10 clickeable

### Cambios

Eliminar las 3 tarjetas de hermandades actuales (lineas 369-395) y reemplazarlas por:

1. **Un recuadro resumen clickeable** que muestra "Top 10 Hermandades" con el top 3 entre parentesis (ej: "La Macarena, Gran Poder, El Cachorro").
2. **Un Dialog** que se abre al pulsar, mostrando una lista de 10 recuadros con el nombre de la hermandad y su numero de usuarios.

### Detalle tecnico

**Archivo:** `src/components/admin/AdminDashboard.tsx`

1. Modificar la query `admin-dashboard-hermandades` para traer 10 hermandades en lugar de 3 (cambiar `.slice(0, 3)` a `.slice(0, 10)`).

2. Anadir un estado `showHermandades` para controlar la apertura del Dialog:
```typescript
const [showHermandades, setShowHermandades] = useState(false);
```

3. Reemplazar el bloque del grid de 3 tarjetas (lineas 369-395) por un unico recuadro clickeable:
```typescript
<Card 
  className="cursor-pointer hover:bg-accent/50 transition-colors"
  onClick={() => setShowHermandades(true)}
>
  <CardHeader className="pb-2">
    <CardTitle className="text-lg flex items-center gap-2">
      Top 10 Hermandades
      <span className="text-sm font-normal text-muted-foreground">
        ({topHermandades?.slice(0, 3).map(h => h.nombre).join(", ")})
      </span>
    </CardTitle>
  </CardHeader>
</Card>
```

4. Anadir un Dialog que muestra los 10 recuadros:
```typescript
<Dialog open={showHermandades} onOpenChange={setShowHermandades}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Top 10 Hermandades</DialogTitle>
    </DialogHeader>
    <ScrollArea className="max-h-[400px]">
      <div className="flex flex-col gap-2">
        {topHermandades?.map((h, index) => (
          <Card key={h.nombre} className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {index + 1}. {h.nombre}
              </span>
              <span className="text-sm text-muted-foreground">
                {h.usuarios} usuarios
              </span>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  </DialogContent>
</Dialog>
```

Un solo archivo modificado, sin cambios en base de datos.

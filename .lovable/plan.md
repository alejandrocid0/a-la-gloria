## Torneos: Pantalla inicial y cambios de navegacion

### Resumen

Tres cambios: (1) nueva pagina de Torneos con estado vacio, (2) reordenar el menu inferior con 5 items, (3) nueva pestana "Torneos" en el panel de administracion.

### Cambios

**1. Nueva pagina `src/pages/Tournament.tsx**`

- Header morado con titulo "TORNEOS" (mismo estilo que otras paginas)
- Subtitulo descriptivo: "Compite, avanza rondas y demuestra cuanto sabes de nuestra Semana Santa."
- Sin tabs de Torneos/Premium (eliminado segun indicacion)
- Mensaje centrado: "Proximamente mas torneos" con icono decorativo
- BottomNav visible

**2. Actualizar `src/components/BottomNav.tsx**`

- 5 items en este orden: Torneo (`/torneo`, icono `Swords`), Jugar (`/jugar`), Inicio (`/`, icono `Home`), Ranking, Perfil
- Inicio sigue siendo la ruta `/` (pagina por defecto al iniciar sesion)

**3. Actualizar `src/App.tsx**`

- Añadir ruta `/torneo` protegida con el componente `Tournament`

**4. Actualizar `src/pages/Admin.tsx**`

- Ampliar TabsList de 4 a 5 columnas (`grid-cols-5`)
- Nueva pestana "Torneos" con icono `Swords` y contenido placeholder: un Card vacio con texto "Gestion de torneos proximamente"

### Detalles tecnicos

```text
BottomNav order:
[Swords/Torneo] [Play/Jugar] [Home/Inicio] [Trophy/Ranking] [User/Perfil]
     /torneo       /jugar         /            /ranking        /perfil
```

No se requieren cambios en base de datos. Solo archivos de frontend.
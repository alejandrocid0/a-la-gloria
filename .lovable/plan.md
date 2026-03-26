

# Proteger los `join_code` de la tabla `tournaments`

## Estado actual

**No está corregido.** La política `"Authenticated users can view tournaments"` usa `USING (true)`, lo que permite a cualquier usuario autenticado leer TODAS las columnas, incluido `join_code`. Las políticas RLS de Postgres no pueden ocultar columnas individuales — solo restringen filas.

## El problema (explicación sencilla)

Un usuario con conocimientos técnicos podría abrir la consola del navegador y hacer `SELECT join_code FROM tournaments` para obtener todos los códigos de acceso, uniéndose a torneos privados sin que nadie se los haya dado.

## Solución

Dado que RLS no puede ocultar columnas, necesitamos dos cosas:
1. Una **vista** que muestre los datos públicos de torneos (sin `join_code`)
2. Una **función RPC** que valide el código y una al usuario al torneo, todo del lado del servidor

## Cambios

### 1. Migración SQL

- **Crear vista** `tournaments_public` — incluye todas las columnas de `tournaments` excepto `join_code`, con `security_invoker = on`
- **Crear función** `join_tournament_by_code(p_code text)` — `SECURITY DEFINER`, busca el torneo por código, valida que no esté completado, inserta al participante y devuelve el id y nombre del torneo
- **Reemplazar política SELECT** — eliminar `"Authenticated users can view tournaments"` y crear una nueva que solo permita SELECT a admins (los usuarios normales usarán la vista)
- **Crear política SELECT en la vista** — permitir a usuarios autenticados leer `tournaments_public`

### 2. Actualizar `src/pages/Tournament.tsx`

- Cambiar `.from("tournaments")` por `.from("tournaments_public")` en la query principal

### 3. Actualizar `src/components/tournament/JoinTournamentDialog.tsx`

- Reemplazar la consulta directa a `tournaments` + insert manual por una llamada a la RPC `join_tournament_by_code`

### 4. Revisar otros archivos que lean de `tournaments`

- Verificar y actualizar cualquier otra query del frontend que lea de la tabla `tournaments` directamente (excepto el panel admin, que seguirá usando la tabla base gracias a la política de admin)

## Impacto

- Los administradores siguen viendo todo, incluidos los `join_code`
- Los usuarios normales ven la lista de torneos sin códigos
- Unirse a un torneo sigue funcionando igual desde la UI, pero el código se valida solo en el servidor




# Prevenir escalada de privilegios en user_roles

## El problema

Aunque las políticas RLS actuales solo permiten a admins hacer INSERT en `user_roles`, falta una capa de defensa adicional a nivel de trigger. Si por algún fallo o cambio futuro en las políticas RLS un usuario autenticado pudiera insertar filas, podría asignarse el rol `admin`.

## Solución

Crear un **trigger de validación** en la tabla `user_roles` que bloquee cualquier INSERT o UPDATE con `role = 'admin'` si el usuario que ejecuta la operación no es ya admin. Esto actúa como defensa en profundidad, independiente de RLS.

## Cambio (1 migración SQL)

1. Crear función `prevent_self_admin_assignment()` — `SECURITY DEFINER`, comprueba con `has_role(auth.uid(), 'admin')` antes de permitir insertar/actualizar un rol admin.
2. Crear trigger `prevent_admin_escalation` en `user_roles` — `BEFORE INSERT OR UPDATE`, ejecuta la función anterior.

```sql
-- Función de validación
CREATE OR REPLACE FUNCTION public.prevent_self_admin_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'admin' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Cannot assign admin role';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER prevent_admin_escalation
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_admin_assignment();
```

## Sin cambios en el frontend

No se toca ningún archivo del código. Es un cambio exclusivamente en la base de datos.

## Impacto

- Los administradores existentes pueden seguir gestionando roles normalmente
- Un usuario no-admin que intente insertar `role = 'admin'` recibirá un error, incluso si las políticas RLS fueran modificadas en el futuro


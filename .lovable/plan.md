

# Proteger funciones RPC con verificación de admin

## Qué se hará

Añadir una comprobación de rol de administrador al inicio de tres funciones SQL que actualmente son accesibles por cualquier usuario autenticado.

## Cambios

### 1. Migración SQL — añadir guard de admin a 3 funciones

**`get_user_retention_stats()`** — Añadir al inicio del cuerpo:
```sql
SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
IF NOT v_is_admin THEN
  RAISE EXCEPTION 'Access denied';
END IF;
```

**`get_daily_activity_stats()`** — Convertir de `LANGUAGE sql` a `LANGUAGE plpgsql` para poder añadir la misma comprobación (las funciones SQL puras no soportan lógica condicional).

**`cleanup_abandoned_games()`** — Añadir la misma comprobación de admin.

### 2. Sin cambios en el frontend

El frontend ya solo llama a estas funciones desde el panel de administración (`AdminDashboard`, `RetentionSection`, `ActivityChart`), que está protegido por `useAdmin`. La comprobación en la base de datos es una capa de defensa adicional para que nadie pueda explotar las funciones directamente.

## Impacto

- Ningún cambio visible para los administradores
- Un usuario no-admin que intente llamar a estas funciones recibirá un error "Access denied"
- Se cierra la exposición de emails y datos personales


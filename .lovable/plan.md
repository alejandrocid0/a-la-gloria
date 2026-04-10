

# Plan: Generar README Técnico Completo

## Qué voy a crear

Un archivo Markdown descargable (`/mnt/documents/README_TECNICO.md`) con toda la documentación técnica del proyecto **A la Gloria**, pensado para que un desarrollador externo entienda el proyecto en 30 minutos.

## Contenido del documento

1. **Resumen del proyecto** — Qué es, público objetivo, métricas actuales (+1300 usuarios)
2. **Stack tecnológico** — React 18, Vite, TypeScript, Tailwind, shadcn/ui, React Query, Supabase (Auth, DB, Edge Functions, Storage)
3. **Estructura de carpetas** — Árbol con explicación de cada directorio
4. **Arquitectura de la aplicación** — Diagrama ASCII del flujo cliente → Edge Functions → DB
5. **Flujo del juego diario** — Paso a paso: obtener fecha servidor → cargar preguntas → jugar → submit → resultados
6. **Sistema de torneos** — 5 rondas, códigos de unión, ranking en tiempo real
7. **Base de datos** — Las 10 tablas con sus columnas, relaciones y propósito
8. **Edge Functions** — Las 4 funciones (`get-server-time`, `check-answer`, `submit-game`, `submit-tournament-round`) con entrada/salida
9. **Seguridad** — RLS policies, funciones SECURITY DEFINER, anti-trampas, protección de `correct_answer`
10. **Decisiones de diseño** — Por qué no hay foreign keys explícitas, por qué `invokeWithTimeout`, por qué fecha del servidor, scoring basado en tiempo
11. **Deuda técnica conocida** — `useAuth` sin Context, ausencia de tests automatizados
12. **Cómo ejecutar en local** — `npm install`, variables de entorno, desarrollo

## Acción

Un solo script que genera el archivo Markdown completo y lo guarda en `/mnt/documents/README_TECNICO.md`.


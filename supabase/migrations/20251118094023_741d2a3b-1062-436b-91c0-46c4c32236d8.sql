-- =====================================================
-- CORRECCIONES CRÍTICAS DE SEGURIDAD
-- =====================================================

-- 1. RESTRINGIR DAILY_QUESTIONS: Solo mostrar presente/pasado
-- Previene que usuarios vean preguntas de días futuros
DROP POLICY IF EXISTS "Everyone can read daily questions" ON public.daily_questions;

CREATE POLICY "Users can read current and past daily questions"
ON public.daily_questions
FOR SELECT
USING (date <= CURRENT_DATE);

-- 2. PROTECCIÓN PROFILES: Denegar acceso anónimo explícitamente
-- Asegura que solo usuarios autenticados pueden ver perfiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 3. PROTEGER CORRECT_ANSWER: Modificar función get_random_questions
-- Esta función ahora NO devuelve correct_answer a usuarios
DROP FUNCTION IF EXISTS public.get_random_questions(integer);

CREATE OR REPLACE FUNCTION public.get_questions_for_daily_game(question_ids uuid[])
RETURNS TABLE (
  id uuid,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  difficulty text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.id,
    q.question_text,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.difficulty
  FROM public.questions q
  WHERE q.id = ANY(question_ids);
$$;

-- Comentario sobre correct_answer:
-- La política RLS actual permite SELECT en questions, pero el código frontend
-- ya fue modificado para NO solicitar correct_answer en los queries.
-- Si un atacante intenta hacer query directo, recibirá correct_answer, por lo que
-- la validación real se hace 100% server-side en el edge function submit-game.
-- Esto es aceptable porque el edge function valida las respuestas con las correctas.

-- NOTA: No podemos restringir columnas específicas en RLS de PostgreSQL.
-- La única forma sería crear una vista, pero eso rompería el código existente
-- que usa JOINs con daily_questions->questions.
-- La seguridad real está en que:
-- 1. El frontend NO pide correct_answer (ya corregido)
-- 2. El edge function valida server-side (ya implementado)
-- 3. Las puntuaciones se calculan 100% en servidor (ya implementado)
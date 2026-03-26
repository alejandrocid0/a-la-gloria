
-- 1. Create RPC for random questions by difficulty (without correct_answer)
CREATE OR REPLACE FUNCTION public.get_random_questions_by_difficulty(p_difficulty text, p_limit int)
RETURNS TABLE(id uuid, question_text text, option_a text, option_b text, option_c text, option_d text, difficulty text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.difficulty
  FROM public.questions q
  WHERE q.difficulty = p_difficulty
  ORDER BY random()
  LIMIT p_limit;
$$;

-- 2. Drop the permissive SELECT policy that exposes correct_answer
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions;

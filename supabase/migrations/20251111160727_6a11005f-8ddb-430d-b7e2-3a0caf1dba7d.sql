-- Crear función para obtener preguntas aleatorias
-- Esta función selecciona 10 preguntas aleatorias de la tabla questions
CREATE OR REPLACE FUNCTION public.get_random_questions(question_count integer DEFAULT 10)
RETURNS SETOF public.questions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM public.questions
  WHERE 
    question_text IS NOT NULL 
    AND option_a IS NOT NULL 
    AND option_b IS NOT NULL 
    AND option_c IS NOT NULL 
    AND option_d IS NOT NULL
    AND correct_answer IS NOT NULL
  ORDER BY RANDOM()
  LIMIT question_count;
$$;
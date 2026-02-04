-- Eliminar función obsoleta que expone correct_answer
DROP FUNCTION IF EXISTS public.get_random_questions(integer);
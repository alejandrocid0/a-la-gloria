-- Eliminar los CHECK CONSTRAINTs antiguos
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_difficulty_check;

ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_correct_answer_check;

-- Crear nuevos CHECK CONSTRAINTs con los valores correctos
ALTER TABLE public.questions 
ADD CONSTRAINT questions_difficulty_check 
CHECK (difficulty = ANY (ARRAY['kanicofrade'::text, 'nazareno'::text, 'costalero'::text, 'capataz'::text, 'maestro'::text]));

ALTER TABLE public.questions 
ADD CONSTRAINT questions_correct_answer_check 
CHECK (correct_answer >= 1 AND correct_answer <= 4);
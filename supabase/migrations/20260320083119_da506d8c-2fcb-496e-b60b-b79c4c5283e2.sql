UPDATE public.questions
SET difficulty = 'nazareno'
WHERE question_text LIKE '¿Qué posición ocupa en carrera oficial este año%'
  AND difficulty = 'kanicofrade';
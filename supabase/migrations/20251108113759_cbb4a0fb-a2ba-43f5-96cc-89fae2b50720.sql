-- Eliminar la columna category de la tabla questions
ALTER TABLE public.questions 
DROP COLUMN IF EXISTS category;
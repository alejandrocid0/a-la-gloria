-- Actualizar CHECK constraint para incluir 'archived'
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_status_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('pending', 'errors', 'ideas', 'compliments', 'resolved', 'archived'));
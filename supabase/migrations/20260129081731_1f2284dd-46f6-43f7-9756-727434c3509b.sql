-- Eliminar constraint antiguo
ALTER TABLE public.feedback 
DROP CONSTRAINT IF EXISTS feedback_status_check;

-- Crear constraint con los 5 nuevos estados
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('pending', 'errors', 'ideas', 'compliments', 'resolved'));
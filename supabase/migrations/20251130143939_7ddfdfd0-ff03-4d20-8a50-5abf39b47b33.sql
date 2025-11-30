-- Añadir columna best_streak a profiles
ALTER TABLE public.profiles 
ADD COLUMN best_streak INTEGER DEFAULT 0;

-- Inicializar best_streak con el valor actual de current_streak para usuarios existentes
UPDATE public.profiles 
SET best_streak = COALESCE(current_streak, 0);
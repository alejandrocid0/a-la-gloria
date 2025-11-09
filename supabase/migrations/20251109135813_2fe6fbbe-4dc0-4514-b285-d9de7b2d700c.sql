-- Eliminar la vista actual public_profiles
DROP VIEW IF EXISTS public.public_profiles;

-- Crear función SECURITY DEFINER que retorna datos públicos de perfiles
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  name text,
  hermandad text,
  total_points integer,
  games_played integer,
  current_streak integer,
  best_score integer,
  last_game_date date,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    hermandad,
    total_points,
    games_played,
    current_streak,
    best_score,
    last_game_date,
    created_at
  FROM public.profiles
  ORDER BY total_points DESC;
$$;
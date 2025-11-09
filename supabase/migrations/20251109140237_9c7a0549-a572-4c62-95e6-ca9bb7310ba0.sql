-- Actualizar función get_public_profiles para excluir administradores
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
    p.id,
    p.name,
    p.hermandad,
    p.total_points,
    p.games_played,
    p.current_streak,
    p.best_score,
    p.last_game_date,
    p.created_at
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = p.id 
    AND ur.role = 'admin'
  )
  ORDER BY p.total_points DESC;
$$;
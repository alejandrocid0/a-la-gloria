-- Función optimizada para obtener el top N del ranking
CREATE OR REPLACE FUNCTION public.get_top_ranking(limit_count INTEGER DEFAULT 100)
RETURNS TABLE(
  rank_position BIGINT,
  id UUID,
  name TEXT,
  hermandad TEXT,
  total_points INTEGER,
  games_played INTEGER,
  current_streak INTEGER,
  best_score INTEGER
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ROW_NUMBER() OVER (ORDER BY p.total_points DESC) as rank_position,
    p.id,
    p.name,
    p.hermandad,
    p.total_points,
    p.games_played,
    p.current_streak,
    p.best_score
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = p.id 
    AND ur.role = 'admin'
  )
  ORDER BY p.total_points DESC
  LIMIT limit_count;
$$;

-- Función optimizada para obtener la posición de un usuario específico
CREATE OR REPLACE FUNCTION public.get_user_ranking_position(user_uuid UUID)
RETURNS TABLE(
  rank_position BIGINT,
  name TEXT,
  total_points INTEGER,
  total_users BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH ranked_users AS (
    SELECT 
      p.id,
      p.name,
      p.total_points,
      ROW_NUMBER() OVER (ORDER BY p.total_points DESC) as rank_position
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 
      FROM public.user_roles ur 
      WHERE ur.user_id = p.id 
      AND ur.role = 'admin'
    )
  ),
  total AS (
    SELECT COUNT(*) as total_users
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 
      FROM public.user_roles ur 
      WHERE ur.user_id = p.id 
      AND ur.role = 'admin'
    )
  )
  SELECT 
    ru.rank_position,
    ru.name,
    ru.total_points,
    t.total_users
  FROM ranked_users ru
  CROSS JOIN total t
  WHERE ru.id = user_uuid;
$$;
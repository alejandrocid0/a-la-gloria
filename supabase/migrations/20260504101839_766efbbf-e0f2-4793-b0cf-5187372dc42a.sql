-- Top semanal
CREATE OR REPLACE FUNCTION public.get_top_weekly_ranking(limit_count integer DEFAULT 100)
RETURNS TABLE(
  rank_position bigint,
  id uuid,
  name text,
  hermandad text,
  weekly_points bigint,
  games_this_week bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('week', (now() AT TIME ZONE 'Europe/Madrid')::date)::date AS monday,
      (date_trunc('week', (now() AT TIME ZONE 'Europe/Madrid')::date) + interval '6 days')::date AS sunday
  ),
  weekly AS (
    SELECT
      g.user_id,
      SUM(g.total_score)::bigint AS weekly_points,
      COUNT(*)::bigint AS games_this_week
    FROM public.games g, bounds b
    WHERE g.status = 'completed'
      AND ((g.created_at AT TIME ZONE 'Europe/Madrid')::date) BETWEEN b.monday AND b.sunday
    GROUP BY g.user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY w.weekly_points DESC, w.games_this_week DESC, p.name ASC) AS rank_position,
    p.id,
    p.name,
    p.hermandad,
    w.weekly_points,
    w.games_this_week
  FROM weekly w
  JOIN public.profiles p ON p.id = w.user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = 'admin'
  )
  ORDER BY w.weekly_points DESC, w.games_this_week DESC, p.name ASC
  LIMIT limit_count;
$$;

-- Posición semanal del usuario
CREATE OR REPLACE FUNCTION public.get_user_weekly_ranking_position(user_uuid uuid)
RETURNS TABLE(
  rank_position bigint,
  name text,
  weekly_points bigint,
  total_users bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('week', (now() AT TIME ZONE 'Europe/Madrid')::date)::date AS monday,
      (date_trunc('week', (now() AT TIME ZONE 'Europe/Madrid')::date) + interval '6 days')::date AS sunday
  ),
  weekly AS (
    SELECT
      g.user_id,
      SUM(g.total_score)::bigint AS weekly_points,
      COUNT(*)::bigint AS games_this_week
    FROM public.games g, bounds b
    WHERE g.status = 'completed'
      AND ((g.created_at AT TIME ZONE 'Europe/Madrid')::date) BETWEEN b.monday AND b.sunday
    GROUP BY g.user_id
  ),
  ranked AS (
    SELECT
      p.id,
      p.name,
      w.weekly_points,
      ROW_NUMBER() OVER (ORDER BY w.weekly_points DESC, w.games_this_week DESC, p.name ASC) AS rank_position
    FROM weekly w
    JOIN public.profiles p ON p.id = w.user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    )
  ),
  total AS (
    SELECT COUNT(*)::bigint AS total_users FROM ranked
  )
  SELECT r.rank_position, r.name, r.weekly_points, t.total_users
  FROM ranked r
  CROSS JOIN total t
  WHERE r.id = user_uuid;
$$;
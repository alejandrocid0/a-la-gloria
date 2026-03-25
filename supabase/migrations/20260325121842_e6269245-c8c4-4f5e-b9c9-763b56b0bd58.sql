
-- 1. get_user_retention_stats: add admin guard
CREATE OR REPLACE FUNCTION public.get_user_retention_stats()
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  v_is_admin BOOLEAN;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  WITH user_stats AS (
    SELECT 
      p.id as user_id,
      p.name,
      p.email,
      p.hermandad,
      p.games_played,
      p.created_at,
      COUNT(DISTINCT g.date) as days_played,
      GREATEST(((NOW() AT TIME ZONE 'Europe/Madrid')::DATE - (p.created_at AT TIME ZONE 'Europe/Madrid')::DATE) + 1, 1) as days_available,
      ROUND(
        (COUNT(DISTINCT g.date)::NUMERIC / 
         GREATEST(((NOW() AT TIME ZONE 'Europe/Madrid')::DATE - (p.created_at AT TIME ZONE 'Europe/Madrid')::DATE) + 1, 1)) * 100, 
        1
      ) as percentage
    FROM profiles p
    LEFT JOIN games g ON g.user_id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    )
    GROUP BY p.id, p.name, p.email, p.hermandad, p.games_played, p.created_at
  ),
  categorized AS (
    SELECT *,
      CASE 
        WHEN days_played = 0 THEN 'inactive'
        WHEN percentage >= 80 THEN 'high'
        WHEN percentage >= 50 THEN 'medium'
        WHEN percentage >= 20 THEN 'low'
        ELSE 'none'
      END as category
    FROM user_stats
  )
  SELECT json_build_object(
    'launchDate', '2025-12-30',
    'counts', (
      SELECT json_build_object(
        'high', COUNT(*) FILTER (WHERE category = 'high'),
        'medium', COUNT(*) FILTER (WHERE category = 'medium'),
        'low', COUNT(*) FILTER (WHERE category = 'low'),
        'none', COUNT(*) FILTER (WHERE category = 'none'),
        'inactive', COUNT(*) FILTER (WHERE category = 'inactive')
      ) FROM categorized
    ),
    'users', (
      SELECT json_build_object(
        'high', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'email', email, 'hermandad', hermandad, 'daysPlayed', days_played, 'daysAvailable', days_available, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'high'), '[]'::json),
        'medium', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'email', email, 'hermandad', hermandad, 'daysPlayed', days_played, 'daysAvailable', days_available, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'medium'), '[]'::json),
        'low', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'email', email, 'hermandad', hermandad, 'daysPlayed', days_played, 'daysAvailable', days_available, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'low'), '[]'::json),
        'none', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'email', email, 'hermandad', hermandad, 'daysPlayed', days_played, 'daysAvailable', days_available, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'none'), '[]'::json),
        'inactive', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'email', email, 'hermandad', hermandad, 'daysPlayed', days_played, 'daysAvailable', days_available, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'inactive'), '[]'::json)
      )
    )
  ) INTO result
  FROM (SELECT 1) dummy;
  
  RETURN result;
END;
$function$;

-- 2. get_daily_activity_stats: convert to plpgsql + add admin guard
CREATE OR REPLACE FUNCTION public.get_daily_activity_stats(p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(fecha date, registros bigint, partidas bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      COALESCE(p_start_date, '2025-01-01'::DATE),
      p_end_date,
      '1 day'::INTERVAL
    )::DATE AS ds_fecha
  ),
  daily_registrations AS (
    SELECT (p.created_at AT TIME ZONE 'Europe/Madrid')::DATE as reg_fecha, COUNT(*) as total
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    )
    AND (p.created_at AT TIME ZONE 'Europe/Madrid')::DATE BETWEEN COALESCE(p_start_date, '2025-01-01') AND p_end_date
    GROUP BY (p.created_at AT TIME ZONE 'Europe/Madrid')::DATE
  ),
  daily_games AS (
    SELECT (g.created_at AT TIME ZONE 'Europe/Madrid')::DATE as game_fecha, COUNT(*) as total
    FROM games g
    WHERE g.status = 'completed'
    AND (g.created_at AT TIME ZONE 'Europe/Madrid')::DATE BETWEEN COALESCE(p_start_date, '2025-01-01') AND p_end_date
    GROUP BY (g.created_at AT TIME ZONE 'Europe/Madrid')::DATE
  )
  SELECT 
    ds.ds_fecha,
    COALESCE(dr.total, 0),
    COALESCE(dg.total, 0)
  FROM date_series ds
  LEFT JOIN daily_registrations dr ON ds.ds_fecha = dr.reg_fecha
  LEFT JOIN daily_games dg ON ds.ds_fecha = dg.game_fecha
  ORDER BY ds.ds_fecha;
END;
$function$;

-- 3. cleanup_abandoned_games: add admin guard
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_games()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
  v_is_admin BOOLEAN;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM public.games 
  WHERE status = 'in_progress' 
  AND date < (NOW() AT TIME ZONE 'Europe/Madrid')::DATE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

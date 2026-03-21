
-- Fix get_daily_activity_stats to use Europe/Madrid timezone
CREATE OR REPLACE FUNCTION public.get_daily_activity_stats(p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(fecha date, registros bigint, partidas bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH date_series AS (
    SELECT generate_series(
      COALESCE(p_start_date, '2025-01-01'::DATE),
      p_end_date,
      '1 day'::INTERVAL
    )::DATE AS fecha
  ),
  daily_registrations AS (
    SELECT (created_at AT TIME ZONE 'Europe/Madrid')::DATE as fecha, COUNT(*) as total
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    )
    AND (created_at AT TIME ZONE 'Europe/Madrid')::DATE BETWEEN COALESCE(p_start_date, '2025-01-01') AND p_end_date
    GROUP BY (created_at AT TIME ZONE 'Europe/Madrid')::DATE
  ),
  daily_games AS (
    SELECT (created_at AT TIME ZONE 'Europe/Madrid')::DATE as fecha, COUNT(*) as total
    FROM games
    WHERE status = 'completed'
    AND (created_at AT TIME ZONE 'Europe/Madrid')::DATE BETWEEN COALESCE(p_start_date, '2025-01-01') AND p_end_date
    GROUP BY (created_at AT TIME ZONE 'Europe/Madrid')::DATE
  )
  SELECT 
    ds.fecha,
    COALESCE(dr.total, 0) as registros,
    COALESCE(dg.total, 0) as partidas
  FROM date_series ds
  LEFT JOIN daily_registrations dr ON ds.fecha = dr.fecha
  LEFT JOIN daily_games dg ON ds.fecha = dg.fecha
  ORDER BY ds.fecha;
$function$;

-- Fix cleanup_abandoned_games to use Europe/Madrid timezone
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_games()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.games 
  WHERE status = 'in_progress' 
  AND date < (NOW() AT TIME ZONE 'Europe/Madrid')::DATE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- Fix get_user_retention_stats to use Europe/Madrid timezone
CREATE OR REPLACE FUNCTION public.get_user_retention_stats()
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
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

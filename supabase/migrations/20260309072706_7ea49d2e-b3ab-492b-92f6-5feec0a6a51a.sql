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
    SELECT DATE(created_at) as fecha, COUNT(*) as total
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    )
    AND DATE(created_at) BETWEEN COALESCE(p_start_date, '2025-01-01') AND p_end_date
    GROUP BY DATE(created_at)
  ),
  daily_games AS (
    SELECT DATE(created_at) as fecha, COUNT(*) as total
    FROM games
    WHERE status = 'completed'
    AND DATE(created_at) BETWEEN COALESCE(p_start_date, '2025-01-01') AND p_end_date
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.fecha,
    COALESCE(dr.total, 0) as registros,
    COALESCE(dg.total, 0) as partidas
  FROM date_series ds
  LEFT JOIN daily_registrations dr ON ds.fecha = dr.fecha
  LEFT JOIN daily_games dg ON ds.fecha = dg.fecha
  ORDER BY ds.fecha;
$function$
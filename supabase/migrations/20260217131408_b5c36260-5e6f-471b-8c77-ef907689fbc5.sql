
CREATE OR REPLACE FUNCTION public.get_user_retention_stats()
 RETURNS json
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
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
      GREATEST((CURRENT_DATE - p.created_at::DATE) + 1, 1) as days_available,
      ROUND(
        (COUNT(DISTINCT g.date)::NUMERIC / 
         GREATEST((CURRENT_DATE - p.created_at::DATE) + 1, 1)) * 100, 
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

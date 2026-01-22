-- Función para obtener estadísticas de retención de usuarios (evita límite de 1000 filas)
CREATE OR REPLACE FUNCTION get_user_retention_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_days INTEGER;
  result JSON;
BEGIN
  -- Calcular días desde lanzamiento (30 dic 2025)
  total_days := GREATEST((CURRENT_DATE - '2025-12-30'::DATE) + 1, 1);
  
  WITH user_stats AS (
    SELECT 
      g.user_id,
      p.name,
      p.hermandad,
      p.games_played,
      COUNT(DISTINCT g.date) as days_played,
      ROUND((COUNT(DISTINCT g.date)::NUMERIC / total_days) * 100, 1) as percentage
    FROM games g
    JOIN profiles p ON p.id = g.user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = g.user_id AND ur.role = 'admin'
    )
    GROUP BY g.user_id, p.name, p.hermandad, p.games_played
  ),
  categorized AS (
    SELECT *,
      CASE 
        WHEN days_played <= 1 THEN 'none'
        WHEN percentage >= 80 THEN 'high'
        WHEN percentage >= 50 THEN 'medium'
        ELSE 'low'
      END as category
    FROM user_stats
  )
  SELECT json_build_object(
    'totalDaysAvailable', total_days,
    'counts', (
      SELECT json_build_object(
        'high', COUNT(*) FILTER (WHERE category = 'high'),
        'medium', COUNT(*) FILTER (WHERE category = 'medium'),
        'low', COUNT(*) FILTER (WHERE category = 'low'),
        'none', COUNT(*) FILTER (WHERE category = 'none')
      ) FROM categorized
    ),
    'users', (
      SELECT json_build_object(
        'high', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'hermandad', hermandad, 'daysPlayed', days_played, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'high'), '[]'::json),
        'medium', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'hermandad', hermandad, 'daysPlayed', days_played, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'medium'), '[]'::json),
        'low', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'hermandad', hermandad, 'daysPlayed', days_played, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'low'), '[]'::json),
        'none', COALESCE((SELECT json_agg(json_build_object('id', user_id, 'name', name, 'hermandad', hermandad, 'daysPlayed', days_played, 'gamesPlayed', games_played, 'percentage', percentage)) FROM categorized WHERE category = 'none'), '[]'::json)
      )
    )
  ) INTO result
  FROM (SELECT 1) dummy;
  
  RETURN result;
END;
$$;
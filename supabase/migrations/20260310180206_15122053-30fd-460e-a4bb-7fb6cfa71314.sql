
CREATE OR REPLACE FUNCTION public.get_tournament_live_stats(p_tournament_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  v_is_admin BOOLEAN;
BEGIN
  -- Only admins can use this function
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can access live stats';
  END IF;

  SELECT json_build_object(
    'tournament', (
      SELECT json_build_object(
        'id', t.id,
        'name', t.name,
        'status', t.status,
        'current_round', t.current_round,
        'image_url', t.image_url
      )
      FROM public.tournaments t
      WHERE t.id = p_tournament_id
    ),
    'total_participants', (
      SELECT COUNT(*)::integer
      FROM public.tournament_participants tp
      WHERE tp.tournament_id = p_tournament_id
    ),
    'round_completed_count', (
      SELECT COUNT(DISTINCT ta.user_id)::integer
      FROM public.tournament_answers ta
      WHERE ta.tournament_id = p_tournament_id
      AND ta.round_number = (
        SELECT t2.current_round FROM public.tournaments t2 WHERE t2.id = p_tournament_id
      )
      GROUP BY ta.round_number
    ),
    'ranking', (
      SELECT COALESCE(json_agg(row_data ORDER BY total_score DESC, rounds_completed DESC), '[]'::json)
      FROM (
        SELECT json_build_object(
          'user_id', tp.user_id,
          'name', p.name,
          'hermandad', p.hermandad,
          'total_score', tp.total_score,
          'rounds_completed', tp.rounds_completed,
          'last_round_score', COALESCE((
            SELECT SUM(ta.points_earned)::integer
            FROM public.tournament_answers ta
            WHERE ta.tournament_id = p_tournament_id
            AND ta.user_id = tp.user_id
            AND ta.round_number = (
              SELECT t3.current_round FROM public.tournaments t3 WHERE t3.id = p_tournament_id
            )
          ), 0)
        ) as row_data,
        tp.total_score,
        tp.rounds_completed
        FROM public.tournament_participants tp
        JOIN public.profiles p ON p.id = tp.user_id
        WHERE tp.tournament_id = p_tournament_id
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$;

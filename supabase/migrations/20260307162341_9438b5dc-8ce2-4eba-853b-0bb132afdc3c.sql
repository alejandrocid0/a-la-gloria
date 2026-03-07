
CREATE OR REPLACE FUNCTION public.get_tournament_ranking(p_tournament_id UUID)
RETURNS TABLE(
  out_user_id UUID,
  out_name TEXT,
  out_hermandad TEXT,
  out_total_score INTEGER,
  out_rounds_completed INTEGER,
  out_last_round_score INTEGER,
  out_position BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_participant BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.tournament_participants tp
    WHERE tp.tournament_id = p_tournament_id AND tp.user_id = auth.uid()
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'User is not a participant of this tournament';
  END IF;

  RETURN QUERY
  WITH max_round AS (
    SELECT MAX(ta.round_number) AS round_num
    FROM public.tournament_answers ta
    WHERE ta.tournament_id = p_tournament_id
  ),
  last_round_scores AS (
    SELECT ta.user_id AS uid, COALESCE(SUM(ta.points_earned), 0)::INTEGER AS score
    FROM public.tournament_answers ta
    CROSS JOIN max_round mr
    WHERE ta.tournament_id = p_tournament_id
      AND ta.round_number = mr.round_num
    GROUP BY ta.user_id
  )
  SELECT
    tp.user_id,
    p.name,
    p.hermandad,
    tp.total_score,
    tp.rounds_completed,
    COALESCE(lrs.score, 0)::INTEGER,
    ROW_NUMBER() OVER (ORDER BY tp.total_score DESC, tp.rounds_completed DESC)
  FROM public.tournament_participants tp
  JOIN public.profiles p ON p.id = tp.user_id
  LEFT JOIN last_round_scores lrs ON lrs.uid = tp.user_id
  WHERE tp.tournament_id = p_tournament_id
  ORDER BY tp.total_score DESC, tp.rounds_completed DESC;
END;
$$;

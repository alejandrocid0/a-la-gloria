
CREATE OR REPLACE FUNCTION public.get_tournament_ranking_public(p_tournament_id uuid)
 RETURNS TABLE(out_user_id uuid, out_name text, out_hermandad text, out_total_score integer, out_rounds_completed integer, out_last_round_score integer, out_position bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status TEXT;
BEGIN
  SELECT t.status INTO v_status
  FROM public.tournaments t
  WHERE t.id = p_tournament_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Tournament not found';
  END IF;

  IF v_status <> 'completed' THEN
    RAISE EXCEPTION 'Tournament is not completed';
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
$function$;

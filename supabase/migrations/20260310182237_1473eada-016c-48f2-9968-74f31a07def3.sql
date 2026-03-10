CREATE OR REPLACE FUNCTION public.get_tournament_participant_counts()
RETURNS TABLE(tournament_id uuid, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT tp.tournament_id, COUNT(*) AS count
  FROM public.tournament_participants tp
  GROUP BY tp.tournament_id;
$$;
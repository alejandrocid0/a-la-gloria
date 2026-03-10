
CREATE OR REPLACE FUNCTION public.get_tournament_participants_list(p_tournament_id uuid)
RETURNS TABLE(out_user_id uuid, out_name text, out_hermandad text, out_joined_at timestamptz, out_position bigint)
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
  SELECT
    tp.user_id,
    p.name,
    p.hermandad,
    tp.joined_at,
    ROW_NUMBER() OVER (ORDER BY tp.joined_at ASC)
  FROM public.tournament_participants tp
  JOIN public.profiles p ON p.id = tp.user_id
  WHERE tp.tournament_id = p_tournament_id
  ORDER BY tp.joined_at ASC;
END;
$$;


-- 1. Create view without join_code
CREATE OR REPLACE VIEW public.tournaments_public
WITH (security_invoker = on)
AS
SELECT
  id,
  name,
  description,
  status,
  tournament_date,
  tournament_time,
  current_round,
  created_at,
  image_url,
  location,
  location_url
FROM public.tournaments;

-- 2. Grant access to the view for authenticated users
GRANT SELECT ON public.tournaments_public TO authenticated;

-- 3. Drop the permissive SELECT policy that exposes join_code
DROP POLICY IF EXISTS "Authenticated users can view tournaments" ON public.tournaments;

-- 4. Create RPC to join by code (SECURITY DEFINER so it can read join_code)
CREATE OR REPLACE FUNCTION public.join_tournament_by_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tournament RECORD;
  v_user_id uuid := auth.uid();
  v_existing uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, name, status INTO v_tournament
  FROM public.tournaments
  WHERE join_code = p_code;

  IF v_tournament.id IS NULL THEN
    RETURN json_build_object('error', 'invalid_code');
  END IF;

  IF v_tournament.status = 'completed' THEN
    RETURN json_build_object('error', 'tournament_completed');
  END IF;

  SELECT id INTO v_existing
  FROM public.tournament_participants
  WHERE tournament_id = v_tournament.id AND user_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    RETURN json_build_object('error', 'already_joined');
  END IF;

  INSERT INTO public.tournament_participants (tournament_id, user_id)
  VALUES (v_tournament.id, v_user_id);

  RETURN json_build_object(
    'success', true,
    'tournament_id', v_tournament.id,
    'tournament_name', v_tournament.name
  );
END;
$$;

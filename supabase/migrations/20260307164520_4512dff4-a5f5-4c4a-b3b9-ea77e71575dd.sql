
DROP POLICY "Users can view tournament participants" ON public.tournament_participants;

CREATE POLICY "Users can view own tournament participation"
ON public.tournament_participants
FOR SELECT
USING (auth.uid() = user_id);

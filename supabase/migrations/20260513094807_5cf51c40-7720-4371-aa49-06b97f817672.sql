CREATE POLICY "Users can view their own registrations"
ON public.tournament_registrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
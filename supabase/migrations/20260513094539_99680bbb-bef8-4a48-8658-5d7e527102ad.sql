CREATE POLICY "Authenticated users can view published tournaments"
ON public.tournaments
FOR SELECT
TO authenticated
USING (status NOT IN ('draft', 'archived'));
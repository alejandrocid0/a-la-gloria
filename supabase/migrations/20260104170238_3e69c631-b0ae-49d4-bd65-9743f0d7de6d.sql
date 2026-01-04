-- Permitir a los admins leer todas las partidas para el dashboard
CREATE POLICY "Admins can view all games"
ON public.games
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
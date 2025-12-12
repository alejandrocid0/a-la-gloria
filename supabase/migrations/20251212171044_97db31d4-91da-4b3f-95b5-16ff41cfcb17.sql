-- Añadir política explícita para bloquear UPDATE en games
-- Esto previene manipulación de puntuaciones después de completar un juego
CREATE POLICY "No updates allowed on games" 
ON public.games 
FOR UPDATE 
USING (false);
-- Recreate the view with SECURITY INVOKER to avoid security definer warning
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS 
SELECT 
  id, 
  name, 
  hermandad, 
  total_points, 
  games_played, 
  best_score, 
  current_streak,
  last_game_date,
  created_at
FROM public.profiles;

-- Re-grant permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
-- Grant SELECT permission on public_profiles view to authenticated and anonymous users
-- This allows the ranking feature to work without exposing email addresses

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
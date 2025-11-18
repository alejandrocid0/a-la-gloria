-- Corregir política conflictiva en profiles
-- La política "Deny anonymous access to profiles" es RESTRICTIVE y bloquea TODO
-- La política existente "Users can view own profile" ya limita correctamente el acceso
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
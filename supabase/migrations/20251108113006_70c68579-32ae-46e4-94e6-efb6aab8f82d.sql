-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles table to protect user emails
-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- The policy "Users can view own profile" already exists, so we don't need to create it again
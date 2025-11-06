-- ============================================
-- SECURITY FIXES FOR A LA GLORIA
-- ============================================

-- 1. Create public_profiles view (excludes sensitive email data)
CREATE VIEW public.public_profiles AS 
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

-- 2. Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 3. Add restrictive SELECT policies
-- Policy: Users can view their own complete profile (including email)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Add INSERT policy (block direct inserts, only trigger can insert)
CREATE POLICY "No direct inserts allowed"
ON public.profiles 
FOR INSERT
WITH CHECK (false);

-- 5. Add DELETE policy (users can delete their own profile)
CREATE POLICY "Users can delete own profile"
ON public.profiles 
FOR DELETE
USING (auth.uid() = id);

-- 6. Add database validation constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_name_length CHECK (length(name) >= 2 AND length(name) <= 50);

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_name_format CHECK (name ~ '^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$');

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_hermandad_not_empty CHECK (length(hermandad) > 0);

-- 7. Update handle_new_user function with validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_name TEXT := NEW.raw_user_meta_data->>'name';
  v_hermandad TEXT := NEW.raw_user_meta_data->>'hermandad';
BEGIN
  -- Validate name
  IF v_name IS NULL OR length(v_name) < 2 OR length(v_name) > 50 THEN
    RAISE EXCEPTION 'Invalid name: must be between 2 and 50 characters';
  END IF;
  
  -- Validate hermandad
  IF v_hermandad IS NULL OR length(v_hermandad) = 0 THEN
    RAISE EXCEPTION 'Invalid hermandad: cannot be empty';
  END IF;
  
  -- Insert validated data
  INSERT INTO public.profiles (id, name, email, hermandad)
  VALUES (NEW.id, v_name, NEW.email, v_hermandad);
  
  RETURN NEW;
END;
$$;
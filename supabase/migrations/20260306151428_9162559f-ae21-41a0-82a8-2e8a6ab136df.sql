
-- Fix search_path for validation functions
ALTER FUNCTION public.validate_tournament_question() SET search_path = public;
ALTER FUNCTION public.validate_tournament_answer() SET search_path = public;

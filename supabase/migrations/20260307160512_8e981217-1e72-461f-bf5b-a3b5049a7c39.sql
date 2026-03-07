
-- Fix validate_tournament_answer trigger to accept selected_answer 0-4 (0=timeout, 1-4=options A-D)
CREATE OR REPLACE FUNCTION public.validate_tournament_answer()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.round_number < 1 OR NEW.round_number > 5 THEN
    RAISE EXCEPTION 'round_number must be between 1 and 5';
  END IF;
  IF NEW.selected_answer < 0 OR NEW.selected_answer > 4 THEN
    RAISE EXCEPTION 'selected_answer must be between 0 and 4';
  END IF;
  RETURN NEW;
END;
$function$;

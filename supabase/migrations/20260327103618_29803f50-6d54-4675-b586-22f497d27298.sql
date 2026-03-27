CREATE OR REPLACE FUNCTION public.cleanup_abandoned_games()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.games 
  WHERE status = 'in_progress' 
  AND created_at < NOW() - INTERVAL '10 minutes';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
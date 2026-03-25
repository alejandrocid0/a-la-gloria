
CREATE OR REPLACE FUNCTION public.prevent_self_admin_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'admin' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Cannot assign admin role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_admin_escalation
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_admin_assignment();

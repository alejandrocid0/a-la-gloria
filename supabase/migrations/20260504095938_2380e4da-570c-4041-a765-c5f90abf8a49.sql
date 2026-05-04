CREATE TABLE public.account_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id uuid NOT NULL,
  name text,
  email text,
  hermandad text,
  total_points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view deletions"
  ON public.account_deletions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_account_deletions_deleted_at ON public.account_deletions (deleted_at DESC);
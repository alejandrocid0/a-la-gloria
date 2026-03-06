
-- ============================================
-- 1. TABLA: tournaments
-- ============================================
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tournament_date DATE NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  current_round INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_date ON public.tournaments(tournament_date DESC);

-- ============================================
-- 2. TABLA: tournament_questions
-- ============================================
CREATE TABLE public.tournament_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  round_number INTEGER NOT NULL,
  order_number INTEGER NOT NULL,
  UNIQUE (tournament_id, question_id),
  UNIQUE (tournament_id, round_number, order_number)
);

-- Validation trigger instead of CHECK for round/order
CREATE OR REPLACE FUNCTION public.validate_tournament_question()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.round_number < 1 OR NEW.round_number > 5 THEN
    RAISE EXCEPTION 'round_number must be between 1 and 5';
  END IF;
  IF NEW.order_number < 1 OR NEW.order_number > 10 THEN
    RAISE EXCEPTION 'order_number must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_tournament_question
  BEFORE INSERT OR UPDATE ON public.tournament_questions
  FOR EACH ROW EXECUTE FUNCTION public.validate_tournament_question();

-- ============================================
-- 3. TABLA: tournament_participants
-- ============================================
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  total_score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  UNIQUE (tournament_id, user_id)
);

CREATE INDEX idx_tournament_participants_tournament ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_score ON public.tournament_participants(tournament_id, total_score DESC);

-- ============================================
-- 4. TABLA: tournament_answers
-- ============================================
CREATE TABLE public.tournament_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  round_number INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken FLOAT NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tournament_id, user_id, question_id)
);

CREATE INDEX idx_tournament_answers_user ON public.tournament_answers(tournament_id, user_id);

-- Validation trigger for tournament_answers
CREATE OR REPLACE FUNCTION public.validate_tournament_answer()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.round_number < 1 OR NEW.round_number > 5 THEN
    RAISE EXCEPTION 'round_number must be between 1 and 5';
  END IF;
  IF NEW.selected_answer < 0 OR NEW.selected_answer > 3 THEN
    RAISE EXCEPTION 'selected_answer must be between 0 and 3';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_tournament_answer
  BEFORE INSERT OR UPDATE ON public.tournament_answers
  FOR EACH ROW EXECUTE FUNCTION public.validate_tournament_answer();

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- TOURNAMENTS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tournaments"
  ON public.tournaments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view tournaments"
  ON public.tournaments FOR SELECT
  TO authenticated
  USING (true);

-- TOURNAMENT_QUESTIONS
ALTER TABLE public.tournament_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tournament questions"
  ON public.tournament_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can only see questions for unlocked rounds (via security definer function below)

-- TOURNAMENT_PARTICIPANTS
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tournament participants"
  ON public.tournament_participants FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can join tournaments"
  ON public.tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view tournament participants"
  ON public.tournament_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tournament_participants tp
      WHERE tp.tournament_id = tournament_participants.tournament_id
      AND tp.user_id = auth.uid()
    )
  );

-- TOURNAMENT_ANSWERS
ALTER TABLE public.tournament_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tournament answers"
  ON public.tournament_answers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own tournament answers"
  ON public.tournament_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tournament answers"
  ON public.tournament_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. SECURITY DEFINER: get tournament questions (sin correct_answer)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_tournament_round_questions(
  p_tournament_id UUID,
  p_round_number INTEGER
)
RETURNS TABLE(
  id UUID,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  difficulty TEXT,
  order_number INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_round INTEGER;
  v_is_participant BOOLEAN;
BEGIN
  -- Check tournament current_round
  SELECT t.current_round INTO v_current_round
  FROM public.tournaments t
  WHERE t.id = p_tournament_id;

  IF v_current_round IS NULL THEN
    RAISE EXCEPTION 'Tournament not found';
  END IF;

  IF p_round_number > v_current_round THEN
    RAISE EXCEPTION 'Round not yet unlocked';
  END IF;

  -- Check user is participant
  SELECT EXISTS(
    SELECT 1 FROM public.tournament_participants tp
    WHERE tp.tournament_id = p_tournament_id AND tp.user_id = auth.uid()
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'User is not a participant';
  END IF;

  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.difficulty,
    tq.order_number
  FROM public.tournament_questions tq
  JOIN public.questions q ON q.id = tq.question_id
  WHERE tq.tournament_id = p_tournament_id
  AND tq.round_number = p_round_number
  ORDER BY tq.order_number;
END;
$$;

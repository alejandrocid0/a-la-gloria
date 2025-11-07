-- ============================================
-- 1. TABLA: questions (banco de preguntas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);

-- ============================================
-- 2. TABLA: daily_questions (10 preguntas del día)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  order_number INTEGER NOT NULL CHECK (order_number BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Solo 10 preguntas por día
  CONSTRAINT unique_date_order UNIQUE (date, order_number),
  CONSTRAINT unique_date_question UNIQUE (date, question_id)
);

-- Índice para obtener preguntas del día actual
CREATE INDEX IF NOT EXISTS idx_daily_questions_date ON public.daily_questions(date DESC);

-- ============================================
-- 3. TABLA: games (partidas jugadas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 1000),
  correct_answers INTEGER NOT NULL CHECK (correct_answers BETWEEN 0 AND 10),
  incorrect_answers INTEGER NOT NULL CHECK (incorrect_answers BETWEEN 0 AND 10),
  avg_time FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Una partida por día por usuario
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON public.games(date DESC);

-- ============================================
-- 4. TABLA: user_answers (respuestas individuales)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer INTEGER NOT NULL CHECK (selected_answer BETWEEN 0 AND 3),
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL,
  points_earned INTEGER NOT NULL CHECK (points_earned BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_answers_game_id ON public.user_answers(game_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);

-- ============================================
-- 5. SISTEMA DE ROLES (admin)
-- ============================================

-- Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Índice para verificación rápida de roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Función segura para verificar roles (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- QUESTIONS: Usuarios autenticados pueden leer todas las preguntas
CREATE POLICY "Authenticated users can read questions"
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (true);

-- QUESTIONS: Solo admin puede insertar/actualizar/eliminar preguntas
CREATE POLICY "Admins can manage questions"
  ON public.questions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DAILY_QUESTIONS: Todos pueden leer preguntas del día
CREATE POLICY "Everyone can read daily questions"
  ON public.daily_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- DAILY_QUESTIONS: Solo admin puede gestionar
CREATE POLICY "Admins can manage daily questions"
  ON public.daily_questions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GAMES: Usuarios pueden leer sus propias partidas
CREATE POLICY "Users can read their own games"
  ON public.games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- GAMES: Usuarios pueden insertar sus propias partidas
CREATE POLICY "Users can insert their own games"
  ON public.games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- USER_ANSWERS: Usuarios pueden leer sus propias respuestas
CREATE POLICY "Users can read their own answers"
  ON public.user_answers
  FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM public.games WHERE user_id = auth.uid()
    )
  );

-- USER_ANSWERS: Usuarios pueden insertar sus propias respuestas
CREATE POLICY "Users can insert their own answers"
  ON public.user_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM public.games WHERE user_id = auth.uid()
    )
  );

-- USER_ROLES: Solo lectura mediante función has_role
CREATE POLICY "Users can read their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- USER_ROLES: Solo admin puede asignar roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
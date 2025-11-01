/**
 * ESTRUCTURA DE BASE DE DATOS PARA LOVABLE CLOUD
 * 
 * Ejecutar estos scripts en orden en el SQL Editor de Lovable Cloud:
 */

-- ============================================
-- 1. TABLA: profiles (perfiles de usuario)
-- ============================================
-- Esta tabla se crea automáticamente cuando un usuario se registra
-- mediante el trigger handle_new_user()

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  hermandad TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_game_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_hermandad ON public.profiles(hermandad);
CREATE INDEX IF NOT EXISTS idx_profiles_last_game_date ON public.profiles(last_game_date);

-- ============================================
-- 2. TABLA: questions (preguntas del trivia)
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

-- Índice para seleccionar preguntas aleatorias eficientemente
CREATE INDEX IF NOT EXISTS idx_questions_random ON public.questions(random());

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
  
  -- CONSTRAINT: Solo una partida por día por usuario
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON public.games(date DESC);

-- ============================================
-- 4. TABLA: user_answers (respuestas individuales)
-- ============================================
-- OPCIONAL: Para análisis detallado y estadísticas avanzadas

CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer INTEGER NOT NULL CHECK (selected_answer BETWEEN 0 AND 3),
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL, -- segundos
  points_earned INTEGER NOT NULL CHECK (points_earned BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_answers_game_id ON public.user_answers(game_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);

-- ============================================
-- 5. TRIGGER: handle_new_user
-- ============================================
-- Se ejecuta automáticamente al registrar un usuario

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, hermandad)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'hermandad'
  );
  RETURN NEW;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- PROFILES: Todos pueden leer todos los perfiles (para ranking)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- PROFILES: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- QUESTIONS: Todos los usuarios autenticados pueden leer preguntas
CREATE POLICY "Authenticated users can read questions"
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (true);

-- GAMES: Los usuarios pueden leer sus propias partidas
CREATE POLICY "Users can read their own games"
  ON public.games
  FOR SELECT
  USING (auth.uid() = user_id);

-- GAMES: Los usuarios pueden insertar sus propias partidas
CREATE POLICY "Users can insert their own games"
  ON public.games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- USER_ANSWERS: Los usuarios pueden leer sus propias respuestas
CREATE POLICY "Users can read their own answers"
  ON public.user_answers
  FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM public.games WHERE user_id = auth.uid()
    )
  );

-- USER_ANSWERS: Los usuarios pueden insertar sus propias respuestas
CREATE POLICY "Users can insert their own answers"
  ON public.user_answers
  FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM public.games WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 7. FUNCIÓN: update_updated_at_column
-- ============================================
-- Actualiza automáticamente el campo updated_at

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplicar trigger a profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. DATOS DE PRUEBA (OPCIONAL)
-- ============================================
-- Insertar preguntas de ejemplo para testing

-- INSERT INTO public.questions (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
-- ('¿En qué año se fundó la Hermandad de la Macarena?', '1595', '1650', '1701', '1820', 0, 'medium'),
-- ('¿Cuántas cofradías procesionan en la Semana Santa de Sevilla?', '58', '60', '68', '72', 2, 'easy'),
-- ('¿Qué día sale la Hermandad del Gran Poder?', 'Domingo de Ramos', 'Lunes Santo', 'Miércoles Santo', 'Jueves Santo', 3, 'easy');

-- ============================================
-- NOTAS FINALES
-- ============================================
-- 
-- 1. Ejecutar estos scripts en orden en Lovable Cloud SQL Editor
-- 2. Verificar que RLS está habilitado: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 3. Probar policies con diferentes usuarios
-- 4. Configurar email templates en Auth → Email Templates
-- 5. Desactivar "Confirm email" durante desarrollo en Auth → Providers → Email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Answer {
  questionId: string;
  selectedAnswer: number;
  timeElapsed: number;
}

interface GameSubmission {
  gameId: string;
  answers: Answer[];
  startTime: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const isDev = Deno.env.get('ENVIRONMENT') === 'development';

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      if (isDev) {
        console.error('Auth error:', authError);
      }
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { gameId, answers, startTime }: GameSubmission = await req.json();

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid answers format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!startTime || typeof startTime !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid start time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Validar que el gameId existe y pertenece al usuario
    if (!gameId) {
      return new Response(
        JSON.stringify({ error: 'ID de juego requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: existingGame, error: gameCheckError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (gameCheckError || !existingGame) {
      if (isDev) {
        console.error('Game validation error:', gameCheckError);
      }
      return new Response(
        JSON.stringify({ error: 'Partida inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar que está en estado 'in_progress'
    if (existingGame.status !== 'in_progress') {
      return new Response(
        JSON.stringify({ error: 'Esta partida ya fue completada o abandonada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate game duration - solo verificar que no sea excesivamente largo (max 5 minutos)
    const now = Date.now();
    const gameTime = now - startTime;

    if (gameTime > 300000) { // 5 minutos máximo
      if (isDev) {
        console.error(`Game too slow: ${gameTime}ms`);
      }
      return new Response(
        JSON.stringify({ error: 'Duración de juego inválida (tiempo expirado)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Load actual questions from database
    const questionIds = answers.map(a => a.questionId);
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .in('id', questionIds);

    if (questionsError || !questions || questions.length !== answers.length) {
      if (isDev) {
        console.error('Error loading questions:', questionsError);
      }
      return new Response(
        JSON.stringify({ error: 'Error validando preguntas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Validate answers and calculate score SERVER-SIDE
    let totalScore = 0;
    let correctCount = 0;
    let totalTime = 0;

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = questions.find(q => q.id === answer.questionId);

      if (!question) {
        if (isDev) {
          console.error(`Question not found: ${answer.questionId}`);
        }
        continue;
      }

      // Validate time taken for this question (0-15 seconds)
      const timeElapsed = answer.timeElapsed;
      if (timeElapsed < 0 || timeElapsed > 15) {
        if (isDev) {
          console.error(`Invalid time for question ${i}: ${timeElapsed}s`);
        }
        continue;
      }

      totalTime += timeElapsed;

      // Tanto BD como frontend usan 1-4 (A=1, B=2, C=3, D=4)
      const isCorrect = answer.selectedAnswer === question.correct_answer;

      if (isCorrect) {
        // Server calculates score: max 100 points if answered immediately,
        // decreasing linearly to 0 points at 15 seconds
        const timeLeft = 15 - timeElapsed;
        const points = Math.round(100 * Math.max(0, timeLeft / 15));
        totalScore += points;
        correctCount++;
      }
    }

    const incorrectCount = answers.length - correctCount;
    const avgTime = totalTime / answers.length;

    // 6. Update game result
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .update({
        total_score: totalScore,
        correct_answers: correctCount,
        incorrect_answers: incorrectCount,
        avg_time: avgTime,
        status: 'completed'
      })
      .eq('id', gameId)
      .select()
      .single();

    if (gameError) {
      if (isDev) {
        console.error('Error updating game:', gameError);
      }
      return new Response(
        JSON.stringify({ error: 'Error guardando resultado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Update user profile statistics
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      const newTotalPoints = (profile.total_points || 0) + totalScore;
      const newGamesPlayed = (profile.games_played || 0) + 1;
      const newBestScore = Math.max(profile.best_score || 0, totalScore);

      // Calculate streak
      let newStreak = profile.current_streak || 0;
      if (profile.last_game_date) {
        const lastGameDate = new Date(profile.last_game_date);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastGameDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Calculate best_streak: máximo entre el guardado y la nueva racha
      const newBestStreak = Math.max(profile.best_streak || 0, newStreak);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_points: newTotalPoints,
          games_played: newGamesPlayed,
          best_score: newBestScore,
          last_game_date: today,
          current_streak: newStreak,
          best_streak: newBestStreak
        })
        .eq('id', user.id);

      if (updateError) {
        if (isDev) {
          console.error('Error updating profile:', updateError);
        }
      }
    }

    // 8. Return validated results
    const isNewBestScore = totalScore > (profile?.best_score || 0);

    return new Response(
      JSON.stringify({
        success: true,
        score: totalScore,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        avgTime: avgTime,
        gameId: gameData.id,
        isNewBestScore
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    if (isDev) {
      console.error('Server error:', error);
    }
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

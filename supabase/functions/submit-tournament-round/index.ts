import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Answer {
  questionId: string;
  selectedAnswer: number; // 1-4 or 0 (timeout)
  timeElapsed: number;    // seconds taken (0-15)
}

interface TournamentRoundSubmission {
  tournamentId: string;
  roundNumber: number;
  answers: Answer[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
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
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tournamentId, roundNumber, answers }: TournamentRoundSubmission = await req.json();

    // Basic validation
    if (!tournamentId || !roundNumber || !answers || !Array.isArray(answers) || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Check tournament exists and round is unlocked
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, current_round, status')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return new Response(
        JSON.stringify({ error: 'Torneo no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tournament.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Este torneo ya ha finalizado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (roundNumber > tournament.current_round) {
      return new Response(
        JSON.stringify({ error: 'Esta ronda aún no está desbloqueada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .select('id, total_score, rounds_completed')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return new Response(
        JSON.stringify({ error: 'No estás inscrito en este torneo' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check user hasn't already played this round
    const { data: existingAnswers } = await supabase
      .from('tournament_answers')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id)
      .eq('round_number', roundNumber)
      .limit(1);

    if (existingAnswers && existingAnswers.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Ya has jugado esta ronda' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check sequential order: if round > 1, must have played previous round
    if (roundNumber > 1) {
      const { data: prevAnswers } = await supabase
        .from('tournament_answers')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .eq('round_number', roundNumber - 1)
        .limit(1);

      if (!prevAnswers || prevAnswers.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Debes completar la ronda anterior primero' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Load correct answers for all submitted questions
    const questionIds = answers.map(a => a.questionId);
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .in('id', questionIds);

    if (questionsError || !questions || questions.length !== answers.length) {
      return new Response(
        JSON.stringify({ error: 'Error validando preguntas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Calculate scores and build answer rows
    let roundScore = 0;
    let correctCount = 0;
    const answerRows = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const timeElapsed = Math.max(0, Math.min(15, answer.timeElapsed));
      const isCorrect = answer.selectedAnswer === question.correct_answer;
      let pointsEarned = 0;

      if (isCorrect) {
        const timeLeft = 15 - timeElapsed;
        pointsEarned = Math.round(100 * Math.max(0, timeLeft / 15));
        correctCount++;
        roundScore += pointsEarned;
      }

      answerRows.push({
        tournament_id: tournamentId,
        user_id: user.id,
        question_id: answer.questionId,
        round_number: roundNumber,
        selected_answer: answer.selectedAnswer,
        is_correct: isCorrect,
        time_taken: timeElapsed,
        points_earned: pointsEarned,
      });
    }

    // 7. Insert all answers
    const { error: insertError } = await supabase
      .from('tournament_answers')
      .insert(answerRows);

    if (insertError) {
      console.error('Error inserting answers:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error guardando respuestas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Update participant totals
    const { error: updateError } = await supabase
      .from('tournament_participants')
      .update({
        total_score: participant.total_score + roundScore,
        rounds_completed: participant.rounds_completed + 1,
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Error updating participant:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: roundScore,
        correctAnswers: correctCount,
        totalQuestions: answers.length,
        roundNumber,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

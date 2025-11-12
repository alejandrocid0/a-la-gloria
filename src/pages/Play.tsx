import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Timer } from "lucide-react";
import { useGameQuestions, useCheckTodayGame } from "@/hooks/useGameQuestions";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * ESTRUCTURA DE BASE DE DATOS NECESARIA:
 * 
 * 1. Tabla: public.questions
 *    - id: uuid (primary key)
 *    - question_text: string (texto de la pregunta)
 *    - option_a: string
 *    - option_b: string
 *    - option_c: string
 *    - option_d: string
 *    - correct_answer: integer (0-3, índice de la respuesta correcta)
 *    - difficulty: string ('easy', 'medium', 'hard')
 *    - category: string (opcional, para futuras categorías)
 *    - created_at: timestamp
 * 
 * 2. Tabla: public.games
 *    - id: uuid (primary key)
 *    - user_id: uuid (foreign key a auth.users.id)
 *    - date: date (fecha de la partida, única por usuario)
 *    - total_score: integer (puntos totales: 0-1000)
 *    - correct_answers: integer (respuestas correctas: 0-10)
 *    - incorrect_answers: integer (respuestas incorrectas: 0-10)
 *    - avg_time: float (tiempo promedio por respuesta en segundos)
 *    - created_at: timestamp
 *    - UNIQUE constraint: (user_id, date) para evitar múltiples partidas por día
 * 
 * 3. Tabla: public.user_answers (opcional, para análisis detallado)
 *    - id: uuid (primary key)
 *    - game_id: uuid (foreign key a games.id)
 *    - question_id: uuid (foreign key a questions.id)
 *    - selected_answer: integer (0-3, respuesta seleccionada por el usuario)
 *    - is_correct: boolean
 *    - time_taken: integer (segundos que tardó en responder)
 *    - points_earned: integer (puntos ganados: 0-100)
 *    - created_at: timestamp
 * 
 * LÓGICA DEL JUEGO:
 * 
 * 1. Al iniciar partida (setGameStarted):
 *    - Verificar que el usuario no haya jugado hoy:
 *      SELECT * FROM games WHERE user_id = auth.uid() AND date = CURRENT_DATE
 *    - Si ya jugó → redirigir a home con mensaje
 *    - Si no jugó → cargar 10 preguntas aleatorias:
 *      SELECT * FROM questions ORDER BY RANDOM() LIMIT 10
 * 
 * 2. Sistema de puntuación por tiempo:
 *    - 15 segundos por pregunta
 *    - Puntos por respuesta correcta: 100 puntos * (timeLeft / 15)
 *    - Ejemplos:
 *      - Responder en 15s = 100 pts
 *      - Responder en 10s = 67 pts
 *      - Responder en 5s = 33 pts
 *      - Responder en 0s o incorrecta = 0 pts
 * 
 * 3. Al terminar el juego (última pregunta):
 *    - Crear registro en games:
 *      INSERT INTO games (user_id, date, total_score, correct_answers, avg_time)
 *      VALUES (auth.uid(), CURRENT_DATE, totalScore, correctCount, avgTime)
 *    - Actualizar perfil del usuario:
 *      UPDATE profiles SET 
 *        total_points = total_points + totalScore,
 *        games_played = games_played + 1,
 *        best_score = GREATEST(best_score, totalScore),
 *        last_game_date = CURRENT_DATE,
 *        current_streak = CASE 
 *          WHEN last_game_date = CURRENT_DATE - 1 THEN current_streak + 1
 *          ELSE 1 
 *        END
 *      WHERE id = auth.uid()
 *    - Opcional: guardar respuestas individuales en user_answers
 */

const Play = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: questions, isLoading: questionsLoading } = useGameQuestions();
  const { data: todayGame, isLoading: checkingTodayGame } = useCheckTodayGame(user?.id);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = 10;
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Store answers for server-side validation instead of calculating scores client-side
  const [gameStartTime] = useState(Date.now());
  const [submissionData, setSubmissionData] = useState<Array<{
    questionId: string;
    selectedAnswer: number;
    timeElapsed: number;
  }>>([]);

  // Verificar si ya jugó hoy
  useEffect(() => {
    if (todayGame && !gameStarted) {
      toast.error("Ya has jugado hoy", {
        description: "Vuelve mañana para una nueva partida"
      });
      navigate('/');
    }
  }, [todayGame, gameStarted, navigate]);

  const currentQuestionData = questions?.[currentQuestion];
  const answers = currentQuestionData ? [
    currentQuestionData.option_a,
    currentQuestionData.option_b,
    currentQuestionData.option_c,
    currentQuestionData.option_d,
  ] : [];

  // Timer countdown simulation
  useEffect(() => {
    if (!gameStarted || selectedAnswer !== null) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, selectedAnswer]);

  const getTimerColor = () => {
    if (timeLeft > 10) return "text-accent";
    if (timeLeft > 5) return "text-orange-500";
    return "text-destructive";
  };

  const handleAnswerClick = async (index: number) => {
    if (!currentQuestionData) return;
    
    setSelectedAnswer(index);
    const timeTaken = 15 - timeLeft;
    
    // Store answer for server submission (don't calculate score client-side)
    const newAnswer = {
      questionId: currentQuestionData.id,
      selectedAnswer: index,
      timeElapsed: timeTaken
    };
    
    const updatedAnswers = [...submissionData, newAnswer];
    setSubmissionData(updatedAnswers);
    
    // Esperar 1.5s para feedback visual antes de continuar
    setTimeout(async () => {
      if (currentQuestion < totalQuestions - 1) {
        // Siguiente pregunta
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        // Game finished - submit to server for validation
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            toast.error('Sesión expirada');
            navigate('/auth');
            return;
          }

          const response = await supabase.functions.invoke('submit-game', {
            body: {
              answers: updatedAnswers,
              startTime: gameStartTime
            }
          });

          if (response.error) {
            console.error('Error submitting game:', response.error);
            toast.error(response.error.message || 'Error al guardar el resultado');
            navigate('/');
            return;
          }

          const result = response.data;
          
          if (!result || !result.success) {
            toast.error(result?.error || 'Error al validar el juego');
            navigate('/');
            return;
          }

          // Navigate to results with server-validated data
          navigate('/resultados', {
            state: {
              score: result.score,
              correctAnswers: result.correctAnswers,
              incorrectAnswers: result.incorrectAnswers,
              totalQuestions,
              avgTime: result.avgTime
            },
            replace: true
          });
        } catch (error) {
          console.error('Error submitting game:', error);
          toast.error('Error al enviar el resultado');
          navigate('/');
        }
      }
    }, 1500);
  };

  if (questionsLoading || checkingTodayGame) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!questions || questions.length < 10) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No hay suficientes preguntas disponibles</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-cinzel font-bold text-foreground leading-tight">
              ¡Todos por igual, valientes!
            </h2>
            <p className="text-lg text-muted-foreground">
              ¿Serás capaz de acertar todo hoy?
            </p>
          </div>
          
          {/* Info del día */}
          <Card className="p-6 border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] bg-gradient-to-br from-[hsl(272,58%,35%)]/5 to-white text-left space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <p className="font-bold text-foreground">Partida del día</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ <span className="font-medium">10 preguntas</span> sobre la Semana Santa</p>
              <p>✓ <span className="font-medium">15 segundos</span> por respuesta</p>
              <p>✓ Más rápido = <span className="font-medium">más puntos</span></p>
            </div>
          </Card>

          <Button 
            onClick={() => setGameStarted(true)}
            variant="cta"
            size="xl"
            className="w-full"
          >
            ¡A esta es!
          </Button>
        </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header with Progress & Timer */}
      <header className="flex-shrink-0 bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pregunta {currentQuestion + 1}/{totalQuestions}</span>
            <div className="flex items-center gap-2">
              <Timer className={`w-5 h-5 ${getTimerColor()}`} />
              <span className={`text-2xl font-bold ${getTimerColor()}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          <Progress 
            value={((currentQuestion + 1) / totalQuestions) * 100} 
            className="h-3 bg-white/80 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-accent/70"
          />
          <div className="flex justify-between items-center text-xs opacity-80">
            <span>Pregunta {currentQuestion + 1} de {totalQuestions}</span>
            <span>Máximo: {Math.round((timeLeft / 15) * 100)} pts</span>
          </div>
        </div>
      </header>

      {/* Question Card */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-6 w-full">
        <Card className="p-5 mb-6 border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          <h2 className="text-lg font-bold text-foreground text-center leading-relaxed">
            {currentQuestionData?.question_text}
          </h2>
        </Card>

        {/* Answer Buttons */}
        <div className="space-y-3">
          {answers.map((answer, index) => {
            const isSelected = selectedAnswer === (index + 1);
            // Tanto BD como frontend usan 1-4 (A=1, B=2, C=3, D=4)
            const isCorrect = selectedAnswer !== null && (index + 1) === currentQuestionData?.correct_answer;
            const isWrong = isSelected && !isCorrect;
            
            return (
              <Button
                key={index}
                onClick={() => handleAnswerClick(index + 1)}
                disabled={selectedAnswer !== null}
                className={`w-full h-[60px] py-4 px-6 text-left text-base font-medium border-2 transition-all ${
                  isCorrect && selectedAnswer !== null
                    ? "bg-green-500 text-white border-green-500 shadow-lg"
                    : isWrong
                    ? "bg-red-500 text-white border-red-500 shadow-lg"
                    : isSelected
                    ? "bg-accent text-accent-foreground border-accent shadow-lg scale-105"
                    : "bg-card hover:bg-accent/10 hover:border-accent text-foreground border-border hover:scale-102"
                }`}
                variant="outline"
              >
                <span className="truncate w-full block">{answer}</span>
              </Button>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Play;

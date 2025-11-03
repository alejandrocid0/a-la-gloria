import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Timer } from "lucide-react";

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
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 10;
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // TODO: Cargar preguntas aleatorias al iniciar
  // const [questions, setQuestions] = useState([]);
  // const [currentScore, setCurrentScore] = useState(0);
  // const [correctCount, setCorrectCount] = useState(0);
  // const [answerTimes, setAnswerTimes] = useState([]);

  const mockAnswers = [
    "Respuesta A - Ejemplo de respuesta larga para ver el diseño",
    "Respuesta B",
    "Respuesta C - Otra respuesta",
    "Respuesta D",
  ];

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

  const handleAnswerClick = (index: number) => {
    setSelectedAnswer(index);
    
    // TODO: Implementar lógica de puntuación
    // const isCorrect = index === questions[currentQuestion - 1].correct_answer;
    // const pointsEarned = isCorrect ? Math.round(100 * (timeLeft / 15)) : 0;
    // 
    // setScore(prev => prev + pointsEarned);
    // if (isCorrect) setCorrectAnswers(prev => prev + 1);
    // setAnswerTimes(prev => [...prev, 15 - timeLeft]);
    
    // Simulación temporal: asumimos que la respuesta es correcta aleatoriamente
    const isCorrect = Math.random() > 0.3; // 70% de probabilidad de acertar
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.round(100 * (timeLeft / 15)));
    }
    
    // 
    // // Guardar respuesta individual (opcional)
    // await supabase.from('user_answers').insert({
    //   game_id: currentGameId,
    //   question_id: questions[currentQuestion - 1].id,
    //   selected_answer: index,
    //   is_correct: isCorrect,
    //   time_taken: 15 - timeLeft,
    //   points_earned: pointsEarned
    // });
    
    // Esperar 1.5s para feedback visual antes de continuar
    setTimeout(() => {
      if (currentQuestion < totalQuestions) {
        // Siguiente pregunta
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        // Última pregunta respondida → navegar automáticamente a resultados
        // TODO: Guardar resultado en Lovable Cloud antes de navegar
        // await saveGameResults();
        navigate('/resultados', { state: { score, totalQuestions, correctAnswers } });
      }
    }, 1500);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20 flex items-center justify-center px-6">
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
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header with Progress & Timer */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pregunta {currentQuestion}/{totalQuestions}</span>
            <div className="flex items-center gap-2">
              <Timer className={`w-5 h-5 ${getTimerColor()}`} />
              <span className={`text-2xl font-bold ${getTimerColor()}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          <Progress 
            value={(currentQuestion / totalQuestions) * 100} 
            className="h-2.5 bg-primary-foreground/20"
          />
          <div className="flex justify-between items-center text-xs opacity-80">
            <span>Puntos: 850</span>
            <span>Máximo: {Math.round((timeLeft / 15) * 100)} pts</span>
          </div>
        </div>
      </header>

      {/* Question Card */}
      <main className="max-w-md mx-auto px-6 py-8">
        <Card className="p-8 mb-8 border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          <h2 className="text-xl font-bold text-foreground text-center leading-relaxed">
            ¿En qué año se fundó la hermandad más antigua de Sevilla documentada?
          </h2>
        </Card>

        {/* Answer Buttons */}
        <div className="space-y-3">
          {mockAnswers.map((answer, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={selectedAnswer !== null}
              className={`w-full min-h-[60px] h-auto py-4 px-6 text-left text-base font-medium border-2 transition-all ${
                selectedAnswer === index
                  ? "bg-accent text-accent-foreground border-accent shadow-lg scale-105"
                  : "bg-card hover:bg-accent/10 hover:border-accent text-foreground border-border hover:scale-102"
              }`}
              variant="outline"
            >
              <span className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{answer}</span>
              </span>
            </Button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Play;

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GameHeader from "@/components/game/GameHeader";
import QuestionCard from "@/components/game/QuestionCard";

/**
 * TournamentPlay — Partida de una ronda del torneo.
 * Reutiliza GameHeader y QuestionCard (mismo diseño que partida diaria).
 * Por ahora usa preguntas mock; TODO: conectar a Supabase aquí.
 */

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;

// Mock questions placeholder
const MOCK_QUESTIONS = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
  id: `mock-${i}`,
  question_text: `Pregunta de ejemplo ${i + 1} del torneo`,
  option_a: "Opción A placeholder",
  option_b: "Opción B placeholder",
  option_c: "Opción C placeholder",
  option_d: "Opción D placeholder",
  difficulty: i < 2 ? "kanicofrade" : i < 4 ? "nazareno" : i < 6 ? "costalero" : i < 8 ? "capataz" : "maestro",
  correct_answer: 1,
}));

const TournamentPlay = () => {
  const navigate = useNavigate();
  const { id: tournamentId, round } = useParams<{ id: string; round: string }>();
  const roundNumber = parseInt(round || "1", 10);

  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [timeExpired, setTimeExpired] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [verifiedAnswer, setVerifiedAnswer] = useState<{ isCorrect: boolean; correctAnswer: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const processingRef = useRef(false);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);

  const questions = MOCK_QUESTIONS;
  const currentQuestionData = questions[currentQuestion];

  // Timer
  useEffect(() => {
    if (!gameStarted || selectedAnswer !== null || timeExpired) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, selectedAnswer, timeExpired, currentQuestion]);

  // Time expiration
  useEffect(() => {
    if (timeLeft === 0 && selectedAnswer === null && !timeExpired && gameStarted) {
      processAnswer(0, TIME_PER_QUESTION);
    }
  }, [timeLeft, selectedAnswer, timeExpired, gameStarted]);

  const processAnswer = useCallback((answerValue: number, timeElapsed: number) => {
    if (processingRef.current) return;
    processingRef.current = true;

    if (answerValue === 0) {
      setTimeExpired(true);
    } else {
      setSelectedAnswer(answerValue);
    }
    setIsVerifying(true);

    // Mock verification — always correct_answer = 1
    const isCorrect = answerValue === currentQuestionData.correct_answer;
    if (isCorrect) {
      correctRef.current += 1;
      scoreRef.current += Math.round((timeLeft / TIME_PER_QUESTION) * 100);
    }

    setTimeout(() => {
      setVerifiedAnswer({ isCorrect, correctAnswer: currentQuestionData.correct_answer });
      setIsVerifying(false);
    }, 300);

    // Advance after feedback
    setTimeout(() => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setSelectedAnswer(null);
        setTimeExpired(false);
        setVerifiedAnswer(null);
        setIsVerifying(false);
        setTimeLeft(TIME_PER_QUESTION);
        setCurrentQuestion((prev) => prev + 1);
        processingRef.current = false;
      } else {
        // Navigate to round result
        navigate(`/torneo/${tournamentId}/resultado`, {
          state: {
            score: scoreRef.current,
            correctAnswers: correctRef.current,
            totalQuestions: TOTAL_QUESTIONS,
            roundNumber,
          },
          replace: true,
        });
      }
    }, 1500);
  }, [currentQuestion, currentQuestionData, navigate, tournamentId, roundNumber, timeLeft]);

  const getTimerColor = () => {
    if (timeLeft > 10) return "text-accent";
    if (timeLeft > 5) return "text-orange-500";
    return "text-destructive";
  };

  // Pre-game screen
  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
        <div className="flex-1 overflow-y-auto flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-cinzel font-bold text-foreground leading-tight">
                Ronda {roundNumber}
              </h2>
              <p className="text-lg text-muted-foreground">
                ¡Prepárate para la siguiente ronda del torneo!
              </p>
            </div>

            <Card className="p-6 border-accent border-2 shadow-[var(--shadow-md)] bg-gradient-to-br from-primary/5 to-background text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚔️</span>
                <p className="font-bold text-foreground">Torneo — Ronda {roundNumber}</p>
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
              aria-label="Comenzar ronda del torneo"
            >
              ¡A por ella!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active game
  const answers = [
    currentQuestionData.option_a,
    currentQuestionData.option_b,
    currentQuestionData.option_c,
    currentQuestionData.option_d,
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <GameHeader
        currentQuestion={currentQuestion}
        totalQuestions={TOTAL_QUESTIONS}
        timeLeft={timeLeft}
        timerColorClass={getTimerColor()}
      />
      <QuestionCard
        questionText={currentQuestionData.question_text}
        answers={answers}
        currentQuestion={currentQuestion}
        timeExpired={timeExpired}
        selectedAnswer={selectedAnswer}
        verifiedAnswer={verifiedAnswer}
        isVerifying={isVerifying}
        onAnswer={processAnswer}
        timeLeft={timeLeft}
      />
    </div>
  );
};

export default TournamentPlay;

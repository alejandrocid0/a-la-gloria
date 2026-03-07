import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import GameHeader from "@/components/game/GameHeader";
import QuestionCard from "@/components/game/QuestionCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;

const TournamentPlay = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: tournamentId, round } = useParams<{ id: string; round: string }>();
  const roundNumber = parseInt(round || "1", 10);

  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [timeExpired, setTimeExpired] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [verifiedAnswer, setVerifiedAnswer] = useState<{ isCorrect: boolean; correctAnswer: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processingRef = useRef(false);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const answersRef = useRef<{ questionId: string; selectedAnswer: number; timeElapsed: number }[]>([]);

  // Fetch real questions via DB function
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ["tournament-round-questions", tournamentId, roundNumber],
    enabled: !!tournamentId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_tournament_round_questions", {
        p_tournament_id: tournamentId!,
        p_round_number: roundNumber,
      });
      if (error) throw error;
      return data;
    },
  });

  // Check if user already played this round
  const { data: alreadyPlayed } = useQuery({
    queryKey: ["tournament-round-played", tournamentId, roundNumber, user?.id],
    enabled: !!tournamentId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_answers")
        .select("id")
        .eq("tournament_id", tournamentId!)
        .eq("user_id", user!.id)
        .eq("round_number", roundNumber)
        .limit(1);
      if (error) throw error;
      return data && data.length > 0;
    },
  });

  useEffect(() => {
    if (alreadyPlayed) {
      toast.error("Ya has jugado esta ronda.");
      navigate(`/torneo/${tournamentId}/ranking`, { replace: true });
    }
  }, [alreadyPlayed, navigate, tournamentId]);

  const currentQuestionData = questions?.[currentQuestion];

  // Timer
  useEffect(() => {
    if (!gameStarted || selectedAnswer !== null || timeExpired || !currentQuestionData) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, selectedAnswer, timeExpired, currentQuestion, currentQuestionData]);

  // Time expiration
  useEffect(() => {
    if (timeLeft === 0 && selectedAnswer === null && !timeExpired && gameStarted) {
      processAnswer(0, TIME_PER_QUESTION);
    }
  }, [timeLeft, selectedAnswer, timeExpired, gameStarted]);

  const submitRound = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-tournament-round", {
        body: {
          tournamentId,
          roundNumber,
          answers: answersRef.current,
        },
      });

      if (error) throw error;

      navigate(`/torneo/${tournamentId}/resultado`, {
        state: {
          score: data.score,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          roundNumber,
        },
        replace: true,
      });
    } catch (err: any) {
      console.error("Error submitting round:", err);
      toast.error(err?.message || "Error al enviar las respuestas.");
      setIsSubmitting(false);
    }
  }, [tournamentId, roundNumber, navigate]);

  const processAnswer = useCallback(async (answerValue: number, timeElapsed: number) => {
    if (processingRef.current || !currentQuestionData) return;
    processingRef.current = true;

    if (answerValue === 0) {
      setTimeExpired(true);
    } else {
      setSelectedAnswer(answerValue);
    }
    setIsVerifying(true);

    // Verify answer via edge function
    try {
      const { data, error } = await supabase.functions.invoke("check-answer", {
        body: { questionId: currentQuestionData.id, selectedAnswer: answerValue },
      });

      if (error) throw error;

      const isCorrect = data.isCorrect;
      if (isCorrect) {
        correctRef.current += 1;
        const tLeft = TIME_PER_QUESTION - timeElapsed;
        scoreRef.current += Math.round((tLeft / TIME_PER_QUESTION) * 100);
      }

      // Store answer for batch submit
      answersRef.current.push({
        questionId: currentQuestionData.id,
        selectedAnswer: answerValue,
        timeElapsed,
      });

      setVerifiedAnswer({ isCorrect, correctAnswer: data.correctAnswer });
      setIsVerifying(false);

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
          // Submit all answers to server
          submitRound();
        }
      }, 1500);
    } catch (err) {
      console.error("Error checking answer:", err);
      toast.error("Error verificando respuesta.");
      processingRef.current = false;
      setIsVerifying(false);
    }
  }, [currentQuestion, currentQuestionData, submitRound]);

  const getTimerColor = () => {
    if (timeLeft > 10) return "text-accent";
    if (timeLeft > 5) return "text-orange-500";
    return "text-destructive";
  };

  // Loading / error states
  if (questionsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (questionsError || !questions || questions.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-6 text-center gap-4">
        <p className="text-lg text-muted-foreground">
          {(questionsError as any)?.message?.includes("not yet unlocked")
            ? "Esta ronda aún no está desbloqueada."
            : (questionsError as any)?.message?.includes("not a participant")
              ? "No estás inscrito en este torneo."
              : "No se pudieron cargar las preguntas."}
        </p>
        <Button variant="cta" onClick={() => navigate("/torneo")}>
          Volver a torneos
        </Button>
      </div>
    );
  }

  // Submitting overlay
  if (isSubmitting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Enviando respuestas...</p>
      </div>
    );
  }

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
                <p>✓ <span className="font-medium">{questions.length} preguntas</span> sobre la Semana Santa</p>
                <p>✓ <span className="font-medium">15 segundos</span> por respuesta</p>
                <p>✓ Más rápido = <span className="font-medium">más puntos</span></p>
                <p>⚠️ <span className="font-medium">Un solo intento</span> por ronda</p>
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
    currentQuestionData!.option_a,
    currentQuestionData!.option_b,
    currentQuestionData!.option_c,
    currentQuestionData!.option_d,
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
        questionText={currentQuestionData!.question_text}
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

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import { useGameQuestions, useCheckTodayGame, useServerDate } from "@/hooks/useGameQuestions";
import { useAuth } from "@/hooks/useAuth";
import { useGameLogic } from "@/hooks/useGameLogic";
import PreGameScreen from "@/components/game/PreGameScreen";
import GameHeader from "@/components/game/GameHeader";
import QuestionCard from "@/components/game/QuestionCard";

/**
 * Play — Orchestrator component.
 *
 * Loads data (server date, questions, today's game check),
 * delegates game logic to useGameLogic hook,
 * and renders modular UI components.
 *
 * correct_answer in DB uses 1-4 (A=1, B=2, C=3, D=4).
 */

const Play = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data queries
  const { data: serverDate } = useServerDate();
  const { data: questions, isLoading: questionsLoading, isError: questionsError } = useGameQuestions(serverDate);
  const { isLoading: checkingTodayGame, isError: checkingError } = useCheckTodayGame(user?.id, serverDate);

  // Game logic hook
  const game = useGameLogic(questions, user?.id);

  // --- Error state ---
  if (questionsError || checkingError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">Error al cargar el juego</p>
          <p className="text-sm text-muted-foreground">Por favor, recarga la página</p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      </div>
    );
  }

  // --- Loading state ---
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

  // --- Not enough questions ---
  if (!questions || !Array.isArray(questions) || questions.length < 10) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No hay suficientes preguntas disponibles</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // --- Pre-game screen ---
  if (!game.gameStarted) {
    return <PreGameScreen onStart={game.startGame} />;
  }

  // --- Active game ---
  const answers = game.currentQuestionData ? [
    game.currentQuestionData.option_a,
    game.currentQuestionData.option_b,
    game.currentQuestionData.option_c,
    game.currentQuestionData.option_d,
  ] : [];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <GameHeader
        currentQuestion={game.currentQuestion}
        totalQuestions={game.totalQuestions}
        timeLeft={game.timeLeft}
        timerColorClass={game.getTimerColor()}
      />
      <QuestionCard
        questionText={game.currentQuestionData?.question_text ?? ''}
        answers={answers}
        currentQuestion={game.currentQuestion}
        timeExpired={game.timeExpired}
        selectedAnswer={game.selectedAnswer}
        verifiedAnswer={game.verifiedAnswer}
        isVerifying={game.isVerifying}
        onAnswer={game.processAnswer}
        timeLeft={game.timeLeft}
      />
      <BottomNav hidden={game.gameStarted} />
    </div>
  );
};

export default Play;

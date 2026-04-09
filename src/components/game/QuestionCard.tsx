import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuestionCardProps {
  questionText: string;
  answers: string[];
  currentQuestion: number;
  timeExpired: boolean;
  selectedAnswer: number | null;
  verifiedAnswer: { isCorrect: boolean; correctAnswer: number } | null;
  isVerifying: boolean;
  onAnswer: (answerValue: number, timeTaken: number) => void;
  timeLeft: number;
}

/** Returns the difficulty label based on question index (2 per level). */
const getDifficultyLabel = (index: number): string => {
  if (index < 2) return 'kanicofrade';
  if (index < 4) return 'nazareno';
  if (index < 6) return 'costalero';
  if (index < 8) return 'capataz';
  return 'maestro';
};

const QuestionCard = ({
  questionText,
  answers,
  currentQuestion,
  timeExpired,
  selectedAnswer,
  verifiedAnswer,
  isVerifying,
  onAnswer,
  timeLeft,
}: QuestionCardProps) => {
  const hasAnswered = selectedAnswer !== null || timeExpired;
  const showFeedback = verifiedAnswer !== null;
  const timedOutNoFeedback = hasAnswered && !isVerifying && !showFeedback;

  const handleClick = (answerValue: number) => {
    if (isVerifying || hasAnswered) return;
    const timeTaken = 15 - timeLeft;
    onAnswer(answerValue, timeTaken);
  };

  return (
    <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-6 w-full">
      {/* Difficulty indicator */}
      <p className="text-sm font-bold text-accent text-center mb-3">
        Nivel {getDifficultyLabel(currentQuestion)}
      </p>

      <Card className="p-5 mb-6 border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
        {timeExpired && (
          <p className="text-destructive font-bold text-center mb-2 animate-pulse" role="alert">
            ¡Tiempo agotado!
          </p>
        )}
        <h2 className="text-lg font-bold text-foreground text-center leading-relaxed">
          {questionText}
        </h2>
      </Card>

      {/* Answer buttons */}
      <div key={currentQuestion} className="space-y-3" role="group" aria-label="Opciones de respuesta">
        {answers.map((answer, index) => {
          const answerValue = index + 1; // 1-4 (A=1, B=2, C=3, D=4)
          const isSelected = selectedAnswer === answerValue;
          const isCorrectAnswer = verifiedAnswer ? answerValue === verifiedAnswer.correctAnswer : false;

          let buttonClasses = "";
          if (hasAnswered && showFeedback) {
            if (isCorrectAnswer) {
              buttonClasses = "!bg-green-500 !text-white !border-green-500 shadow-lg";
            } else if (isSelected) {
              buttonClasses = "!bg-red-500 !text-white !border-red-500 shadow-lg";
            } else {
              buttonClasses = "bg-card text-foreground border-border opacity-60";
            }
          } else if (hasAnswered && timedOutNoFeedback) {
            // Timeout: no server response — show neutral highlight on selected
            buttonClasses = isSelected
              ? "!bg-accent/30 !text-foreground !border-accent"
              : "bg-card text-foreground border-border opacity-60";
          } else if (hasAnswered && isVerifying) {
            buttonClasses = isSelected
              ? "bg-accent/20 text-foreground border-accent animate-pulse"
              : "bg-card text-foreground border-border opacity-60";
          } else {
            buttonClasses = "!bg-card !text-foreground !border-border focus:!bg-card focus:!outline-none focus:!ring-0 active:!bg-card md:hover:bg-accent/10 md:hover:border-accent md:hover:scale-[1.02]";
          }

          return (
            <Button
              key={`q${currentQuestion}-a${index}`}
              variant="none"
              onClick={() => handleClick(answerValue)}
              onTouchEnd={(e) => e.currentTarget.blur()}
              disabled={hasAnswered || timeExpired || isVerifying}
              className={`w-full min-h-[64px] py-4 px-5 text-left font-medium border-2 rounded-md transition-transform touch-manipulation ${buttonClasses}`}
              aria-label={`Opción ${String.fromCharCode(65 + index)}: ${answer}`}
            >
              <span className={`w-full block break-words hyphens-auto leading-snug ${
                answer.length > 80 ? 'text-xs' :
                answer.length > 60 ? 'text-sm' :
                answer.length > 45 ? 'text-[0.9rem]' :
                'text-base'
              }`}>{answer}</span>
            </Button>
          );
        })}
      </div>
    </main>
  );
};

export default QuestionCard;

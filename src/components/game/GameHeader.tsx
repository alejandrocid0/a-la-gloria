import { Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GameHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  timerColorClass: string;
}

const GameHeader = ({ currentQuestion, totalQuestions, timeLeft, timerColorClass }: GameHeaderProps) => {
  return (
    <header className="flex-shrink-0 bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Pregunta {currentQuestion + 1}/{totalQuestions}</span>
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${timerColorClass}`} aria-hidden="true" />
            <span className={`text-2xl font-bold ${timerColorClass}`} aria-label={`${timeLeft} segundos restantes`}>
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
  );
};

export default GameHeader;

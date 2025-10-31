import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy } from "lucide-react";

const Play = () => {
  // TODO: conectar a Supabase aquí para cargar preguntas
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion] = useState(1);
  const totalQuestions = 10;
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const mockAnswers = [
    "Respuesta A - Ejemplo de respuesta larga para ver el diseño",
    "Respuesta B",
    "Respuesta C - Otra respuesta",
    "Respuesta D",
  ];

  // Timer countdown simulation
  useEffect(() => {
    if (showResults || selectedAnswer !== null) return;
    
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
  }, [showResults, selectedAnswer]);

  const getTimerColor = () => {
    if (timeLeft > 10) return "text-accent";
    if (timeLeft > 5) return "text-orange-500";
    return "text-destructive";
  };

  const handleAnswerClick = (index: number) => {
    setSelectedAnswer(index);
    // TODO: calcular puntos basado en timeLeft (100 a 0 puntos)
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-8">
          <h2 className="text-4xl font-cinzel font-bold text-foreground leading-tight px-6">
            ¿Serás capaz de acertar todo hoy?
          </h2>
          <Button 
            onClick={() => setGameStarted(true)}
            className="w-full h-24 flex flex-col items-center justify-center bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <span className="text-2xl font-bold">A esta es</span>
            <span className="text-xs mt-1 opacity-80">Empieza la partida ya</span>
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-accent/5 pb-20 flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-8 text-center space-y-6 border-accent/30 shadow-xl">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent/80 mx-auto flex items-center justify-center shadow-lg">
            <Trophy className="w-16 h-16 text-accent-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">¡Partida completada!</h2>
          <div className="space-y-2 py-4">
            <p className="text-muted-foreground text-lg">Puntuación total</p>
            <p className="text-6xl font-bold text-accent drop-shadow-lg">850</p>
            <p className="text-sm text-muted-foreground">de 1000 puntos</p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Correctas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-xs text-muted-foreground">Incorrectas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">12s</p>
              <p className="text-xs text-muted-foreground">Tiempo medio</p>
            </div>
          </div>
          <Button 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            onClick={() => setShowResults(false)}
          >
            Volver al inicio
          </Button>
        </Card>
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

        {/* Test Results Button */}
        <Button
          onClick={() => setShowResults(true)}
          className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg"
        >
          Ver resultados (prueba)
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Play;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";

const Play = () => {
  // TODO: conectar a Supabase aquí para cargar preguntas
  const [currentQuestion] = useState(1);
  const totalQuestions = 10;
  const [showResults, setShowResults] = useState(false);

  const mockAnswers = [
    "Respuesta A",
    "Respuesta B",
    "Respuesta C",
    "Respuesta D",
  ];

  if (showResults) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-8 text-center space-y-6 border-border">
          <div className="w-24 h-24 rounded-full bg-accent mx-auto flex items-center justify-center">
            <span className="text-4xl font-bold text-accent-foreground">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">¡Partida completada!</h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">Puntuación total</p>
            <p className="text-5xl font-bold text-accent">0</p>
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Progress */}
      <header className="bg-primary text-primary-foreground py-6 px-6">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Pregunta {currentQuestion} de {totalQuestions}</span>
            <span className="font-bold">Puntos: 0</span>
          </div>
          <Progress value={(currentQuestion / totalQuestions) * 100} className="h-2" />
        </div>
      </header>

      {/* Question Card */}
      <main className="max-w-md mx-auto px-6 py-8">
        <Card className="p-6 mb-8 border-border">
          <h2 className="text-xl font-bold text-foreground text-center leading-relaxed">
            Pregunta de ejemplo sobre la Semana Santa
          </h2>
        </Card>

        {/* Answer Buttons */}
        <div className="space-y-4">
          {mockAnswers.map((answer, index) => (
            <Button
              key={index}
              className="w-full h-auto py-4 px-6 text-left text-base font-medium bg-card hover:bg-accent hover:text-accent-foreground text-foreground border-2 border-border"
              variant="outline"
            >
              {answer}
            </Button>
          ))}
        </div>

        {/* Test Results Button */}
        <Button
          onClick={() => setShowResults(true)}
          className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Ver resultados (prueba)
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Play;

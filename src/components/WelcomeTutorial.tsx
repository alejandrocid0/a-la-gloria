import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Trophy, Timer, Target } from "lucide-react";

interface WelcomeTutorialProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: Target,
    title: "¡Bienvenido a la Gloria!",
    description: "Cada día podrás jugar una partida de 10 preguntas sobre la Semana Santa de Sevilla.",
    tips: [
      "Solo una partida diaria",
      "10 preguntas únicas cada día",
      "Pon a prueba tus conocimientos"
    ]
  },
  {
    icon: Timer,
    title: "El tiempo es oro",
    description: "Tienes 15 segundos por pregunta. Cuanto más rápido respondas, más puntos ganarás.",
    tips: [
      "15 segundos por pregunta",
      "Más rapidez = más puntos",
      "100 puntos máximo por pregunta"
    ]
  },
  {
    icon: Trophy,
    title: "Compite por la gloria",
    description: "Acumula puntos y escala posiciones en el ranking. ¿Llegarás a lo más alto?",
    tips: [
      "Gana puntos en cada partida",
      "Compite con otros jugadores",
      "Sube en el ranking global"
    ]
  }
];

export const WelcomeTutorial = ({ onComplete }: WelcomeTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setDirection("right");
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection("left");
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentContent = tutorialSteps[currentStep];
  const Icon = currentContent.icon;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-accent/30 shadow-2xl bg-gradient-to-br from-card to-card/90"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="space-y-6 py-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Icon className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Content with slide animation */}
          <div 
            key={currentStep}
            className={`space-y-4 ${
              direction === "right" 
                ? "animate-[slide-in-right_0.3s_ease-out]" 
                : "animate-[slide-in-left_0.3s_ease-out]"
            }`}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-cinzel font-bold text-foreground">
                {currentContent.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {currentContent.description}
              </p>
            </div>

            {/* Tips */}
            <div className="space-y-2 bg-primary/5 rounded-lg p-4 border border-accent/20">
              {currentContent.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? "w-8 bg-accent" 
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {currentStep === tutorialSteps.length - 1 ? "¡Empezar!" : "Siguiente"}
              {currentStep < tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Skip button */}
          {currentStep < tutorialSteps.length - 1 && (
            <button
              onClick={onComplete}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Saltar tutorial
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

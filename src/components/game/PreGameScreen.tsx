import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

interface PreGameScreenProps {
  onStart: () => void;
}

const PreGameScreen = ({ onStart }: PreGameScreenProps) => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-cinzel font-bold text-foreground leading-tight">
              ¡Tos' por iguá, valientes!
            </h2>
            <p className="text-lg text-muted-foreground">
              ¿Serás capaz de acertar todo hoy?
            </p>
          </div>

          {/* Info del día */}
          <Card className="p-6 border-accent border-2 shadow-[var(--shadow-md)] bg-gradient-to-br from-primary/5 to-background text-left space-y-3">
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
            onClick={onStart}
            variant="cta"
            size="xl"
            className="w-full"
            aria-label="Comenzar partida"
          >
            ¡A esta es!
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PreGameScreen;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Flame } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <h1 className="text-3xl font-bold mb-2">A la Gloria</h1>
        <p className="text-sm opacity-90">Trivia de Semana Santa</p>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* User Info Card */}
        <Card className="p-6 bg-card border-border">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-accent mx-auto flex items-center justify-center">
              <span className="text-3xl font-bold text-accent-foreground">U</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Nombre del usuario</h2>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center border-border">
            <p className="text-sm text-muted-foreground mb-1">Puntos totales</p>
            <p className="text-2xl font-bold text-accent">0</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-accent" />
              <p className="text-sm text-muted-foreground">Racha</p>
            </div>
            <p className="text-2xl font-bold text-accent">0</p>
          </Card>
        </div>

        {/* Play Button */}
        <Button 
          className="w-full h-16 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          Jugar partida diaria
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;

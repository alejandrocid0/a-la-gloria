import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Flame } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Flame className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">¡A la Gloria!</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Greeting */}
        <div className="text-center py-2">
          <h2 className="text-2xl font-bold text-foreground">Hola, Nombre del usuario</h2>
        </div>

        {/* Play Button */}
        <Button 
          className="w-full h-20 text-xl font-bold bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          size="lg"
        >
          🎯 Jugar la partida de hoy
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-accent/20 shadow-lg hover:shadow-xl transition-shadow">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Puntos totales</p>
            <p className="text-3xl font-bold text-accent">2,450</p>
          </Card>
          <Card className="p-5 text-center border-accent/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-muted-foreground font-medium">Racha</p>
            </div>
            <p className="text-3xl font-bold text-orange-500">7 días</p>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-bold text-foreground">¡Nueva partida disponible!</span>
            <br />
            10 preguntas · 15 segundos cada una
          </p>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;

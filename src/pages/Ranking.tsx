import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Trophy, Medal } from "lucide-react";

const Ranking = () => {
  // TODO: conectar a Supabase aquí para cargar ranking
  const mockRanking = Array.from({ length: 50 }, (_, i) => ({
    position: i + 1,
    name: `Jugador ${i + 1}`,
    points: 1000 - i * 20,
  }));

  const currentUserPosition = {
    position: 25,
    name: "Tu nombre",
    points: 500,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-32">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Ranking</h1>
        </div>
      </header>

      {/* Ranking List */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-2">
        {mockRanking.map((player) => (
          <Card
            key={player.position}
            className={`p-4 flex items-center justify-between transition-all ${
              player.position <= 3
                ? "border-accent/40 shadow-lg bg-gradient-to-r from-accent/5 to-transparent"
                : "border-border hover:border-accent/30 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-md ${
                player.position === 1
                  ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground"
                  : player.position === 2
                  ? "bg-gradient-to-br from-gray-400 to-gray-300 text-white"
                  : player.position === 3
                  ? "bg-gradient-to-br from-orange-600 to-orange-500 text-white"
                  : "bg-muted text-foreground"
              }`}>
                {player.position <= 3 ? (
                  <Medal className="w-6 h-6" />
                ) : (
                  <span className="text-sm">{player.position}</span>
                )}
              </div>
              <div>
                <span className="font-bold text-foreground block">{player.name}</span>
                {player.position <= 3 && (
                  <span className="text-xs text-muted-foreground">Hermandad X</span>
                )}
              </div>
            </div>
            <span className={`font-bold text-lg ${
              player.position <= 3 ? "text-accent" : "text-accent/80"
            }`}>
              {player.points.toLocaleString()}
            </span>
          </Card>
        ))}
      </main>

      {/* Fixed User Position Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-r from-accent to-accent/90 border-t-2 border-accent shadow-2xl z-40">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-accent-foreground/20 backdrop-blur-sm flex items-center justify-center font-bold text-accent-foreground shadow-lg border-2 border-accent-foreground/30">
              {currentUserPosition.position}
            </div>
            <div>
              <span className="font-bold text-accent-foreground block">
                {currentUserPosition.name}
              </span>
              <span className="text-xs text-accent-foreground/80">Tu posición</span>
            </div>
          </div>
          <span className="font-bold text-xl text-accent-foreground drop-shadow-lg">
            {currentUserPosition.points.toLocaleString()}
          </span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Ranking;

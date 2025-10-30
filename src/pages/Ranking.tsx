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
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-accent" />
        <h1 className="text-3xl font-bold">Ranking</h1>
        <p className="text-sm opacity-90 mt-1">Top 50 jugadores</p>
      </header>

      {/* Ranking List */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-2">
        {mockRanking.map((player) => (
          <Card
            key={player.position}
            className="p-4 flex items-center justify-between border-border hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">
                {player.position <= 3 ? (
                  <Medal
                    className={`w-6 h-6 ${
                      player.position === 1
                        ? "text-accent"
                        : player.position === 2
                        ? "text-muted-foreground"
                        : "text-orange-600"
                    }`}
                  />
                ) : (
                  <span className="text-sm">{player.position}</span>
                )}
              </div>
              <span className="font-medium text-foreground">{player.name}</span>
            </div>
            <span className="font-bold text-accent">{player.points}</span>
          </Card>
        ))}
      </main>

      {/* Fixed User Position Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-accent border-t-2 border-primary z-40">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
              {currentUserPosition.position}
            </div>
            <span className="font-bold text-accent-foreground">
              {currentUserPosition.name}
            </span>
          </div>
          <span className="font-bold text-accent-foreground">
            {currentUserPosition.points}
          </span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Ranking;

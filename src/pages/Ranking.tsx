import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Trophy, Medal } from "lucide-react";

/**
 * DATOS DE SEGURIDAD:
 * - Usa la vista 'public_profiles' que NO expone emails
 * - La vista pública muestra: name, hermandad, total_points, etc.
 * - Los emails están protegidos en la tabla 'profiles'
 */

const Ranking = () => {
  // TODO: Cargar ranking desde public_profiles (sin exponer emails)
  // const { data: ranking } = useQuery({
  //   queryKey: ['ranking'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('public_profiles')  // ✅ Vista segura sin emails
  //       .select('id, name, hermandad, total_points')
  //       .order('total_points', { ascending: false })
  //       .limit(100);
  //     if (error) throw error;
  //     return data.map((user, index) => ({
  //       ...user,
  //       position: index + 1
  //     }));
  //   }
  // });
  
  // TODO: Cargar posición del usuario actual
  // const { data: currentUser } = useQuery({
  //   queryKey: ['currentUserRanking'],
  //   queryFn: async () => {
  //     const { data: profile } = await supabase
  //       .from('public_profiles')  // ✅ Vista segura
  //       .select('name, total_points')
  //       .eq('id', userId)
  //       .single();
  //     
  //     const { count } = await supabase
  //       .from('public_profiles')  // ✅ Vista segura
  //       .select('*', { count: 'exact', head: true })
  //       .gt('total_points', profile.total_points);
  //     
  //     return {
  //       name: profile.name,
  //       points: profile.total_points,
  //       position: (count || 0) + 1
  //     };
  //   }
  // });

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

  const [isUserVisible, setIsUserVisible] = useState(false);
  const userRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUserVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (userRowRef.current) {
      observer.observe(userRowRef.current);
    }

    return () => {
      if (userRowRef.current) {
        observer.unobserve(userRowRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Ranking</h1>
        </div>
      </header>

      {/* Ranking List */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-6 space-y-2 w-full">
        {mockRanking.map((player) => (
          <Card
            key={player.position}
            ref={player.position === currentUserPosition.position ? userRowRef : null}
            className={`p-4 flex items-center justify-between transition-all ${
              player.position === currentUserPosition.position
                ? "border-accent/40 shadow-lg bg-gradient-to-r from-accent/10 to-transparent"
                : player.position <= 3
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

      {/* Fixed User Position Bar - Only show when user row is not visible */}
      {!isUserVisible && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-6">
          <Card className="max-w-md mx-auto p-4 flex items-center justify-between border-accent/40 shadow-2xl bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center font-bold text-accent-foreground shadow-md">
                {currentUserPosition.position}
              </div>
              <div>
                <span className="font-bold text-accent-foreground block">
                  {currentUserPosition.name}
                </span>
                <span className="text-xs text-accent-foreground/70">Tu posición</span>
              </div>
            </div>
            <span className="font-bold text-lg text-accent-foreground">
              {currentUserPosition.points.toLocaleString()}
            </span>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Ranking;

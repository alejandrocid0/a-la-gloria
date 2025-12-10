import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Trophy, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * DATOS DE SEGURIDAD:
 * - Usa la vista 'public_profiles' que NO expone emails
 * - La vista pública muestra: name, hermandad, total_points, etc.
 * - Los emails están protegidos en la tabla 'profiles'
 */

const Ranking = () => {
  const { user } = useAuth();

  // Cargar top 100 del ranking usando función optimizada
  const { data: ranking, isLoading: rankingLoading } = useQuery({
    queryKey: ['top-ranking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_top_ranking', { limit_count: 100 });
      
      if (error) throw error;
      return data?.map((player) => ({
        ...player,
        position: Number(player.rank_position)
      })) || [];
    }
  });

  // Cargar posición del usuario actual usando función optimizada
  const { data: currentUserPosition, isLoading: userPositionLoading } = useQuery({
    queryKey: ['user-ranking-position', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .rpc('get_user_ranking_position', { user_uuid: user.id });

      if (error || !data || data.length === 0) return null;

      return {
        name: data[0].name,
        points: data[0].total_points,
        position: Number(data[0].rank_position)
      };
    },
    enabled: !!user?.id
  });

  // Verificar si el usuario está en el top 100 visible
  const isUserInTop100 = ranking?.some(player => player.id === user?.id);

  const [isUserVisible, setIsUserVisible] = useState(false);
  const userRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo observar si el usuario está en el top 100
    if (!isUserInTop100) {
      setIsUserVisible(false);
      return;
    }

    const element = userRowRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUserVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ranking, user?.id, isUserInTop100]);

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
      <main 
        className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-6 space-y-2 w-full transition-all"
        style={{ 
          paddingBottom: !isUserVisible && currentUserPosition ? '180px' : '88px' 
        }}
      >
        {rankingLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))
        ) : (
          ranking?.map((player) => (
          <Card
            key={player.id}
            ref={player.id === user?.id ? userRowRef : null}
            className={`p-4 flex items-center justify-between transition-all ${
              player.id === user?.id
                ? "border-accent/40 shadow-lg bg-gradient-to-r from-accent to-accent/90"
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
                  <span className="text-xs text-muted-foreground">{player.hermandad}</span>
                )}
              </div>
            </div>
            <span className={`font-bold text-lg ${
              player.id === user?.id
                ? "text-foreground"
                : player.position <= 3 
                ? "text-accent"
                : "text-accent/80"
            }`}>
              {player.total_points.toLocaleString()}
            </span>
          </Card>
        )))}
      </main>

      {/* Fixed User Position Bar - Show when user is not in top 100 OR when user row is not visible */}
      {!isUserVisible && currentUserPosition && !userPositionLoading && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-6 animate-slide-up">
          <Card className="max-w-md mx-auto p-4 flex items-center justify-between border-accent/40 shadow-2xl bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center font-bold text-accent-foreground shadow-md text-sm">
                {currentUserPosition.position.toLocaleString()}
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

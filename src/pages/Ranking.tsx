import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Trophy, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * DATOS DE SEGURIDAD:
 * - Usa RPCs que NO exponen emails
 * - El ranking semanal suma los puntos de partidas completadas entre lunes y domingo (Europe/Madrid)
 */

type Mode = "weekly" | "global";

interface RankingPlayer {
  id: string;
  name: string | null;
  hermandad: string | null;
  points: number;
  position: number;
}

const Ranking = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("weekly");

  // === GLOBAL ===
  const { data: globalRanking, isLoading: globalLoading } = useQuery({
    queryKey: ["top-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_ranking", { limit_count: 100 });
      if (error) throw error;
      return (data ?? []).map((p: any): RankingPlayer => ({
        id: p.id,
        name: p.name,
        hermandad: p.hermandad,
        points: p.total_points ?? 0,
        position: Number(p.rank_position),
      }));
    },
    staleTime: 0,
  });

  const { data: globalUserPos, isLoading: globalUserPosLoading } = useQuery({
    queryKey: ["user-ranking-position", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc("get_user_ranking_position", { user_uuid: user.id });
      if (error || !data || data.length === 0) return null;
      const u = data[0] as any;
      return {
        name: u.name || "Usuario",
        points: u.total_points ?? 0,
        position: Number(u.rank_position) || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

  // === SEMANAL ===
  const { data: weeklyRanking, isLoading: weeklyLoading } = useQuery({
    queryKey: ["top-weekly-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_weekly_ranking", { limit_count: 100 });
      if (error) throw error;
      return (data ?? []).map((p: any): RankingPlayer => ({
        id: p.id,
        name: p.name,
        hermandad: p.hermandad,
        points: Number(p.weekly_points ?? 0),
        position: Number(p.rank_position),
      }));
    },
    staleTime: 0,
  });

  const { data: weeklyUserPos, isLoading: weeklyUserPosLoading } = useQuery({
    queryKey: ["user-weekly-ranking-position", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc("get_user_weekly_ranking_position", { user_uuid: user.id });
      if (error || !data || data.length === 0) return null;
      const u = data[0] as any;
      return {
        name: u.name || "Usuario",
        points: Number(u.weekly_points ?? 0),
        position: Number(u.rank_position) || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

  // Rango de la semana actual (lunes a domingo) en Europe/Madrid
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = domingo, 1 = lunes...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const fmt = (d: Date) =>
      d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return `${fmt(monday)} – ${fmt(sunday)}`;
  };

  // Activos según modo
  const ranking = mode === "weekly" ? weeklyRanking : globalRanking;
  const rankingLoading = mode === "weekly" ? weeklyLoading : globalLoading;
  const currentUserPosition = mode === "weekly" ? weeklyUserPos : globalUserPos;
  const userPositionLoading = mode === "weekly" ? weeklyUserPosLoading : globalUserPosLoading;

  // Verificar si el usuario está en el top visible
  const isUserInTop = ranking?.some((player) => player.id === user?.id);

  const [isUserVisible, setIsUserVisible] = useState(false);
  const userRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserInTop) {
      setIsUserVisible(false);
      return;
    }
    const element = userRowRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsUserVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ranking, user?.id, isUserInTop]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Ranking</h1>
        </div>
      </header>

      {/* Selector Semanal / Global */}
      <div className="flex-shrink-0 max-w-md mx-auto w-full px-6 pt-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Ranking List */}
      <main
        className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-4 space-y-2 w-full transition-all"
        style={{
          paddingBottom: !isUserVisible && currentUserPosition ? "180px" : "88px",
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
        ) : !ranking || ranking.length === 0 ? (
          <Card className="p-6 text-center border-accent/30">
            <p className="text-sm text-muted-foreground">
              {mode === "weekly"
                ? "Aún nadie ha sumado puntos esta semana — ¡sé el primero!"
                : "No hay ranking disponible todavía."}
            </p>
          </Card>
        ) : (
          ranking.map((player) => (
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
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-md ${
                    player.position === 1
                      ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground"
                      : player.position === 2
                      ? "bg-gradient-to-br from-gray-400 to-gray-300 text-white"
                      : player.position === 3
                      ? "bg-gradient-to-br from-orange-600 to-orange-500 text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {player.position <= 3 ? (
                    <Medal className="w-6 h-6" />
                  ) : (
                    <span className="text-sm">{player.position}</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-foreground block">{player.name}</span>
                  <span className="text-xs text-muted-foreground">{player.hermandad}</span>
                </div>
              </div>
              <span
                className={`font-bold text-lg ${
                  player.id === user?.id
                    ? "text-foreground"
                    : player.position <= 3
                    ? "text-accent"
                    : "text-accent/80"
                }`}
              >
                {(player.points ?? 0).toLocaleString()}
              </span>
            </Card>
          ))
        )}
      </main>

      {/* Fixed User Position Bar */}
      {!isUserVisible && currentUserPosition && !userPositionLoading && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-6 animate-slide-up">
          <Card className="max-w-md mx-auto p-4 flex items-center justify-between border-accent/40 shadow-2xl bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center font-bold text-accent-foreground shadow-md text-sm">
                {(currentUserPosition.position ?? 0).toLocaleString()}
              </div>
              <div>
                <span className="font-bold text-accent-foreground block">
                  {currentUserPosition.name}
                </span>
                <span className="text-xs text-accent-foreground/70">Tu posición</span>
              </div>
            </div>
            <span className="font-bold text-lg text-accent-foreground">
              {(currentUserPosition.points ?? 0).toLocaleString()}
            </span>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Ranking;

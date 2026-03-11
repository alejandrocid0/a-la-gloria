import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface LiveStats {
  tournament: {
    id: string;
    name: string;
    status: string;
    current_round: number;
    image_url: string | null;
  } | null;
  total_participants: number;
  round_completed_count: number | null;
  ranking: {
    user_id: string;
    name: string;
    hermandad: string;
    total_score: number;
    rounds_completed: number;
    last_round_score: number;
  }[];
}

const ROUND_LABELS: Record<number, string> = {
  1: "Kanicofrade",
  2: "Nazareno",
  3: "Costalero",
  4: "Capataz",
  5: "Maestro",
};

const TournamentLive = () => {
  const { id } = useParams<{ id: string }>();

  const { data: stats, isLoading } = useQuery<LiveStats>({
    queryKey: ["tournament-live", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_tournament_live_stats", {
        p_tournament_id: id!,
      });
      if (error) throw error;
      return data as unknown as LiveStats;
    },
    refetchInterval: 3000,
    enabled: !!id,
  });

  if (isLoading || !stats?.tournament) {
    return (
      <div className="min-h-screen bg-[hsl(var(--primary))] flex items-center justify-center">
        <div className="text-primary-foreground text-2xl animate-pulse">Cargando vista en vivo...</div>
      </div>
    );
  }

  const { tournament, total_participants, round_completed_count, ranking } = stats;
  const completed = round_completed_count ?? 0;
  const progressPercent = total_participants > 0 ? (completed / total_participants) * 100 : 0;
  const isCompleted = tournament.status === "completed";
  const isNotStarted = tournament.current_round === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] text-primary-foreground p-6 md:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src={logo} alt="A la Gloria" className="h-14 md:h-20 drop-shadow-lg" />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">{tournament.name}</h1>

        {/* Status banner */}
        {isCompleted ? (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-secondary/20 backdrop-blur-sm rounded-2xl px-8 py-4 mt-4">
              <Trophy className="h-8 w-8 text-secondary" />
              <span className="text-2xl md:text-4xl font-bold text-secondary">¡Torneo finalizado!</span>
              <Trophy className="h-8 w-8 text-secondary" />
            </div>
          </div>
        ) : isNotStarted ? (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl px-8 py-4 mt-4">
              <Users className="h-6 w-6" />
              <span className="text-xl md:text-2xl font-medium">
                Esperando inicio · {total_participants} participante{total_participants !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center mb-8 space-y-4 mt-4">
            <div className="inline-flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl px-8 py-4">
              <Swords className="h-6 w-6" />
              <span className="text-xl md:text-3xl font-bold">
                Ronda {tournament.current_round}: {ROUND_LABELS[tournament.current_round] || ""}
              </span>
            </div>

            {/* Progress bar */}
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={progressPercent} className="h-5 bg-primary-foreground/20" indicatorClassName="bg-secondary transition-all duration-700" />
              <p className="text-lg md:text-xl font-medium">
                {completed} / {total_participants} jugadores han completado la ronda
                {completed === total_participants && total_participants > 0 && " ✓"}
              </p>
            </div>
          </div>
        )}

        {/* Ranking */}
        {ranking.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
              {isCompleted ? "Clasificación final" : "Clasificación"}
            </h2>

            {/* Podium - top 3 */}
            {ranking.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-8">
                {/* 2nd place */}
                <PodiumCard rank={2} player={ranking[1]} height="h-28 md:h-36" />
                {/* 1st place */}
                <PodiumCard rank={1} player={ranking[0]} height="h-36 md:h-44" />
                {/* 3rd place */}
                <PodiumCard rank={3} player={ranking[2]} height="h-24 md:h-32" />
              </div>
            )}

            {/* Rest of ranking */}
            <div className="space-y-2">
              {ranking.map((player, idx) => {
                const position = idx + 1;
                if (ranking.length >= 3 && position <= 3) return null;

                return (
                  <div
                    key={player.user_id}
                    className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-5 py-3"
                  >
                    <span className="text-lg md:text-xl font-bold w-8 text-center">{position}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base md:text-lg truncate">{player.name}</p>
                      <p className="text-sm text-primary-foreground/70 truncate">{player.hermandad}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg md:text-xl">{player.total_score} pts</p>
                      {!isNotStarted && (
                        <p className="text-xs text-primary-foreground/60">
                          Última ronda: +{player.last_round_score}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {ranking.length === 0 && (
          <div className="text-center py-12 text-primary-foreground/60 text-xl">
            Aún no hay participantes
          </div>
        )}
      </div>
    </div>
  );
};

const PodiumCard = ({
  rank,
  player,
  height,
}: {
  rank: number;
  player: { name: string; hermandad: string; total_score: number; last_round_score: number };
  height: string;
}) => {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-end rounded-2xl bg-primary-foreground/15 backdrop-blur-sm p-3 md:p-4 w-28 md:w-40",
        height
      )}
    >
      <span className="text-2xl md:text-4xl mb-1">{medals[rank - 1]}</span>
      <p className="font-bold text-sm md:text-base text-center truncate w-full">{player.name}</p>
      <p className="text-xs text-primary-foreground/70 truncate w-full text-center">{player.hermandad}</p>
      <p className="font-bold text-base md:text-lg mt-1">{player.total_score} pts</p>
    </div>
  );
};

export default TournamentLive;

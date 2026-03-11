import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import TournamentCard from "@/components/tournament/TournamentCard";

const PastTournaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["past-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "completed")
        .order("tournament_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myParticipations } = useQuery({
    queryKey: ["my-tournament-participations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("tournament_id, total_score, rounds_completed")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: participantCounts } = useQuery({
    queryKey: ["tournament-participant-counts"],
    enabled: !!tournaments && tournaments.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_tournament_participant_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.tournament_id] = Number(row.count);
      }
      return counts;
    },
  });

  const participationsMap = new Map(
    (myParticipations ?? []).map((p) => [p.tournament_id, p])
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background pb-20">
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/torneo")} className="p-1 -ml-1" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-cinzel font-bold text-primary-foreground">Torneos anteriores</h1>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 mt-5 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (tournaments ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Swords className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-cinzel font-semibold text-muted-foreground">
              No hay torneos anteriores
            </p>
          </div>
        ) : (
          (tournaments ?? []).map((t) => {
            const participation = participationsMap.get(t.id);
            return (
              <TournamentCard
                key={t.id}
                tournamentId={t.id}
                name={t.name}
                description={t.description}
                tournamentDate={t.tournament_date}
                imageUrl={t.image_url}
                participantCount={participantCounts?.[t.id] ?? 0}
                status={t.status}
                isJoined={!!participation}
                roundsCompleted={participation?.rounds_completed ?? 0}
                totalScore={participation?.total_score ?? 0}
                tournamentTime={t.tournament_time ?? null}
                location={t.location ?? null}
                locationUrl={t.location_url ?? null}
                currentRound={t.current_round}
              />
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default PastTournaments;

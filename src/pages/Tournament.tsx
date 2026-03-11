import { useQuery } from "@tanstack/react-query";
import { ChevronRight, History, Swords } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import TournamentCard from "@/components/tournament/TournamentCard";

const Tournament = () => {
  const { user } = useAuth();

  // Query real tournaments
  const { data: dbTournaments, isLoading } = useQuery({
    queryKey: ["tournaments"],
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .neq("status", "draft")
        .order("tournament_date", { ascending: true })
        .order("tournament_time", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  // User's participations with progress
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

  // Participant counts per tournament (via RPC to bypass RLS)
  const { data: participantCounts } = useQuery({
    queryKey: ["tournament-participant-counts"],
    enabled: !!dbTournaments && dbTournaments.length > 0,
    refetchInterval: 10000,
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

  const activeTournaments = (dbTournaments ?? []).filter(t => t.status !== "completed");
  const completedTournaments = (dbTournaments ?? []).filter(t => t.status === "completed");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Swords className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Torneos</h1>
        </div>
      </header>

      {/* Cuenta atrás automática */}
      {(() => {
        const nextTournament = (dbTournaments ?? []).find(t => t.status === "upcoming");
        if (!nextTournament) return null;
        const days = differenceInCalendarDays(new Date(nextTournament.tournament_date + "T00:00:00"), new Date());
        if (days < 0) return null;
        const label = days === 0 ? "¡Próximo torneo hoy!" : days === 1 ? "Próximo torneo mañana" : `Próximo torneo en ${days} días`;
        return (
          <div className="max-w-md mx-auto w-full px-4 mt-5">
            <div className="bg-secondary/15 border border-secondary/30 rounded-xl px-4 py-3 text-center">
              <span className="text-sm font-bold text-foreground">{label}</span>
            </div>
          </div>
        );
      })()}

      {/* Enlace a torneos anteriores */}
      {completedTournaments.length > 0 && (
        <div className="max-w-md mx-auto w-full px-4 mt-3">
          <Link
            to="/torneo/anteriores"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Torneos anteriores</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Lista de torneos */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 mt-5 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeTournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Swords className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-cinzel font-semibold text-muted-foreground">
              Próximamente más torneos
            </p>
          </div>
        ) : (
          activeTournaments.map((t) => {
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

export default Tournament;

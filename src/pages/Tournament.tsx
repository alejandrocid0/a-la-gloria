import { useQuery } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import TournamentCard from "@/components/tournament/TournamentCard";

// Mockups de torneos — se muestran solo si no hay torneos reales
const MOCK_TOURNAMENTS = [
  {
    id: "mock-1",
    name: "Gran Torneo de Cuaresma",
    description: "Demuestra cuánto sabes sobre los días grandes de nuestra Semana Santa.",
    tournament_date: "2026-03-29",
    image_url: null,
    status: "upcoming",
    join_code: "",
    current_round: 0,
    created_at: null,
    _participantCount: 24,
  },
  {
    id: "mock-2",
    name: "Reto Cofrade Madrugá",
    description: "Solo para los más valientes. Preguntas sobre la noche más especial.",
    tournament_date: "2026-04-02",
    image_url: null,
    status: "upcoming",
    join_code: "",
    current_round: 0,
    created_at: null,
    _participantCount: 18,
  },
  {
    id: "mock-3",
    name: "Desafío Domingo de Ramos",
    description: "El torneo que abre la Semana Mayor. ¿Estás preparado?",
    tournament_date: "2026-03-22",
    image_url: null,
    status: "active",
    join_code: "",
    current_round: 1,
    created_at: null,
    _participantCount: 42,
  },
];

const Tournament = () => {
  const { user } = useAuth();

  // Query real tournaments
  const { data: dbTournaments, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("tournament_date", { ascending: true });
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

  // Participant counts per tournament
  const { data: participantCounts } = useQuery({
    queryKey: ["tournament-participant-counts"],
    enabled: !!dbTournaments && dbTournaments.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("tournament_id");
      if (error) throw error;
      // Count per tournament
      const counts: Record<string, number> = {};
      for (const p of data) {
        counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1;
      }
      return counts;
    },
  });

  const participationsMap = new Map(
    (myParticipations ?? []).map((p) => [p.tournament_id, p])
  );

  const tournaments =
    dbTournaments && dbTournaments.length > 0 ? dbTournaments : MOCK_TOURNAMENTS;

  const isMock = !dbTournaments || dbTournaments.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Swords className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Torneos</h1>
        </div>
      </header>

      {/* Cuenta atrás placeholder */}
      <div className="max-w-md mx-auto w-full px-4 mt-5">
        <div className="bg-secondary/15 border border-secondary/30 rounded-xl px-4 py-3 text-center">
          <span className="text-sm font-bold text-foreground">Próximo torneo en 3 días</span>
        </div>
      </div>

      {/* Lista de torneos */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 mt-5 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          tournaments.map((t) => {
            const participation = participationsMap.get(t.id);
            return (
              <TournamentCard
                key={t.id}
                tournamentId={t.id}
                name={t.name}
                description={t.description}
                tournamentDate={t.tournament_date}
                imageUrl={t.image_url}
                participantCount={
                  isMock
                    ? (t as any)._participantCount ?? 0
                    : participantCounts?.[t.id] ?? 0
                }
                status={t.status}
                isJoined={!isMock && !!participation}
                joinCode={t.join_code}
                isMock={isMock}
                roundsCompleted={participation?.rounds_completed ?? 0}
                totalScore={participation?.total_score ?? 0}
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

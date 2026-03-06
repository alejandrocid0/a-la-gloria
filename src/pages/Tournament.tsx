import { useQuery } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import TournamentCard from "@/components/tournament/TournamentCard";

// Mockups de torneos — se muestran solo si no hay torneos reales en la base de datos
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

  // TODO: conectar a Supabase aquí — query real de torneos
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

  // Consultar en qué torneos está inscrito el usuario actual
  const { data: myParticipations } = useQuery({
    queryKey: ["my-tournament-participations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("tournament_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((p) => p.tournament_id);
    },
  });

  const joinedSet = new Set(myParticipations ?? []);

  const tournaments =
    dbTournaments && dbTournaments.length > 0 ? dbTournaments : MOCK_TOURNAMENTS;

  const isMock = !dbTournaments || dbTournaments.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-8 px-6 shadow-lg">
        <div className="max-w-md mx-auto text-center">
          <Swords className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h1 className="font-cinzel text-2xl font-bold tracking-wide">TORNEOS</h1>
          <p className="text-primary-foreground/80 text-sm mt-2">
            Compite, avanza rondas y demuestra cuánto sabes de nuestra Semana Santa.
          </p>
        </div>
      </header>

      {/* Cuenta atrás placeholder */}
      <div className="max-w-md mx-auto w-full px-4 mt-5">
        <div className="bg-secondary/15 border border-secondary/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Próximo torneo en</span>
          <span className="font-cinzel font-bold text-secondary text-lg">3 días</span>
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
          tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              name={t.name}
              description={t.description}
              tournamentDate={t.tournament_date}
              imageUrl={t.image_url}
              participantCount={(t as any)._participantCount ?? 0}
              status={t.status}
              isJoined={!isMock && joinedSet.has(t.id)}
              joinCode={t.join_code}
              isMock={isMock}
            />
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Tournament;

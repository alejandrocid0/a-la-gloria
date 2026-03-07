import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TournamentRoundResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { id: tournamentId } = useParams<{ id: string }>();

  const {
    score = 0,
    correctAnswers = 0,
    totalQuestions = 10,
    roundNumber = 1,
  } = location.state || {};

  // Poll tournament current_round every 5s
  const { data: tournament } = useQuery({
    queryKey: ["tournament-status", tournamentId],
    enabled: !!tournamentId,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("current_round, status")
        .eq("id", tournamentId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const isNextRoundUnlocked = tournament
    ? roundNumber < tournament.current_round
    : false;

  const isTournamentCompleted = tournament?.status === "completed";

  useEffect(() => {
    if (!location.state || location.state.score === undefined) {
      navigate(`/torneo`);
    }
  }, [location.state, navigate]);

  const handleViewRanking = () => {
    // Invalidate ranking cache before navigating
    queryClient.invalidateQueries({ queryKey: ["tournament-ranking", tournamentId] });
    navigate(`/torneo/${tournamentId}/ranking`, {
      state: { roundNumber, score }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-6 px-6 shadow-lg">
        <div className="text-center">
          <p className="text-sm opacity-80 mb-1">Ronda {roundNumber}</p>
          <h1 className="text-2xl font-cinzel font-bold">¡Ronda Completada!</h1>
        </div>
      </header>

      {/* Results Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Score Card */}
        <Card className="p-8 text-center border-accent border-2 shadow-[var(--shadow-lg)] bg-gradient-to-br from-accent/20 to-card">
          <p className="text-sm text-muted-foreground mb-4 font-medium">Tu puntuación</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-7xl font-bold text-accent">{score}</span>
            <span className="text-4xl">⭐</span>
          </div>
          <p className="text-base text-muted-foreground">puntos</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-accent border-2 shadow-[var(--shadow-md)] bg-gradient-to-br from-primary/5 to-card">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Aciertos</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">{correctAnswers}</span>
              <span className="text-xl">✅</span>
            </div>
          </Card>
          <Card className="p-5 text-center border-accent border-2 shadow-[var(--shadow-md)] bg-gradient-to-br from-primary/5 to-card">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Promedio</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">
                {totalQuestions > 0 ? Math.round(score / totalQuestions) : 0}
              </span>
              <span className="text-xl">🎯</span>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleViewRanking}
            variant="cta"
            size="xl"
            className="w-full"
          >
            Ver clasificación
          </Button>

          {!isNextRoundUnlocked && !isTournamentCompleted && (
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Esperando a que se desbloquee la siguiente ronda...
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TournamentRoundResult;

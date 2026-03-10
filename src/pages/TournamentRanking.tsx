import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Lock, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TournamentPodium from "@/components/tournament/TournamentPodium";
import TournamentParticipantsList from "@/components/tournament/TournamentParticipantsList";
import TournamentRankingList from "@/components/tournament/TournamentRankingList";

const TOTAL_ROUNDS = 5;

const TournamentRanking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: tournamentId } = useParams<{ id: string }>();

  const { data: tournament } = useQuery({
    queryKey: ["tournament-status", tournamentId],
    enabled: !!tournamentId,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("current_round, status, name")
        .eq("id", tournamentId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const currentRound = tournament?.current_round ?? 0;
  const isPreStart = currentRound === 0;
  const isTournamentCompleted = tournament?.status === "completed";

  // Participants list for pre-start state
  const { data: participantsList, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ["tournament-participants-list", tournamentId],
    enabled: !!tournamentId && isPreStart,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_tournament_participants_list", { p_tournament_id: tournamentId! });
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        id: p.out_user_id,
        name: p.out_name ?? "Jugador",
        hermandad: p.out_hermandad ?? "",
        joinedAt: p.out_joined_at,
        position: Number(p.out_position),
      }));
    },
  });

  // Ranking for active/completed state
  const { data: participants, isLoading: isLoadingRanking } = useQuery({
    queryKey: ["tournament-ranking", tournamentId],
    enabled: !!tournamentId && !isPreStart,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_tournament_ranking", { p_tournament_id: tournamentId! });
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        id: p.out_user_id,
        name: p.out_name ?? "Jugador",
        hermandad: p.out_hermandad ?? "",
        totalScore: p.out_total_score,
        roundsCompleted: p.out_rounds_completed,
        lastRoundScore: p.out_last_round_score,
        position: Number(p.out_position),
      }));
    },
  });

  const myParticipation = participants?.find((p) => p.id === user?.id);
  const myNextRound = (myParticipation?.roundsCompleted ?? 0) + 1;
  const canPlayNextRound = !isPreStart && myNextRound <= currentRound && myNextRound <= TOTAL_ROUNDS;

  const isLoading = isPreStart ? isLoadingParticipants : isLoadingRanking;
  const hasRoundData = (participants ?? []).some((p) => p.roundsCompleted > 0);

  const top3 = (participants ?? []).slice(0, 3);
  const rest = (participants ?? []).slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/90 pb-24">
      {/* Header */}
      <header className="relative py-6 px-6">
        <button
          onClick={() => navigate("/torneo")}
          className="absolute top-6 right-6 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-primary-foreground/70 text-sm mb-1">
            {tournament?.name ?? "Torneo"}
          </p>
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground tracking-wider">
            {isPreStart ? "PARTICIPANTES" : "CLASIFICACIÓN"}
          </h1>
          {isPreStart ? (
            <p className="text-primary-foreground/50 text-xs mt-1">
              Esperando a que comience el torneo
            </p>
          ) : hasRoundData ? (
            <p className="text-primary-foreground/50 text-xs mt-1">
              Ronda actual: {currentRound}
            </p>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : isPreStart ? (
        <TournamentParticipantsList
          participants={participantsList ?? []}
          currentUserId={user?.id}
        />
      ) : (
        <>
          {top3.length >= 3 && <TournamentPodium top3={top3} />}
          <TournamentRankingList rest={rest} currentUserId={user?.id} />
          {(!participants || participants.length === 0) && (
            <p className="text-center text-primary-foreground/50 text-sm py-8">
              Aún no hay participantes
            </p>
          )}
        </>
      )}

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary to-transparent">
        <div className="max-w-md mx-auto">
          {isPreStart ? (
            <Button
              variant="cta"
              size="xl"
              className="w-full opacity-60 cursor-not-allowed"
              disabled
            >
              <Lock className="w-4 h-4 mr-2" />
              Jugar Ronda 1
            </Button>
          ) : canPlayNextRound ? (
            <Button
              onClick={() => navigate(`/torneo/${tournamentId}/jugar/${myNextRound}`)}
              variant="cta"
              size="xl"
              className="w-full"
            >
              Jugar Ronda {myNextRound}
            </Button>
          ) : isTournamentCompleted ? (
            <Button
              onClick={() => navigate("/torneo")}
              variant="cta"
              size="xl"
              className="w-full"
            >
              Volver a torneos
            </Button>
          ) : (
            <Button
              variant="cta"
              size="xl"
              className="w-full opacity-60 cursor-not-allowed"
              disabled
            >
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Esperando siguiente ronda...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentRanking;

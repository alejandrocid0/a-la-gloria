import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TOTAL_ROUNDS = 5;

const TournamentRanking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: tournamentId } = useParams<{ id: string }>();

  // Poll tournament state every 10s
  const { data: tournament } = useQuery({
    queryKey: ["tournament-status", tournamentId],
    enabled: !!tournamentId,
    refetchInterval: 10000,
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

  // Get participants with profiles
  const { data: participants, isLoading } = useQuery({
    queryKey: ["tournament-ranking", tournamentId],
    enabled: !!tournamentId,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("user_id, total_score, rounds_completed")
        .eq("tournament_id", tournamentId!)
        .order("total_score", { ascending: false });
      if (error) throw error;

      // Fetch profiles for these users
      const userIds = data.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, hermandad")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      return data.map((p, i) => {
        const profile = profileMap.get(p.user_id);
        return {
          id: p.user_id,
          name: profile?.name ?? "Jugador",
          hermandad: profile?.hermandad ?? "",
          totalScore: p.total_score,
          roundsCompleted: p.rounds_completed,
          position: i + 1,
        };
      });
    },
  });

  // Get last round scores for each participant
  const { data: lastRoundScores } = useQuery({
    queryKey: ["tournament-last-round-scores", tournamentId, tournament?.current_round],
    enabled: !!tournamentId && !!tournament && tournament.current_round > 0,
    queryFn: async () => {
      // Get the latest round that has been played (current_round or current_round - 1)
      const latestRound = tournament!.current_round;
      const { data, error } = await supabase
        .from("tournament_answers")
        .select("user_id, points_earned, round_number")
        .eq("tournament_id", tournamentId!)
        .eq("round_number", latestRound);
      if (error) throw error;

      // Sum points per user for this round
      const scores: Record<string, number> = {};
      for (const a of data) {
        scores[a.user_id] = (scores[a.user_id] || 0) + a.points_earned;
      }
      return { roundNumber: latestRound, scores };
    },
  });

  // User's own participation
  const myParticipation = participants?.find((p) => p.id === user?.id);
  const myNextRound = (myParticipation?.roundsCompleted ?? 0) + 1;
  const currentRound = tournament?.current_round ?? 0;
  const canPlayNextRound = myNextRound <= currentRound && myNextRound <= TOTAL_ROUNDS;
  const isTournamentCompleted = tournament?.status === "completed";

  const top3 = (participants ?? []).slice(0, 3);
  const rest = (participants ?? []).slice(3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3;
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumMedals = ["🥈", "🥇", "🥉"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/90 pb-24">
      {/* Header */}
      <header className="relative py-6 px-6">
        <button
          onClick={() => navigate("/torneo")}
          className="absolute top-6 right-6 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Cerrar ranking"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-primary-foreground/70 text-sm mb-1">
            {tournament?.name ?? "Torneo"}
          </p>
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground tracking-wider">
            CLASIFICACIÓN
          </h1>
          {lastRoundScores && (
            <p className="text-primary-foreground/50 text-xs mt-1">
              Última ronda jugada: {lastRoundScores.roundNumber}
            </p>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 3 && (
            <div className="max-w-sm mx-auto px-6 mb-8">
              <div className="flex items-end justify-center gap-3">
                {podiumOrder.map((player, i) => {
                  const roundScore = lastRoundScores?.scores[player?.id ?? ""] ?? null;
                  return (
                    <div key={player?.id || i} className="flex flex-col items-center flex-1">
                      <Avatar className="w-14 h-14 border-2 border-accent mb-2">
                        <AvatarFallback className="bg-accent text-accent-foreground font-bold text-lg">
                          {player?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-primary-foreground text-xs font-bold text-center truncate w-full">
                        {player?.name || "---"}
                      </p>
                      <p className="text-primary-foreground/60 text-[10px] text-center truncate w-full">
                        {player?.hermandad || ""}
                      </p>
                      <p className="text-accent text-sm font-bold mt-1">
                        {player?.totalScore ?? 0} pts
                      </p>
                      {roundScore !== null && (
                        <p className="text-primary-foreground/50 text-[10px]">
                          (última: {roundScore})
                        </p>
                      )}

                      <div
                        className={`w-full ${podiumHeights[i]} mt-2 rounded-t-lg bg-gradient-to-t from-accent/80 to-accent flex items-start justify-center pt-2`}
                      >
                        <span className="text-2xl">{podiumMedals[i]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rest of ranking */}
          <div className="max-w-md mx-auto px-6 space-y-2">
            {rest.map((player) => {
              const roundScore = lastRoundScores?.scores[player.id] ?? null;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                    player.id === user?.id
                      ? "bg-accent/20 border border-accent/40"
                      : "bg-card/10 backdrop-blur-sm"
                  }`}
                >
                  <span className="text-primary-foreground/60 font-bold text-sm min-w-[24px] text-center">
                    {player.position}°
                  </span>
                  <Avatar className="w-9 h-9 border border-accent/30">
                    <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-sm font-bold">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary-foreground text-sm font-medium truncate">{player.name}</p>
                    <p className="text-primary-foreground/50 text-xs truncate">{player.hermandad}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-accent text-sm font-bold">{player.totalScore} pts</span>
                    {roundScore !== null && (
                      <p className="text-primary-foreground/50 text-[10px]">(+{roundScore})</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No participants */}
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
          {canPlayNextRound ? (
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

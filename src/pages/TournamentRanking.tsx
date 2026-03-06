import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { X } from "lucide-react";

/**
 * TournamentRanking — Pantalla de clasificación del torneo.
 * Podio top 3 + lista del resto de participantes.
 * TODO: conectar a Supabase aquí — leer tournament_participants con scores reales.
 */

// Mock ranking data
const MOCK_RANKING = [
  { id: "1", name: "CofradeMayor", hermandad: "La Macarena", score: 890, position: 1 },
  { id: "2", name: "NazarenoFiel", hermandad: "El Silencio", score: 845, position: 2 },
  { id: "3", name: "Costalero99", hermandad: "La Esperanza", score: 810, position: 3 },
  { id: "4", name: "CapatazPro", hermandad: "Los Gitanos", score: 780, position: 4 },
  { id: "5", name: "SaeteroAndaluz", hermandad: "El Gran Poder", score: 750, position: 5 },
  { id: "6", name: "DevotoSS", hermandad: "La Estrella", score: 720, position: 6 },
  { id: "7", name: "PasoDorado", hermandad: "San Esteban", score: 690, position: 7 },
  { id: "8", name: "InciensoBueno", hermandad: "La Amargura", score: 660, position: 8 },
];

const TOTAL_ROUNDS = 3; // Mock total de rondas

const TournamentRanking = () => {
  const navigate = useNavigate();
  const { id: tournamentId } = useParams<{ id: string }>();
  const location = useLocation();
  const { roundNumber = 1 } = location.state || {};

  const hasMoreRounds = roundNumber < TOTAL_ROUNDS;
  const top3 = MOCK_RANKING.slice(0, 3);
  const rest = MOCK_RANKING.slice(3);

  // Podium order: 2nd, 1st, 3rd (visual layout)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumLabels = ["2°", "1°", "3°"];
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
          <p className="text-primary-foreground/70 text-sm mb-1">Ronda {roundNumber}</p>
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground tracking-wider">
            GANADORES
          </h1>
        </div>
      </header>

      {/* Podium */}
      <div className="max-w-sm mx-auto px-6 mb-8">
        <div className="flex items-end justify-center gap-3">
          {podiumOrder.map((player, i) => (
            <div key={player?.id || i} className="flex flex-col items-center flex-1">
              {/* Avatar + Name */}
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
              <p className="text-accent text-sm font-bold mt-1">{player?.score || 0} pts</p>

              {/* Podium column */}
              <div
                className={`w-full ${podiumHeights[i]} mt-2 rounded-t-lg bg-gradient-to-t from-accent/80 to-accent flex items-start justify-center pt-2`}
              >
                <span className="text-2xl">{podiumMedals[i]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rest of ranking */}
      <div className="max-w-md mx-auto px-6 space-y-2">
        {rest.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 bg-card/10 backdrop-blur-sm rounded-lg px-4 py-3"
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
            <span className="text-accent text-sm font-bold">{player.score} pts</span>
          </div>
        ))}
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary to-transparent">
        <div className="max-w-md mx-auto">
          {hasMoreRounds ? (
            <Button
              onClick={() => navigate(`/torneo/${tournamentId}/jugar/${roundNumber + 1}`)}
              variant="cta"
              size="xl"
              className="w-full"
            >
              Siguiente ronda
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/torneo")}
              variant="cta"
              size="xl"
              className="w-full"
            >
              Volver a torneos
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentRanking;

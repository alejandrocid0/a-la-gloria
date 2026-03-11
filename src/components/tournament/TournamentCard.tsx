import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import JoinTournamentDialog from "./JoinTournamentDialog";

interface TournamentCardProps {
  tournamentId: string;
  name: string;
  description?: string | null;
  tournamentDate: string;
  imageUrl?: string | null;
  participantCount?: number;
  status?: string;
  isJoined?: boolean;
  joinCode?: string;
  
  roundsCompleted?: number;
  totalScore?: number;
  tournamentTime?: string | null;
  location?: string | null;
  locationUrl?: string | null;
  currentRound?: number;
}

const TournamentCard = ({
  tournamentId,
  name,
  description,
  tournamentDate,
  imageUrl,
  participantCount = 0,
  status = "upcoming",
  isJoined = false,
  joinCode = "",
  
  roundsCompleted = 0,
  totalScore = 0,
  tournamentTime,
  location,
  locationUrl,
  currentRound = 0,
}: TournamentCardProps) => {
  const [joinOpen, setJoinOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const date = new Date(tournamentDate);
  const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const hours = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const handleButtonClick = () => {
    if (status === "completed") {
      navigate(`/torneo/${tournamentId}/ranking`);
      return;
    }
    if (!isJoined) {
      setJoinOpen(true);
    } else {
      queryClient.invalidateQueries({ queryKey: ["tournament-ranking", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournament-status", tournamentId] });
      navigate(`/torneo/${tournamentId}/ranking`);
    }
  };

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-border bg-card shadow-[var(--shadow-md)]">
        {/* Imagen horizontal */}
        <div className="w-full h-40 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Imagen del torneo ${name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="font-cinzel text-primary-foreground/30 text-2xl font-bold tracking-widest">
                TORNEO
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Título + badge */}
          <div className="flex items-start gap-2">
            <h3 className="font-cinzel font-bold text-foreground text-lg leading-tight flex-1 min-w-0">
              {name}
            </h3>
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
              status === "completed"
                ? "bg-muted text-muted-foreground"
                : status === "active"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-secondary text-secondary-foreground"
            }`}>
              {status === "active" ? "En curso" : status === "completed" ? "Finalizado" : "Próximo"}
            </span>
          </div>

          {/* Descripción */}
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
          )}

          {/* Recuadro de metadatos */}
          <div className="bg-muted rounded-lg p-3 space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>{participantCount} participantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {date.toLocaleDateString("es-ES")} · {tournamentTime ? tournamentTime.slice(0, 5) : hours}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                {locationUrl ? (
                  <a
                    href={locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-1 underline hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {location}
                  </a>
                ) : (
                  <span className="line-clamp-1">{location}</span>
                )}
              </div>
            )}
            {/* Progress para usuarios unidos */}
            {isJoined && (
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <span className="text-xs font-medium text-accent">
                  Rondas: {roundsCompleted}/5
                </span>
                <span className="text-xs">·</span>
                <span className="text-xs font-medium text-accent">
                  {totalScore} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botón contextual */}
        <div className="px-4 pb-4">
          <Button
            variant="cta"
            className="w-full"
            aria-label={isJoined ? `Jugar torneo ${name}` : `Unirse al torneo ${name}`}
            onClick={handleButtonClick}
          >
            {status === "completed"
              ? "Ver clasificación"
              : !isJoined
                ? "Unirse al torneo"
                : currentRound === 0
                  ? "Ver participantes"
                  : roundsCompleted >= 5
                    ? "Ver clasificación"
                    : `Jugar ronda ${roundsCompleted + 1}`}
          </Button>
        </div>
      </div>

      <JoinTournamentDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        
      />
    </>
  );
};

export default TournamentCard;

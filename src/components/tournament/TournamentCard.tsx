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
  isMock?: boolean;
  roundsCompleted?: number;
  totalScore?: number;
  tournamentTime?: string | null;
  location?: string | null;
  locationUrl?: string | null;
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
  isMock = false,
  roundsCompleted = 0,
  totalScore = 0,
  tournamentTime,
  location,
  locationUrl,
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
    if (isMock) return;
    if (!isJoined) {
      setJoinOpen(true);
    } else {
      // Invalidate cache before navigating to ranking
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
          {/* Badge de estado */}
          <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow">
            {status === "active" ? "En curso" : status === "completed" ? "Finalizado" : "Próximo"}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex gap-4 p-4">
          {/* Fecha destacada */}
          <div className="flex flex-col items-center justify-center min-w-[56px] bg-muted rounded-lg px-2 py-3">
            <span className="text-xs font-bold text-muted-foreground uppercase">{month}</span>
            <span className="text-2xl font-bold text-foreground leading-none">{day}</span>
            <span className="text-xs text-muted-foreground mt-1">
              {tournamentTime ? tournamentTime.slice(0, 5) : hours}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel font-bold text-foreground text-base leading-tight truncate">
              {name}
            </h3>
            {description && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {participantCount} participantes
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {date.toLocaleDateString("es-ES")}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}
            {/* Progress for joined users */}
            {isJoined && !isMock && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-accent">
                  Rondas: {roundsCompleted}/5
                </span>
                <span className="text-xs text-muted-foreground">·</span>
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
            {isJoined ? "Jugar Torneo" : "Unirse al torneo"}
          </Button>
        </div>
      </div>

      <JoinTournamentDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        prefillCode={joinCode}
      />
    </>
  );
};

export default TournamentCard;

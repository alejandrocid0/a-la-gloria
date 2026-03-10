import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Participant {
  id: string;
  name: string;
  hermandad: string;
  joinedAt: string;
  position: number;
}

interface Props {
  participants: Participant[];
  currentUserId?: string;
}

const TournamentParticipantsList = ({ participants, currentUserId }: Props) => {
  if (participants.length === 0) {
    return (
      <p className="text-center text-primary-foreground/50 text-sm py-8">
        Aún no hay participantes
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6">
      <p className="text-primary-foreground/60 text-sm text-center mb-4">
        {participants.length} {participants.length === 1 ? "participante" : "participantes"}
      </p>
      <div className="space-y-2">
        {participants.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
              player.id === currentUserId
                ? "bg-accent/20 border border-accent/40"
                : "bg-card/10 backdrop-blur-sm"
            }`}
          >
            <span className="text-primary-foreground/60 font-bold text-sm min-w-[24px] text-center">
              {player.position}
            </span>
            <Avatar className="w-9 h-9 border border-accent/30">
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-sm font-bold">
                {player.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground text-sm font-medium truncate">
                {player.name}
                {player.id === currentUserId && (
                  <span className="text-accent ml-1 text-xs">(tú)</span>
                )}
              </p>
              <p className="text-primary-foreground/50 text-xs truncate">{player.hermandad}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentParticipantsList;

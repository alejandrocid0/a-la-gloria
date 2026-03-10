import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Player {
  id: string;
  name: string;
  hermandad: string;
  totalScore: number;
  lastRoundScore: number;
  position: number;
}

interface Props {
  rest: Player[];
  currentUserId?: string;
}

const TournamentRankingList = ({ rest, currentUserId }: Props) => {
  if (rest.length === 0) return null;

  return (
    <div className="max-w-md mx-auto px-6 space-y-2">
      {rest.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
            player.id === currentUserId
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
            {player.lastRoundScore > 0 && (
              <p className="text-primary-foreground/50 text-[10px]">(+{player.lastRoundScore})</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentRankingList;

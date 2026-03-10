import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Player {
  id: string;
  name: string;
  hermandad: string;
  totalScore: number;
  lastRoundScore: number;
}

interface Props {
  top3: Player[];
}

const TournamentPodium = ({ top3 }: Props) => {
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumMedals = ["🥈", "🥇", "🥉"];

  return (
    <div className="max-w-sm mx-auto px-6 mb-8">
      <div className="flex items-end justify-center gap-3">
        {podiumOrder.map((player, i) => (
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
            {player?.lastRoundScore > 0 && (
              <p className="text-primary-foreground/50 text-[10px]">
                (última: {player.lastRoundScore})
              </p>
            )}
            <div
              className={`w-full ${podiumHeights[i]} mt-2 rounded-t-lg bg-gradient-to-t from-accent/80 to-accent flex items-start justify-center pt-2`}
            >
              <span className="text-2xl">{podiumMedals[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentPodium;

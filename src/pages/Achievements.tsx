import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Trophy, Flame, Star, Target, Award, Zap, Crown, Medal } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  isUnlocked: (profile: any) => boolean;
  requirement: string;
}

const achievements: Achievement[] = [
  {
    id: "streak_3",
    name: "Tres de tres",
    description: "Mantén una racha de 3 días",
    icon: Flame,
    isUnlocked: (profile) => (profile?.best_streak || 0) >= 3,
    requirement: "Racha de 3 días"
  },
  {
    id: "streak_7",
    name: "Constancia",
    description: "Mantén una racha de una semana",
    icon: Flame,
    isUnlocked: (profile) => (profile?.best_streak || 0) >= 7,
    requirement: "Racha de 7 días"
  },
  {
    id: "streak_15",
    name: "Devoto",
    description: "Mantén una racha de quince días",
    icon: Crown,
    isUnlocked: (profile) => (profile?.best_streak || 0) >= 15,
    requirement: "Racha de 15 días"
  },
  {
    id: "streak_30",
    name: "Nazareno",
    description: "Mantén una racha de treinta días",
    icon: Crown,
    isUnlocked: (profile) => (profile?.best_streak || 0) >= 30,
    requirement: "Racha de 30 días"
  },
  {
    id: "points_1000",
    name: "Aprendiz",
    description: "Consigue 1000 puntos totales",
    icon: Star,
    isUnlocked: (profile) => (profile?.total_points || 0) >= 1000,
    requirement: "1000 puntos"
  },
  {
    id: "points_5000",
    name: "Conocedor",
    description: "Consigue 5000 puntos totales",
    icon: Star,
    isUnlocked: (profile) => (profile?.total_points || 0) >= 5000,
    requirement: "5000 puntos"
  },
  {
    id: "points_10000",
    name: "Experto",
    description: "Consigue 10000 puntos totales",
    icon: Award,
    isUnlocked: (profile) => (profile?.total_points || 0) >= 10000,
    requirement: "10000 puntos"
  },
  {
    id: "points_50000",
    name: "Maestro",
    description: "Consigue 50000 puntos totales",
    icon: Crown,
    isUnlocked: (profile) => (profile?.total_points || 0) >= 50000,
    requirement: "50000 puntos"
  },
  {
    id: "games_50",
    name: "Aficionado",
    description: "Juega 50 partidas",
    icon: Target,
    isUnlocked: (profile) => (profile?.games_played || 0) >= 50,
    requirement: "50 partidas"
  },
  {
    id: "games_100",
    name: "Jugador",
    description: "Juega 100 partidas",
    icon: Target,
    isUnlocked: (profile) => (profile?.games_played || 0) >= 100,
    requirement: "100 partidas"
  },
  {
    id: "games_150",
    name: "Veterano",
    description: "Juega 150 partidas",
    icon: Medal,
    isUnlocked: (profile) => (profile?.games_played || 0) >= 150,
    requirement: "150 partidas"
  },
  {
    id: "games_200",
    name: "Leyenda",
    description: "Juega 200 partidas",
    icon: Zap,
    isUnlocked: (profile) => (profile?.games_played || 0) >= 200,
    requirement: "200 partidas"
  }
];

const Achievements = () => {
  const { data: profile, isLoading } = useProfile();

  const unlockedCount = achievements.filter(achievement => 
    profile && achievement.isUnlocked(profile)
  ).length;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Logros</h1>
        </div>
        {!isLoading && (
          <p className="text-center text-sm text-primary-foreground/80 mt-2">
            {unlockedCount} de {achievements.length} desbloqueados
          </p>
        )}
      </header>

      {/* Achievements Grid */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 pt-6 pb-24 w-full">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-24 mx-auto mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const unlocked = achievement.isUnlocked(profile);
              const Icon = achievement.icon;

              return (
                <Card
                  key={achievement.id}
                  className={`p-4 text-center transition-all ${
                    unlocked
                      ? "border-accent/40 shadow-lg bg-gradient-to-br from-accent/10 to-transparent hover:shadow-xl hover:scale-105"
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      unlocked
                        ? "bg-gradient-to-br from-accent to-accent/80 shadow-md"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        unlocked ? "text-accent-foreground" : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  {/* Name */}
                  <h3
                    className={`font-bold text-sm mb-2 ${
                      unlocked ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {achievement.name}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-xs mb-2 ${
                      unlocked ? "text-muted-foreground" : "text-muted-foreground/60"
                    }`}
                  >
                    {achievement.description}
                  </p>

                  {/* Requirement */}
                  <p
                    className={`text-xs font-medium ${
                      unlocked ? "text-accent" : "text-muted-foreground/50"
                    }`}
                  >
                    {unlocked ? "✓ Completado" : achievement.requirement}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Achievements;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, Percent, Calendar, UserPlus, CheckCircle, XCircle } from "lucide-react";

interface StatsData {
  totalUsers: number;
  totalGames: number;
  avgDailyGames: string;
  avgDailyUsers: string;
  allGamesInDb: number;
  abandonedGames: number;
}

interface StatsCardsProps {
  stats: StatsData | undefined;
  avgRetention: string | null;
}

const StatsCards = ({ stats, avgRetention }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-secondary">
            {stats?.totalUsers ?? "..."}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevos/día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-secondary">
            {stats?.avgDailyUsers ?? "..."}
          </p>
          <p className="text-xs opacity-70 mt-1">usuarios/día</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Válidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-secondary">
            {stats?.totalGames ?? "..."}
          </p>
          <p className="text-xs opacity-70 mt-1">completadas</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Abandonadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-secondary">
            {stats?.abandonedGames ?? "..."}
          </p>
          <p className="text-xs opacity-70 mt-1">
            de {stats?.allGamesInDb ?? "..."} totales
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Diarias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-secondary">
            {stats?.avgDailyGames ?? "..."}
          </p>
          <p className="text-xs opacity-70 mt-1">partidas/día</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Retención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-secondary">
            {avgRetention ?? "..."}%
          </p>
          <p className="text-xs opacity-70 mt-1">retención media</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;

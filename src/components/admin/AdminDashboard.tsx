import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gamepad2, Percent, Calendar, UserPlus, CheckCircle, Award, AlertTriangle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";

type TimeRange = "7d" | "30d" | "all";
type RetentionCategory = "high" | "medium" | "low" | "none" | null;

interface UserRetentionInfo {
  id: string;
  name: string;
  hermandad: string;
  daysPlayed: number;
  daysAvailable: number;
  percentage: number;
}



const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [selectedCategory, setSelectedCategory] = useState<RetentionCategory>(null);

  // KPIs principales
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: gamesData } = await supabase
        .from("profiles")
        .select("games_played");

      const totalGames =
        gamesData?.reduce((sum, p) => sum + (p.games_played || 0), 0) || 0;
      // Calcular partidas diarias promedio desde lanzamiento (30 dic 2025)
      // Nota: usamos días de calendario para evitar desfases por hora/zona/DST.
      const LAUNCH_DATE = new Date(2025, 11, 30); // months are 0-indexed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      LAUNCH_DATE.setHours(0, 0, 0, 0);

      // +1 para contar el propio día de lanzamiento
      const daysSinceLaunch = Math.max(
        differenceInCalendarDays(today, LAUNCH_DATE) + 1,
        1
      );
      const avgDailyGames = (totalGames / daysSinceLaunch).toFixed(1);
      const avgDailyUsers = ((totalUsers || 0) / daysSinceLaunch).toFixed(1);

      return { totalUsers: totalUsers || 0, totalGames, avgDailyGames, avgDailyUsers, daysSinceLaunch };
    },
  });

  // Datos temporales para gráfico (usando RPC para evitar límite de 1000 filas)
  const { data: timelineData } = useQuery({
    queryKey: ["admin-dashboard-timeline", timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date | null = null;

      if (timeRange === "7d") {
        startDate = subDays(now, 7);
      } else if (timeRange === "30d") {
        startDate = subDays(now, 30);
      } else {
        // Vista "Todo" desde el 1 de diciembre de 2025
        startDate = new Date(2025, 11, 25);
      }

      // Usar función RPC que calcula estadísticas en el servidor
      const { data, error } = await supabase.rpc('get_daily_activity_stats', {
        p_start_date: startDate?.toISOString().split('T')[0] || null,
        p_end_date: now.toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching timeline data:', error);
        return [];
      }

      // Mapear al formato del gráfico
      return (data || []).map((row: { fecha: string; registros: number; partidas: number }) => ({
        fecha: format(parseISO(row.fecha), "dd MMM", { locale: es }),
        registros: Number(row.registros),
        partidas: Number(row.partidas),
      }));
    },
  });

  // Top hermandades
  const { data: topHermandades } = useQuery({
    queryKey: ["admin-dashboard-hermandades"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("hermandad");

      const counts: Record<string, number> = {};
      data?.forEach((p) => {
        if (p.hermandad) {
          counts[p.hermandad] = (counts[p.hermandad] || 0) + 1;
        }
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nombre, usuarios]) => ({ nombre, usuarios }));
    },
  });

  // Estadísticas de retención (usando RPC para evitar límite de 1000 filas)
  const { data: retentionStats } = useQuery({
    queryKey: ["admin-dashboard-retention"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_retention_stats');

      if (error) {
        console.error('Error fetching retention stats:', error);
        return null;
      }

      // Parsear respuesta JSON del servidor
      const result = data as unknown as {
        launchDate: string;
        counts: { high: number; medium: number; low: number; none: number };
        users: {
          high: UserRetentionInfo[];
          medium: UserRetentionInfo[];
          low: UserRetentionInfo[];
          none: UserRetentionInfo[];
        };
      };

      const totalUsers = 
        result.counts.high + result.counts.medium + result.counts.low + result.counts.none || 1;

      // Ordenar usuarios por días jugados descendente
      const sortByDays = (a: UserRetentionInfo, b: UserRetentionInfo) => 
        (b.daysPlayed || 0) - (a.daysPlayed || 0);
      
      result.users.high?.sort(sortByDays);
      result.users.medium?.sort(sortByDays);
      result.users.low?.sort(sortByDays);
      result.users.none?.sort(sortByDays);

      return {
        launchDate: result.launchDate,
        highRetention: ((result.counts.high / totalUsers) * 100).toFixed(1),
        mediumRetention: ((result.counts.medium / totalUsers) * 100).toFixed(1),
        lowRetention: ((result.counts.low / totalUsers) * 100).toFixed(1),
        noRetention: ((result.counts.none / totalUsers) * 100).toFixed(1),
        counts: { 
          highRetention: result.counts.high, 
          mediumRetention: result.counts.medium, 
          lowRetention: result.counts.low, 
          noRetention: result.counts.none 
        },
        users: result.users,
      };
    },
  });

  const getCategoryTitle = (category: RetentionCategory) => {
    switch (category) {
      case "high": return "Alta Retención (+80%)";
      case "medium": return "Media Retención (50-80%)";
      case "low": return "Baja Retención (20-50%)";
      case "none": return "Muy Baja Retención (<20%)";
      default: return "";
    }
  };

  const getCategoryUsers = (category: RetentionCategory): UserRetentionInfo[] => {
    if (!retentionStats?.users || !category) return [];
    return retentionStats.users[category] || [];
  };

  // Calcular retención media global
  const avgRetention = useMemo(() => {
    if (!retentionStats?.users) return null;
    const allUsers = [
      ...(retentionStats.users.high || []),
      ...(retentionStats.users.medium || []),
      ...(retentionStats.users.low || []),
      ...(retentionStats.users.none || [])
    ];
    if (allUsers.length === 0) return "0";
    const sumPercentages = allUsers.reduce((sum, u) => sum + u.percentage, 0);
    return (sumPercentages / allUsers.length).toFixed(1);
  }, [retentionStats]);

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const medalEmojis = ["🥇", "🥈", "🥉"];

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs en grid 2x2 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <Gamepad2 className="h-4 w-4" />
              Partidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">
              {stats?.totalGames ?? "..."}
            </p>
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
      </div>

      {/* Gráfico de líneas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Actividad</CardTitle>
              <div className="flex gap-1">
                {(["7d", "30d", "all"] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="text-xs px-3"
                  >
                    {range === "7d" ? "7 días" : range === "30d" ? "30 días" : "Todo"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="registros"
                    name="Nuevos registros"
                    stroke="#E4B229"
                    strokeWidth={2}
                    dot={{ fill: "#E4B229" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="partidas"
                    name="Partidas jugadas"
                    stroke="#4B2B8A"
                    strokeWidth={2}
                    dot={{ fill: "#4B2B8A" }}
                  />
                  {timelineData && timelineData.length > 0 && stats?.avgDailyGames && (
                    <ReferenceLine
                      y={+stats.avgDailyGames}
                      stroke="#4B2B8A"
                      strokeWidth={1}
                      strokeOpacity={0.4}
                      strokeDasharray="6 3"
                      label={{ value: `Promedio: ${stats.avgDailyGames}`, position: "right", fontSize: 10, fill: "#4B2B8A", opacity: 0.6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Hermandades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topHermandades?.map((h, index) => (
            <Card
              key={h.nombre}
              style={{
                borderColor: medalColors[index],
                borderWidth: "2px",
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">{medalEmojis[index]}</span>
                  {h.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-foreground">
                  {h.usuarios}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    usuarios
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estadísticas de Retención */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📊 Retención de Usuarios
              <span className="text-sm font-normal text-muted-foreground">
                (% calculado desde registro de cada usuario)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Alta retención (+80%) */}
              <button 
                onClick={() => setSelectedCategory("high")}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center hover:bg-green-500/20 transition-colors cursor-pointer"
              >
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{retentionStats?.highRetention}%</p>
                <p className="text-xs text-muted-foreground">+80%</p>
                <p className="text-sm font-medium mt-1">{retentionStats?.counts.highRetention} usuarios</p>
              </button>

              {/* Media retención (50-80%) */}
              <button 
                onClick={() => setSelectedCategory("medium")}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center hover:bg-yellow-500/20 transition-colors cursor-pointer"
              >
                <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{retentionStats?.mediumRetention}%</p>
                <p className="text-xs text-muted-foreground">50-80%</p>
                <p className="text-sm font-medium mt-1">{retentionStats?.counts.mediumRetention} usuarios</p>
              </button>

              {/* Baja retención (<50%) */}
              <button 
                onClick={() => setSelectedCategory("low")}
                className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center hover:bg-orange-500/20 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{retentionStats?.lowRetention}%</p>
                <p className="text-xs text-muted-foreground">20-50%</p>
                <p className="text-sm font-medium mt-1">{retentionStats?.counts.lowRetention} usuarios</p>
              </button>

              {/* Sin retención (0-1 partida) */}
              <button 
                onClick={() => setSelectedCategory("none")}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{retentionStats?.noRetention}%</p>
                <p className="text-xs text-muted-foreground">&lt;20%</p>
                <p className="text-sm font-medium mt-1">{retentionStats?.counts.noRetention} usuarios</p>
              </button>
            </div>

            {/* Dialog para ver usuarios de categoría */}
            <Dialog open={selectedCategory !== null} onOpenChange={(open) => !open && setSelectedCategory(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{getCategoryTitle(selectedCategory)}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-2">
                    {getCategoryUsers(selectedCategory).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No hay usuarios en esta categoría</p>
                    ) : (
                      getCategoryUsers(selectedCategory).map((user, idx) => (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm w-6">{idx + 1}.</span>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.hermandad}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{user.daysPlayed}/{user.daysAvailable} días</p>
                            <p className="text-xs text-muted-foreground">{user.percentage.toFixed(0)}%</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
    </div>
  );
};

export default AdminDashboard;

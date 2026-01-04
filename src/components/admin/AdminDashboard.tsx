import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gamepad2, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type TimeRange = "7d" | "30d" | "all";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

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
      const avgGames = totalUsers ? (totalGames / totalUsers).toFixed(2) : "0";

      return { totalUsers: totalUsers || 0, totalGames, avgGames };
    },
  });

  // Datos temporales para gráfico
  const { data: timelineData } = useQuery({
    queryKey: ["admin-dashboard-timeline", timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date | null = null;

      if (timeRange === "7d") {
        startDate = subDays(now, 7);
      } else if (timeRange === "30d") {
        startDate = subDays(now, 30);
      }

      // Obtener todos los perfiles para registros
      const profilesQuery = supabase.from("profiles").select("created_at");
      if (startDate) {
        profilesQuery.gte("created_at", startDate.toISOString());
      }
      const { data: profiles } = await profilesQuery;

      // Obtener todas las partidas
      const gamesQuery = supabase.from("games").select("created_at, user_id");
      if (startDate) {
        gamesQuery.gte("created_at", startDate.toISOString());
      }
      const { data: games } = await gamesQuery;

      // Agrupar por día
      const dailyData: Record<
        string,
        { registros: number; partidas: number; usuariosActivos: Set<string> }
      > = {};

      profiles?.forEach((p) => {
        const day = format(parseISO(p.created_at), "yyyy-MM-dd");
        if (!dailyData[day]) {
          dailyData[day] = { registros: 0, partidas: 0, usuariosActivos: new Set() };
        }
        dailyData[day].registros++;
      });

      games?.forEach((g) => {
        const day = format(parseISO(g.created_at), "yyyy-MM-dd");
        if (!dailyData[day]) {
          dailyData[day] = { registros: 0, partidas: 0, usuariosActivos: new Set() };
        }
        dailyData[day].partidas++;
        dailyData[day].usuariosActivos.add(g.user_id);
      });

      // Convertir a array ordenado
      const sortedDays = Object.keys(dailyData).sort();
      return sortedDays.map((day) => ({
        fecha: format(parseISO(day), "dd MMM", { locale: es }),
        registros: dailyData[day].registros,
        partidas: dailyData[day].partidas,
        activos: dailyData[day].usuariosActivos.size,
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

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const medalEmojis = ["🥇", "🥈", "🥉"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
      {/* KPIs columna izquierda */}
      <div className="flex flex-col gap-4">
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
              <TrendingUp className="h-4 w-4" />
              Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">
              {stats?.avgGames ?? "..."}
            </p>
            <p className="text-xs opacity-70 mt-1">partidas/usuario</p>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha: Gráfico + Top 3 */}
      <div className="flex flex-col gap-6">
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
                  <Line
                    type="monotone"
                    dataKey="activos"
                    name="Usuarios activos"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981" }}
                  />
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
              className="relative overflow-hidden"
              style={{
                borderColor: medalColors[index],
                borderWidth: "2px",
              }}
            >
              <div
                className="absolute top-0 right-0 w-16 h-16 opacity-10"
                style={{ backgroundColor: medalColors[index] }}
              />
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
      </div>
    </div>
  );
};

export default AdminDashboard;

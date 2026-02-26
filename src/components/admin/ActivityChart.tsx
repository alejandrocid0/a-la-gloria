import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import type { TimeRange } from "./adminTypes";

interface ActivityChartProps {
  avgDailyGames: string | undefined;
}

const ActivityChart = ({ avgDailyGames }: ActivityChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const { data: timelineData } = useQuery({
    queryKey: ["admin-dashboard-timeline", timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;

      if (timeRange === "7d") {
        startDate = subDays(now, 7);
      } else if (timeRange === "30d") {
        startDate = subDays(now, 30);
      } else {
        startDate = new Date(2025, 11, 25);
      }

      const { data, error } = await supabase.rpc("get_daily_activity_stats", {
        p_start_date: startDate.toISOString().split("T")[0],
        p_end_date: now.toISOString().split("T")[0],
      });

      if (error) {
        console.error("Error fetching timeline data:", error);
        return [];
      }

      return (data || []).map((row: { fecha: string; registros: number; partidas: number }) => ({
        fecha: format(parseISO(row.fecha), "dd MMM", { locale: es }),
        registros: Number(row.registros),
        partidas: Number(row.partidas),
      }));
    },
  });


  const totalRegistros = useMemo(() => (timelineData || []).reduce((sum, d) => sum + d.registros, 0), [timelineData]);
  const totalPartidas = useMemo(() => (timelineData || []).reduce((sum, d) => sum + d.partidas, 0), [timelineData]);

  return (
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
              <Line type="monotone" dataKey="registros" name="Nuevos registros" stroke="#E4B229" strokeWidth={2} dot={{ fill: "#E4B229" }} />
              <Line type="monotone" dataKey="partidas" name="Partidas jugadas" stroke="#4B2B8A" strokeWidth={2} dot={{ fill: "#4B2B8A" }} />
              {timelineData && timelineData.length > 0 && avgDailyGames && (
                <ReferenceLine
                  y={+avgDailyGames}
                  stroke="#4B2B8A"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeDasharray="6 3"
                  label={{ value: `Promedio: ${avgDailyGames}`, position: "right", fontSize: 10, fill: "#4B2B8A", opacity: 0.6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {timeRange !== "all" && timelineData && timelineData.length > 0 && (
          <div className="flex justify-center gap-4 mt-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "rgba(228,178,41,0.12)", color: "#E4B229" }}>
              👤 {totalRegistros} nuevos registros
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "rgba(75,43,138,0.12)", color: "#4B2B8A" }}>
              🎮 {totalPartidas} partidas jugadas
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityChart;

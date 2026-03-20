import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import type { TimeRange } from "./adminTypes";

const calcPctChange = (current: number, previous: number): { label: string; color: string } => {
  if (previous === 0 && current === 0) return { label: "0%", color: "#9ca3af" };
  if (previous === 0) return { label: "+100%", color: "#22c55e" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return { label: `+${pct}%`, color: "#22c55e" };
  if (pct < 0) return { label: `${pct}%`, color: "#ef4444" };
  return { label: "0%", color: "#9ca3af" };
};

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

  const { data: prevTimelineData } = useQuery({
    queryKey: ["admin-dashboard-timeline-prev", timeRange],
    enabled: timeRange !== "all",
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (timeRange === "7d") {
        startDate = subDays(now, 14);
        endDate = subDays(now, 7);
      } else {
        startDate = subDays(now, 60);
        endDate = subDays(now, 30);
      }

      const { data, error } = await supabase.rpc("get_daily_activity_stats", {
        p_start_date: startDate.toISOString().split("T")[0],
        p_end_date: endDate.toISOString().split("T")[0],
      });

      if (error) {
        console.error("Error fetching prev timeline data:", error);
        return [];
      }

      return (data || []).map((row: { fecha: string; registros: number; partidas: number }) => ({
        registros: Number(row.registros),
        partidas: Number(row.partidas),
      }));
    },
  });

  const totalRegistros = useMemo(() => (timelineData || []).reduce((sum, d) => sum + d.registros, 0), [timelineData]);
  const totalPartidas = useMemo(() => (timelineData || []).reduce((sum, d) => sum + d.partidas, 0), [timelineData]);
  const prevTotalRegistros = useMemo(() => (prevTimelineData || []).reduce((sum, d) => sum + d.registros, 0), [prevTimelineData]);
  const prevTotalPartidas = useMemo(() => (prevTimelineData || []).reduce((sum, d) => sum + d.partidas, 0), [prevTimelineData]);

  const regChange = calcPctChange(totalRegistros, prevTotalRegistros);
  const parChange = calcPctChange(totalPartidas, prevTotalPartidas);

  const chartData = useMemo(() => {
    if (timeRange !== "all" || !timelineData) return timelineData || [];
    let sumP = 0, sumR = 0;
    return timelineData.map((row, i) => {
      sumP += row.partidas;
      sumR += row.registros;
      return { ...row, avgPartidas: +(sumP / (i + 1)).toFixed(1), avgRegistros: +(sumR / (i + 1)).toFixed(1) };
    });
  }, [timelineData, timeRange]);

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
            <LineChart data={chartData}>
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
              
              <Line type="monotone" dataKey="registros" name="Nuevos registros" stroke="#E4B229" strokeWidth={2} dot={{ fill: "#E4B229" }} />
              <Line type="monotone" dataKey="partidas" name="Partidas jugadas" stroke="#4B2B8A" strokeWidth={2} dot={{ fill: "#4B2B8A" }} />
              {timeRange === "all" && (
                <>
                  <Line type="monotone" dataKey="avgRegistros" name="Media registros" stroke="#E4B229" strokeWidth={1.5} strokeDasharray="6 3" strokeOpacity={0.5} dot={false} />
                  <Line type="monotone" dataKey="avgPartidas" name="Media partidas" stroke="#4B2B8A" strokeWidth={1.5} strokeDasharray="6 3" strokeOpacity={0.5} dot={false} />
                </>
              )}
              {timeRange !== "all" && timelineData && timelineData.length > 0 && avgDailyGames && (
                <ReferenceLine
                  y={+avgDailyGames}
                  stroke="#4B2B8A"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeDasharray="6 3"
                  label={{ value: `Promedio: ${avgDailyGames}`, position: "right", fontSize: 10, fill: "#4B2B8A", opacity: 0.6 }}
                />
              )}
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {timeRange !== "all" && timelineData && timelineData.length > 0 && (
          <div className="flex justify-center gap-4 mt-3 text-xs font-semibold">
            <span style={{ color: "#E4B229" }}>
              {totalRegistros} nuevos registros <span style={{ color: regChange.color }}>({regChange.label})</span>
            </span>
            <span style={{ color: "#9ca3af" }}>·</span>
            <span style={{ color: "#4B2B8A" }}>
              {totalPartidas} partidas jugadas <span style={{ color: parChange.color }}>({parChange.label})</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityChart;

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
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

const RANGE_LABELS: Record<TimeRange, string> = {
  "7d": "7 días",
  "30d": "30 días",
  all: "Todo",
  monthly: "Mensual",
};

const ActivityChart = ({ avgDailyGames }: ActivityChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const isMonthly = timeRange === "monthly";
  const fetchAll = timeRange === "all" || isMonthly;

  const { data: timelineData } = useQuery({
    queryKey: ["admin-dashboard-timeline", fetchAll ? "all" : timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;

      if (timeRange === "7d") {
        startDate = subDays(now, 7);
      } else if (timeRange === "30d") {
        startDate = subDays(now, 30);
      } else {
        startDate = new Date(2025, 11, 29);
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
        fecha: row.fecha,
        registros: Number(row.registros),
        partidas: Number(row.partidas),
      }));
    },
  });

  const { data: prevTimelineData } = useQuery({
    queryKey: ["admin-dashboard-timeline-prev", timeRange],
    enabled: timeRange === "7d" || timeRange === "30d",
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

  const chartData = useMemo(() => {
    if (!timelineData) return [];

    if (isMonthly) {
      const grouped: Record<string, { fecha: string; registros: number; partidas: number }> = {};
      for (const row of timelineData) {
        const d = parseISO(row.fecha);
        // Merge Dec 2025 into Jan 2026
        const monthKey =
          d.getFullYear() === 2025 && d.getMonth() === 11
            ? "ene 2026"
            : format(d, "MMM yyyy", { locale: es });
        if (!grouped[monthKey]) grouped[monthKey] = { fecha: monthKey, registros: 0, partidas: 0 };
        grouped[monthKey].registros += row.registros;
        grouped[monthKey].partidas += row.partidas;
      }
      return Object.values(grouped);
    }

    return timelineData.map((row) => ({
      ...row,
      fecha: format(parseISO(row.fecha), "dd MMM", { locale: es }),
    }));
  }, [timelineData, isMonthly]);

  const totalRegistros = useMemo(() => (timelineData || []).reduce((sum, d) => sum + d.registros, 0), [timelineData]);
  const totalPartidas = useMemo(() => (timelineData || []).reduce((sum, d) => sum + d.partidas, 0), [timelineData]);
  const prevTotalRegistros = useMemo(() => (prevTimelineData || []).reduce((sum, d) => sum + d.registros, 0), [prevTimelineData]);
  const prevTotalPartidas = useMemo(() => (prevTimelineData || []).reduce((sum, d) => sum + d.partidas, 0), [prevTimelineData]);

  const regChange = calcPctChange(totalRegistros, prevTotalRegistros);
  const parChange = calcPctChange(totalPartidas, prevTotalPartidas);

  const showComparison = (timeRange === "7d" || timeRange === "30d") && chartData.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Actividad</CardTitle>
          <div className="flex gap-1">
            {(["7d", "30d", "all", "monthly"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs px-3"
              >
                {RANGE_LABELS[range]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            {isMonthly ? (
              <BarChart data={chartData}>
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
                <Bar dataKey="registros" name="Nuevos registros" fill="#E4B229" radius={[4, 4, 0, 0]} />
                <Bar dataKey="partidas" name="Partidas jugadas" fill="#4B2B8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
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
                {chartData.length > 0 && avgDailyGames && (
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
            )}
          </ResponsiveContainer>
        </div>
        {showComparison && (
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

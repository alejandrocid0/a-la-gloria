import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Award, AlertTriangle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RetentionCategory, UserRetentionInfo } from "./adminTypes";

interface RetentionSectionProps {
  onAvgRetentionChange?: (avg: string | null) => void;
}

const RetentionSection = ({ onAvgRetentionChange }: RetentionSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<RetentionCategory>(null);

  const { data: retentionStats } = useQuery({
    queryKey: ["admin-dashboard-retention"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_retention_stats");

      if (error) {
        console.error("Error fetching retention stats:", error);
        return null;
      }

      const result = data as unknown as {
        launchDate: string;
        counts: { high: number; medium: number; low: number; none: number; inactive: number };
        users: {
          high: UserRetentionInfo[];
          medium: UserRetentionInfo[];
          low: UserRetentionInfo[];
          none: UserRetentionInfo[];
          inactive: UserRetentionInfo[];
        };
      };

      const totalUsers =
        result.counts.high + result.counts.medium + result.counts.low + result.counts.none + result.counts.inactive || 1;

      const sortByDays = (a: UserRetentionInfo, b: UserRetentionInfo) =>
        (b.daysPlayed || 0) - (a.daysPlayed || 0);

      result.users.high?.sort(sortByDays);
      result.users.medium?.sort(sortByDays);
      result.users.low?.sort(sortByDays);
      result.users.none?.sort(sortByDays);
      result.users.inactive?.sort(sortByDays);

      return {
        launchDate: result.launchDate,
        highRetention: ((result.counts.high / totalUsers) * 100).toFixed(1),
        mediumRetention: ((result.counts.medium / totalUsers) * 100).toFixed(1),
        lowRetention: ((result.counts.low / totalUsers) * 100).toFixed(1),
        noRetention: ((result.counts.none / totalUsers) * 100).toFixed(1),
        inactiveRetention: ((result.counts.inactive / totalUsers) * 100).toFixed(1),
        counts: {
          highRetention: result.counts.high,
          mediumRetention: result.counts.medium,
          lowRetention: result.counts.low,
          noRetention: result.counts.none,
          inactiveRetention: result.counts.inactive,
        },
        users: result.users,
      };
    },
  });

  // Usuarios con 0-1 partidas jugadas (baja actividad)
  const lowActivityUsers = useMemo(() => {
    if (!retentionStats?.users) return [];
    const all = [
      ...(retentionStats.users.high || []),
      ...(retentionStats.users.medium || []),
      ...(retentionStats.users.low || []),
      ...(retentionStats.users.none || []),
      ...(retentionStats.users.inactive || []),
    ];
    return all.filter(u => (u.gamesPlayed ?? 0) <= 1);
  }, [retentionStats]);

  const exportLowActivityCSV = () => {
    const csv = "Nombre,Correo\n" + lowActivityUsers.map(u => `"${u.name}","${u.email}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "baja_actividad.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calcular retención media y notificar al padre
  const avgRetention = useMemo(() => {
    if (!retentionStats?.users) return null;
    const allUsers = [
      ...(retentionStats.users.high || []),
      ...(retentionStats.users.medium || []),
      ...(retentionStats.users.low || []),
      ...(retentionStats.users.none || []),
      ...(retentionStats.users.inactive || []),
    ];
    if (allUsers.length === 0) return "0";
    const sumPercentages = allUsers.reduce((sum, u) => sum + u.percentage, 0);
    return (sumPercentages / allUsers.length).toFixed(1);
  }, [retentionStats]);

  useEffect(() => {
    onAvgRetentionChange?.(avgRetention);
  }, [avgRetention, onAvgRetentionChange]);

  const getCategoryTitle = (category: RetentionCategory) => {
    switch (category) {
      case "high": return "Alta Retención (+80%)";
      case "medium": return "Media Retención (50-80%)";
      case "low": return "Baja Retención (20-50%)";
      case "none": return "Muy Baja Retención (<20%)";
      case "inactive": return "Inactivos (0 partidas)";
      default: return "";
    }
  };

  const getCategoryUsers = (category: RetentionCategory): UserRetentionInfo[] => {
    if (!retentionStats?.users || !category) return [];
    return retentionStats.users[category] || [];
  };

  const exportCSV = (category: RetentionCategory) => {
    const users = getCategoryUsers(category);
    const csv = "Nombre,Correo\n" + users.map((u) => `"${u.name}","${u.email}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retencion_${category}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Alta retención (+80%) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory("high")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCategory("high"); }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center hover:bg-green-500/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{retentionStats?.highRetention}%</p>
              <p className="text-xs text-muted-foreground">+80%</p>
              <p className="text-sm font-medium mt-1">{retentionStats?.counts.highRetention} usuarios</p>
            </div>

            {/* Media retención (50-80%) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory("medium")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCategory("medium"); }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center hover:bg-yellow-500/20 transition-colors cursor-pointer"
            >
              <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{retentionStats?.mediumRetention}%</p>
              <p className="text-xs text-muted-foreground">50-80%</p>
              <p className="text-sm font-medium mt-1">{retentionStats?.counts.mediumRetention} usuarios</p>
            </div>

            {/* Baja retención (20-50%) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory("low")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCategory("low"); }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center hover:bg-orange-500/20 transition-colors cursor-pointer"
            >
              <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{retentionStats?.lowRetention}%</p>
              <p className="text-xs text-muted-foreground">20-50%</p>
              <p className="text-sm font-medium mt-1">{retentionStats?.counts.lowRetention} usuarios</p>
            </div>

            {/* Sin retención (<20%) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory("none")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCategory("none"); }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{retentionStats?.noRetention}%</p>
              <p className="text-xs text-muted-foreground">&lt;20%</p>
              <p className="text-sm font-medium mt-1">{retentionStats?.counts.noRetention} usuarios</p>
            </div>

            {/* Inactivos (0 partidas) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory("inactive")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCategory("inactive"); }}
              className="bg-red-900/10 border border-red-900/30 rounded-lg p-4 text-center hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <XCircle className="h-6 w-6 text-red-900 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{retentionStats?.inactiveRetention}%</p>
              <p className="text-xs text-muted-foreground">0 partidas</p>
              <p className="text-sm font-medium mt-1">{retentionStats?.counts.inactiveRetention} usuarios</p>
            </div>
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
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
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

      {/* Exportar lista de correos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Exportar lista de correos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button onClick={() => exportCSV("high")} className="px-3 py-2 rounded-md border border-secondary text-sm hover:bg-muted transition-colors" aria-label="Descargar CSV alta retención">
              Alta ({retentionStats?.counts.highRetention})
            </button>
            <button onClick={() => exportCSV("medium")} className="px-3 py-2 rounded-md border border-secondary text-sm hover:bg-muted transition-colors" aria-label="Descargar CSV media retención">
              Media ({retentionStats?.counts.mediumRetention})
            </button>
            <button onClick={() => exportCSV("low")} className="px-3 py-2 rounded-md border border-secondary text-sm hover:bg-muted transition-colors" aria-label="Descargar CSV baja retención">
              Baja ({retentionStats?.counts.lowRetention})
            </button>
            <button onClick={() => exportCSV("none")} className="px-3 py-2 rounded-md border border-secondary text-sm hover:bg-muted transition-colors" aria-label="Descargar CSV sin retención">
              Muy baja ({retentionStats?.counts.noRetention})
            </button>
            <button onClick={() => exportCSV("inactive")} className="px-3 py-2 rounded-md border border-secondary text-sm hover:bg-muted transition-colors" aria-label="Descargar CSV inactivos">
              Inactivos ({retentionStats?.counts.inactiveRetention})
            </button>
            <button onClick={exportLowActivityCSV} className="px-3 py-2 rounded-md border border-primary text-sm hover:bg-primary/10 transition-colors font-medium" aria-label="Descargar CSV jugadores con 0-1 partidas">
              0-1 partidas ({lowActivityUsers.length})
            </button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default RetentionSection;

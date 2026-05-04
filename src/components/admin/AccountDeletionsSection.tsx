import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DeletionRow {
  id: string;
  deleted_user_id: string;
  name: string | null;
  email: string | null;
  hermandad: string | null;
  total_points: number | null;
  games_played: number | null;
  deleted_at: string;
}

const AccountDeletionsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["account-deletions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_deletions")
        .select("*")
        .order("deleted_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as DeletionRow[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          Cuentas eliminadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay eliminaciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Hermandad</th>
                  <th className="py-2 pr-3 text-right">Puntos</th>
                  <th className="py-2 pr-3 text-right">Partidas</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {format(new Date(row.deleted_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </td>
                    <td className="py-2 pr-3">{row.name ?? "—"}</td>
                    <td className="py-2 pr-3">{row.email ?? "—"}</td>
                    <td className="py-2 pr-3">{row.hermandad ?? "—"}</td>
                    <td className="py-2 pr-3 text-right">{row.total_points ?? 0}</td>
                    <td className="py-2 pr-3 text-right">{row.games_played ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDeletionsSection;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["account-deletions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_deletions")
        .select("*")
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DeletionRow[];
    },
  });

  const total = data?.length ?? 0;
  const label =
    total === 0
      ? "Cero cuentas eliminadas"
      : `${total} cuenta${total === 1 ? "" : "s"} eliminada${total === 1 ? "" : "s"}`;

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            Cuentas eliminadas
            <span className="text-sm font-normal text-muted-foreground">
              ({label})
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cuentas eliminadas ({total})</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="flex flex-col gap-2">
              {total === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay eliminaciones registradas.
                </p>
              ) : (
                data!.map((row, index) => (
                  <Card key={row.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {index + 1}. {row.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {row.email ?? "—"}
                        </p>
                        {row.hermandad && (
                          <p className="text-xs text-muted-foreground truncate">
                            {row.hermandad}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        <p>{format(new Date(row.deleted_at), "dd/MM/yyyy", { locale: es })}</p>
                        <p>
                          {row.total_points ?? 0} pts · {row.games_played ?? 0} part.
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountDeletionsSection;

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Registration {
  id: string;
  tournament_id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentName: string;
}

const csvEscape = (v: string | null | undefined) => {
  const s = (v ?? "").toString();
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const TournamentRegistrationsDialog = ({ open, onOpenChange, tournamentId, tournamentName }: Props) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["tournament-registrations", tournamentId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tournament_registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament-registrations", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournament-registration-counts"] });
      toast.success("Inscripción eliminada");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        (r.apellidos || "").toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.telefono || "").toLowerCase().includes(q)
    );
  }, [registrations, search]);

  const exportCsv = () => {
    const headers = ["nombre", "apellidos", "email", "telefono", "mensaje", "torneo_id", "created_at"];
    const rows = registrations.map((r) =>
      [r.nombre, r.apellidos ?? "", r.email, r.telefono ?? "", r.mensaje ?? "", r.tournament_id, r.created_at]
        .map(csvEscape)
        .join(",")
    );
    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = tournamentName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    a.href = url;
    a.download = `inscripciones-${safeName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Inscritos al torneo</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{tournamentName}</span>
            {" · "}
            {registrations.length} {registrations.length === 1 ? "inscripción" : "inscripciones"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellidos, email o teléfono…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={exportCsv}
            disabled={registrations.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="overflow-auto border rounded-lg flex-1">
          {isLoading ? (
            <p className="p-6 text-center text-muted-foreground">Cargando…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              {registrations.length === 0 ? "Aún no hay inscripciones." : "No hay resultados."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left">
                  <th className="p-3 font-semibold">Nombre</th>
                  <th className="p-3 font-semibold">Apellidos</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Teléfono</th>
                  <th className="p-3 font-semibold">Mensaje</th>
                  <th className="p-3 font-semibold">Fecha</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-accent/30">
                    <td className="p-3 font-medium">{r.nombre}</td>
                    <td className="p-3">{r.apellidos || "—"}</td>
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.telefono || "—"}</td>
                    <td className="p-3 max-w-[240px] truncate" title={r.mensaje || ""}>
                      {r.mensaje || "—"}
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {format(new Date(r.created_at), "dd/MM/yy HH:mm")}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(`¿Eliminar inscripción de ${r.nombre}?`)) {
                            deleteMutation.mutate(r.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        aria-label="Eliminar inscripción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentRegistrationsDialog;

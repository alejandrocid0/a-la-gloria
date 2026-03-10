import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Swords, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface JoinTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillCode?: string;
  onJoined?: () => void;
}

const JoinTournamentDialog = ({ open, onOpenChange, prefillCode = "", onJoined }: JoinTournamentDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState(prefillCode);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!user || !code.trim()) return;
    setLoading(true);

    try {
      // Find tournament by join_code
      const { data: tournament, error: findError } = await supabase
        .from("tournaments")
        .select("id, status, name")
        .eq("join_code", code.trim())
        .maybeSingle();

      if (findError || !tournament) {
        toast.error("Código no válido. Revisa e inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (tournament.status === "completed") {
        toast.error("Este torneo ya ha finalizado.");
        setLoading(false);
        return;
      }

      // Check if already joined
      const { data: existing } = await supabase
        .from("tournament_participants")
        .select("id")
        .eq("tournament_id", tournament.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        toast.info("Ya estás inscrito en este torneo.");
        setLoading(false);
        onOpenChange(false);
        return;
      }

      // Insert participant
      const { error: insertError } = await supabase
        .from("tournament_participants")
        .insert({ tournament_id: tournament.id, user_id: user.id });

      if (insertError) {
        toast.error("No se pudo unirse al torneo. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      toast.success(`¡Te has unido a "${tournament.name}"!`);
      queryClient.invalidateQueries({ queryKey: ["my-tournament-participations"] });
      queryClient.invalidateQueries({ queryKey: ["tournament-participant-counts"] });
      onJoined?.();
      onOpenChange(false);
      setCode("");
    } catch {
      toast.error("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-xl">
        <DialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Swords className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-cinzel text-xl text-foreground">
            UNIRSE A TORNEO
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Introduce el código de acceso que te han proporcionado para unirte al torneo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: ABC123"
            className="text-center text-lg tracking-widest h-12"
            maxLength={20}
            aria-label="Código de acceso al torneo"
          />
          <Button
            variant="cta"
            className="w-full"
            aria-label="Unirme al torneo"
            onClick={handleJoin}
            disabled={loading || !code.trim()}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Unirme al torneo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTournamentDialog;

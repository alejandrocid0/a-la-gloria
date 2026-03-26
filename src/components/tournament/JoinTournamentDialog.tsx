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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [code, setCode] = useState(prefillCode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setCode(prefillCode);
  }, [open, prefillCode]);

  const handleJoin = async () => {
    if (!user || !code.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("join_tournament_by_code", {
        p_code: code.trim(),
      });

      if (error) {
        toast.error("Error inesperado. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      const result = data as { error?: string; success?: boolean; tournament_id?: string; tournament_name?: string };

      if (result.error === "invalid_code") {
        toast.error("Código no válido. Revisa e inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      if (result.error === "tournament_completed") {
        toast.error("Este torneo ya ha finalizado.");
        setLoading(false);
        return;
      }

      if (result.error === "already_joined") {
        toast.info("Ya estás inscrito en este torneo.");
        setLoading(false);
        onOpenChange(false);
        return;
      }

      toast.success(`¡Te has unido a "${result.tournament_name}"!`);
      queryClient.invalidateQueries({ queryKey: ["my-tournament-participations"] });
      queryClient.invalidateQueries({ queryKey: ["tournament-participant-counts"] });
      onJoined?.();
      onOpenChange(false);
      setCode("");
      navigate(`/torneo/${result.tournament_id}/ranking`);
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

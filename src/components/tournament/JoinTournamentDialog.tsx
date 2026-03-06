import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";

interface JoinTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinTournamentDialog = ({ open, onOpenChange }: JoinTournamentDialogProps) => {
  // TODO: conectar a Supabase aquí
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
            placeholder="Ej: 123 452"
            className="text-center text-lg tracking-widest h-12"
            maxLength={10}
            aria-label="Código de acceso al torneo"
          />
          <Button variant="cta" className="w-full" aria-label="Unirme al torneo">
            Unirme al torneo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTournamentDialog;

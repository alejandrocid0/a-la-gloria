import { useEffect, useState } from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const inscripcionSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio (mínimo 2 caracteres)").max(100),
  apellidos: z.string().trim().min(2, "Los apellidos son obligatorios (mínimo 2 caracteres)").max(100),
  email: z.string().trim().email("Email no válido").max(255).toLowerCase(),
  telefono: z
    .string()
    .trim()
    .min(6, "El teléfono es obligatorio")
    .max(30, "Teléfono demasiado largo")
    .regex(/^[+\d\s().-]+$/, "Teléfono no válido"),
  mensaje: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentName: string;
}

const InscripcionTorneoDialog = ({ open, onOpenChange, tournamentId, tournamentName }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prefill desde profiles cuando se abre
  useEffect(() => {
    if (!open || !user) return;
    setEmail((prev) => prev || user.email || "");
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setNombre((prev) => prev || data.name);
      });
  }, [open, user]);

  const reset = () => {
    setNombre("");
    setApellidos("");
    setEmail("");
    setTelefono("");
    setMensaje("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inscripcionSchema.safeParse({ nombre, apellidos, email, telefono, mensaje });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id: tournamentId,
        user_id: user?.id ?? null,
        nombre: parsed.data.nombre,
        apellidos: parsed.data.apellidos,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        mensaje: parsed.data.mensaje || null,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("Ya estás inscrito en este torneo con ese email.");
          return;
        }
        throw error;
      }
      toast.success(`¡Inscripción enviada al torneo "${tournamentName}"!`);
      queryClient.invalidateQueries({ queryKey: ["my-tournament-registrations"] });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Error al enviar la inscripción");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cinzel">Inscribirse al torneo</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{tournamentName}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ins-nombre">Nombre *</Label>
            <Input
              id="ins-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ins-apellidos">Apellidos *</Label>
            <Input
              id="ins-apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ins-email">Email *</Label>
            <Input
              id="ins-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ins-telefono">Teléfono *</Label>
            <Input
              id="ins-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              maxLength={30}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ins-mensaje">Mensaje (opcional)</Label>
            <Textarea
              id="ins-mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="¿Quieres añadir algo?"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
            >
              {submitting ? "Enviando..." : "Confirmar inscripción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InscripcionTorneoDialog;

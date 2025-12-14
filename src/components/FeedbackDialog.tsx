import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const FeedbackDialog = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          message: message.trim(),
        });

      if (error) throw error;

      setSubmitted(true);
      setMessage("");
      
      // Cerrar después de mostrar confirmación
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Error al enviar tu sugerencia. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="xl"
          className="w-full border-[hsl(45,71%,65%)] border-2 bg-white hover:bg-[hsl(45,71%,65%)]/10 text-foreground font-bold shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)]"
        >
          <MessageSquarePlus className="w-5 h-5 mr-2" />
          Buzón de sugerencias
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-semibold text-center">¡Gracias por tu feedback!</p>
            <p className="text-muted-foreground text-center">Tu sugerencia nos ayuda a mejorar</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-accent" />
                Buzón de sugerencias
              </DialogTitle>
              <DialogDescription>
                Cuéntanos qué podemos mejorar, reporta errores o comparte tus ideas. ¡Tu opinión es muy valiosa!
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Escribe tu sugerencia, feedback o reporte de error aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {message.length}/1000 caracteres
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar sugerencia
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

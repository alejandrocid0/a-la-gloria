import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Mail, BookOpen, Trophy, Calendar, Send, Smartphone, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const contactSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre debe tener menos de 50 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Email demasiado largo"),
  message: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000, "El mensaje debe tener menos de 1000 caracteres"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Acerca = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    // Crear mailto link con los datos del formulario
    const subject = encodeURIComponent(`Contacto de ${data.name}`);
    const body = encodeURIComponent(
      `Nombre: ${data.name}\nEmail: ${data.email}\n\nMensaje:\n${data.message}`
    );
    const mailtoLink = `mailto:alagloria2025@gmail.com?subject=${subject}&body=${body}`;
    
    // Abrir cliente de email
    window.location.href = mailtoLink;
    
    // Limpiar formulario y mostrar mensaje
    reset();
    toast.success("Cliente de email abierto. ¡Gracias por tu mensaje!");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Acerca del Proyecto</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-8 space-y-6 w-full pb-24">
        {/* Instalar PWA */}
        <Card 
          className="p-6 border-accent/20 shadow-lg cursor-pointer hover:shadow-xl hover:border-accent/40 transition-all duration-300 bg-gradient-to-br from-accent/10 to-transparent"
          onClick={() => navigate('/instalar')}
        >
          <div className="flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">¿Cómo instalar A la Gloria?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                Instala la aplicación en tu dispositivo móvil para acceder rápidamente y disfrutar de una 
                experiencia como la de una app nativa.
              </p>
              <p className="text-xs font-medium text-accent">
                Pulsa aquí para ver las instrucciones →
              </p>
            </div>
          </div>
        </Card>

        {/* Misión */}
        <Card className="p-6 border-accent/20 shadow-lg">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Nuestra Misión</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A la Gloria es una aplicación diseñada para celebrar y compartir el conocimiento sobre la Semana Santa. 
                A través de preguntas diarias, buscamos mantener viva la tradición, promover el aprendizaje y conectar 
                a cofrades y devotos en una experiencia única y educativa.
              </p>
            </div>
          </div>
        </Card>

        {/* Cómo funciona */}
        <Card className="p-6 border-accent/20 shadow-lg">
          <div className="flex items-start gap-3 mb-3">
            <Trophy className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">¿Cómo Funciona?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <li>• <span className="font-medium text-foreground">10 preguntas diarias</span>: Cada día, responde 10 nuevas preguntas sobre la Semana Santa</li>
                <li>• <span className="font-medium text-foreground">Niveles de dificultad</span>: Desde Kanicofrade hasta Maestro, desafía tus conocimientos</li>
                <li>• <span className="font-medium text-foreground">Sistema de puntuación</span>: Gana hasta 100 puntos por respuesta rápida y correcta</li>
                <li>• <span className="font-medium text-foreground">Rachas y logros</span>: Mantén tu racha diaria y desbloquea nuevos logros</li>
                <li>• <span className="font-medium text-foreground">Ranking global</span>: Compite con otros jugadores y alcanza la cima</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Información adicional */}
        <Card className="p-6 border-accent/20 shadow-lg">
          <div className="flex items-start gap-3 mb-3">
            <Calendar className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Sobre las Preguntas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Nuestro banco de preguntas es elaborado con cuidado para reflejar la riqueza de la Semana Santa: 
                historia, tradiciones, hermandades, pasos, música sacra y más. 
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cada pregunta se selecciona para ofrecer una experiencia educativa y entretenida, respetando 
                la profundidad de esta celebración.
              </p>
            </div>
          </div>
        </Card>

        {/* Contacto - Formulario */}
        <Card className="p-6 border-accent/20 shadow-lg bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-start gap-3 mb-4">
            <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">Contacto y Soporte</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ¿Tienes preguntas, sugerencias o deseas reportar un problema? Completa el formulario y nos pondremos en contacto contigo.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nombre
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                {...register("name")}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register("email")}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Mensaje
              </Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                {...register("message")}
                className="mt-1 resize-none"
              />
              {errors.message && (
                <p className="text-xs text-destructive mt-1">{errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 font-medium shadow-md"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar mensaje
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              También puedes escribirnos directamente a:{" "}
              <a 
                href="mailto:alagloria2025@gmail.com" 
                className="text-accent font-medium hover:underline"
              >
                alagloria2025@gmail.com
              </a>
            </p>
          </form>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground px-4 py-4">
          A la Gloria es un proyecto creado con pasión por la Semana Santa.<br />
          © 2025 A la Gloria. Todos los derechos reservados.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Acerca;

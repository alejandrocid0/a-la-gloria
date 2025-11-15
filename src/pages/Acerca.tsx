import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Mail, BookOpen, Trophy, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Acerca = () => {
  const navigate = useNavigate();

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
        {/* Logo/Title Card */}
        <Card className="p-8 border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50 text-center">
          <h2 className="text-4xl font-cinzel font-bold text-accent mb-2">A la Gloria</h2>
          <p className="text-sm text-muted-foreground italic">Trivia sobre la Semana Santa</p>
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
                <li>• <span className="font-medium text-foreground">3 preguntas diarias</span>: Cada día, responde 3 nuevas preguntas sobre la Semana Santa</li>
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

        {/* Contacto */}
        <Card className="p-6 border-accent/20 shadow-lg bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">Contacto y Soporte</h3>
              <p className="text-sm text-muted-foreground mb-3">
                ¿Tienes preguntas, sugerencias o deseas reportar un problema? Estamos aquí para ayudarte.
              </p>
              <a 
                href="mailto:contacto@alagloria.es" 
                className="text-accent font-medium hover:underline text-sm"
              >
                contacto@alagloria.es
              </a>
            </div>
          </div>
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

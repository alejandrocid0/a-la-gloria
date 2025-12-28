import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <img src={logo} alt="A la Gloria" className="h-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-cinzel font-bold text-foreground">
              Términos y Condiciones
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground">
                Al acceder y utilizar A la Gloria, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no deberías usar esta aplicación.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Uso de la Aplicación</h2>
              <p className="text-muted-foreground">
                A la Gloria es un juego de trivia sobre la Semana Santa. Los usuarios pueden:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Jugar una partida diaria de 10 preguntas</li>
                <li>Acumular puntos según su desempeño</li>
                <li>Participar en el ranking global</li>
                <li>Ver su progreso y estadísticas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">3. Registro de Cuenta</h2>
              <p className="text-muted-foreground">
                Para usar la aplicación, debes registrarte proporcionando:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Un nombre de usuario</li>
                <li>Una dirección de email válida</li>
                <li>Una contraseña segura</li>
                <li>Tu hermandad</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Reglas del Juego</h2>
              <p className="text-muted-foreground">
                El juego funciona bajo las siguientes reglas:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Una partida por usuario al día</li>
                <li>10 preguntas por partida</li>
                <li>15 segundos para responder cada pregunta</li>
                <li>Sistema de puntuación basado en velocidad y precisión</li>
                <li>Prohibido el uso de herramientas externas o trampas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Conducta del Usuario</h2>
              <p className="text-muted-foreground">
                Los usuarios se comprometen a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>No utilizar bots o automatización</li>
                <li>No intentar acceder a datos de otros usuarios</li>
                <li>No manipular el sistema de puntuación</li>
                <li>Mantener un comportamiento respetuoso</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                El incumplimiento de estas normas puede resultar en la suspensión o eliminación de la cuenta.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">6. Propiedad Intelectual</h2>
              <p className="text-muted-foreground">
                Todo el contenido de la aplicación, incluyendo textos, gráficos, logos y preguntas, es propiedad de A la Gloria y está protegido por las leyes de propiedad intelectual.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">7. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground">
                A la Gloria se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables de:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Errores en las preguntas o respuestas</li>
                <li>Interrupciones del servicio</li>
                <li>Pérdida de datos o progreso</li>
                <li>Daños derivados del uso de la aplicación</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">8. Modificaciones del Servicio</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar, suspender o discontinuar el servicio en cualquier momento, con o sin previo aviso.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">9. Cambios en los Términos</h2>
              <p className="text-muted-foreground">
                Podemos actualizar estos términos periódicamente. El uso continuado de la aplicación después de los cambios constituye la aceptación de los nuevos términos.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">10. Contacto</h2>
              <p className="text-muted-foreground">
                Para cualquier pregunta sobre estos términos, contacta con nosotros en{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>.
              </p>
            </div>
          </section>

          <div className="pt-6 border-t">
            <Button
              onClick={() => navigate(-1)}
              className="w-full"
              variant="outline"
            >
              Volver
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Terms;

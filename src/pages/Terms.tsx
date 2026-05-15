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
              <h2 className="text-xl font-bold text-foreground">1. Aceptación de los Términos y Titular</h2>
              <p className="text-muted-foreground">
                Los presentes Términos y Condiciones regulan el uso de la aplicación <strong>A la Gloria</strong> (en adelante, "la App"), un proyecto personal de carácter no comercial dedicado a la divulgación cultural sobre la Semana Santa. Al registrarte o utilizar la App aceptas íntegramente estos términos. Si no estás de acuerdo, no debes usar la App.
              </p>
              <p className="text-muted-foreground">
                Para cualquier comunicación relacionada con estos términos, puedes contactar al titular del proyecto en{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground">
                A la Gloria es un juego de trivia sobre la Semana Santa que permite a los usuarios:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Jugar una partida diaria de 10 preguntas con dificultad progresiva</li>
                <li>Acumular puntos, rachas y logros</li>
                <li>Participar en torneos puntuales con varias rondas</li>
                <li>Consultar rankings globales y de torneo</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">3. Edad Mínima</h2>
              <p className="text-muted-foreground">
                Para registrarte y utilizar la App debes tener al menos <strong>14 años</strong>, de conformidad con el artículo 7 de la Ley Orgánica 3/2018 (LOPDGDD). Los menores de 14 años no pueden crear una cuenta. Si detectamos cuentas de menores de esa edad procederemos a su eliminación. Padres o tutores legales pueden solicitar el borrado de la cuenta de un menor escribiendo a{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Registro de Cuenta</h2>
              <p className="text-muted-foreground">
                Para usar la App debes registrarte proporcionando:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Un nombre de usuario</li>
                <li>Una dirección de email válida</li>
                <li>Una contraseña segura</li>
                <li>Tu hermandad</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad que se realice desde tu cuenta. Debes proporcionar datos veraces y mantenerlos actualizados.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Reglas del Juego</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Una partida diaria por usuario</li>
                <li>10 preguntas por partida con tiempo limitado por pregunta</li>
                <li>Sistema de puntuación basado en velocidad y precisión</li>
                <li>Prohibido el uso de bots, automatizaciones, herramientas externas o cualquier forma de trampa</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">6. Conducta del Usuario</h2>
              <p className="text-muted-foreground">Los usuarios se comprometen a:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>No utilizar bots ni automatización</li>
                <li>No intentar acceder a datos de otros usuarios ni a áreas restringidas</li>
                <li>No manipular el sistema de puntuación, ranking o torneos</li>
                <li>Mantener un comportamiento respetuoso, especialmente al elegir nombre de usuario</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                El incumplimiento podrá derivar en la suspensión temporal o eliminación definitiva de la cuenta sin previo aviso.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">7. Comunicaciones Comerciales</h2>
              <p className="text-muted-foreground">
                Al registrarte consientes expresamente recibir comunicaciones electrónicas relacionadas con la App (novedades, actualizaciones, promociones, eventos y contenido relacionado con la Semana Santa). La frecuencia será razonable (no más de 2-3 emails mensuales). Puedes revocar este consentimiento en cualquier momento, de forma gratuita, desde tu perfil, mediante el enlace de baja incluido en cada email o escribiendo a{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">8. Servicio Gratuito</h2>
              <p className="text-muted-foreground">
                A la Gloria es actualmente <strong>gratuito</strong> y no incluye compras dentro de la aplicación ni suscripciones. En el futuro podrían introducirse funcionalidades de pago opcionales; en tal caso se informará previamente y será necesaria tu aceptación expresa antes de cualquier cobro. El uso de la App no genera obligaciones económicas mientras no aceptes específicamente un servicio de pago.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">9. Propiedad Intelectual</h2>
              <p className="text-muted-foreground">
                Todo el contenido de la App (textos, gráficos, logos, banco de preguntas, diseño, código) está protegido por la legislación de propiedad intelectual y pertenece al titular del proyecto o a sus licenciantes. No se permite su reproducción, distribución, comunicación pública o transformación sin autorización previa por escrito.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">10. Disponibilidad y Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground">
                La App se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo. En la máxima medida permitida por la ley, el titular no será responsable de:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Errores ocasionales en preguntas o respuestas</li>
                <li>Interrupciones, retrasos o caídas del servicio</li>
                <li>Pérdida de datos, puntuaciones o progreso</li>
                <li>Daños indirectos derivados del uso de la App</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Lo anterior no limita los derechos irrenunciables que la normativa de consumidores te reconozca.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">11. Modificaciones del Servicio y de los Términos</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar, suspender o discontinuar la App, total o parcialmente, en cualquier momento. Asimismo podemos actualizar estos términos; los cambios sustanciales se comunicarán a través de la App. El uso continuado tras la entrada en vigor implica su aceptación.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">12. Eliminación de Cuenta</h2>
              <p className="text-muted-foreground">
                Puedes eliminar tu cuenta en cualquier momento desde la propia App, en <strong>Acerca → Zona de peligro → Eliminar cuenta</strong>. La eliminación es irreversible y borra de forma permanente tu perfil, puntos, partidas, rachas, logros e inscripciones a torneos.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">13. Legislación Aplicable y Jurisdicción</h2>
              <p className="text-muted-foreground">
                Estos términos se rigen por la legislación española, en particular el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE). Cualquier controversia se someterá a los tribunales del domicilio del usuario cuando este actúe como consumidor.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">14. Contacto</h2>
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

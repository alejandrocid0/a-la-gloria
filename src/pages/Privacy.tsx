import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Privacy = () => {
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
              Política de Privacidad
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">1. Información que Recopilamos</h2>
              <p className="text-muted-foreground">
                Cuando te registras en A la Gloria, recopilamos la siguiente información:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Información de cuenta:</strong> Nombre, email, hermandad</li>
                <li><strong>Datos de juego:</strong> Puntuaciones, respuestas, estadísticas</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Cómo Usamos tu Información</h2>
              <p className="text-muted-foreground">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Proporcionar y mejorar el servicio</li>
                <li>Gestionar tu cuenta y preferencias</li>
                <li>Mostrar rankings y estadísticas</li>
                <li>Detectar y prevenir fraudes</li>
                <li>Comunicarnos contigo sobre el servicio</li>
                <li>Cumplir con requisitos legales</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">3. Compartir Información</h2>
              <p className="text-muted-foreground">
                Tu información personal NO será vendida a terceros. Sin embargo, puede ser compartida en los siguientes casos:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Información pública:</strong> Tu nombre, hermandad y puntuación son visibles en el ranking público</li>
                <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar la aplicación (hosting, análisis)</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Cookies y Tecnologías Similares</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de la aplicación</li>
                <li>Mejorar la seguridad</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la aplicación.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Seguridad de los Datos</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Cifrado de datos en tránsito y reposo</li>
                <li>Contraseñas hasheadas de forma segura</li>
                <li>Controles de acceso estrictos</li>
                <li>Monitorización de seguridad continua</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Sin embargo, ningún sistema es 100% seguro. Usa una contraseña fuerte y única para tu cuenta.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">6. Tus Derechos</h2>
              <p className="text-muted-foreground">
                Conforme al RGPD y leyes de protección de datos aplicables, tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de tu cuenta y datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Para ejercer estos derechos, contacta con nosotros a través de los canales oficiales.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">7. Retención de Datos</h2>
              <p className="text-muted-foreground">
                Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Proporcionar el servicio</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Resolver disputas</li>
                <li>Hacer cumplir nuestros acuerdos</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Cuando elimines tu cuenta, tus datos personales serán borrados dentro de un plazo razonable.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">8. Menores de Edad</h2>
              <p className="text-muted-foreground">
                A la Gloria está destinada a usuarios mayores de 13 años. No recopilamos intencionadamente información de menores de 13 años. Si descubrimos que un menor de 13 años nos ha proporcionado datos personales, eliminaremos dicha información de forma inmediata.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">9. Transferencias Internacionales</h2>
              <p className="text-muted-foreground">
                Tus datos pueden ser procesados en servidores ubicados fuera de tu país de residencia. En estos casos, nos aseguramos de que existan las salvaguardas adecuadas para proteger tu información.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">10. Cambios en esta Política</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre cambios significativos a través de la aplicación o por email. La fecha de "Última actualización" al inicio del documento indicará cuándo se realizó la última modificación.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">11. Contacto</h2>
              <p className="text-muted-foreground">
                Si tienes preguntas sobre esta política de privacidad o el tratamiento de tus datos personales, puedes contactarnos a través de:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Los canales oficiales de la aplicación</li>
                <li>El correo electrónico proporcionado en la aplicación</li>
              </ul>
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

export default Privacy;

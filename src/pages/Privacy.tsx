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
              <h2 className="text-xl font-bold text-foreground">1. Responsable del Tratamiento</h2>
              <p className="text-muted-foreground">
                El responsable del tratamiento de tus datos es el titular de <strong>A la Gloria</strong>, un proyecto personal de divulgación cultural sin entidad mercantil. Para cualquier asunto relacionado con tus datos personales puedes contactar en{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Datos que Recopilamos</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Cuenta:</strong> nombre de usuario, email, hermandad, contraseña almacenada de forma cifrada (hash).</li>
                <li><strong>Datos de juego:</strong> puntuaciones, respuestas, partidas, rachas y logros.</li>
                <li><strong>Inscripciones a torneos:</strong> nombre, apellidos, email, teléfono y mensaje opcional cuando te inscribes a un torneo.</li>
                <li><strong>Datos técnicos mínimos:</strong> registros del servidor (logs) generados automáticamente para garantizar la seguridad y el correcto funcionamiento.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">3. Finalidades y Bases Legales</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Prestar el servicio</strong> (gestionar tu cuenta, partidas, rankings, torneos): ejecución de un contrato — art. 6.1.b RGPD.</li>
                <li><strong>Comunicaciones comerciales</strong> sobre la App: tu consentimiento expreso — art. 6.1.a RGPD y art. 21 LSSI-CE.</li>
                <li><strong>Seguridad y prevención de fraude</strong> (detección de trampas, abuso, accesos indebidos): interés legítimo — art. 6.1.f RGPD.</li>
                <li><strong>Cumplimiento de obligaciones legales</strong>: art. 6.1.c RGPD.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Encargados del Tratamiento y Terceros</h2>
              <p className="text-muted-foreground">
                Para operar la App utilizamos <strong>Lovable Cloud (Supabase)</strong> como infraestructura de hosting, base de datos y autenticación. Sus servidores se encuentran en la Unión Europea. Supabase actúa como encargado del tratamiento bajo las garantías del RGPD.
              </p>
              <p className="text-muted-foreground">
                Cuando la App se distribuya como aplicación nativa en Google Play / App Store, podríamos incorporar <strong>Firebase Cloud Messaging (Google)</strong> para el envío de notificaciones push. En ese caso se aplicarán las cláusulas contractuales tipo y se actualizará esta política. <strong>No vendemos ni cedemos tus datos a terceros con fines publicitarios.</strong>
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Datos Visibles Públicamente en la App</h2>
              <p className="text-muted-foreground">
                Tu nombre de usuario, hermandad y puntuaciones son visibles para el resto de usuarios en los rankings globales y en los rankings de torneo. Tu email, teléfono, contraseña y demás datos personales <strong>nunca</strong> son visibles para otros usuarios.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">6. Cookies y Tecnologías Similares</h2>
              <p className="text-muted-foreground">
                Solo utilizamos cookies y almacenamiento local <strong>técnicos y funcionales</strong> imprescindibles para mantener tu sesión iniciada y recordar tus preferencias. <strong>No empleamos cookies analíticas, de marketing ni de terceros</strong>, por lo que no es necesario un banner de consentimiento de cookies.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">7. Conservación de los Datos</h2>
              <p className="text-muted-foreground">
                Conservamos tus datos personales mientras tu cuenta esté activa. Cuando elimines tu cuenta desde <strong>Acerca → Zona de peligro → Eliminar cuenta</strong>, todos tus datos personales se borran de forma permanente. Determinados registros técnicos (logs de servidor) podrán conservarse hasta 12 meses por motivos de seguridad y prevención de fraude, antes de su eliminación o anonimización.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">8. Tus Derechos</h2>
              <p className="text-muted-foreground">
                Conforme al RGPD y a la LOPDGDD tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Acceso</strong> a tus datos personales</li>
                <li><strong>Rectificación</strong> de datos inexactos (puedes hacerlo directamente desde tu perfil en la App)</li>
                <li><strong>Supresión</strong> de tus datos (eliminando tu cuenta in-app o solicitándolo por email)</li>
                <li><strong>Portabilidad</strong> de tus datos en formato estructurado</li>
                <li><strong>Oposición</strong> al tratamiento</li>
                <li><strong>Limitación</strong> del tratamiento</li>
                <li>Retirar el consentimiento prestado en cualquier momento</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Para ejercer cualquiera de estos derechos escribe a{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>{" "}
                indicando claramente tu solicitud y adjuntando, si es necesario, un medio que permita verificar tu identidad.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">9. Reclamación ante la Autoridad de Control</h2>
              <p className="text-muted-foreground">
                Si consideras que el tratamiento de tus datos no se ajusta a la normativa, tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> a través de su sede electrónica:{" "}
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aepd.es</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">10. Menores de Edad</h2>
              <p className="text-muted-foreground">
                La edad mínima para registrarte es <strong>14 años</strong>, conforme al art. 7 de la LOPDGDD. Si detectamos cuentas pertenecientes a menores de esa edad serán eliminadas. Padres o tutores legales pueden solicitar el borrado de la cuenta de un menor escribiendo a{" "}
                <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a>.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">11. Seguridad de los Datos</h2>
              <p className="text-muted-foreground">
                Aplicamos medidas técnicas y organizativas adecuadas para proteger tu información personal:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Cifrado en tránsito mediante HTTPS</li>
                <li>Contraseñas almacenadas mediante hash seguro</li>
                <li>Políticas de seguridad a nivel de fila (Row Level Security) en la base de datos</li>
                <li>Control de acceso por roles y validación en servidor</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Ningún sistema es 100% seguro: te recomendamos usar una contraseña robusta y única.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">12. Transferencias Internacionales</h2>
              <p className="text-muted-foreground">
                Los datos se almacenan en servidores ubicados en la <strong>Unión Europea</strong>. Si en el futuro se incorporan servicios que impliquen transferencias fuera del EEE (por ejemplo, Firebase Cloud Messaging para notificaciones push en la app nativa), se aplicarán las cláusulas contractuales tipo aprobadas por la Comisión Europea u otras garantías equivalentes previstas por el RGPD.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">13. Versión Nativa (Android / iOS)</h2>
              <p className="text-muted-foreground">
                Cuando la App se distribuya como aplicación nativa a través de tiendas oficiales (Google Play, App Store), podrá utilizar:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Almacenamiento local del dispositivo para mantener la sesión y preferencias</li>
                <li>Identificadores de instalación generados por el sistema operativo</li>
                <li>Notificaciones push <strong>opcionales</strong> (solo si concedes permiso expreso)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                La App <strong>no accede</strong> a contactos, ubicación, cámara, micrófono ni a los archivos del usuario.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">14. Cambios en esta Política</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta política periódicamente. Los cambios sustanciales se notificarán a través de la App o por email. La fecha de "Última actualización" al inicio del documento indica cuándo se realizó la última modificación.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">15. Contacto</h2>
              <p className="text-muted-foreground">
                Para cualquier consulta sobre esta política o sobre el tratamiento de tus datos personales:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Email:</strong> <a href="mailto:info@alagloria.es" className="text-primary hover:underline">info@alagloria.es</a></li>
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

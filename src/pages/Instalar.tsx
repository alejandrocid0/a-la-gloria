import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Smartphone, Chrome } from "lucide-react";

const Instalar = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="font-cinzel text-4xl font-bold text-primary">
            Instala A la Gloria
          </h1>
          <p className="text-muted-foreground">
            Accede más rápido y disfruta de una experiencia como app nativa
          </p>
        </div>

        {/* iOS Instructions */}
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Smartphone className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">iOS (iPhone/iPad)</CardTitle>
                <CardDescription>Usando Safari</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <p className="text-foreground pt-1">
                  Abre esta página en <span className="font-semibold text-primary">Safari</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <p className="text-foreground pt-1">
                  Pulsa el botón de <span className="font-semibold text-primary">Compartir</span> (cuadrado con flecha hacia arriba)
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <p className="text-foreground pt-1">
                  Selecciona <span className="font-semibold text-primary">"Añadir a pantalla de inicio"</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  4
                </div>
                <p className="text-foreground pt-1">
                  Pulsa <span className="font-semibold text-primary">"Añadir"</span> en la esquina superior derecha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Android Instructions */}
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Chrome className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Android</CardTitle>
                <CardDescription>Usando Chrome</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <p className="text-foreground pt-1">
                  Abre esta página en <span className="font-semibold text-primary">Chrome</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <p className="text-foreground pt-1">
                  Pulsa el menú <span className="font-semibold text-primary">(⋮)</span> en la esquina superior derecha
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <p className="text-foreground pt-1">
                  Selecciona <span className="font-semibold text-primary">"Instalar aplicación"</span> o <span className="font-semibold text-primary">"Añadir a pantalla de inicio"</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  4
                </div>
                <p className="text-foreground pt-1">
                  Confirma pulsando <span className="font-semibold text-primary">"Instalar"</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-accent/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-xl">Ventajas de instalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-foreground">
                  <span className="font-semibold">Acceso directo</span> desde tu pantalla de inicio
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-foreground">
                  <span className="font-semibold">Funciona sin conexión</span> una vez descargada
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-foreground">
                  <span className="font-semibold">Experiencia como app nativa</span> sin barras de navegador
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-foreground">
                  <span className="font-semibold">Carga más rápida</span> con caché optimizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="border-primary/20 hover:bg-primary/5"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Instalar;

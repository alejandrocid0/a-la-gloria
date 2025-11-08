import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import logo from "@/assets/logo.png";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-6 px-6 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <img 
            src={logo} 
            alt="A la Gloria" 
            className="h-12 drop-shadow-lg"
          />
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-w-4xl mx-auto px-6 py-6 w-full">
        <h1 className="text-3xl font-bold text-foreground mb-6">Panel de Administración</h1>
        
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Gestionar Preguntas
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preguntas Diarias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gestión de Preguntas</h2>
              <p className="text-muted-foreground">
                Aquí podrás añadir, editar y eliminar preguntas del banco de preguntas.
              </p>
              {/* TODO: Implementar formulario y lista de preguntas */}
            </Card>
          </TabsContent>

          <TabsContent value="daily">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Selección de Preguntas Diarias</h2>
              <p className="text-muted-foreground">
                Aquí podrás seleccionar las 10 preguntas que aparecerán cada día.
              </p>
              {/* TODO: Implementar selector de fecha y preguntas */}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

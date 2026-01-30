import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, BookOpen, Calendar, LogOut, MessageSquare, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QuestionForm from "@/components/admin/QuestionForm";
import QuestionsList from "@/components/admin/QuestionsList";
import { DailyQuestionsSelector } from "@/components/admin/DailyQuestionsSelector";
import { CSVImporter } from "@/components/admin/CSVImporter";
import { FeedbackList } from "@/components/admin/FeedbackList";
import AdminDashboard from "@/components/admin/AdminDashboard";
import logo from "@/assets/logo.png";

const Admin = () => {
  const navigate = useNavigate();
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar preguntas
  const { data: questions = [], refetch } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filtrar preguntas por texto
  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuestionSuccess = () => {
    refetch();
    setEditingQuestion(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada correctamente");
      navigate('/auth');
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
        
        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="control" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Control
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Preguntas
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Diarias
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            {/* Importador CSV */}
            <CSVImporter />

            {/* Buscador de preguntas */}
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar preguntas por texto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                {searchTerm && (
                  <Button variant="ghost" size="icon" onClick={() => setSearchTerm("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Mostrando {filteredQuestions.length} de {questions.length} preguntas
                </p>
              )}
            </Card>

            {/* Formulario */}
            <QuestionForm
              onSuccess={handleQuestionSuccess}
              editQuestion={editingQuestion}
              onCancelEdit={() => setEditingQuestion(null)}
            />

            {/* Lista de preguntas */}
            <QuestionsList
              questions={filteredQuestions}
              onEdit={setEditingQuestion}
              onDelete={refetch}
            />
          </TabsContent>

          <TabsContent value="daily">
            <DailyQuestionsSelector />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

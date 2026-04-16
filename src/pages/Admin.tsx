import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, BookOpen, Calendar, ChevronRight, LogOut, MessageSquare, Search, Swords, X } from "lucide-react";
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
import TournamentManager from "@/components/admin/TournamentManager";
import logo from "@/assets/logo.png";

const Admin = () => {
  const navigate = useNavigate();
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Cargar preguntas
  const { data: questions = [], refetch } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: async () => {
      const allQuestions: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allQuestions.push(...data);
          offset += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      return allQuestions;
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn("Logout error (proceeding anyway):", error.message);
    }
    toast.success("Sesión cerrada correctamente");
    navigate('/auth');
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
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
            <TabsTrigger value="tournaments" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              Torneos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="questions" className="space-y-3">
            {/* 📥 Importar CSV */}
            <Collapsible
              open={openSection === 'csv'}
              onOpenChange={(open) => setOpenSection(open ? 'csv' : null)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="flex items-center gap-2 font-medium text-sm">
                  📥 Importar preguntas desde CSV
                </span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === 'csv' ? 'rotate-90' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <CSVImporter />
              </CollapsibleContent>
            </Collapsible>

            {/* 🔍 Buscar preguntas */}
            <Collapsible
              open={openSection === 'search'}
              onOpenChange={(open) => {
                setOpenSection(open ? 'search' : null);
                if (!open) setSearchTerm("");
              }}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="flex items-center gap-2 font-medium text-sm">
                  🔍 Buscar preguntas
                </span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === 'search' ? 'rotate-90' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
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
                  <>
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredQuestions.length} de {questions.length} preguntas
                    </p>
                    <QuestionsList
                      questions={filteredQuestions}
                      onEdit={setEditingQuestion}
                      onDelete={refetch}
                      isSearching={true}
                    />
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* ✏️ Crear nueva pregunta */}
            <Collapsible
              open={openSection === 'create' || !!editingQuestion}
              onOpenChange={(open) => {
                setOpenSection(open ? 'create' : null);
                if (!open) setEditingQuestion(null);
              }}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="flex items-center gap-2 font-medium text-sm">
                  {editingQuestion ? '✏️ Editar pregunta' : '✏️ Crear nueva pregunta'}
                </span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === 'create' || editingQuestion ? 'rotate-90' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <QuestionForm
                  key={editingQuestion?.id || 'new'}
                  onSuccess={handleQuestionSuccess}
                  editQuestion={editingQuestion}
                  onCancelEdit={() => setEditingQuestion(null)}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* 📚 Banco de preguntas */}
            <Collapsible
              open={openSection === 'bank'}
              onOpenChange={(open) => setOpenSection(open ? 'bank' : null)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="flex items-center gap-2 font-medium text-sm">
                  📚 Banco de preguntas ({questions.length})
                </span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === 'bank' ? 'rotate-90' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <QuestionsList
                  questions={questions}
                  onEdit={(q) => {
                    setEditingQuestion(q);
                    setOpenSection('create');
                  }}
                  onDelete={refetch}
                  isSearching={false}
                />
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="daily">
            <DailyQuestionsSelector />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackList />
          </TabsContent>

          <TabsContent value="tournaments">
            <TournamentManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

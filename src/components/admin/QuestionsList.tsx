import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  difficulty: string;
  category?: string;
  created_at: string;
}

interface QuestionsListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: () => void;
}

const QuestionsList = ({ questions, onEdit, onDelete }: QuestionsListProps) => {
  const handleDelete = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast.success('Pregunta eliminada con éxito');
      onDelete();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error eliminando pregunta:', error);
      }
      toast.error('Error al eliminar la pregunta');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'difícil':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCorrectOptionLabel = (correctAnswer: number) => {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[correctAnswer - 1];
  };

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No hay preguntas creadas todavía. Crea la primera pregunta usando el formulario de arriba.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Banco de Preguntas ({questions.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header con categoría y dificultad */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {question.category && (
                      <Badge variant="outline" className="text-xs">
                        {question.category}
                      </Badge>
                    )}
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground leading-relaxed">
                    {question.question_text}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(question)}
                    className="h-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La pregunta será eliminada permanentemente del banco de preguntas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(question.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Opciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'A', value: question.option_a, num: 1 },
                  { label: 'B', value: question.option_b, num: 2 },
                  { label: 'C', value: question.option_c, num: 3 },
                  { label: 'D', value: question.option_d, num: 4 },
                ].map((option) => (
                  <div
                    key={option.label}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-sm ${
                      question.correct_answer === option.num
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="font-semibold text-muted-foreground flex-shrink-0">
                      {option.label}.
                    </span>
                    <span className={question.correct_answer === option.num ? 'font-medium' : ''}>
                      {option.value}
                    </span>
                    {question.correct_answer === option.num && (
                      <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;

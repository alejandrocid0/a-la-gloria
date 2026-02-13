import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";
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
  isSearching?: boolean;
}

const QUESTION_CATEGORIES = [
  { key: 'advocaciones-cristo', label: 'Advocaciones del Cristo', pattern: '¿Cuál es la advocación del Cristo' },
  { key: 'advocaciones-virgen', label: 'Advocaciones de la Virgen', pattern: '¿Cuál es la advocación de la Virgen' },
  { key: 'sedes', label: 'Sedes canónicas', pattern: '¿Cuál es la sede' },
  { key: 'sedes-historicas', label: 'Sedes históricas', pattern: '¿Cuál ha tenido alguna vez como sede' },
  { key: 'anos', label: 'Fechas y años', pattern: '¿En qué año' },
  { key: 'dias', label: 'Días de procesión', pattern: '¿Qué día' },
  { key: 'dias-historicos', label: 'Días de salida históricos', pattern: '¿En qué día procesionó durante años' },
  { key: 'capataces', label: 'Capataces', pattern: '¿Quién es el capataz de' },
  { key: 'capataces-no', label: 'Capataces', pattern: '¿Qué hermandad NO tiene como capataz' },
  { key: 'bandas-cristo', label: 'Bandas de Cristo', pattern: '¿Qué banda acompaña al misterio' },
  { key: 'bandas-palio', label: 'Bandas de palio', pattern: '¿Qué banda acompaña al palio' },
  { key: 'hermandades-procesionan', label: 'Hermandades que procesionan', pattern: '¿Cuál de estas hermandades' },
  { key: 'hermandades-general', label: 'Hermandades (general)', pattern: '¿Qué hermandad' },
  { key: 'restauraciones', label: 'Restauraciones', pattern: '¿Quién restauró en' },
];

function groupQuestionsByCategory(questions: Question[]) {
  const groups: Record<string, Question[]> = {};
  QUESTION_CATEGORIES.forEach(c => { groups[c.key] = []; });
  groups['otras'] = [];

  questions.forEach(q => {
    const matched = QUESTION_CATEGORIES.find(c => q.question_text.startsWith(c.pattern));
    if (matched) {
      groups[matched.key].push(q);
    } else {
      groups['otras'].push(q);
    }
  });

  return groups;
}

const QuestionsList = ({ questions, onEdit, onDelete, isSearching = false }: QuestionsListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const grouped = useMemo(() => groupQuestionsByCategory(questions), [questions]);

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

  const renderQuestionCard = (question: Question) => (
    <Card key={question.id} className="p-5 hover:shadow-md transition-shadow">
      <div className="space-y-4">
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
            <Button variant="outline" size="sm" onClick={() => onEdit(question)} className="h-8">
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
  );

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No hay preguntas creadas todavía. Crea la primera pregunta usando el formulario de arriba.
        </p>
      </Card>
    );
  }

  // Búsqueda activa: lista plana
  if (isSearching) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resultados ({questions.length})</h3>
        <div className="grid gap-4">
          {questions.map(renderQuestionCard)}
        </div>
      </div>
    );
  }

  // Vista de categoría seleccionada
  if (selectedCategory) {
    const keys = selectedCategory.split(',');
    const catLabel = keys.map(k => k === 'otras'
      ? 'Otras'
      : QUESTION_CATEGORIES.find(c => c.key === k)?.label ?? k
    ).filter((v, i, a) => a.indexOf(v) === i).join(' / ');
    const catQuestions = keys.flatMap(k => grouped[k] ?? []);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h3 className="text-lg font-semibold">
            {catLabel} ({catQuestions.length})
          </h3>
        </div>
        <div className="grid gap-4">
          {catQuestions.map(renderQuestionCard)}
        </div>
      </div>
    );
  }

  // Vista principal: cuadrícula de categorías
  // Merge categories with same label (e.g. two Capataces patterns)
  const mergedMap = new Map<string, { key: string; label: string; count: number }>();
  [
    ...QUESTION_CATEGORIES.map(c => ({ key: c.key, label: c.label, count: grouped[c.key].length })),
    { key: 'otras', label: 'Otras', count: grouped['otras'].length },
  ].forEach(cat => {
    const existing = mergedMap.get(cat.label);
    if (existing) {
      existing.count += cat.count;
      existing.key = existing.key + ',' + cat.key;
    } else {
      mergedMap.set(cat.label, { ...cat });
    }
  });
  const allCategories = Array.from(mergedMap.values()).filter(c => c.count > 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Banco de Preguntas ({questions.length})
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {allCategories.map(cat => (
          <Card
            key={cat.key}
            className="p-5 cursor-pointer hover:shadow-md hover:border-primary/40 transition-all text-center"
            onClick={() => setSelectedCategory(cat.key)}
            role="button"
            aria-label={`Ver preguntas de ${cat.label}`}
          >
            <p className="font-semibold text-foreground leading-tight mb-2">{cat.label}</p>
            <p className="text-2xl font-bold text-primary">{cat.count}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;

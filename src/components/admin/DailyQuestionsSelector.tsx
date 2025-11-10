import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Question {
  id: string;
  question_text: string;
  difficulty: string | null;
}

interface SelectedQuestion extends Question {
  order: number;
}

export const DailyQuestionsSelector = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const queryClient = useQueryClient();

  // Cargar todas las preguntas disponibles
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['all-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, difficulty')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
  });

  // Cargar preguntas ya asignadas para la fecha seleccionada
  const { data: dailyQuestions = [] } = useQuery({
    queryKey: ['daily-questions', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('daily_questions')
        .select('question_id, order_number')
        .eq('date', dateStr)
        .order('order_number');

      if (error) throw error;
      return data;
    },
  });

  // Sincronizar selectedQuestions con dailyQuestions cuando cambie la fecha
  useState(() => {
    if (dailyQuestions.length > 0) {
      const questionsWithOrder = dailyQuestions
        .map((dq) => {
          const question = questions.find((q) => q.id === dq.question_id);
          if (!question) return null;
          return { ...question, order: dq.order_number };
        })
        .filter((q): q is SelectedQuestion => q !== null);
      setSelectedQuestions(questionsWithOrder);
    } else {
      setSelectedQuestions([]);
    }
  });

  // Mutation para guardar las preguntas del día
  const saveMutation = useMutation({
    mutationFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // 1. Eliminar preguntas existentes para esta fecha
      const { error: deleteError } = await supabase
        .from('daily_questions')
        .delete()
        .eq('date', dateStr);

      if (deleteError) throw deleteError;

      // 2. Insertar las nuevas preguntas
      const inserts = selectedQuestions.map((q) => ({
        date: dateStr,
        question_id: q.id,
        order_number: q.order,
      }));

      const { error: insertError } = await supabase
        .from('daily_questions')
        .insert(inserts);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-questions'] });
      toast.success('Preguntas del día guardadas correctamente');
    },
    onError: (error) => {
      console.error('Error saving daily questions:', error);
      toast.error('Error al guardar las preguntas del día');
    },
  });

  const handleToggleQuestion = (question: Question) => {
    const isSelected = selectedQuestions.some((q) => q.id === question.id);

    if (isSelected) {
      // Deseleccionar y reordenar
      const filtered = selectedQuestions
        .filter((q) => q.id !== question.id)
        .map((q, index) => ({ ...q, order: index + 1 }));
      setSelectedQuestions(filtered);
    } else {
      // Seleccionar solo si no hay 10 ya seleccionadas
      if (selectedQuestions.length < 10) {
        setSelectedQuestions([
          ...selectedQuestions,
          { ...question, order: selectedQuestions.length + 1 },
        ]);
      } else {
        toast.error('Solo puedes seleccionar 10 preguntas');
      }
    }
  };

  const handleSave = () => {
    if (selectedQuestions.length !== 10) {
      toast.error('Debes seleccionar exactamente 10 preguntas');
      return;
    }
    saveMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando preguntas...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <Card>
        <CardHeader>
          <CardTitle>Selecciona la fecha</CardTitle>
          <CardDescription>
            Elige el día para el que quieres configurar las preguntas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={es}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Lista de preguntas disponibles */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Preguntas para {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </CardTitle>
          <CardDescription>
            Selecciona exactamente 10 preguntas ({selectedQuestions.length}/10 seleccionadas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {questions.map((question) => {
              const selected = selectedQuestions.find((q) => q.id === question.id);
              return (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={!!selected}
                    onCheckedChange={() => handleToggleQuestion(question)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {selected && (
                        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                          {selected.order}
                        </span>
                      )}
                      {question.question_text}
                    </p>
                    {question.difficulty && (
                      <span className="text-xs text-muted-foreground">
                        Dificultad: {question.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={selectedQuestions.length !== 10 || saveMutation.isPending}
              size="lg"
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Preguntas del Día'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

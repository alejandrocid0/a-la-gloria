import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  difficulty: string | null;
  last_used_date: string | null;
}

interface SelectedQuestion extends Question {
  order: number;
}

// Niveles de dificultad en orden progresivo
const DIFFICULTY_LEVELS = [
  { key: 'kanicofrade', label: 'Kanicofrade', orderStart: 1 },
  { key: 'nazareno', label: 'Nazareno', orderStart: 3 },
  { key: 'costalero', label: 'Costalero', orderStart: 5 },
  { key: 'capataz', label: 'Capataz', orderStart: 7 },
  { key: 'maestro', label: 'Maestro', orderStart: 9 },
] as const;

const QUESTIONS_PER_LEVEL = 2;

export const DailyQuestionsSelector = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const queryClient = useQueryClient();

  // Cargar todas las preguntas disponibles
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['all-questions'],
    queryFn: async () => {
      const fetchPage = (start: number, end: number) =>
        supabase
          .from('questions')
          .select('id, question_text, difficulty, last_used_date')
          .order('created_at', { ascending: false })
          .range(start, end);

      const [p1, p2, p3] = await Promise.all([
        fetchPage(0, 999),
        fetchPage(1000, 1999),
        fetchPage(2000, 2999),
      ]);

      if (p1.error) throw p1.error;

      return [
        ...(p1.data || []),
        ...(p2.data || []),
        ...(p3.data || []),
      ] as Question[];
    },
  });

  // Cargar días que tienen exactamente 10 preguntas configuradas
  const { data: daysWithTenQuestions = [] } = useQuery({
    queryKey: ['days-with-ten-questions'],
    queryFn: async () => {
      const fetchPage = (start: number, end: number) =>
        supabase
          .from('daily_questions')
          .select('date')
          .order('date')
          .range(start, end);

      const [p1, p2, p3] = await Promise.all([
        fetchPage(0, 999),
        fetchPage(1000, 1999),
        fetchPage(2000, 2999),
      ]);

      if (p1.error) throw p1.error;

      const allRows = [
        ...(p1.data || []),
        ...(p2.data || []),
        ...(p3.data || []),
      ];

      // Contar preguntas por día y filtrar solo los que tienen 10
      const dateCounts = allRows.reduce((acc, { date }) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.keys(dateCounts)
        .filter(date => dateCounts[date] === 10)
        .map(date => new Date(date + 'T00:00:00'));
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

  // Sincronizar selectedQuestions con dailyQuestions cuando cambie la fecha o las preguntas
  useEffect(() => {
    if (dailyQuestions.length > 0 && questions.length > 0) {
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
  }, [dailyQuestions, questions, selectedDate]);

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

      // 3. Actualizar last_used_date de las preguntas seleccionadas
      const questionIds = selectedQuestions.map((q) => q.id);
      const { error: updateError } = await supabase
        .from('questions')
        .update({ last_used_date: dateStr })
        .in('id', questionIds);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-questions'] });
      queryClient.invalidateQueries({ queryKey: ['days-with-ten-questions'] });
      queryClient.invalidateQueries({ queryKey: ['all-questions'] });
      toast.success('Preguntas del día guardadas correctamente');
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('Error saving daily questions:', error);
      }
      toast.error('Error al guardar las preguntas del día');
    },
  });

  // Obtener preguntas seleccionadas por nivel
  const getSelectedByLevel = (levelKey: string): SelectedQuestion[] => {
    return selectedQuestions.filter(q => q.difficulty === levelKey);
  };

  // Manejar selección/deselección de pregunta
  const handleToggleQuestion = (question: Question, levelKey: string) => {
    const isSelected = selectedQuestions.some((q) => q.id === question.id);
    const levelConfig = DIFFICULTY_LEVELS.find(l => l.key === levelKey);
    if (!levelConfig) return;

    if (isSelected) {
      // Deseleccionar
      const filtered = selectedQuestions.filter((q) => q.id !== question.id);
      // Reordenar las preguntas del mismo nivel
      const reordered = recalculateOrders(filtered);
      setSelectedQuestions(reordered);
    } else {
      // Verificar si ya hay 2 preguntas de este nivel
      const currentLevelQuestions = getSelectedByLevel(levelKey);
      if (currentLevelQuestions.length >= QUESTIONS_PER_LEVEL) {
        toast.error(`Ya has seleccionado ${QUESTIONS_PER_LEVEL} preguntas de nivel ${levelConfig.label}`);
        return;
      }

      // Calcular el orden para esta nueva pregunta
      const orderInLevel = currentLevelQuestions.length + 1; // 1 o 2
      const order = levelConfig.orderStart + orderInLevel - 1;

      setSelectedQuestions([
        ...selectedQuestions,
        { ...question, order },
      ]);
    }
  };

  // Recalcular órdenes después de eliminar una pregunta
  const recalculateOrders = (questions: SelectedQuestion[]): SelectedQuestion[] => {
    return questions.map(q => {
      const levelConfig = DIFFICULTY_LEVELS.find(l => l.key === q.difficulty);
      if (!levelConfig) return q;
      
      // Contar cuántas preguntas del mismo nivel vienen antes
      const sameLevel = questions.filter(sq => sq.difficulty === q.difficulty);
      const positionInLevel = sameLevel.findIndex(sq => sq.id === q.id);
      
      return {
        ...q,
        order: levelConfig.orderStart + positionInLevel
      };
    });
  };

  const handleSave = () => {
    // Verificar que hay exactamente 2 preguntas por nivel
    for (const level of DIFFICULTY_LEVELS) {
      const count = getSelectedByLevel(level.key).length;
      if (count !== QUESTIONS_PER_LEVEL) {
        toast.error(`Debes seleccionar exactamente ${QUESTIONS_PER_LEVEL} preguntas de nivel ${level.label}`);
        return;
      }
    }
    saveMutation.mutate();
  };

  // Calcular días desde la última vez que se usó una pregunta
  const getDaysSinceLastUse = (lastUsedDate: string | null): number | null => {
    if (!lastUsedDate) return null;
    return differenceInDays(new Date(), new Date(lastUsedDate));
  };

  // Obtener color del badge según días transcurridos
  const getUsageBadgeColor = (days: number | null): string => {
    // Verde: nunca usada o usada hace más de 70 días
    if (days === null || days > 70) return 'bg-green-500/20 text-green-700 dark:text-green-400';
    // Rojo: usada hace menos de 10 días
    if (days < 10) return 'bg-red-500/20 text-red-700 dark:text-red-400';
    // Naranja: usada hace 10-30 días
    if (days <= 30) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    // Amarillo: usada hace 31-50 días
    return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
  };

  // Verificar si todas las secciones están completas
  const isAllComplete = DIFFICULTY_LEVELS.every(
    level => getSelectedByLevel(level.key).length === QUESTIONS_PER_LEVEL
  );

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
            modifiers={{
              hasQuestions: daysWithTenQuestions,
            }}
            modifiersClassNames={{
              hasQuestions: 'has-questions-day',
            }}
          />
        </CardContent>
      </Card>

      {/* Lista de preguntas por nivel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Preguntas para {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </CardTitle>
          <CardDescription>
            Selecciona 2 preguntas de cada nivel de dificultad ({selectedQuestions.length}/10 total)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Secciones por nivel de dificultad */}
          {DIFFICULTY_LEVELS.map((level) => {
            const levelQuestions = questions
              .filter(q => q.difficulty === level.key)
              .sort((a, b) => {
                if (a.last_used_date === null && b.last_used_date === null) return 0;
                if (a.last_used_date === null) return -1;
                if (b.last_used_date === null) return 1;
                return new Date(a.last_used_date).getTime() - new Date(b.last_used_date).getTime();
              });
            const selectedInLevel = getSelectedByLevel(level.key);
            const isLevelComplete = selectedInLevel.length === QUESTIONS_PER_LEVEL;

            return (
              <div key={level.key} className="space-y-3">
                {/* Header del nivel */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg uppercase tracking-wide">
                      {level.label}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {levelQuestions.length} preguntas{' '}
                      <span className="text-green-600 font-medium">
                        ({levelQuestions.filter(q => q.last_used_date === null || differenceInDays(new Date(), new Date(q.last_used_date)) > 70).length} disponibles para usar)
                      </span>
                    </span>
                    {isLevelComplete && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isLevelComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
                    ({selectedInLevel.length}/{QUESTIONS_PER_LEVEL})
                  </span>
                </div>

                {/* Lista de preguntas del nivel */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pl-2">
                  {levelQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No hay preguntas de nivel {level.label}
                    </p>
                  ) : (
                    levelQuestions.map((question) => {
                      const selected = selectedQuestions.find((q) => q.id === question.id);
                      const daysSinceUse = getDaysSinceLastUse(question.last_used_date);
                      const badgeColor = getUsageBadgeColor(daysSinceUse);
                      const isDisabled = !selected && selectedInLevel.length >= QUESTIONS_PER_LEVEL;

                      return (
                        <div
                          key={question.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors ${
                            isDisabled ? 'opacity-50' : 'hover:bg-accent/50'
                          } ${selected ? 'border-primary bg-primary/5' : ''}`}
                        >
                          <Checkbox
                            checked={!!selected}
                            onCheckedChange={() => handleToggleQuestion(question, level.key)}
                            disabled={isDisabled}
                          />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {selected && (
                                <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                                  {selected.order}
                                </span>
                              )}
                              {question.question_text}
                            </p>
                            <Badge variant="outline" className={`text-xs ${badgeColor}`}>
                              {daysSinceUse === null
                                ? 'Nunca usada'
                                : daysSinceUse === 0
                                ? 'Usada hoy'
                                : daysSinceUse === 1
                                ? 'Usada hace 1 día'
                                : `Usada hace ${daysSinceUse} días`}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          {/* Botón guardar */}
          <div className="mt-6 flex justify-end border-t pt-4">
            <Button
              onClick={handleSave}
              disabled={!isAllComplete || saveMutation.isPending}
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

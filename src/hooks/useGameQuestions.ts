import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGameQuestions = () => {
  return useQuery({
    queryKey: ['game-questions'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // 1. Intentar cargar preguntas del día
      // SEGURIDAD: NO incluir correct_answer para prevenir trampas
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_questions')
        .select('question_id, questions(id, question_text, option_a, option_b, option_c, option_d, difficulty)')
        .eq('date', today)
        .order('order_number');

      if (dailyError) throw dailyError;

      // Si hay 10 preguntas para hoy, usarlas
      if (dailyData && dailyData.length === 10) {
        return dailyData.map((dq: any) => dq.questions);
      }

      // 2. Fallback: cargar 10 preguntas aleatorias
      // SEGURIDAD: Seleccionar solo campos necesarios, SIN correct_answer
      const { data: randomData, error: randomError } = await supabase
        .from('questions')
        .select('id, question_text, option_a, option_b, option_c, option_d, difficulty')
        .order('created_at', { ascending: false })
        .limit(10);

      if (randomError) throw randomError;

      return randomData || [];
    },
    staleTime: Infinity, // No recargar durante la sesión
  });
};

export const useCheckTodayGame = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['today-game', userId],
    queryFn: async () => {
      if (!userId) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

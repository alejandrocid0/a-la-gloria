import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGameQuestions = () => {
  return useQuery({
    queryKey: ['game-questions'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // 1. Intentar cargar preguntas del día
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_questions')
        .select('question_id, questions(*)')
        .eq('date', today)
        .order('order_number');

      if (dailyError) throw dailyError;

      // Si hay 10 preguntas para hoy, usarlas
      if (dailyData && dailyData.length === 10) {
        return dailyData.map((dq: any) => dq.questions);
      }

      // 2. Fallback: cargar 10 preguntas aleatorias
      const { data: randomData, error: randomError } = await supabase
        .from('questions')
        .select('*')
        .limit(10);

      if (randomError) throw randomError;

      // Mezclar las preguntas aleatoriamente en el cliente
      const shuffled = randomData?.sort(() => Math.random() - 0.5);
      return shuffled || [];
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

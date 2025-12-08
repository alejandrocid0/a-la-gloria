import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Campos seguros que no incluyen correct_answer
const SAFE_QUESTION_FIELDS = 'id, question_text, option_a, option_b, option_c, option_d, difficulty';

export const useGameQuestions = () => {
  return useQuery({
    queryKey: ['game-questions'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // 1. Intentar cargar preguntas del día (sin correct_answer)
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_questions')
        .select(`question_id, questions(${SAFE_QUESTION_FIELDS})`)
        .eq('date', today)
        .order('order_number');

      if (dailyError) {
        console.warn('No se pudieron cargar preguntas del día, usando aleatorias:', dailyError);
      }

      // Si hay 10 preguntas para hoy, usarlas
      if (dailyData && dailyData.length === 10) {
        return dailyData.map((dq: any) => dq.questions);
      }

      // 2. Fallback: cargar preguntas aleatorias de niveles fáciles (sin correct_answer)
      const { data: randomData, error: randomError } = await supabase
        .from('questions')
        .select(SAFE_QUESTION_FIELDS)
        .in('difficulty', ['kanicofrade', 'nazareno'])
        .limit(50);

      if (randomError) throw randomError;

      // Barajar y tomar 10 aleatorias
      if (randomData && randomData.length > 0) {
        const shuffled = randomData.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 10);
      }

      return [];
    },
    staleTime: Infinity,
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
    staleTime: 0,
    refetchOnMount: true,
  });
};

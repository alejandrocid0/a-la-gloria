import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Campos seguros que no incluyen correct_answer
const SAFE_QUESTION_FIELDS = 'id, question_text, option_a, option_b, option_c, option_d, difficulty';

// Hook para obtener la fecha del servidor (anti-manipulación de reloj)
export const useServerDate = () => {
  return useQuery({
    queryKey: ['server-date'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-server-time');
      
      if (error) {
        console.error('Error fetching server time:', error);
        throw error;
      }
      
      console.log('Server date received:', data.date);
      return data.date as string; // YYYY-MM-DD
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    gcTime: 1000 * 60 * 30, // Mantener en cache 30 minutos
    retry: 3,
  });
};

export const useGameQuestions = (serverDate: string | undefined) => {
  return useQuery({
    queryKey: ['game-questions', serverDate],
    queryFn: async () => {
      if (!serverDate) throw new Error('Server date not available');

      // 1. Intentar cargar preguntas del día (sin correct_answer)
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_questions')
        .select(`question_id, questions(${SAFE_QUESTION_FIELDS})`)
        .eq('date', serverDate)
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
    enabled: !!serverDate,
    staleTime: Infinity,
  });
};

export const useCheckTodayGame = (userId: string | undefined, serverDate: string | undefined) => {
  return useQuery({
    queryKey: ['today-game', userId, serverDate],
    queryFn: async () => {
      if (!userId || !serverDate) return null;
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', userId)
        .eq('date', serverDate)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!serverDate,
    staleTime: 0,
    refetchOnMount: true,
  });
};

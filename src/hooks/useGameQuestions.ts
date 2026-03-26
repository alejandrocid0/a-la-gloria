import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
  });
};

export const useGameQuestions = (serverDate: string | undefined) => {
  return useQuery({
    queryKey: ['game-questions', serverDate],
    queryFn: async () => {
      if (!serverDate) throw new Error('Server date not available');

      // 1. Obtener IDs de preguntas del día
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_questions')
        .select('question_id')
        .eq('date', serverDate)
        .order('order_number');

      if (dailyError) {
        console.warn('No se pudieron cargar preguntas del día, usando aleatorias:', dailyError);
      }

      // Si hay 10 preguntas para hoy, cargarlas via RPC segura
      if (dailyData && dailyData.length === 10) {
        const questionIds = dailyData.map((dq) => dq.question_id);
        const { data: questions, error: qError } = await supabase
          .rpc('get_questions_for_daily_game', { question_ids: questionIds });

        if (qError) {
          console.error('Error loading daily questions via RPC:', qError);
          throw qError;
        }

        // Mantener el orden original de daily_questions
        const questionMap = new Map(questions.map((q: any) => [q.id, q]));
        return questionIds.map((id) => questionMap.get(id)).filter(Boolean);
      }

      // 2. Fallback: cargar 2 preguntas aleatorias de cada nivel via RPC segura
      const DIFFICULTY_LEVELS = ['kanicofrade', 'nazareno', 'costalero', 'capataz', 'maestro'];
      const questionsPerLevel: any[] = [];

      for (const difficulty of DIFFICULTY_LEVELS) {
        const { data, error } = await supabase
          .rpc('get_random_questions_by_difficulty', { p_difficulty: difficulty, p_limit: 2 });

        if (error) {
          console.warn(`Error loading ${difficulty} questions:`, error);
          continue;
        }

        if (data && data.length > 0) {
          questionsPerLevel.push(...data);
        }
      }

      if (questionsPerLevel.length > 0) {
        return questionsPerLevel;
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

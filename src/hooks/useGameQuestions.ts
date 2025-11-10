import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGameQuestions = () => {
  return useQuery({
    queryKey: ['game-questions'],
    queryFn: async () => {
      // Cargar 10 preguntas aleatorias
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(10);

      if (error) throw error;
      
      // Mezclar las preguntas aleatoriamente en el cliente
      const shuffled = data?.sort(() => Math.random() - 0.5);
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

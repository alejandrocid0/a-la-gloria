import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * DATOS NECESARIOS DE LOVABLE CLOUD (Supabase):
 * 
 * 1. Resultado de la partida:
 *    - Viene desde Play.tsx via useLocation state
 *    - score: número de puntos obtenidos
 *    - totalQuestions: total de preguntas respondidas
 * 
 * 2. Guardar resultado en base de datos:
 *    - INSERT INTO games (user_id, score, date, answers)
 *    - UPDATE profiles SET 
 *        total_points = total_points + score,
 *        games_played = games_played + 1,
 *        last_game_date = CURRENT_DATE,
 *        best_score = GREATEST(best_score, score)
 * 
 * 3. Actualizar racha:
 *    - Si last_game_date = yesterday → current_streak + 1
 *    - Si last_game_date < yesterday → current_streak = 1
 */

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { score = 0, totalQuestions = 10, correctAnswers = 0, avgTime = 0 } = location.state || {};
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    const saveGameResult = async () => {
      if (!user?.id) {
        toast.error("No autenticado");
        navigate('/auth');
        return;
      }

      if (!location.state) {
        toast.error("No hay datos de la partida");
        navigate('/');
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const incorrectAnswers = totalQuestions - correctAnswers;

        // 1. Guardar la partida
        const { error: gameError } = await supabase.from('games').insert({
          user_id: user.id,
          date: today,
          total_score: score,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          avg_time: avgTime,
        });

        if (gameError) throw gameError;

        // 2. Obtener perfil actual
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // 3. Calcular nueva racha
        let newStreak = 1;
        if (profile.last_game_date) {
          const lastGameDate = new Date(profile.last_game_date);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastGameDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak = (profile.current_streak || 0) + 1;
          }
        }

        // 4. Actualizar perfil
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_points: (profile.total_points || 0) + score,
            games_played: (profile.games_played || 0) + 1,
            best_score: Math.max(profile.best_score || 0, score),
            last_game_date: today,
            current_streak: newStreak,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast.success("¡Partida guardada!");
      } catch (error) {
        console.error('Error saving game:', error);
        toast.error("Error al guardar la partida");
      } finally {
        setSaving(false);
      }
    };

    saveGameResult();
  }, [user, location.state, score, totalQuestions, correctAnswers, avgTime, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-6 px-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-cinzel font-bold">¡Partida completada!</h1>
        </div>
      </header>

      {/* Results Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Score Card */}
        <Card className="p-8 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_8px_24px_rgba(75,43,138,0.2)] bg-gradient-to-br from-[hsl(45,71%,65%)]/20 to-white">
          <p className="text-sm text-muted-foreground mb-4 font-medium">Tu puntuación</p>
          {/* TODO: Mostrar score real desde state */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-7xl font-bold text-accent">{score}</span>
            <span className="text-4xl">⭐</span>
          </div>
          <p className="text-base text-muted-foreground">puntos</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] bg-gradient-to-br from-[hsl(272,58%,35%)]/5 to-white">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Aciertos</p>
            {/* TODO: Mostrar correctAnswers real desde Play.tsx */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">{correctAnswers}</span>
              <span className="text-xl">✅</span>
            </div>
          </Card>
          <Card className="p-5 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] bg-gradient-to-br from-[hsl(272,58%,35%)]/5 to-white">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Promedio</p>
            {/* TODO: Calcular promedio real: score / totalQuestions */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">
                {Math.round(score / totalQuestions)}
              </span>
              <span className="text-xl">🎯</span>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate('/ranking')}
            variant="cta"
            size="xl"
            className="w-full"
            disabled={saving}
          >
            🏆 Ver Ranking
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-12 text-base border-2 hover:bg-primary/5 font-semibold"
            size="lg"
            disabled={saving}
          >
            ← Volver al inicio
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Results;

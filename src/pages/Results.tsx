import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { user, loading } = useAuth();
  const { score = 0, totalQuestions = 10, correctAnswers = 0, avgTime = 0, isNewBestScore = false } = location.state || {};

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (loading) return;
    
    // Game result is already saved by the edge function
    // This component just displays the server-validated results
    if (!user?.id) {
      toast.error("No autenticado");
      navigate('/auth');
      return;
    }

    if (!location.state || location.state.score === undefined) {
      toast.error("No hay datos de la partida");
      navigate('/');
      return;
    }
    
    toast.success('¡Resultado guardado!');
  }, [user, loading, location.state, navigate]);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
        <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-6 px-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-cinzel font-bold">Cargando...</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

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

        {/* New Best Score Banner */}
        {isNewBestScore && (
          <div className="p-4 text-center rounded-lg border-2 border-accent bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 shadow-[0_4px_12px_rgba(228,178,41,0.3)]">
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <span className="text-2xl">🏆</span>
              <span className="text-lg font-cinzel font-bold text-accent">¡Nueva mejor puntuación!</span>
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        )}

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
          >
            🏆 Ver Ranking
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-12 text-base border-2 hover:bg-primary/5 font-semibold"
            size="lg"
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

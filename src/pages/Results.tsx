import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useNavigate, useLocation } from "react-router-dom";

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
  const { score = 0, totalQuestions = 10 } = location.state || {};

  // TODO: Guardar resultado en Lovable Cloud cuando se monta el componente
  // useEffect(() => {
  //   const saveGameResult = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) return;
  //
  //     // Guardar partida
  //     await supabase.from('games').insert({
  //       user_id: user.id,
  //       score,
  //       date: new Date().toISOString()
  //     });
  //
  //     // Actualizar perfil se hace automáticamente con trigger en database.sql
  //   };
  //   saveGameResult();
  // }, []);

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
        <Card className="p-8 text-center border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          <p className="text-lg text-muted-foreground mb-2">Tu puntuación</p>
          {/* TODO: Mostrar score real desde state */}
          <p className="text-6xl font-bold text-accent mb-2">{score}</p>
          <p className="text-sm text-muted-foreground">puntos</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-border">
            <p className="text-sm text-muted-foreground mb-2">Preguntas</p>
            <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
          </Card>
          <Card className="p-5 text-center border-border">
            <p className="text-sm text-muted-foreground mb-2">Promedio</p>
            {/* TODO: Calcular promedio real: score / totalQuestions */}
            <p className="text-3xl font-bold text-foreground">
              {Math.round(score / totalQuestions)}
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate('/ranking')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-lg"
          >
            Ver Ranking
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-14 text-lg font-bold border-2"
          >
            Volver al inicio
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Results;

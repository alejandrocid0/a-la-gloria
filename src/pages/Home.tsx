import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Flame, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { useCheckTodayGame, useServerDate } from "@/hooks/useGameQuestions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";
import logo from "@/assets/logo.png";

/**
 * DATOS NECESARIOS DE LOVABLE CLOUD (Supabase):
 * 
 * 1. Usuario actual:
 *    - Query: SELECT * FROM profiles WHERE id = auth.uid()
 *    - Campos: name, total_points, current_streak, last_game_date
 * 
 * 2. Verificar si hay partida disponible hoy:
 *    - Comparar last_game_date con fecha actual
 *    - Si last_game_date < hoy → mostrar botón habilitado
 *    - Si last_game_date = hoy → deshabilitar botón o mostrar mensaje
 * 
 * 3. Estado de autenticación:
 *    - useEffect con supabase.auth.onAuthStateChange()
 *    - Si no hay sesión → redirigir a /auth
 */

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [showTutorial, setShowTutorial] = useState(false);

  // Verificar si es la primera visita
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial && profile) {
      setShowTutorial(true);
    }
  }, [profile]);

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  // Obtener posición del usuario en el ranking usando función optimizada
  const { data: rankingData } = useQuery({
    queryKey: ['user-ranking-position', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .rpc('get_user_ranking_position', { user_uuid: profile.id });

      if (error || !data || data.length === 0) return null;

      return {
        position: Number(data[0].rank_position),
        totalUsers: Number(data[0].total_users),
      };
    },
    enabled: !!profile?.id,
    staleTime: 0, // Siempre obtener datos frescos al navegar
  });

  // Si es admin, redirigir al panel de administración
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, loading, navigate]);

  // Obtener fecha del servidor para evitar manipulación de reloj
  const { data: serverDate } = useServerDate();
  
  // Verificar si ya hay una partida del día (completada o in_progress)
  const { data: todayGame } = useCheckTodayGame(user?.id, serverDate);
  const hasPlayedToday = !!todayGame;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {showTutorial && <WelcomeTutorial onComplete={handleTutorialComplete} />}
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-6 px-6 shadow-lg">
        <div className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="A la Gloria" 
            className="h-16 drop-shadow-lg"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-6 space-y-6 w-full">
        {/* Greeting */}
        <div className="text-center py-2">
          {profileLoading ? (
            <Skeleton className="h-8 w-48 mx-auto" />
          ) : (
            <h2 className="text-2xl font-bold text-foreground">Hola, {profile?.name || 'Usuario'}</h2>
          )}
        </div>

        {/* Play Button */}
        <Button 
          onClick={() => navigate('/jugar')}
          variant={hasPlayedToday ? "secondary" : "cta"}
          size="xl"
          className="w-full"
          disabled={hasPlayedToday}
        >
          {hasPlayedToday ? 'No puedes volver a jugar hoy' : '🎯 Jugar la partida de hoy'}
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)] transition-all bg-gradient-to-br from-[hsl(45,71%,65%)]/10 to-white">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Puntos totales</p>
            {profileLoading ? (
              <Skeleton className="h-10 w-24 mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-accent">{profile?.total_points?.toLocaleString() || 0}</span>
                <span className="text-2xl">⭐</span>
              </div>
            )}
          </Card>
          <Card className="p-5 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)] transition-all bg-gradient-to-br from-orange-500/10 to-white">
            <p className="text-sm text-muted-foreground mb-2 font-medium flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Racha</span>
            </p>
            {profileLoading ? (
              <Skeleton className="h-10 w-20 mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-orange-500">{profile?.current_streak || 0}</span>
                <span className="text-xl text-muted-foreground">días</span>
              </div>
            )}
          </Card>
        </div>

        {/* Ranking Position Reminder */}
        <Card 
          className="p-6 border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.25)] transition-all cursor-pointer bg-gradient-to-br from-[hsl(272,58%,35%)]/5 to-white hover:scale-[1.02]"
          onClick={() => navigate('/ranking')}
        >
          {profileLoading ? (
            <div className="flex items-center justify-between">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-16 w-24" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">Tu posición</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-4xl font-bold text-accent">#{rankingData?.position || '-'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">de</p>
                <p className="text-3xl font-bold text-foreground">{rankingData?.totalUsers?.toLocaleString() || '-'}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Compartir con amigos */}
        <Button 
          asChild
          variant="outline"
          size="xl"
          className="w-full border-[hsl(45,71%,65%)] border-2 bg-white hover:bg-[hsl(45,71%,65%)]/10 text-foreground font-bold shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)]"
        >
          <a
            href="https://wa.me/?text=¡Prueba%20ya%20A%20la%20Gloria,%20el%20mejor%20juego%20para%20cofrades!%20Demuestra%20que%20eres%20quien%20más%20sabe%20de%20Semana%20Santa%20🏆.%20alagloria.es"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Comparte con otros cofrades
          </a>
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;

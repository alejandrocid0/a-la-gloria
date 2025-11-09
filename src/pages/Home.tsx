import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { isAdmin, loading } = useAdmin();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Obtener posición del usuario en el ranking
  const { data: rankingData } = useQuery({
    queryKey: ['user-ranking-position', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      // Contar usuarios con más puntos
      const { count: betterPlayersCount } = await supabase
        .from('public_profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', profile.total_points || 0);

      // Contar total de usuarios
      const { count: totalUsers } = await supabase
        .from('public_profiles')
        .select('*', { count: 'exact', head: true });

      return {
        position: (betterPlayersCount || 0) + 1,
        totalUsers: totalUsers || 0,
      };
    },
    enabled: !!profile?.id,
  });

  // Si es admin, redirigir al panel de administración
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, loading, navigate]);

  // Verificar si ya jugó hoy
  const hasPlayedToday = profile?.last_game_date === new Date().toISOString().split('T')[0];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
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
          variant="cta"
          size="xl"
          className="w-full"
          disabled={hasPlayedToday}
        >
          {hasPlayedToday ? '✓ Ya jugaste hoy' : '🎯 Jugar la partida de hoy'}
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
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;

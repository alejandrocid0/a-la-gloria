import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  
  // TODO: Cargar datos del usuario desde Lovable Cloud
  // const { data: profile } = useQuery({
  //   queryKey: ['profile'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('profiles')
  //       .select('*')
  //       .eq('id', userId)
  //       .single();
  //     if (error) throw error;
  //     return data;
  //   }
  // });
  
  // TODO: Verificar autenticación
  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (!session) {
  //       navigate('/auth');
  //     }
  //   });
  //   return () => authListener.subscription.unsubscribe();
  // }, []);
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-6 px-6 shadow-lg">
        <div className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="A la Gloria" 
            className="h-16 drop-shadow-lg"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6 flex-1 overflow-auto">
        {/* Greeting */}
        <div className="text-center py-2">
          {/* TODO: Reemplazar con profile?.name */}
          <h2 className="text-2xl font-bold text-foreground">Hola, Nombre del usuario</h2>
        </div>

        {/* Play Button */}
        {/* TODO: Verificar si ya jugó hoy (profile?.last_game_date === today) */}
        {/* TODO: Si ya jugó → deshabilitar botón y mostrar "Ya jugaste hoy" */}
        <Button 
          onClick={() => navigate('/jugar')}
          variant="cta"
          size="xl"
          className="w-full"
        >
          🎯 Jugar la partida de hoy
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)] transition-all bg-gradient-to-br from-[hsl(45,71%,65%)]/10 to-white">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Puntos totales</p>
            {/* TODO: Reemplazar con profile?.total_points */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-accent">2,450</span>
              <span className="text-2xl">⭐</span>
            </div>
          </Card>
          <Card className="p-5 text-center border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.2)] transition-all bg-gradient-to-br from-orange-500/10 to-white">
            <p className="text-sm text-muted-foreground mb-2 font-medium flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Racha</span>
            </p>
            {/* TODO: Reemplazar con profile?.current_streak */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-orange-500">7</span>
              <span className="text-xl text-muted-foreground">días</span>
            </div>
          </Card>
        </div>

        {/* Ranking Position Reminder */}
        {/* TODO: Cargar posición del usuario en ranking desde Lovable Cloud */}
        {/* Query: 
             SELECT COUNT(*) + 1 as position
             FROM profiles
             WHERE total_points > (SELECT total_points FROM profiles WHERE id = auth.uid())
        */}
        <Card 
          className="p-6 border-[hsl(45,71%,65%)] border-2 shadow-[0_4px_12px_rgba(75,43,138,0.15)] hover:shadow-[0_8px_24px_rgba(75,43,138,0.25)] transition-all cursor-pointer bg-gradient-to-br from-[hsl(272,58%,35%)]/5 to-white hover:scale-[1.02]"
          onClick={() => navigate('/ranking')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Tu posición</p>
              {/* TODO: Reemplazar con posición real del usuario */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-4xl font-bold text-accent">#25</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">de</p>
              {/* TODO: Reemplazar con total de usuarios: SELECT COUNT(*) FROM profiles */}
              <p className="text-3xl font-bold text-foreground">1,234</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;

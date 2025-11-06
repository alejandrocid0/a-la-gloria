import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * DATOS DE SEGURIDAD:
 * - El perfil del usuario (con email) se obtiene de 'profiles'
 * - RLS Policy: Los usuarios solo pueden ver su propio perfil completo
 * - Query: SELECT * FROM profiles WHERE id = auth.uid()
 * - El email del usuario está protegido y solo visible para el propio usuario
 */

const Profile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
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
  
  // TODO: Obtener email desde auth.users
  // const { data: { user } } = await supabase.auth.getUser();
  
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
      return;
    }
    
    toast.success('¡Hasta pronto!');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Mi Perfil</h1>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* User Info */}
        <Card className="p-6 border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center gap-4">
            {/* Avatar/Escudo */}
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-accent-foreground">A</span>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-left">
              {/* TODO: Reemplazar con profile?.name */}
              <h2 className="text-xl font-bold text-foreground mb-1">Alias del jugador</h2>
              {/* TODO: Reemplazar con profile?.hermandad */}
              <p className="text-sm text-muted-foreground mb-1">Hermandad del usuario</p>
              {/* TODO: Reemplazar con user?.email */}
              <p className="text-xs text-muted-foreground">jugador@email.com</p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-accent/20 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Puntos totales</p>
            {/* TODO: Reemplazar con profile?.total_points */}
            <p className="text-3xl font-bold text-accent">2,450</p>
          </Card>
          <Card className="p-5 text-center border-accent/20 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Partidas jugadas</p>
            {/* TODO: Reemplazar con profile?.games_played */}
            <p className="text-3xl font-bold text-accent">15</p>
          </Card>
        </div>

        {/* Extended Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center border-border">
            <p className="text-xs text-muted-foreground mb-1">Mejor</p>
            {/* TODO: Reemplazar con profile?.best_score */}
            <p className="text-2xl font-bold text-accent">950</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <p className="text-xs text-muted-foreground mb-1">Racha</p>
            {/* TODO: Reemplazar con profile?.current_streak */}
            <p className="text-2xl font-bold text-orange-500">7</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <p className="text-xs text-muted-foreground mb-1">Promedio</p>
            {/* TODO: Calcular profile?.total_points / profile?.games_played */}
            <p className="text-2xl font-bold text-foreground">820</p>
          </Card>
        </div>

        {/* Achievements Preview */}
        <Card className="p-5 border-accent/20 shadow-lg">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            🏆 Logros recientes
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-accent/10 rounded">
              <span className="text-foreground">Primera victoria</span>
              <span className="text-accent font-bold">✓</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded opacity-50">
              <span className="text-muted-foreground">Racha de 10 días</span>
              <span className="text-muted-foreground">7/10</span>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12 text-base font-bold shadow-lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar sesión
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

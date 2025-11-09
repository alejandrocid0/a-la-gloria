import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { signOut, user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  // Calcular promedio (evitar división por cero)
  const average = profile?.games_played ? Math.round(profile.total_points / profile.games_played) : 0;

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
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-4 px-6 shadow-lg">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-cinzel font-bold text-primary-foreground">Mi Perfil</h1>
        </div>
      </header>

      {/* Profile Content */}
      <main className="flex-1 overflow-y-auto max-w-md mx-auto px-6 py-8 space-y-6 w-full">
        {/* User Info */}
        <Card className="p-6 border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Avatar/Escudo */}
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-accent-foreground">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-left">
                <h2 className="text-xl font-bold text-foreground mb-1">{profile?.name || 'Usuario'}</h2>
                <p className="text-sm text-muted-foreground mb-1">{profile?.hermandad || 'Sin hermandad'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'Sin email'}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center border-accent/20 shadow-lg">
            <p className="text-xs text-muted-foreground mb-1">Puntos</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-accent">{profile?.total_points?.toLocaleString() || 0}</p>
            )}
          </Card>
          <Card className="p-4 text-center border-accent/20 shadow-lg">
            <p className="text-xs text-muted-foreground mb-1">Partidas</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-accent">{profile?.games_played || 0}</p>
            )}
          </Card>
          <Card className="p-4 text-center border-accent/20 shadow-lg">
            <p className="text-xs text-muted-foreground mb-1">Promedio</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-accent">{average}</p>
            )}
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

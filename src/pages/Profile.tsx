import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { LogOut, User } from "lucide-react";

const Profile = () => {
  // TODO: conectar a Supabase aquí para cargar datos del usuario
  const handleLogout = () => {
    // TODO: implementar lógica de cierre de sesión
    console.log("Cerrar sesión");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-10 px-6 text-center shadow-lg">
        <User className="w-14 h-14 mx-auto mb-3 text-accent drop-shadow-lg" />
        <h1 className="text-4xl font-cinzel font-bold">Mi Perfil</h1>
      </header>

      {/* Profile Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* User Avatar & Name */}
        <Card className="p-6 text-center border-accent/20 shadow-xl bg-gradient-to-br from-card to-card/50">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent/80 mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-5xl font-bold text-accent-foreground">A</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Alias del jugador</h2>
          <p className="text-sm text-muted-foreground mb-1">Hermandad del usuario</p>
          <p className="text-xs text-muted-foreground">jugador@email.com</p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 text-center border-accent/20 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Puntos totales</p>
            <p className="text-3xl font-bold text-accent">2,450</p>
          </Card>
          <Card className="p-5 text-center border-accent/20 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Partidas jugadas</p>
            <p className="text-3xl font-bold text-accent">15</p>
          </Card>
        </div>

        {/* Extended Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center border-border">
            <p className="text-xs text-muted-foreground mb-1">Mejor</p>
            <p className="text-2xl font-bold text-accent">950</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <p className="text-xs text-muted-foreground mb-1">Racha</p>
            <p className="text-2xl font-bold text-orange-500">7</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <p className="text-xs text-muted-foreground mb-1">Promedio</p>
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

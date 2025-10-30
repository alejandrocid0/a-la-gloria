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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <User className="w-12 h-12 mx-auto mb-2 text-accent" />
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </header>

      {/* Profile Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* User Avatar & Name */}
        <Card className="p-6 text-center border-border">
          <div className="w-24 h-24 rounded-full bg-accent mx-auto flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-accent-foreground">A</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Alias del jugador</h2>
          <p className="text-sm text-muted-foreground">jugador@email.com</p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center border-border">
            <p className="text-sm text-muted-foreground mb-2">Puntos totales</p>
            <p className="text-3xl font-bold text-accent">0</p>
          </Card>
          <Card className="p-4 text-center border-border">
            <p className="text-sm text-muted-foreground mb-2">Partidas jugadas</p>
            <p className="text-3xl font-bold text-accent">0</p>
          </Card>
        </div>

        {/* Best Score */}
        <Card className="p-6 text-center border-border">
          <p className="text-sm text-muted-foreground mb-2">Mejor puntuación</p>
          <p className="text-4xl font-bold text-accent">0</p>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12 text-base font-medium"
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

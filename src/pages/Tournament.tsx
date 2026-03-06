import { Swords } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Tournament = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-8 px-6 shadow-lg">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold tracking-wide">TORNEOS</h1>
          <p className="text-primary-foreground/80 text-sm mt-2">
            Compite, avanza rondas y demuestra cuánto sabes de nuestra Semana Santa.
          </p>
        </div>
      </header>

      {/* Empty state */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <Swords className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-lg font-medium text-center">
          Próximamente más torneos
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Tournament;

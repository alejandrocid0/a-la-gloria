import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Ranking from "./pages/Ranking";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Auth from "./pages/Auth";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Acerca from "./pages/Acerca";
import Instalar from "./pages/Instalar";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LaunchOverlay from "./components/LaunchOverlay";

// PRELANZAMIENTO: Cambiar a false para lanzar la app
const SHOW_LAUNCH_OVERLAY = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
    },
  },
});

const App = () => {
  // Si el overlay está activo, mostrar SOLO el overlay sin cargar nada más
  if (SHOW_LAUNCH_OVERLAY) {
    return <LaunchOverlay />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/jugar" element={<ProtectedRoute><Play /></ProtectedRoute>} />
            <Route path="/resultados" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/logros" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/acerca" element={<ProtectedRoute><Acerca /></ProtectedRoute>} />
            <Route path="/instalar" element={<Instalar />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

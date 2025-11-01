import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Ranking from "./pages/Ranking";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

/**
 * TODO: IMPLEMENTAR PROTECCIÓN DE RUTAS CON LOVABLE CLOUD
 * 
 * 1. Crear componente ProtectedRoute:
 *    - Verificar si el usuario está autenticado con supabase.auth.getSession()
 *    - Si NO está autenticado → redirigir a /auth
 *    - Si está autenticado → mostrar children
 * 
 * 2. Crear hook useAuth para gestionar sesión global:
 *    - useState para user y session
 *    - useEffect con supabase.auth.onAuthStateChange()
 *    - Funciones login, signup, logout
 * 
 * 3. Envolver rutas protegidas:
 *    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
 *    <Route path="/jugar" element={<ProtectedRoute><Play /></ProtectedRoute>} />
 *    <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
 *    <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
 *    <Route path="/auth" element={<Auth />} /> (sin protección)
 * 
 * 4. En Auth.tsx, redirigir a "/" si el usuario ya está autenticado
 */

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jugar" element={<Play />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

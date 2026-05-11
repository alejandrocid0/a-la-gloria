import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNotificationSetup } from "@/hooks/useNotificationSetup";
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
import Tournament from "./pages/Tournament";
import PastTournaments from "./pages/PastTournaments";
import TournamentPlay from "./pages/TournamentPlay";
import TournamentRoundResult from "./pages/TournamentRoundResult";
import TournamentRanking from "./pages/TournamentRanking";
import TournamentLive from "./pages/TournamentLive";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Web uses BrowserRouter (clean URLs, good SEO).
// Native uses HashRouter (no web server available in the device filesystem).
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

const AppRoutes = () => {
  useNotificationSetup();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Handle deep links from email auth (e.g. password reset)
    const urlListener = CapApp.addListener("appUrlOpen", (event) => {
      try {
        const url = new URL(event.url);
        window.location.hash = url.pathname + url.search;
      } catch {}
    });

    // Handle Android hardware back button
    const backListener = CapApp.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      urlListener.then((l) => l.remove());
      backListener.then((l) => l.remove());
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/jugar" element={<ProtectedRoute><Play /></ProtectedRoute>} />
      <Route path="/resultados" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/logros" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/torneo" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
      <Route path="/torneo/anteriores" element={<ProtectedRoute><PastTournaments /></ProtectedRoute>} />
      <Route path="/torneo/:id/jugar/:round" element={<ProtectedRoute><TournamentPlay /></ProtectedRoute>} />
      <Route path="/torneo/:id/resultado" element={<ProtectedRoute><TournamentRoundResult /></ProtectedRoute>} />
      <Route path="/torneo/:id/ranking" element={<ProtectedRoute><TournamentRanking /></ProtectedRoute>} />
      <Route path="/torneo/:id/live" element={<AdminRoute><TournamentLive /></AdminRoute>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/terminos" element={<Terms />} />
      <Route path="/privacidad" element={<Privacy />} />
      <Route path="/acerca" element={<ProtectedRoute><Acerca /></ProtectedRoute>} />
      <Route path="/instalar" element={<Instalar />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

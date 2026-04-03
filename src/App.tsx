import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Conges from "./pages/Conges";
import Remboursements from "./pages/Remboursements";
import HeuresSup from "./pages/HeuresSup";
import Historique from "./pages/Historique";
import Entretiens from "./pages/Entretiens";
import Admin from "./pages/Admin";
import Employes from "./pages/Employes";
import EmployeDetail from "./pages/EmployeDetail";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return <Navigate to="/" replace />;
  return <AppLayout />;
};

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/conges" element={<Conges />} />
      <Route path="/remboursements" element={<Remboursements />} />
      <Route path="/heures-sup" element={<HeuresSup />} />
      <Route path="/entretiens" element={<Entretiens />} />
      <Route path="/historique" element={<Historique />} />
      <Route path="/employes" element={<AdminGuard><Employes /></AdminGuard>} />
      <Route path="/employes/:userId" element={<AdminGuard><EmployeDetail /></AdminGuard>} />
      <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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

const PendingApproval = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-8">
    <div className="text-center max-w-md space-y-4">
      <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
        <span className="text-3xl">⏳</span>
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Compte en attente de validation</h1>
      <p className="text-muted-foreground text-sm">
        Votre compte a été créé avec succès. Un administrateur doit valider votre accès avant que vous puissiez utiliser l'application.
      </p>
      <button onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">
        Vérifier à nouveau
      </button>
    </div>
  </div>
);

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return <Navigate to="/" replace />;
  if (!user.approved) return <PendingApproval />;
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

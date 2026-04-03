import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Receipt, Clock, Shield, LogOut,
  ChevronLeft, ChevronRight, ClipboardCheck, Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const roleLabels: Record<string, string> = {
  employe: "Employé",
  professeur: "Employé",
  admin_simple: "Admin",
  admin_gestionnaire: "Admin",
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { label: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Congés", icon: CalendarDays, path: "/conges" },
    { label: "Remboursements", icon: Receipt, path: "/remboursements" },
    { label: "Heures Sup.", icon: Clock, path: "/heures-sup" },
    { label: "Entretiens", icon: ClipboardCheck, path: "/entretiens" },
    // La section Historique a été supprimée ici
    ...(isAdmin ? [
      { label: "Employés", icon: Users, path: "/employes" },
      { label: "Administration", icon: Shield, path: "/admin" },
    ] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 shadow-2xl ${collapsed ? "w-[72px]" : "w-64"}`}
      style={{ backgroundColor: "#121212" }}
    >
      {/* SECTION LOGO */}
      <div className="flex items-center gap-3 px-5 py-8 border-b border-white/5">
        <div className="flex items-center justify-center flex-shrink-0">
          <img src="/Flow RH.png" alt="Logo" className={`${collapsed ? "w-10" : "w-12"} h-auto transition-all`} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-heading font-bold text-xl text-white tracking-tight leading-none">FLOWRH</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Management</p>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-[#00C2B2] text-white shadow-lg shadow-[#00C2B2]/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* UTILISATEUR */}
      {!collapsed && user && (
        <div className="mx-3 mb-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
          <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
          <p className="text-xs text-[#00C2B2] font-medium">{roleLabels[user.role] || user.role}</p>
        </div>
      )}

      {/* DECONNEXION */}
      <div className="px-3 pb-6">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-500 w-full transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* BOUTON COLLAPSE */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center shadow-xl hover:bg-[#1a1a1a] transition-colors">
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-white" /> : <ChevronLeft className="w-3.5 h-3.5 text-white" />}
      </button>
    </aside>
  );
};

export default AppSidebar;
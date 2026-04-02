import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Receipt, Clock, Shield, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, History, ClipboardCheck,
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
    { label: "Historique", icon: History, path: "/historique" },
    ...(isAdmin ? [{ label: "Administration", icon: Shield, path: "/admin" }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}
      style={{ background: "var(--gradient-sidebar)" }}
    >
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary/20 flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-sidebar-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-heading font-bold text-lg text-sidebar-primary-foreground leading-none">FLOWRH</h1>
            <p className="text-[11px] text-sidebar-muted mt-0.5 truncate">École des Langues et Cultures</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && user && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.fullName}</p>
          <p className="text-xs text-sidebar-muted">{roleLabels[user.role] || user.role}</p>
        </div>
      )}

      <div className="px-3 pb-4">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-card hover:shadow-card-hover transition-shadow">
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </aside>
  );
};

export default AppSidebar;

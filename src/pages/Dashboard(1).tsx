import { CalendarDays, Receipt, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { statusColors } from "@/types/requests";

const statusLabels: Record<string, string> = { en_attente: "En attente", approuve: "Approuvé", refuse: "Refusé" };
const roleLabels: Record<string, string> = {
  employe: "Employé",
  professeur: "Employé",
  admin_simple: "Admin",
  admin_gestionnaire: "Admin",
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const { data: conges = [] } = useQuery({
    queryKey: ["conges"],
    queryFn: async () => {
      const { data } = await supabase.from("conges").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: remboursements = [] } = useQuery({
    queryKey: ["remboursements"],
    queryFn: async () => {
      const { data } = await supabase.from("remboursements").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: heuresSup = [] } = useQuery({
    queryKey: ["heures_sup"],
    queryFn: async () => {
      const { data } = await supabase.from("heures_supplementaires").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const allRequests = [
    ...conges.map((c) => ({ ...c, type: "conge" as const })),
    ...remboursements.map((r) => ({ ...r, type: "remboursement" as const })),
    ...heuresSup.map((h) => ({ ...h, type: "heures_sup" as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  const pendingCount = allRequests.filter((r) => r.status === "en_attente").length;
  const totalOvertimeHours = heuresSup.reduce((sum, h) => sum + Number(h.heures), 0);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenue, <span className="font-medium text-foreground">{user?.fullName}</span> — {roleLabels[user?.role || "employe"]}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Solde congés" value={user?.soldeConges.restant ?? 0}
          subtitle={`${user?.soldeConges.utilise ?? 0} utilisés sur ${user?.soldeConges.total ?? 0}`}
          icon={CalendarDays} />
        <StatCard title="Demandes en attente" value={pendingCount}
          subtitle={isAdmin ? "toutes demandes" : "en cours de traitement"}
          icon={AlertCircle} colorClass="text-warning" />
        <StatCard title="Remboursements" value={remboursements.length}
          subtitle="demandes soumises" icon={Receipt} colorClass="text-info" />
        <StatCard title="Heures sup." value={`${totalOvertimeHours}h`}
          subtitle="ce trimestre" icon={Clock} colorClass="text-success" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl shadow-card border border-border/50 p-5">
        <h2 className="font-heading font-semibold text-card-foreground mb-4">Solde de congés détaillé</h2>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Utilisé</span>
              <span className="font-medium text-foreground">{user?.soldeConges.utilise} / {user?.soldeConges.total} jours</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((user?.soldeConges.utilise ?? 0) / (user?.soldeConges.total ?? 1)) * 100}%` }} />
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-accent">
            <p className="text-2xl font-heading font-bold text-accent-foreground">{user?.soldeConges.restant}</p>
            <p className="text-xs text-muted-foreground">restants</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-xl shadow-card border border-border/50">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-card-foreground">
            {isAdmin ? "Toutes les demandes récentes" : "Mes dernières demandes"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Détails</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {allRequests.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-card-foreground capitalize">
                    {r.type === "conge" ? "Congé" : r.type === "remboursement" ? "Remboursement" : "Heures sup."}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {r.type === "conge" ? `${r.date_debut} → ${r.date_fin}` :
                     r.type === "remboursement" ? `${r.montant}€ — ${r.motif}` :
                     `${r.heures}h — ${r.motif}`}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {allRequests.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Aucune demande pour le moment</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

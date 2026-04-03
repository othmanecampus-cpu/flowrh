import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Users, CalendarDays } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { statusColors } from "@/types/requests";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  employe: "Employé",
  professeur: "Employé",
  admin_simple: "Admin",
  admin_gestionnaire: "Admin",
};

const Admin = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"demandes" | "utilisateurs" | "soldes">("demandes");

  const { data: pendingConges = [] } = useQuery({
    queryKey: ["admin_conges"],
    queryFn: async () => {
      const { data } = await supabase.from("conges").select("*, profiles!conges_user_id_fkey(full_name)").eq("status", "en_attente");
      return data || [];
    },
  });
  const { data: pendingRemb = [] } = useQuery({
    queryKey: ["admin_remb"],
    queryFn: async () => {
      const { data } = await supabase.from("remboursements").select("*, profiles!remboursements_user_id_fkey(full_name)").eq("status", "en_attente");
      return data || [];
    },
  });
  const { data: pendingHS = [] } = useQuery({
    queryKey: ["admin_hs"],
    queryFn: async () => {
      const { data } = await supabase.from("heures_supplementaires").select("*, profiles!heures_supplementaires_user_id_fkey(full_name)").eq("status", "en_attente");
      return data || [];
    },
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*, user_roles(role), soldes_conges(total, utilise, restant)");
      return data || [];
    },
  });

  

  const allPending = [
    ...pendingConges.map((c: any) => ({ id: c.id, table: "conges" as const, userName: c.profiles?.full_name || "—", type: "Congé", details: `${c.date_debut} → ${c.date_fin}`, date: c.created_at })),
    ...pendingRemb.map((r: any) => ({ id: r.id, table: "remboursements" as const, userName: r.profiles?.full_name || "—", type: "Remboursement", details: `${r.montant}€ — ${r.motif}`, date: r.created_at })),
    ...pendingHS.map((h: any) => ({ id: h.id, table: "heures_supplementaires" as const, userName: h.profiles?.full_name || "—", type: "Heures sup.", details: `${h.heures}h — ${h.motif}`, date: h.created_at })),
  ];

  const validateMutation = useMutation({
    mutationFn: async ({ id, table, status }: { id: string; table: "conges" | "remboursements" | "heures_supplementaires"; status: "approuve" | "refuse" }) => {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_conges"] });
      queryClient.invalidateQueries({ queryKey: ["admin_remb"] });
      queryClient.invalidateQueries({ queryKey: ["admin_hs"] });
      toast.success("Demande mise à jour !");
    },
    onError: (err: Error) => toast.error(err.message),
  });


  const roleChangeMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").update({ role: role as any }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profiles"] });
      toast.success("Rôle modifié !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const tabs = [
    { key: "demandes" as const, label: "Demandes", icon: CheckCircle, count: allPending.length },
    { key: "utilisateurs" as const, label: "Utilisateurs", icon: Users },
    { key: "soldes" as const, label: "Soldes", icon: CalendarDays },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Administration</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez les demandes, comptes et soldes</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-0 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "demandes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Utilisateur</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Détails</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPending.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="px-5 py-3 font-medium text-card-foreground">{r.userName}</td>
                    <td className="px-5 py-3 text-card-foreground">{r.type}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.details}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => validateMutation.mutate({ id: r.id, table: r.table, status: "approuve" })}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Valider
                        </button>
                        <button onClick={() => validateMutation.mutate({ id: r.id, table: r.table, status: "refuse" })}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allPending.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Aucune demande en attente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "utilisateurs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Nom</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Rôle</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Solde congés</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((p: any) => {
                  const currentRole = p.user_roles?.[0]?.role || "employe";
                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-card-foreground">{p.full_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.email}</td>
                      <td className="px-5 py-3">
                        <select value={currentRole === "professeur" ? "employe" : currentRole}
                          onChange={(e) => roleChangeMutation.mutate({ userId: p.user_id, role: e.target.value })}
                          className="px-2 py-1 rounded border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring/30">
                          <option value="employe">Employé</option>
                          <option value="admin_gestionnaire">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${p.approved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {p.approved ? "Actif" : "En attente"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.soldes_conges?.[0]?.restant ?? "—"} / {p.soldes_conges?.[0]?.total ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "soldes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {allProfiles.map((p: any) => {
            const solde = p.soldes_conges?.[0];
            if (!solde) return null;
            return (
              <div key={p.id} className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-card-foreground">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-heading font-bold text-primary">{solde.restant}</p>
                    <p className="text-xs text-muted-foreground">jours restants</p>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(solde.utilise / solde.total) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{solde.utilise} utilisés sur {solde.total}</p>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Admin;

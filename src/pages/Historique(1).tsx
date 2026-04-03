import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, statusColors } from "@/types/requests";

type FilterType = "all" | "conge" | "remboursement" | "heures_sup";

const Historique = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState("all");

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
    ...conges.map((c) => ({ id: c.id, type: "conge" as const, details: `${c.date_debut} → ${c.date_fin}`, status: c.status, createdAt: c.created_at })),
    ...remboursements.map((r) => ({ id: r.id, type: "remboursement" as const, details: `${r.montant}€ — ${r.motif}`, status: r.status, createdAt: r.created_at })),
    ...heuresSup.map((h) => ({ id: h.id, type: "heures_sup" as const, details: `${h.heures}h — ${h.motif}`, status: h.status, createdAt: h.created_at })),
  ]
    .filter((r) => filterType === "all" || r.type === filterType)
    .filter((r) => filterStatus === "all" || r.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const typeLabels = { conge: "Congé", remboursement: "Remboursement", heures_sup: "Heures sup." };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Historique</h1>
        <p className="text-sm text-muted-foreground mt-1">Retrouvez toutes vos demandes</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="all">Tous les types</option>
          <option value="conge">Congés</option>
          <option value="remboursement">Remboursements</option>
          <option value="heures_sup">Heures sup.</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
          <option value="all">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="approuve">Approuvé</option>
          <option value="refuse">Refusé</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-card border border-border/50">
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
                  <td className="px-5 py-3 font-medium text-card-foreground">{typeLabels[r.type]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.details}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                  </td>
                </tr>
              ))}
              {allRequests.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Aucune demande trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Historique;

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Eye, UserCheck, UserX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; class: string }> = {
  actif: { label: "Actif", class: "bg-success/10 text-success" },
  arret: { label: "En arrêt", class: "bg-warning/10 text-warning" },
  sorti: { label: "Sorti", class: "bg-destructive/10 text-destructive" },
};

const Employes = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin_employes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, user_roles(role), soldes_conges(total, utilise, restant)")
        .order("full_name");
      return data || [];
    },
  });

  const filtered = profiles.filter((p: any) =>
    `${p.full_name} ${p.email} ${p.poste || ""} ${p.departement || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = profiles.filter((p: any) => (p.statut_employe || "actif") === "actif").length;
  const arretCount = profiles.filter((p: any) => p.statut_employe === "arret").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Gestion des employés</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble du personnel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-card-foreground">{profiles.length}</p>
            <p className="text-xs text-muted-foreground">Total employés</p>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-card-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <UserX className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-card-foreground">{arretCount}</p>
            <p className="text-xs text-muted-foreground">En arrêt</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-card rounded-xl shadow-card border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Nom complet</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Poste</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Département</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Contrat</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const status = statusConfig[p.statut_employe || "actif"] || statusConfig.actif;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-card-foreground">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.poste || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.departement || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.type_contrat || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/employes/${p.user_id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir fiche
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Aucun employé trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Employes;

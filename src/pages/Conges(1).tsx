import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { congeTypeLabels, statusLabels, statusColors } from "@/types/requests";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CongeType = Database["public"]["Enums"]["conge_type"];
type PrioriteType = Database["public"]["Enums"]["priorite_type"];

const Conges = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ congeType: "annuel" as CongeType, dateDebut: "", dateFin: "", priorite: "normale" as PrioriteType, telephone: "", commentaire: "" });

  const { data: conges = [] } = useQuery({
    queryKey: ["conges"],
    queryFn: async () => {
      const { data } = await supabase.from("conges").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      // Check balance
      if (user.soldeConges.restant <= 0 && form.congeType !== "sans_solde") {
        throw new Error("Solde de congés insuffisant");
      }
      const { error } = await supabase.from("conges").insert({
        user_id: user.id,
        conge_type: form.congeType,
        date_debut: form.dateDebut,
        date_fin: form.dateFin,
        priorite: form.priorite,
        telephone: form.telephone || null,
        commentaire: form.commentaire || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conges"] });
      setShowForm(false);
      setForm({ congeType: "annuel", dateDebut: "", dateFin: "", priorite: "normale", telephone: "", commentaire: "" });
      toast.success("Demande de congé soumise !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Congés</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Solde restant : <span className="font-semibold text-primary">{user?.soldeConges.restant} jours</span>
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nouvelle demande
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl shadow-lg border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg text-card-foreground">Demande de congé</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Type de congé</label>
                    <select value={form.congeType} onChange={(e) => setForm({ ...form, congeType: e.target.value as CongeType })}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                      {Object.entries(congeTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Date début</label>
                    <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Date fin</label>
                    <input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Priorité</label>
                    <select value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value as PrioriteType })}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                      <option value="normale">Normale</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Téléphone</label>
                    <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Commentaire</label>
                    <textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                      rows={3} placeholder="Précisions..."
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Annuler</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {createMutation.isPending ? "Envoi..." : "Soumettre"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-card border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Période</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Priorité</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {conges.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-card-foreground">{congeTypeLabels[r.conge_type]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date_debut} → {r.date_fin}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${r.priorite === "urgente" ? "text-destructive" : "text-muted-foreground"}`}>
                      {r.priorite === "urgente" ? "Urgente" : "Normale"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                  </td>
                </tr>
              ))}
              {conges.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Aucune demande de congé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Conges;

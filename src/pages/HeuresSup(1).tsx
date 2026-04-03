import { useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, statusColors } from "@/types/requests";
import { toast } from "sonner";

const HeuresSup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", heures: "", motif: "", commentaire: "" });

  const { data: heuresSup = [] } = useQuery({
    queryKey: ["heures_sup"],
    queryFn: async () => {
      const { data } = await supabase.from("heures_supplementaires").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const resetForm = () => {
    setForm({ date: "", heures: "", motif: "", commentaire: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      const heures = parseFloat(form.heures);
      if (isNaN(heures) || heures <= 0) throw new Error("Nombre d'heures invalide");
      if (editingId) {
        const { error } = await supabase.from("heures_supplementaires").update({
          date: form.date,
          heures,
          motif: form.motif,
          commentaire: form.commentaire || null,
        }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("heures_supplementaires").insert({
          user_id: user.id,
          date: form.date,
          heures,
          motif: form.motif,
          commentaire: form.commentaire || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heures_sup"] });
      resetForm();
      toast.success(editingId ? "Déclaration modifiée !" : "Déclaration d'heures supplémentaires soumise !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("heures_supplementaires").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heures_sup"] });
      toast.success("Déclaration supprimée !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startEdit = (r: any) => {
    setForm({ date: r.date, heures: String(r.heures), motif: r.motif, commentaire: r.commentaire || "" });
    setEditingId(r.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Heures Supplémentaires</h1>
          <p className="text-sm text-muted-foreground mt-1">Déclarez vos heures supplémentaires</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nouvelle déclaration
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl shadow-lg border border-border w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg text-card-foreground">
                  {editingId ? "Modifier la déclaration" : "Déclaration d'heures sup."}
                </h2>
                <button onClick={resetForm} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nombre d'heures</label>
                    <input type="number" min="0.5" step="0.5" value={form.heures} onChange={(e) => setForm({ ...form, heures: e.target.value })}
                      placeholder="0" required
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Motif</label>
                  <input type="text" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })}
                    placeholder="Ex: Cours du soir" required
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Commentaire</label>
                  <textarea value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                    rows={3} placeholder="Informations complémentaires..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetForm}
                    className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Annuler</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {createMutation.isPending ? "Envoi..." : editingId ? "Modifier" : "Soumettre"}
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
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Heures</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Motif</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {heuresSup.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-card-foreground">{r.date}</td>
                  <td className="px-5 py-3 font-medium text-card-foreground">{r.heures}h</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.motif}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                  </td>
                  <td className="px-5 py-3">
                    {r.status === "en_attente" && (
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Modifier">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => { if (confirm("Supprimer cette déclaration ?")) deleteMutation.mutate(r.id); }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {heuresSup.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Aucune déclaration</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HeuresSup;

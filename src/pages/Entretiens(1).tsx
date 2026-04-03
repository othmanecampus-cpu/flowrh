import { useState } from "react";
import { Plus, X, Star, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusLabels: Record<string, string> = { planifie: "Planifié", termine: "Terminé" };
const statusColors: Record<string, string> = { planifie: "bg-warning/10 text-warning", termine: "bg-success/10 text-success" };

const ScoreStars = ({ score }: { score: number | null }) => {
  if (!score) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= score ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
};

const Entretiens = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState<string | null>(null);
  const [form, setForm] = useState({ userId: "", dateEntretien: "" });
  const [evalForm, setEvalForm] = useState({ performance: 3, competences: 3, feedback: "" });

  const { data: entretiens = [] } = useQuery({
    queryKey: ["entretiens"],
    queryFn: async () => {
      const { data } = await supabase.from("entretiens").select("*").order("date_entretien", { ascending: false });
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin_profiles_for_entretiens"],
    queryFn: async () => {
      if (!isAdmin) return [];
      const { data } = await supabase.from("profiles").select("user_id, full_name, email");
      return data || [];
    },
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("entretiens").insert({
        user_id: form.userId,
        evaluator_id: user.id,
        date_entretien: form.dateEntretien,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entretiens"] });
      setShowForm(false);
      setForm({ userId: "", dateEntretien: "" });
      toast.success("Entretien planifié !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const evalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entretiens").update({
        performance_score: evalForm.performance,
        competences_score: evalForm.competences,
        feedback_manager: evalForm.feedback || null,
        status: "termine",
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entretiens"] });
      setShowEvalForm(null);
      setEvalForm({ performance: 3, competences: 3, feedback: "" });
      toast.success("Évaluation enregistrée !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getProfileName = (userId: string) => {
    const p = profiles.find((p: any) => p.user_id === userId);
    return p ? p.full_name : "—";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Entretiens Annuels</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Planifiez et évaluez les entretiens" : "Consultez vos entretiens annuels"}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Planifier un entretien
          </button>
        )}
      </div>

      {/* Plan form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl shadow-lg border border-border w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg text-card-foreground">Planifier un entretien</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Employé</label>
                  <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                    <option value="">Sélectionner un employé</option>
                    {profiles.map((p: any) => (
                      <option key={p.user_id} value={p.user_id}>{p.full_name} ({p.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Date de l'entretien</label>
                  <input type="date" value={form.dateEntretien} onChange={(e) => setForm({ ...form, dateEntretien: e.target.value })} required
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Annuler</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {createMutation.isPending ? "Envoi..." : "Planifier"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation form */}
      <AnimatePresence>
        {showEvalForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl shadow-lg border border-border w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg text-card-foreground">Évaluation de l'entretien</h2>
                <button onClick={() => setShowEvalForm(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); evalMutation.mutate(showEvalForm); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Performance (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" onClick={() => setEvalForm({ ...evalForm, performance: i })}
                        className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-colors ${
                          evalForm.performance >= i ? "bg-warning/20 border-warning text-warning" : "border-input text-muted-foreground hover:bg-muted"
                        }`}>{i}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Compétences (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" onClick={() => setEvalForm({ ...evalForm, competences: i })}
                        className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-colors ${
                          evalForm.competences >= i ? "bg-info/20 border-info text-info" : "border-input text-muted-foreground hover:bg-muted"
                        }`}>{i}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Feedback du manager</label>
                  <textarea value={evalForm.feedback} onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })}
                    rows={4} placeholder="Commentaires, points forts, axes d'amélioration..."
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEvalForm(null)}
                    className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Annuler</button>
                  <button type="submit" disabled={evalMutation.isPending}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {evalMutation.isPending ? "Envoi..." : "Valider l'évaluation"}
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
                {isAdmin && <th className="px-5 py-3 font-medium text-muted-foreground">Employé</th>}
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Performance</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Compétences</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Statut</th>
                {isAdmin && <th className="px-5 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {entretiens.map((e: any) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {isAdmin && <td className="px-5 py-3 font-medium text-card-foreground">{getProfileName(e.user_id)}</td>}
                  <td className="px-5 py-3 text-card-foreground">{e.date_entretien}</td>
                  <td className="px-5 py-3"><ScoreStars score={e.performance_score} /></td>
                  <td className="px-5 py-3"><ScoreStars score={e.competences_score} /></td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[e.status] || ""}`}>
                      {statusLabels[e.status] || e.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      {e.status === "planifie" && (
                        <button onClick={() => { setEvalForm({ performance: 3, competences: 3, feedback: "" }); setShowEvalForm(e.id); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                          <ClipboardCheck className="w-3.5 h-3.5" /> Évaluer
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {entretiens.length === 0 && (
                <tr><td colSpan={isAdmin ? 6 : 4} className="px-5 py-8 text-center text-muted-foreground">Aucun entretien</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Feedback detail for employees */}
      {!isAdmin && entretiens.filter((e: any) => e.status === "termine").length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-foreground">Détails des évaluations</h2>
          {entretiens.filter((e: any) => e.status === "termine").map((e: any) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-card border border-border/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-card-foreground">Entretien du {e.date_entretien}</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors.termine}`}>Terminé</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Performance</p>
                  <ScoreStars score={e.performance_score} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Compétences</p>
                  <ScoreStars score={e.competences_score} />
                </div>
              </div>
              {e.feedback_manager && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Feedback du manager</p>
                  <p className="text-sm text-card-foreground bg-muted/50 rounded-lg p-3">{e.feedback_manager}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Entretiens;

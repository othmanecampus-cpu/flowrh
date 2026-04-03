import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Briefcase, Landmark, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EmployeDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["employe_detail", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, user_roles(role), soldes_conges(total, utilise, restant)")
        .eq("user_id", userId!)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employe_detail", userId] });
      setEditing(false);
      toast.success("Profil mis à jour !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Chargement...</div>;
  if (!profile) return <div className="p-8 text-muted-foreground">Employé introuvable</div>;

  const startEdit = () => {
    setForm({
      full_name: profile.full_name || "",
      prenom: profile.prenom || "",
      email: profile.email || "",
      phone: profile.phone || "",
      date_naissance: profile.date_naissance || "",
      adresse: profile.adresse || "",
      numero_securite_sociale: profile.numero_securite_sociale || "",
      contact_urgence: profile.contact_urgence || "",
      contact_urgence_tel: profile.contact_urgence_tel || "",
      type_contrat: profile.type_contrat || "CDI",
      temps_travail: profile.temps_travail || "35h",
      date_entree: profile.date_entree || "",
      date_sortie: profile.date_sortie || "",
      poste: profile.poste || "",
      departement: profile.departement || "",
      statut_employe: profile.statut_employe || "actif",
      numero_salarie: profile.numero_salarie || "",
      convention_collective: profile.convention_collective || "",
      salaire: profile.salaire || "",
      iban: profile.iban || "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    const updates = { ...form };
    if (updates.salaire === "") updates.salaire = null;
    updateMutation.mutate(updates);
  };

  const val = (field: string) => editing ? (form[field] ?? "") : (profile[field as keyof typeof profile] ?? "");
  const onChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const Field = ({ label, field, type = "text", sensitive = false }: { label: string; field: string; type?: string; sensitive?: boolean }) => {
    if (sensitive && !isAdmin) return null;
    return (
      <div>
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {editing ? (
          <input type={type} value={val(field)} onChange={(e) => onChange(field, e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
        ) : (
          <p className="mt-1 text-sm text-card-foreground">{val(field) || "—"}</p>
        )}
      </div>
    );
  };

  const SelectField = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {editing ? (
        <select value={val(field)} onChange={(e) => onChange(field, e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <p className="mt-1 text-sm text-card-foreground">{options.find((o) => o.value === val(field))?.label || val(field) || "—"}</p>
      )}
    </div>
  );

  const solde = profile.soldes_conges?.[0] as any;
  const role = (profile.user_roles?.[0] as any)?.role || "employe";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/employes")}
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-foreground">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">{profile.poste || "Poste non défini"} · {profile.departement || "Département non défini"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            role === "admin_gestionnaire" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {role === "admin_gestionnaire" ? "Admin" : "Employé"}
          </span>
          {isAdmin && !editing && (
            <button onClick={startEdit}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Modifier
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Save className="w-4 h-4" /> Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pilier 1: Identité & Contact */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-card border border-border/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-heading font-semibold text-card-foreground">Identité & Contact</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom" field="full_name" />
          <Field label="Prénom" field="prenom" />
          <Field label="Date de naissance" field="date_naissance" type="date" />
          <Field label="Email" field="email" type="email" />
          <Field label="Téléphone" field="phone" />
          <Field label="Adresse" field="adresse" />
          <Field label="N° Sécurité sociale" field="numero_securite_sociale" sensitive />
          <Field label="Contact d'urgence" field="contact_urgence" />
          <Field label="Tél. contact d'urgence" field="contact_urgence_tel" />
        </div>
      </motion.div>

      {/* Pilier 2: Vie Professionnelle */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card rounded-xl shadow-card border border-border/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-info" />
          </div>
          <h2 className="font-heading font-semibold text-card-foreground">Vie Professionnelle</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Type de contrat" field="type_contrat" options={[
            { value: "CDI", label: "CDI" },
            { value: "CDD", label: "CDD" },
            { value: "Freelance", label: "Freelance" },
          ]} />
          <SelectField label="Temps de travail" field="temps_travail" options={[
            { value: "35h", label: "Temps plein (35h)" },
            { value: "partiel", label: "Temps partiel" },
          ]} />
          <Field label="Date d'entrée" field="date_entree" type="date" />
          <Field label="Date de sortie" field="date_sortie" type="date" />
          <Field label="Poste" field="poste" />
          <Field label="Département" field="departement" />
          <SelectField label="Statut" field="statut_employe" options={[
            { value: "actif", label: "Actif" },
            { value: "arret", label: "En arrêt" },
            { value: "sorti", label: "Sorti" },
          ]} />
        </div>

        {solde && (
          <div className="mt-5 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-card-foreground">Solde de congés</p>
              <p className="text-sm font-heading font-bold text-primary">{solde.restant} / {solde.total} jours</p>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(solde.utilise / solde.total) * 100}%` }} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Pilier 3: Données Administratives & Paie (admin only) */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-warning" />
            </div>
            <h2 className="font-heading font-semibold text-card-foreground">Données Administratives & Paie</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Numéro de salarié" field="numero_salarie" />
            <Field label="Convention collective" field="convention_collective" />
            <Field label="Salaire (€)" field="salaire" type="number" sensitive />
            <Field label="IBAN" field="iban" sensitive />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EmployeDetail;
